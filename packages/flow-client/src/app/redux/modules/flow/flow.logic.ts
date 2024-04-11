import { AppDispatch, RootState } from '../../store';
import { NodeEntity } from '../node/node.slice';
import {
    FlowEntity,
    FlowNodeEntity,
    flowActions,
    selectFlowNodesByFlowId,
} from './flow.slice';

export type SerializedGraph = {
    id: string;
    offsetX: number;
    offsetY: number;
    zoom: number;
    gridSize: number;
    layers: Layer[];
};

type BaseLayer = {
    id: string;
    isSvg: boolean;
    transformed: boolean;
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
    extras: {
        entity: NodeEntity;
        [key: string]: unknown;
    };
};

export type LinkModel = {
    id: string;
    type: string;
    source: string;
    sourcePort: string;
    target: string;
    targetPort: string;
    points: PointModel[];
    labels: LabelModel[];
    width: number;
    color: string;
    curvyness: number;
    selectedColor: string;
};

export type PortModel = {
    id: string;
    type: string;
    x: number;
    y: number;
    name: string;
    alignment: string;
    parentNode: string;
    links: string[];
    in: boolean;
    label: string;
};

export type PointModel = {
    id: string;
    type: string;
    x: number;
    y: number;
};

export type LabelModel = {
    id: string;
    type: string;
    offsetX: number;
    offsetY: number;
    label: string;
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
                    const wires = node.ports
                        // only look at out ports
                        .filter(it => !it.in)
                        //find connected target ports and map them to target node IDs
                        .map(port => linksBySourcePort[port.id] || []);

                    return {
                        id: node.id,
                        type: node.extras.entity.type,
                        x: node.x,
                        y: node.y,
                        z: graph.id, // Assuming all nodes belong to the same flow
                        name: node.name,
                        wires: wires.length > 0 ? wires : [], // Adjust based on your wires structure needs
                        // Add other properties as needed
                    };
                }
            );

            // Dispatch an action to add the transformed nodes to the Redux state
            dispatch(flowActions.upsertEntities(nodes));
        };
    }
}
