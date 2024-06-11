import { createSelector } from '@reduxjs/toolkit';

import { AppDispatch, RootState } from '../../store';
import {
    PaletteNodeEntity,
    selectPaletteNodeEntities,
} from '../palette/node.slice';
import {
    FlowNodeEntity,
    LinkModel,
    PortModel,
    flowActions,
    selectFlowEntityById,
    selectFlowNodesByFlowId,
} from './flow.slice';
import { NodeLogic } from './node.logic';

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
        entity: PaletteNodeEntity;
        [key: string]: unknown;
    };
};

export class GraphLogic {
    constructor(private nodeLogic: NodeLogic) {}

    // Method to convert and update the flow based on the serialized graph from react-diagrams
    updateFlowFromSerializedGraph(graph: SerializedGraph) {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
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

            // get existing flow entity or create new one
            const flowEntity = selectFlowEntityById(getState(), graph.id) ?? {
                id: graph.id,
                type: 'flow',
                name: 'My Flow', // Example label, could be dynamic
                disabled: false,
                info: '', // Additional info about the flow
                env: [], // Environment variables or other settings
            };

            // Dispatch an action to add the flow entity to the Redux state
            dispatch(flowActions.upsertFlowEntity(flowEntity));

            // Step 1: Fetch current nodes of the flow
            const currentNodes = selectFlowNodesByFlowId(getState(), graph.id);

            // Step 2: Identify nodes to remove
            const updatedNodeIds = Object.values(nodeModels).map(it => it.id);
            const nodesToRemove = currentNodes.filter(
                node => !updatedNodeIds.includes(node.id)
            );

            // Step 3: Remove the identified nodes
            dispatch(
                flowActions.removeFlowNodes(nodesToRemove.map(it => it.id))
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
                        x: node.x,
                        y: node.y,
                        z: graph.id, // Assuming all nodes belong to the same flow
                        name: node.name,
                        wires,
                        inPorts: node.ports.filter(it => it.in),
                        outPorts: node.ports.filter(it => !it.in),
                        links: outLinks,
                        selected: node.selected,
                        locked: node.locked,
                    };
                }
            );

            // Dispatch an action to add the transformed nodes to the Redux state
            dispatch(flowActions.upsertFlowNodes(nodes));
        };
    }

    selectSerializedGraphByFlowId = createSelector(
        [state => state, selectFlowEntityById, selectFlowNodesByFlowId],
        (state, flow, flowNodes) => {
            if (!flow) {
                return null;
            }

            const nodeEntities = {
                ...selectPaletteNodeEntities(state),
                ...this.nodeLogic.selectSubflowEntitiesAsPaletteNodes(state),
                ...this.nodeLogic.selectInOutPaletteNodeEntities(),
            };

            // Construct NodeModels from flow nodes
            const nodeModels: { [key: string]: NodeModel } = {};
            // Infer LinkModels from node wires
            const linkModels: { [key: string]: LinkModel } = {};

            flowNodes.forEach(node => {
                node.wires?.forEach((portWires, index) => {
                    const port = node.outPorts[index];

                    // let portLinks = outPort.links;

                    // if (outPort.id === null) {
                    //     outPort = {
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
                    //     node.ports?.splice(index, 1, outPort);
                    // }

                    // const port = outPort as PortModel;

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

                    // port.links = portLinks;
                });

                nodeModels[node.id] = {
                    // default values
                    locked: false,
                    selected: false,
                    color: 'defaultColor',
                    // flow node values
                    ...node,
                    // node model values
                    ports: [...node.inPorts, ...node.outPorts],
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
