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

            // First, map all links by their sourcePort to easily find connections later
            const linksBySourcePort = Object.values(linkModels)
                .filter(it => it.targetPort in portModels)
                .reduce<Record<string, string[]>>((acc, link) => {
                    (acc[link.sourcePort] = acc[link.sourcePort] || []).push(
                        portModels[link.targetPort].parentNode
                    );
                    return acc;
                }, {});

            // Transform nodes, incorporating links data into the wires property
            const nodes = Object.values(nodeModels).map(
                (node): FlowNodeEntity => {
                    // For each port of the node
                    const wires: string[][] = [];
                    const outLinks: Record<string, LinkModel> = {};
                    node.ports
                        // only look at out ports
                        .filter(it => !it.in)
                        //find connected target ports and map them to target node IDs
                        .forEach(port => {
                            wires.push(linksBySourcePort[port.id] || []);
                            port.links.forEach(linkId => {
                                outLinks[linkId] = linkModels[linkId];
                            });
                        });

                    return {
                        id: node.id,
                        type: node.extras.entity.type,
                        x: node.x,
                        y: node.y,
                        z: graph.id, // Assuming all nodes belong to the same flow
                        name: node.name,
                        wires,
                        // Add other properties as needed
                        ports: node.ports,
                        links: outLinks,
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
                    id: node.id,
                    type: 'custom-node',
                    x: node.x,
                    y: node.y,
                    ports: node.ports ?? [],
                    name: node.name || '',
                    color: 'defaultColor',
                    locked: false,
                    selected: false,
                    extras: {
                        entity: nodeEntities[node.type],
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
