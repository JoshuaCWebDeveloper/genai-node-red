import { createSelector } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import { AppDispatch, RootState } from '../../store';
import {
    NodeEntity,
    selectAllNodes,
    selectNodeById,
} from '../palette/node.slice';
import {
    DirectoryEntity,
    FlowEntity,
    FlowNodeEntity,
    LinkModel,
    PortModel,
    SubflowEntity,
    flowActions,
    selectDirectories,
    selectEntityById,
    selectFlowNodesByFlowId,
    selectFlows,
    selectSubflows,
} from './flow.slice';
import { executeNodeFn } from '../../../red/execute-script';
import { PortModelAlignment } from '@projectstorm/react-diagrams';

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

type DirtyNodeChanges = Partial<
    Omit<FlowNodeEntity, 'outputs'> & {
        inputs: number | string;
        outputs: number | string | null;
        __outputs: number | null;
    }
>;

type TreeItem = {
    id: string;
    name: string;
    directory: string;
    directoryPath: string;
};

export type TreeDirectory = TreeItem & {
    type: 'directory';
    children: TreeItemData[];
};

export type TreeFile = TreeItem & {
    type: 'file';
};

export type TreeItemData = TreeDirectory | TreeFile;

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

            // get existing flow entity or create new one
            const flowEntity = selectEntityById(getState(), graph.id) ?? {
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
                        inPorts: node.ports.filter(it => it.in),
                        outPorts: node.ports.filter(it => !it.in),
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

    private parseNodeOutputs(
        changes: DirtyNodeChanges,
        nodeInstance: FlowNodeEntity
    ): {
        outputs?: number;
        outputMap?: Record<string, string>;
    } {
        const parseNumber = (value: string | number) => {
            try {
                const number = parseInt(value.toString());
                return isNaN(number) ? null : number;
            } catch (e) {
                return null;
            }
        };

        // Create a new index for our output map, using the algorithm that
        // Node-RED's switch node uses
        const createNewIndex = () => {
            return `${Math.floor((0x99999 - 0x10000) * Math.random())}`;
        };

        // if no outputs, return nothing
        if (
            typeof changes.outputs == 'undefined' ||
            changes.outputs === null ||
            changes.outputs?.toString().trim() === ''
        ) {
            return {};
        }

        // if we were just given a number
        const outputs = parseNumber(changes.outputs);
        if (outputs !== null) {
            // get our existing number of outputs
            const oldOutputs = nodeInstance.outputs ?? 0;
            // if our number of outputs hasn't changed
            if (outputs === oldOutputs) {
                // just return our outputs
                return {
                    outputs,
                };
            }
            // else, we either have more or fewer outputs
            // we'll handle the addition/removal of ports by creating our own outputMap
            const outputMap: Record<string, string> = {};
            // if we have fewer outputs
            if (outputs < oldOutputs) {
                // truncate output ports and wires by marking excess as removed
                for (let i = outputs; i < oldOutputs; i++) {
                    outputMap[`${i}`] = '-1'; // Marking index for removal
                }
            }
            // else, if we have more outputs
            else if (outputs > oldOutputs) {
                // create new output ports and wires
                for (let i = oldOutputs; i < outputs; i++) {
                    // a non-existent index indicates a new port
                    outputMap[createNewIndex()] = `${i}`;
                }
            }
            // return our new outputs
            return {
                outputs,
                outputMap,
            };
        }

        // else, it's a map, parse it
        const outputMap = JSON.parse(changes.outputs as string) as Record<
            string,
            string
        >;
        // count our outputs
        let outputCount = 0;
        // filter our output map
        for (const [oldPort, newPort] of Object.entries(outputMap)) {
            // ensure our value is a string
            outputMap[oldPort] = `${newPort}`;

            // if our old port is not a number, that indicates a new output
            if (parseNumber(oldPort) === null) {
                // replace our non number port with a number port that still indicates a new output
                outputMap[createNewIndex()] = newPort;
                delete outputMap[oldPort];
                // our port is now definitely a number, so we can keep going
            }

            // a value of -1 indicates the port will be removed
            if (newPort === '-1') {
                continue;
            }

            // this definitely counts as an output
            outputCount++;

            // if our port has not changed, then no updates are needed
            if (oldPort === newPort) {
                delete outputMap[oldPort];
                continue;
            }
        }

        return {
            outputs: outputCount,
            outputMap,
        };
    }

    private updateNodeInputsOutputs(
        nodeInstance: FlowNodeEntity,
        nodeEntity: NodeEntity,
        changes: DirtyNodeChanges
    ): Partial<FlowNodeEntity> {
        // build new changes
        const newChanges = {
            inputs: nodeInstance.inputs,
            outputs: nodeInstance.outputs,
            inPorts: nodeInstance.inPorts.map(it => ({
                ...it,
                extras: { ...it.extras },
            })),
            outPorts: nodeInstance.outPorts.map(it => ({
                ...it,
                extras: { ...it.extras },
            })),
            wires: [...(nodeInstance.wires ?? [])],
        };

        // parse node outputs property
        const { outputs, outputMap } = this.parseNodeOutputs(
            changes,
            nodeInstance
        );

        // if we have new outputs
        if (typeof outputs !== 'undefined' && outputs !== newChanges.outputs) {
            // record them
            newChanges.outputs = outputs;
        }

        // handle the output map, if returned
        if (outputMap) {
            // build new ports and wires collection
            const outPorts: PortModel[] = [];
            const wires: string[][] = [];
            // first, iterate over current wires (no-changes, removals, and movers)
            newChanges.wires?.forEach((portWires, index) => {
                const oldPort = index;

                // if we don't have this port in our map
                if (!Object.prototype.hasOwnProperty.call(outputMap, oldPort)) {
                    // then it has not changed
                    wires[oldPort] = portWires;
                    outPorts[oldPort] = newChanges.outPorts[oldPort];
                    return;
                }

                // else, this is in our output map
                const newPort = parseInt(outputMap[oldPort]);

                // if this port is being removed
                if (newPort === -1) {
                    // simply don't add it
                    return;
                }

                // else, it must be being moved
                wires[newPort] = portWires;
                outPorts[newPort] = newChanges.outPorts[oldPort];
            });
            // now, iterate over our output map and add new wires
            for (const [oldPort, newPort] of Object.entries(outputMap)) {
                // if this port already exists, skip it
                if (newChanges.wires?.[parseInt(oldPort)]) {
                    continue;
                }
                // else, it is new
                wires[parseInt(newPort)] = [];
                outPorts[parseInt(newPort)] = {
                    id: uuidv4(),
                    type: 'default',
                    x: 0,
                    y: 0,
                    name: uuidv4(),
                    alignment: PortModelAlignment.RIGHT,
                    parentNode: nodeInstance.id,
                    links: [],
                    in: false,
                    extras: {
                        label: `Output ${parseInt(newPort) + 1}`,
                    },
                };
            }
            // update changes, replace out ports and wires
            newChanges.outPorts = outPorts.filter(it => it);
            newChanges.wires = wires.filter(it => it);
            // TODO: Remove old links from nodeInstance.links (if necessary)
        }

        let inputs = newChanges.inputs;
        // parse new inputs
        if (Object.prototype.hasOwnProperty.call(changes, 'inputs')) {
            inputs =
                typeof changes.inputs === 'string'
                    ? parseInt(changes.inputs)
                    : (changes.inputs as number);
        }
        // normalize inputs
        inputs = Math.min(1, Math.max(0, inputs ?? 0));
        if (isNaN(inputs)) {
            inputs = 0;
        }
        // if we have new inputs
        if (inputs !== newChanges.inputs) {
            // record them
            newChanges.inputs = inputs;
        }
        if (inputs === 0) {
            // remove all input nodes
            newChanges.inPorts = [];
            // TODO: Remove links from the source port and node (if necessary)
        }

        // update port labels
        const portLabels = this.getNodeInputsOutputs(
            { ...nodeInstance, ...changes, ...newChanges },
            nodeEntity
        );
        newChanges.inPorts.forEach((port, index) => {
            const label = portLabels.inputs[index];
            port.extras.label = label;
        });
        newChanges.outPorts.forEach((port, index) => {
            const label = portLabels.outputs[index];
            port.extras.label = label;
        });

        return newChanges;
    }

    updateFlowNode = (nodeId: string, changes: DirtyNodeChanges) => {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            // update node inputs and outputs
            const nodeInstance = selectEntityById(
                getState(),
                nodeId
            ) as FlowNodeEntity;
            const nodeEntity = selectNodeById(
                getState(),
                nodeInstance.type
            ) as NodeEntity;

            const newChanges = {
                ...changes,
                ...this.updateNodeInputsOutputs(
                    nodeInstance,
                    nodeEntity,
                    changes
                ),
            } as Partial<FlowNodeEntity>;

            dispatch(
                flowActions.updateEntity({ id: nodeId, changes: newChanges })
            );
        };
    };

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

    public directoryIsDefault(item: TreeDirectory) {
        return ['flows', 'subflows'].includes(item.id);
    }

    public getFilePath(item: TreeItemData) {
        const parent = item.directoryPath ? `${item.directoryPath}` : '';
        return item.name ? `${parent}/${item.name}` : parent;
    }

    private createTreeDirectory(
        directory: DirectoryEntity,
        defaultDirectory: string
    ) {
        return {
            id: directory.id,
            name: directory.name,
            type: 'directory',
            directory: directory.directory ?? defaultDirectory,
            directoryPath: '',
            children: [],
        } as TreeDirectory;
    }

    private addTreeDirectory(
        treeItems: Record<string, TreeItemData>,
        directories: DirectoryEntity[],
        defaultDirectory: string,
        directory: DirectoryEntity
    ) {
        // create item
        const item = this.createTreeDirectory(directory, defaultDirectory);
        // get the parent directory
        let parent = treeItems[item.directory] as TreeDirectory;
        if (!parent) {
            const parentEntity = directories.find(
                it => it.id === item.directory
            );
            if (!parentEntity) {
                throw new Error(`Directory ${item.directory} not found`);
            }
            parent = this.addTreeDirectory(
                treeItems,
                directories,
                defaultDirectory,
                parentEntity
            );
        }
        // update item
        item.directoryPath = this.getFilePath(parent);
        parent.children?.push(item);
        treeItems[item.id] = item;
        // return item
        return item;
    }

    selectFlowTree = createSelector(
        [state => state, selectDirectories, selectFlows, selectSubflows],
        (state, directories, flows, subflows) => {
            // collect tree hierarchy
            const rootDirectory = {
                id: '',
                name: '',
                type: 'directory',
                directory: '',
                directoryPath: '',
                children: [],
            } as TreeDirectory;
            const flowsDirectory = {
                id: 'flows',
                name: 'Flows',
                type: 'directory',
                directory: rootDirectory.id,
                directoryPath: '',
                children: [],
            } as TreeDirectory;
            const subflowsDirectory = {
                id: 'subflows',
                name: 'Subflows',
                type: 'directory',
                directory: rootDirectory.id,
                directoryPath: '',
                children: [],
            } as TreeDirectory;
            rootDirectory.children?.push(flowsDirectory, subflowsDirectory);
            const treeItems = {
                [rootDirectory.id]: rootDirectory,
                [flowsDirectory.id]: flowsDirectory,
                [subflowsDirectory.id]: subflowsDirectory,
            } as Record<string, TreeItemData>;
            // loop directories
            directories.forEach(directory => {
                // if we've already created it
                if (treeItems[directory.id]) {
                    // nothing to do
                    return;
                }
                // else, create it
                this.addTreeDirectory(
                    treeItems,
                    directories,
                    rootDirectory.id,
                    directory
                );
            });
            // loop flows and subflows with default paths
            [
                {
                    defaultDirectory: flowsDirectory.id,
                    entities: flows,
                },
                {
                    defaultDirectory: subflowsDirectory.id,
                    entities: subflows,
                },
            ].forEach(({ defaultDirectory, entities }) => {
                entities.forEach(entity => {
                    const directoryId = entity.directory ?? defaultDirectory;
                    const directory = treeItems[directoryId] as TreeDirectory;
                    const item = {
                        id: entity.id,
                        name:
                            (entity as SubflowEntity).name ??
                            (entity as FlowEntity).label,
                        type: 'file',
                        directory: directoryId,
                        directoryPath: `${directory.directoryPath}/${directory.name}`,
                    } as TreeFile;
                    directory.children.push(item);
                    treeItems[item.id] = item;
                });
            });

            return { tree: rootDirectory.children, items: treeItems };
        }
    );
}
