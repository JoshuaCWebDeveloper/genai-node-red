import { PortModelAlignment } from '@projectstorm/react-diagrams';
import { createSelector } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import { executeNodeFn } from '../../../red/execute-script';
import {
    createSubflowDefinitionScript,
    createSubflowEditorTemplate,
} from '../../../red/subflow';
import { AppDispatch, RootState } from '../../store';
import {
    PaletteNodeEntity,
    selectPaletteNodeById,
} from '../palette/node.slice';
import {
    FlowEntity,
    FlowNodeEntity,
    PortModel,
    SubflowEntity,
    flowActions,
    selectAllSubflows,
    selectFlowEntities,
    selectFlowEntityById,
    selectFlowNodeById,
} from './flow.slice';
import { NodeEditorLogic } from './node-editor.logic';

type DirtyNodeChanges = Partial<
    Omit<FlowNodeEntity, 'outputs'> & {
        inputs: number | string;
        outputs: number | string | null;
        __outputs: number | null;
    }
>;

export class NodeLogic {
    public readonly editor: NodeEditorLogic;

    constructor() {
        this.editor = new NodeEditorLogic(this);
    }
    // Method to extract inputs and outputs from a NodeEntity, including deserializing inputLabels and outputLabels
    private getNodeInputOutputLabels(
        nodeInstance: FlowNodeEntity,
        nodeEntity: PaletteNodeEntity
    ) {
        const inputs: string[] = [];
        const outputs: string[] = [];

        // Handle optional properties with defaults
        const inputsCount = nodeInstance.inputs ?? 0;
        const outputsCount = nodeInstance.outputs ?? 0;

        // Generate input and output labels using the deserialized functions
        for (let i = 0; i < inputsCount; i++) {
            inputs.push(
                nodeInstance.inputLabels?.[i] ??
                    executeNodeFn<(index: number) => string>(
                        ['inputLabels', i],
                        nodeEntity,
                        nodeInstance
                    ) ??
                    `Input ${i + 1}`
            );
        }

        for (let i = 0; i < outputsCount; i++) {
            outputs.push(
                nodeInstance.outputLabels?.[i] ??
                    executeNodeFn<(index: number) => string>(
                        ['outputLabels', i],
                        nodeEntity,
                        nodeInstance
                    ) ??
                    `Output ${i + 1}`
            );
        }

        return { inputLabels: inputs, outputLabels: outputs };
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
        nodeEntity: PaletteNodeEntity,
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
            // create new inPorts
            if (inputs > newChanges.inputs) {
                newChanges.inPorts = newChanges.inPorts.concat(
                    Array.from({ length: inputs - newChanges.inputs }, () => ({
                        id: uuidv4(),
                        type: 'default',
                        x: 0,
                        y: 0,
                        name: uuidv4(),
                        alignment: PortModelAlignment.LEFT,
                        parentNode: nodeInstance.id,
                        links: [],
                        in: true,
                        extras: {
                            label: `Input ${newChanges.inputs + 1}`,
                        },
                    }))
                );
            }
            // record them
            newChanges.inputs = inputs;
        }
        if (inputs === 0) {
            // remove all input nodes
            newChanges.inPorts = [];
            // TODO: Remove links from the source port and node (if necessary)
        }

        // update port labels
        const { inputLabels, outputLabels } = this.getNodeInputOutputLabels(
            { ...nodeInstance, ...changes, ...newChanges },
            nodeEntity
        );
        newChanges.inPorts.forEach((port, index) => {
            const label = inputLabels[index];
            port.extras.label = label;
        });
        newChanges.outPorts.forEach((port, index) => {
            const label = outputLabels[index];
            port.extras.label = label;
        });

        return newChanges;
    }

    createFlowNode(flowNode: FlowNodeEntity) {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            const nodeEntity = this.selectPaletteNodeByFlowNode(
                getState(),
                flowNode
            ) as PaletteNodeEntity;

            const newChanges = this.updateNodeInputsOutputs(
                { ...flowNode, inputs: 0, outputs: 0 },
                nodeEntity,
                { inputs: flowNode.inputs, outputs: flowNode.outputs }
            ) as Partial<FlowNodeEntity>;

            const newNode = {
                ...flowNode,
                ...newChanges,
            };

            dispatch(flowActions.addFlowNode(newNode));
        };
    }

    updateFlowNode(nodeId: string, changes: DirtyNodeChanges) {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            // update node inputs and outputs
            const nodeInstance = selectFlowNodeById(
                getState(),
                nodeId
            ) as FlowNodeEntity;
            const nodeEntity = this.selectPaletteNodeByFlowNode(
                getState(),
                nodeInstance
            ) as PaletteNodeEntity;

            const newChanges = {
                ...changes,
                ...this.updateNodeInputsOutputs(
                    nodeInstance,
                    nodeEntity,
                    changes
                ),
            } as Partial<FlowNodeEntity>;

            dispatch(
                flowActions.updateFlowNode({ id: nodeId, changes: newChanges })
            );
        };
    }

    private convertSubflowToPaletteNode(
        subflow: SubflowEntity
    ): PaletteNodeEntity {
        const id = `subflow:${subflow.id}`;
        return {
            id,
            nodeRedId: '',
            nodeRedName: subflow.name,
            name: subflow.name,
            defaults: {
                name: { value: subflow.name },
            },
            type: id,
            category: subflow.category,
            icon: subflow.icon,
            color: subflow.color,
            inputs: subflow.in?.length ?? 0,
            outputs: subflow.out?.length ?? 0,
            module: 'subflows',
            version: '1.0.0',
            editorTemplate: createSubflowEditorTemplate(subflow),
            definitionScript: createSubflowDefinitionScript(subflow),
        } as PaletteNodeEntity;
    }

    selectAllSubflowsAsPaletteNodes = createSelector(
        [selectAllSubflows],
        (subflows: SubflowEntity[]) => {
            return subflows.map(subflow =>
                this.convertSubflowToPaletteNode(subflow)
            );
        }
    );

    selectSubflowAsPaletteNodeById = createSelector(
        [selectFlowEntityById],
        (subflow: FlowEntity | SubflowEntity) => {
            if (subflow.type === 'subflow') {
                return this.convertSubflowToPaletteNode(subflow);
            }
            return undefined;
        }
    );

    selectSubflowEntitiesAsPaletteNodes = createSelector(
        [selectFlowEntities],
        (entities: Record<string, FlowEntity | SubflowEntity>) => {
            return Object.fromEntries(
                Object.values(entities)
                    .filter(entity => entity.type === 'subflow')
                    .map(entity => {
                        const paletteNode = this.convertSubflowToPaletteNode(
                            entity as SubflowEntity
                        );
                        return [paletteNode.id, paletteNode];
                    })
            );
        }
    );

    selectPaletteNodeByFlowNode = createSelector(
        [state => state, (_, flowNode: FlowNodeEntity) => flowNode],
        (state, flowNode) => {
            // either get the palette node or the subflow
            if (flowNode.type.startsWith('subflow:')) {
                return this.selectSubflowAsPaletteNodeById(
                    state,
                    flowNode.type.split(':')[1]
                );
            }
            return selectPaletteNodeById(state, flowNode.type);
        }
    );
}
