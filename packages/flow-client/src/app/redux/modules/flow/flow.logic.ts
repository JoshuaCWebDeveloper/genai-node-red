import { v4 as uuidv4 } from 'uuid';

import { AppDispatch, RootState } from '../../store';
import { builderActions, selectNewFlowCounter } from '../builder/builder.slice';
import {
    FlowNodeEntity,
    SubflowEntity,
    flowActions,
    selectFlowEntityById,
    selectSubflowInOutByFlowId,
    selectSubflowInstancesByFlowId,
} from './flow.slice';
import { GraphLogic } from './graph.logic';
import { NodeLogic } from './node.logic';
import { TreeLogic } from './tree.logic';

// checks if a given property has changed
const objectHasChange = <T>(
    current: T,
    changes: Partial<T>,
    property: keyof T
) =>
    Object.prototype.hasOwnProperty.call(changes, property) &&
    current[property] !== changes[property];

const partition = <T>(
    arr: T[],
    predicate: (item: T) => boolean
): [T[], T[]] => {
    const pass: T[] = [];
    const fail: T[] = [];
    arr.forEach(item => (predicate(item) ? pass.push(item) : fail.push(item)));
    return [pass, fail];
};

export class FlowLogic {
    public readonly graph: GraphLogic;
    public readonly node: NodeLogic;
    public readonly tree: TreeLogic;

    constructor() {
        this.node = new NodeLogic();
        this.graph = new GraphLogic(this.node);
        this.tree = new TreeLogic();
    }

    public createNewFlow(
        { id, directory }: Partial<{ id: string; directory: string }> = {},
        open = true
    ) {
        return (dispatch: AppDispatch, getState: () => RootState) => {
            const flowCounter = selectNewFlowCounter(getState());
            const flowId = id ?? uuidv4();
            dispatch(
                flowActions.addFlowEntity({
                    id: flowId,
                    type: 'flow',
                    name: `New Flow${flowCounter ? ` ${flowCounter}` : ''}`,
                    disabled: false,
                    info: '',
                    env: [],
                    directory,
                })
            );
            dispatch(builderActions.addNewFlow(flowId));
            if (open) {
                dispatch(builderActions.setActiveFlow(flowId));
            }
        };
    }

    public createNewSubflow(
        { id, directory }: Partial<{ id: string; directory: string }> = {},
        open = true
    ) {
        return (dispatch: AppDispatch, getState: () => RootState) => {
            const flowCounter = selectNewFlowCounter(getState());
            const subflowId = id ?? uuidv4();
            dispatch(
                flowActions.addFlowEntity({
                    id: subflowId,
                    type: 'subflow',
                    name: `New Subflow${flowCounter ? ` ${flowCounter}` : ''}`,
                    category: 'subflows',
                    color: '#ddaa99',
                    icon: 'node-red/subflow.svg',
                    info: '',
                    env: [],
                    directory,
                    inputLabels: [],
                    outputLabels: [],
                })
            );
            dispatch(builderActions.addNewFlow(subflowId));
            if (open) {
                dispatch(builderActions.setActiveFlow(subflowId));
            }
        };
    }

    private updateSubflowInstanceLabels(
        instance: FlowNodeEntity,
        subflow: SubflowEntity,
        subflowChanges: Partial<SubflowEntity>,
        which: 'inputLabels' | 'outputLabels'
    ) {
        const newLabels = Array.from({
            length: Math.max(
                instance[which]?.length ?? 0,
                subflowChanges[which]?.length ?? 0
            ),
        }).map((_, idx) =>
            instance[which]?.[idx] === subflow[which]?.[idx]
                ? subflowChanges[which]?.[idx] ?? ''
                : instance[which]?.[idx] ?? ''
        );
        if (newLabels.join('') !== instance[which]?.join('')) {
            return newLabels;
        }
        return undefined;
    }

    private updateSubflowInstances(
        subflowInstances: FlowNodeEntity[],
        subflow: SubflowEntity,
        subflowChanges: Partial<SubflowEntity>
    ) {
        const hasChange = (property: keyof SubflowEntity) =>
            objectHasChange(subflow, subflowChanges, property);
        // loop through all nodes that are instances of this subflow
        return subflowInstances
            .map(node => {
                const changes: Partial<FlowNodeEntity> = {};

                // if our name has changed and our instance is still using the default name
                if (hasChange('name') && node.name === subflow.name) {
                    changes.name = subflowChanges.name as string;
                }

                // update icon
                if (hasChange('icon') && node.icon === subflow.icon) {
                    changes.icon = subflowChanges.icon;
                }

                // update input labels
                if (hasChange('inputLabels')) {
                    const newLabels = this.updateSubflowInstanceLabels(
                        node,
                        subflow,
                        subflowChanges,
                        'inputLabels'
                    );
                    if (newLabels) {
                        changes.inputLabels = newLabels;
                    }
                }

                // update output labels
                if (hasChange('outputLabels')) {
                    const newLabels = this.updateSubflowInstanceLabels(
                        node,
                        subflow,
                        subflowChanges,
                        'outputLabels'
                    );
                    if (newLabels) {
                        changes.outputLabels = newLabels;
                    }
                }

                // update inputs
                if (hasChange('in')) {
                    changes.inputs = subflowChanges.in?.length ?? 0;
                }

                // update outputs
                if (hasChange('out')) {
                    changes.outputs = subflowChanges.out?.length ?? 0;
                }

                // only return changes if we have any
                if (Object.keys(changes).length > 0) {
                    return {
                        id: node.id,
                        changes,
                    };
                }

                return undefined;
            })
            .filter(Boolean) as {
            id: string;
            changes: Partial<FlowNodeEntity>;
        }[];
    }

    private updateSubflowInOutNodes(
        subflowInOut: FlowNodeEntity[],
        subflow: SubflowEntity,
        subflowChanges: Partial<SubflowEntity>
    ) {
        const hasChange = (property: keyof SubflowEntity) =>
            objectHasChange(subflow, subflowChanges, property);
        // loop through all nodes that are instances of this subflow
        const [inNodes, outNodes] = partition(
            subflowInOut,
            node => node.type === 'in'
        );

        return [
            ...inNodes
                .map((node, idx) =>
                    hasChange('inputLabels')
                        ? {
                              id: node.id,
                              changes: {
                                  outputLabels: [
                                      subflowChanges.inputLabels?.[idx] ??
                                          node.inputLabels?.[0] ??
                                          '',
                                  ],
                              },
                          }
                        : undefined
                )
                .filter(Boolean),
            ...outNodes
                .map((node, idx) =>
                    hasChange('outputLabels')
                        ? {
                              id: node.id,
                              changes: {
                                  inputLabels: [
                                      subflowChanges.outputLabels?.[idx] ??
                                          node.outputLabels?.[0] ??
                                          '',
                                  ],
                              },
                          }
                        : undefined
                )
                .filter(Boolean),
        ] as {
            id: string;
            changes: Partial<FlowNodeEntity>;
        }[];
    }

    public updateSubflow(subflowId: string, changes: Partial<SubflowEntity>) {
        return (dispatch: AppDispatch, getState: () => RootState) => {
            const subflow = selectFlowEntityById(
                getState(),
                subflowId
            ) as SubflowEntity;
            const subflowInstances = selectSubflowInstancesByFlowId(
                getState(),
                subflow.id
            );
            const subflowInOut = selectSubflowInOutByFlowId(
                getState(),
                subflow.id
            );

            [
                ...this.updateSubflowInstances(
                    subflowInstances,
                    subflow,
                    changes
                ),
                ...this.updateSubflowInOutNodes(subflowInOut, subflow, changes),
            ].forEach(nodeChange => {
                dispatch(
                    this.node.updateFlowNode(nodeChange.id, nodeChange.changes)
                );
            });

            dispatch(
                flowActions.updateFlowEntity({
                    id: subflow.id,
                    changes,
                })
            );
        };
    }

    private updateSubflowInOut(
        which: 'in' | 'out',
        subflow: SubflowEntity,
        count: number
    ) {
        const currentNodes = subflow[which]?.length || 0;
        const subflowChanges: Partial<SubflowEntity> = {};
        const newNodes: FlowNodeEntity[] = [];
        const oldNodeIds: string[] = [];
        // if our nodes have increased
        if (count > currentNodes) {
            // Add new nodes
            for (let i = currentNodes; i < count; i++) {
                const newNode = {
                    id: uuidv4(),
                    name: `${which === 'out' ? 'Output' : 'Input'} ${i + 1}`,
                    type: which,
                    x: which === 'in' ? 100 : 1000,
                    y: 100 * (i + 1),
                    z: subflow.id,
                    inputs: which === 'in' ? 0 : 1,
                    outputs: which === 'out' ? 0 : 1,
                    inputLabels:
                        which === 'out'
                            ? subflow.outputLabels?.slice(i, i + 1)
                            : [],
                    outputLabels:
                        which === 'in'
                            ? subflow.inputLabels?.slice(i, i + 1)
                            : [],
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                };
                newNodes.push(newNode);
                subflowChanges[which] = [
                    ...(subflow[which] ?? []),
                    ...(subflowChanges[which] ?? []),
                    newNode.id,
                ];
            }
        } else if (count < currentNodes) {
            // Remove nodes
            oldNodeIds.push(...(subflow[which]?.slice(count) ?? []));
            subflowChanges[which] = subflow[which]?.slice(0, count);
        }

        return { newNodes, oldNodeIds, subflowChanges };
    }

    public updateSubflowInputs(subflow: SubflowEntity, inputs: number) {
        return (dispatch: AppDispatch) => {
            const { newNodes, oldNodeIds, subflowChanges } =
                this.updateSubflowInOut('in', subflow, inputs);
            dispatch(this.updateSubflow(subflow.id, subflowChanges));
            dispatch(flowActions.removeFlowNodes(oldNodeIds));
            newNodes.forEach(node => {
                dispatch(this.node.createFlowNode(node));
            });
        };
    }

    public updateSubflowOutputs(subflow: SubflowEntity, outputs: number) {
        return (dispatch: AppDispatch) => {
            const { newNodes, oldNodeIds, subflowChanges } =
                this.updateSubflowInOut('out', subflow, outputs);
            dispatch(this.updateSubflow(subflow.id, subflowChanges));
            dispatch(flowActions.removeFlowNodes(oldNodeIds));
            newNodes.forEach(node => {
                dispatch(this.node.createFlowNode(node));
            });
        };
    }
}
