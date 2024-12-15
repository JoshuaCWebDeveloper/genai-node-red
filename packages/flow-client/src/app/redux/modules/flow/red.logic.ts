import { RootState } from '../../store';
import { NodeRedFlows } from '../api/flow.api';
import {
    FlowEntity,
    FlowNodeEntity,
    SubflowEntity,
    selectAllFlowEntities,
    selectFlowNodesByFlowId,
} from './flow.slice';

export class RedLogic {
    private convertNodeToNodeRed(node: FlowNodeEntity): unknown {
        // Convert our node format to Node-RED format
        const nodeRedNode = {
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
            info: node.info,
        };

        // Remove undefined properties
        return Object.fromEntries(
            Object.entries(nodeRedNode).filter(([, v]) => v !== undefined)
        );
    }

    private convertFlowToNodeRed(
        flow: FlowEntity | SubflowEntity,
        state: RootState
    ): unknown {
        const baseFlow = {
            id: flow.id,
            type: flow.type,
            label: flow.name,
            disabled: flow.disabled,
            info: flow.info,
        };

        if (flow.type === 'subflow') {
            return {
                ...baseFlow,
                name: flow.name,
                category: flow.category,
                color: flow.color,
                icon: flow.icon,
                in: flow.in,
                out: flow.out,
                env: flow.env,
                meta: {},
            };
        }

        return {
            ...baseFlow,
            env: flow.env,
        };
    }

    private createMetadataFlow(state: RootState): unknown {
        const flows = selectAllFlowEntities(state);
        const metadata = flows.map(flow => ({
            id: flow.id,
            extraData: flow,
            nodes: selectFlowNodesByFlowId(state, flow.id).map(node => ({
                id: node.id,
                extraData: node
            }))
        }));
        return {
            id: "aed83478cb340859",
            type: "tab",
            label: "FLOW-CLIENT:::METADATA::ROOT",
            disabled: true,
            info: JSON.stringify(metadata),
            env: []
        };
    }

    public toNodeRed(state: RootState): NodeRedFlows {
        // Get all flows and their nodes
        const flows = selectAllFlowEntities(state);

        // Convert each flow and its nodes to Node-RED format
        const nodeRedFlows = flows.map(flow => {
            const flowNodes = selectFlowNodesByFlowId(state, flow.id);

            return {
                ...this.convertFlowToNodeRed(flow, state),
                // Include nodes if this is not a subflow
                ...(flow.type !== 'subflow' && {
                    nodes: flowNodes.map(node =>
                        this.convertNodeToNodeRed(node)
                    ),
                }),
            };
        }).concat(this.createMetadataFlow(state));

        return {
            flows: nodeRedFlows,
        };
    }

    private extractMetadata(nodeRedFlows: NodeRedFlows) {
        const metadataFlow = nodeRedFlows.flows.find(
            flow => flow.type === 'tab' && flow.label === 'FLOW-CLIENT:::METADATA::ROOT'
        );
        if (!metadataFlow?.info) {
            return {};
        }
        const metadata = JSON.parse(metadataFlow.info as string);
        return metadata.reduce((acc: Record<string, unknown>, flowMeta: any) => {
            acc[flowMeta.id] = {
                flow: flowMeta.extraData,
                nodes: flowMeta.nodes.reduce((nodeAcc: Record<string, unknown>, nodeMeta: any) => {
                    nodeAcc[nodeMeta.id] = nodeMeta.extraData;
                    return nodeAcc;
                }, {})
            };
            return acc;
        }, {});
    }

    public fromNodeRed(nodeRedFlows: NodeRedFlows): {
        flows: Array<FlowEntity | SubflowEntity>;
        nodes: FlowNodeEntity[];
    } {
        const metadata = this.extractMetadata(nodeRedFlows);
        const flows: Array<FlowEntity | SubflowEntity> = [];
        const nodes: FlowNodeEntity[] = [];

        nodeRedFlows.flows
            .filter(flow => flow.label !== 'FLOW-CLIENT:::METADATA::ROOT')
            .forEach(nodeRedFlow => {
                const flowMetadata = metadata[nodeRedFlow.id as string]?.flow || {};

                if (nodeRedFlow.type === 'subflow') {
                    flows.push({
                        ...flowMetadata,
                        id: nodeRedFlow.id as string,
                        type: 'subflow',
                        name: nodeRedFlow.name as string,
                        info: nodeRedFlow.info as string || '',
                        category: nodeRedFlow.category as string,
                        color: nodeRedFlow.color as string,
                        icon: nodeRedFlow.icon as string,
                        in: nodeRedFlow.in as string[],
                        out: nodeRedFlow.out as string[],
                        env: nodeRedFlow.env as []
                    } as SubflowEntity);
                } else {
                    flows.push({
                        ...flowMetadata,
                        id: nodeRedFlow.id as string,
                        type: 'flow',
                        name: nodeRedFlow.label as string,
                        disabled: nodeRedFlow.disabled as boolean,
                        info: nodeRedFlow.info as string || '',
                        env: nodeRedFlow.env as []
                    } as FlowEntity);
                }

                // If this is a regular flow with nodes, process them
                if (nodeRedFlow.type !== 'subflow' && Array.isArray(nodeRedFlow.nodes)) {
                    nodeRedFlow.nodes.forEach(nodeRedNode => {
                        const nodeMetadata = metadata[nodeRedFlow.id as string]?.nodes?.[nodeRedNode.id as string] || {};
                        nodes.push({
                            ...nodeMetadata,
                            id: nodeRedNode.id as string,
                            type: nodeRedNode.type as string,
                            x: nodeRedNode.x as number,
                            y: nodeRedNode.y as number,
                            z: nodeRedFlow.id as string,
                            wires: nodeRedNode.wires as string[][],
                        } as FlowNodeEntity);
                    });
                }
            });

        return {
            flows,
            nodes,
        };
    }
}
