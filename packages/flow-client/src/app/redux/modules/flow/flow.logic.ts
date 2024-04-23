import { createSelector } from '@reduxjs/toolkit';

import { AppDispatch, RootState } from '../../store';
import { NodeEntity, selectAllNodes } from '../node/node.slice';
import {
    FlowEntity,
    FlowNodeEntity,
    LinkModel,
    PortModel,
    flowActions,
    selectEntityById,
    selectFlowNodesByFlowId,
} from './flow.slice';
import { executeNodeFn } from '../../../red/execute-script';

export type SerializedGraph = {
    id: string;
    offsetX: number;
    offsetY: number;
    zoom: number;
    gridSize: number;
    layers: Layer[];
    locked: boolean;
};

type BaseLayer = {
    id: string;
    isSvg: boolean;
    transformed: boolean;
    selected: boolean;
    extras: Record<string, unknown>;
    locked: boolean;
};

export type NodeLayer = BaseLayer & {
    type: 'diagram-nodes';
    models: { [key: string]: NodeModel };
};

export type LinkLayer = BaseLayer & {
    type: 'diagram-links';
    models: { [key: string]: LinkModel };
};

export type Layer = NodeLayer | LinkLayer;

export type NodeModel = {
    id: string;
    type: string;
    x: number;
    y: number;
    ports: PortModel[];
    name: string;
    color: string;
    portsInOrder?: string[];
    portsOutOrder?: string[];
    locked: boolean;
    selected: boolean;
    extras: {
        entity: NodeEntity;
        [key: string]: unknown;
    };
};

export class FlowLogic {
    // Method to extract inputs and outputs from a NodeEntity, including deserializing inputLabels and outputLabels
    getNodeInputsOutputs(
        nodeInstance: FlowNodeEntity,
        nodeEntity: NodeEntity
    ): {
        inputs: string[];
        outputs: string[];
    } {
        const inputs: string[] = [];
        const outputs: string[] = [];

        // Handle optional properties with defaults
        const inputsCount = nodeInstance.inputs ?? 0;
        const outputsCount = nodeInstance.outputs ?? 0;

        // Generate input and output labels using the deserialized functions
        for (let i = 0; i < inputsCount; i++) {
            inputs.push(
                executeNodeFn<(index: number) => string>(
                    ['inputLabels', i],
                    nodeEntity,
                    nodeInstance
                ) ?? `Input ${i + 1}`
            );
        }

        for (let i = 0; i < outputsCount; i++) {
            outputs.push(
                executeNodeFn<(index: number) => string>(
                    ['outputLabels', i],
                    nodeEntity,
                    nodeInstance
                ) ?? `Output ${i + 1}`
            );
        }

        return { inputs, outputs };
    }

    // Method to convert and update the flow based on the serialized graph from react-diagrams
    updateFlowFromSerializedGraph(graph: SerializedGraph) {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            // const graph = JSON.parse(serializedGraph) as SerializedGraph;

            // Assuming layers[1] contains nodes and layers[0] contains links
            const nodeModels =
                (
                    graph.layers.find(
                        layer => layer.type === 'diagram-nodes'
                    ) as NodeLayer
                )?.models || {};
            const linkModels =
                (
                    graph.layers.find(
                        layer => layer.type === 'diagram-links'
                    ) as LinkLayer
                )?.models || {};
            const portModels = Object.fromEntries(
                Object.values(nodeModels).flatMap(node =>
                    node.ports.map(it => [it.id, it])
                )
            );

            // Create a flow entity to represent the graph
            const flowEntity: FlowEntity = {
                id: graph.id,
                type: 'tab',
                label: 'My Flow', // Example label, could be dynamic
                disabled: false,
                info: '', // Additional info about the flow
                env: [], // Environment variables or other settings
            };

            // Dispatch an action to add the flow entity to the Redux state
            dispatch(flowActions.upsertEntity(flowEntity));

            // Step 1: Fetch current nodes of the flow
            const currentNodes = selectFlowNodesByFlowId(getState(), graph.id);

            // Step 2: Identify nodes to remove
            const updatedNodeIds = Object.values(nodeModels).map(it => it.id);
            const nodesToRemove = currentNodes.filter(
                node => !updatedNodeIds.includes(node.id)
            );

            // Step 3: Remove the identified nodes
            dispatch(
                flowActions.removeEntities(nodesToRemove.map(it => it.id))
            );

            // Map all links by their out port to organize connections from out -> in
            const linksByOutPort = Object.values(linkModels)
                .filter(
                    link =>
                        link.sourcePort in portModels &&
                        link.targetPort in portModels
                )
                .reduce<Record<string, string[]>>((acc, link) => {
                    const outPortId = portModels[link.sourcePort].in
                        ? link.targetPort
                        : link.sourcePort;
                    const inPortId = portModels[link.sourcePort].in
                        ? link.sourcePort
                        : link.targetPort;
                    const inPortNode = portModels[inPortId].parentNode;
                    (acc[outPortId] = acc[outPortId] || []).push(inPortNode);
                    return acc;
                }, {});

            // Transform nodes, incorporating links data into the wires property based on out ports
            const nodes = Object.values(nodeModels).map(
                (node): FlowNodeEntity => {
                    // For each out port of the node
                    const wires: string[][] = [];
                    const outLinks: Record<string, LinkModel> = {};
                    node.ports
                        .filter(port => !port.in) // only look at out ports
                        .forEach(port => {
                            wires.push(linksByOutPort[port.id] || []);
                            port.links.forEach(linkId => {
                                outLinks[linkId] = linkModels[linkId];
                            });
                        });

                    return {
                        ...(node.extras.config as FlowNodeEntity),
                        id: node.id,
                        type: node.extras.entity.type,
                        x: node.x,
                        y: node.y,
                        z: graph.id, // Assuming all nodes belong to the same flow
                        name: node.name,
                        wires,
                        ports: node.ports,
                        links: outLinks,
                        selected: node.selected,
                        locked: node.locked,
                    };
                }
            );

            // Dispatch an action to add the transformed nodes to the Redux state
            dispatch(flowActions.upsertEntities(nodes));
        };
    }

    selectSerializedGraphByFlowId = createSelector(
        [state => state, selectEntityById, selectFlowNodesByFlowId],
        (state, flow, flowNodes) => {
            if (!flow) {
                return null;
            }

            const nodeEntities = Object.fromEntries(
                selectAllNodes(state).map(it => [it.id, it])
            );

            // Construct NodeModels from flow nodes
            const nodeModels: { [key: string]: NodeModel } = {};
            // Infer LinkModels from node wires
            const linkModels: { [key: string]: LinkModel } = {};

            flowNodes.forEach(node => {
                const outPorts = node.ports?.filter(it => !it.in) ?? [];

                node.wires?.forEach((portWires, index) => {
                    const port = outPorts[index];

                    // if (!port) {
                    //     port = {
                    //         id: `${node.id}-out-${index}`,
                    //         type: 'default',
                    //         x: 0,
                    //         y: 0,
                    //         name: '',
                    //         alignment: 'right',
                    //         parentNode: node.id,
                    //         links: [],
                    //         in: false,
                    //         label: `Output ${index + 1}`,
                    //     };
                    //     outPorts.push(port);
                    // }

                    portWires.forEach((targetNodeId, targetIndex) => {
                        const linkId = port.links[targetIndex];
                        const nodeLink = node.links?.[linkId];
                        if (nodeLink) {
                            linkModels[linkId] = nodeLink;
                        }

                        // linkModels[linkId] = {
                        //     id: linkId,
                        //     type: 'default', // Placeholder value
                        //     source: node.id,
                        //     sourcePort: port.id, // Assuming a port naming convention
                        //     target: targetNodeId,
                        //     targetPort: `${targetNodeId}-in-${targetIndex}`, // This assumes you can determine the target port index
                        //     points: [], // Points would need to be constructed if they are used
                        //     labels: [], // Labels would need to be constructed if they are used
                        //     width: 1, // Placeholder value
                        //     color: 'defaultColor', // Placeholder value
                        //     curvyness: 0, // Placeholder value
                        //     selectedColor: 'defaultSelectedColor', // Placeholder value
                        //     locked: false,
                        //     selected: false,
                        //     extras: {},
                        // };
                    });
                });

                nodeModels[node.id] = {
                    locked: false,
                    selected: false,
                    ports: [],
                    name: '',
                    color: 'defaultColor',
                    ...node,
                    type: 'custom-node',
                    extras: {
                        entity: nodeEntities[node.type],
                        config: node,
                    },
                };
            });

            // Assemble the SerializedGraph
            const serializedGraph: SerializedGraph = {
                id: flow.id,
                offsetX: 0, // Placeholder value
                offsetY: 0, // Placeholder value
                zoom: 1, // Placeholder value
                gridSize: 20, // Placeholder value
                locked: false,
                layers: [
                    {
                        id: 'nodeLayer',
                        isSvg: false,
                        transformed: true,
                        type: 'diagram-nodes',
                        models: nodeModels,
                        locked: false,
                        selected: false,
                        extras: {},
                    },
                    {
                        id: 'linkLayer',
                        isSvg: true,
                        transformed: true,
                        type: 'diagram-links',
                        models: linkModels,
                        locked: false,
                        selected: false,
                        extras: {},
                    },
                ],
            };

            return serializedGraph;
        }
    );
}
