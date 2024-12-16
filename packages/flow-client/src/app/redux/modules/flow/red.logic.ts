import { RootState } from '../../store';
import {
    NodeRedBase,
    NodeRedFlow,
    NodeRedFlows,
    NodeRedNode,
    NodeRedSubflow,
} from '../api/flow.api';
import {
    FlowEntity,
    FlowNodeEntity,
    SubflowEntity,
    selectAllFlowEntities,
    selectFlowNodesByFlowId,
} from './flow.slice';

// Define a more specific type for flowMeta
interface FlowMeta {
    id: string;
    extraData: Record<string, unknown>;
    nodes: Array<{ id: string; extraData: Record<string, unknown> }>;
}

interface NodeMeta {
    id: string;
    extraData: Record<string, unknown>;
}

export class RedLogic {
    private convertNodeToNodeRed(node: FlowNodeEntity): NodeRedNode {
        // Convert our node format to Node-RED format
        const nodeRedNode: NodeRedNode = {
            id: node.id,
            type: node.type,
            name: node.name,
            x: node.x,
            y: node.y,
            z: node.z,
            wires: node.wires ?? [],
            inputs: node.inputs,
            outputs: node.outputs,
            inputLabels: node.inputLabels,
            outputLabels: node.outputLabels,
            icon: node.icon,
            info: node.info ?? '',
            env: [],
        };

        return nodeRedNode;
    }

    private convertFlowToNodeRed(
        flow: FlowEntity | SubflowEntity
    ): NodeRedBase {
        const baseFlow = {
            id: flow.id,
            type: 'tab',
            label: flow.name,
            disabled: false,
            info: flow.info,
        };

        if (flow.type === 'subflow') {
            return {
                ...baseFlow,
                name: flow.name,
                category: flow.category,
                color: flow.color,
                icon: flow.icon,
                in:
                    flow.in?.map(endpoint => ({
                        id: endpoint,
                        x: 0,
                        y: 0,
                        wires: [],
                    })) ?? [],
                out:
                    flow.out?.map(endpoint => ({
                        id: endpoint,
                        x: 0,
                        y: 0,
                        wires: [],
                    })) ?? [],
                env: flow.env,
                meta: {},
            } as NodeRedSubflow;
        }

        return {
            ...baseFlow,
            env: flow.env,
        };
    }

    private createMetadataFlow(state: RootState): NodeRedFlow {
        const flows = selectAllFlowEntities(state);
        const metadata = flows.map(flow => ({
            id: flow.id,
            extraData: flow,
            nodes: selectFlowNodesByFlowId(state, flow.id).map(node => ({
                id: node.id,
                extraData: node,
            })),
        }));
        return {
            id: 'aed83478cb340859',
            type: 'tab',
            label: 'FLOW-CLIENT:::METADATA::ROOT',
            disabled: true,
            info: JSON.stringify(metadata),
            env: [],
        };
    }

    public toNodeRed(state: RootState): NodeRedFlows {
        // Get all flows and their nodes
        const flows = selectAllFlowEntities(state);

        // Convert each flow and its nodes to Node-RED format
        const nodeRedFlows = flows
            .map(flow => {
                const flowNodes = selectFlowNodesByFlowId(state, flow.id);

                return [
                    this.convertFlowToNodeRed(flow),
                    ...flowNodes.map(node => this.convertNodeToNodeRed(node)),
                ];
            })
            .flat()
            .concat(this.createMetadataFlow(state));

        return {
            flows: nodeRedFlows,
            // TODO: Implement versioning
            // rev: 'b03654ee1803134c42f82d4530f0ebf8',
        };
    }

    private extractMetadata(nodeRedFlows: NodeRedFlows) {
        const metadataFlow = nodeRedFlows.flows.find(
            flow =>
                flow.type === 'tab' &&
                (flow as NodeRedFlow).label === 'FLOW-CLIENT:::METADATA::ROOT'
        ) as NodeRedFlow;
        if (!metadataFlow?.info) {
            return {};
        }
        const metadata = JSON.parse(metadataFlow.info as string);
        return metadata.reduce(
            (acc: Record<string, unknown>, flowMeta: FlowMeta) => {
                acc[flowMeta.id] = {
                    flow: flowMeta.extraData,
                    nodes: flowMeta.nodes.reduce(
                        (
                            nodeAcc: Record<string, unknown>,
                            nodeMeta: NodeMeta
                        ) => {
                            nodeAcc[nodeMeta.id] = nodeMeta.extraData;
                            return nodeAcc;
                        },
                        {}
                    ),
                };
                return acc;
            },
            {}
        );
    }

    public fromNodeRed(nodeRedFlows: NodeRedFlows): {
        flows: Array<FlowEntity | SubflowEntity>;
        nodes: FlowNodeEntity[];
    } {
        const metadata = this.extractMetadata(nodeRedFlows);
        const flows: Array<FlowEntity | SubflowEntity> = [];
        const nodes: FlowNodeEntity[] = [];

        nodeRedFlows.flows.forEach(nodeRedObj => {
            const flowMetadata = metadata[nodeRedObj.id as string]?.flow || {};

            // Handle subflows
            if (nodeRedObj.type === 'subflow') {
                const nodeRedFlow = nodeRedObj as NodeRedSubflow;
                flows.push({
                    ...flowMetadata,
                    id: nodeRedFlow.id,
                    type: 'subflow',
                    name: nodeRedFlow.name || '',
                    info: nodeRedFlow.info || '',
                    category: nodeRedFlow.category || '',
                    color: nodeRedFlow.color || '',
                    icon: nodeRedFlow.icon || '',
                    in: nodeRedFlow.in || [],
                    out: nodeRedFlow.out || [],
                    env: nodeRedFlow.env || [],
                } as SubflowEntity);
            }
            // Handle regular flows
            else if (nodeRedObj.type === 'tab') {
                const nodeRedFlow = nodeRedObj as NodeRedFlow;
                flows.push({
                    ...flowMetadata,
                    id: nodeRedFlow.id,
                    type: 'flow',
                    name: nodeRedFlow.label || '',
                    disabled: nodeRedFlow.disabled || false,
                    info: nodeRedFlow.info || '',
                    env: nodeRedFlow.env || [],
                } as FlowEntity);
            } else {
                const nodeRedNode = nodeRedObj as NodeRedNode;
                const nodeMetadata =
                    metadata[nodeRedNode.id]?.nodes?.[nodeRedNode.id] || {};
                nodes.push({
                    ...nodeMetadata,
                    id: nodeRedNode.id,
                    type: nodeRedNode.type,
                    x: nodeRedNode.x,
                    y: nodeRedNode.y,
                    z: nodeRedNode.z,
                    wires: nodeRedNode.wires || [],
                } as FlowNodeEntity);
            }
        });

        return {
            flows,
            nodes,
        };
    }
}
