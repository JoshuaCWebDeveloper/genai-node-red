import { MockedFunction } from 'vitest';
import '../../../../../vitest-esbuild-compat';

import { RootState } from '../../store';
import {
    PaletteNodeEntity,
    selectPaletteNodeById,
} from '../palette/node.slice';
import {
    FlowEntity,
    FlowNodeEntity,
    SubflowEntity,
    flowActions,
    selectAllSubflows,
    selectFlowEntities,
    selectFlowEntityById,
    selectFlowNodeById,
} from './flow.slice';
import { NodeLogic } from './node.logic';
import { NodeEditorLogic } from './node-editor.logic';

vi.mock('../palette/node.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('../palette/node.slice')
    >();
    return {
        ...originalModule,

        selectPaletteNodeById: vi.fn(() => null),
    };
});

// Mock the selectFlowNodesByFlowId selector if used within the method
vi.mock('./flow.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('./flow.slice')
    >();
    return {
        ...originalModule,
        selectFlowEntityById: vi.fn(() => null),
        selectFlowEntities: vi.fn(() => []),
        selectFlowNodeById: vi.fn(() => null),
        selectAllSubflows: vi.fn(() => []),
    };
});

const mockDispatch = vi.fn();
const mockGetState = vi.fn(() => ({})) as unknown as () => RootState;

const mockedSelectPaletteNodeById = selectPaletteNodeById as MockedFunction<
    typeof selectPaletteNodeById
>;

const mockedSelectFlowNodeById = selectFlowNodeById as MockedFunction<
    typeof selectFlowNodeById
>;

const mockedSelectFlowEntityById = selectFlowEntityById as MockedFunction<
    typeof selectFlowEntityById
>;

const mockedSelectFlowEntities = selectFlowEntities as MockedFunction<
    typeof selectFlowEntities
>;

const mockedSelectAllSubflows = selectAllSubflows as MockedFunction<
    typeof selectAllSubflows
>;

describe('node.logic', () => {
    let nodeLogic: NodeLogic;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        nodeLogic = new NodeLogic();
    });

    it('editor', () => {
        const editor = nodeLogic.editor;
        expect(editor).toBeInstanceOf(NodeEditorLogic);
    });

    describe('createFlowNode', () => {
        const testNodeEntity: PaletteNodeEntity = {
            id: 'node1',
            type: 'custom-node',
            nodeRedId: 'node1',
            nodeRedName: 'Test Node',
            name: 'Test Node',
            module: 'test-module',
            version: '1.0.0',
        };

        const testFlowNodeEntity: FlowNodeEntity = {
            id: 'node1',
            type: 'custom-node',
            x: 100,
            y: 200,
            z: 'flow1',
            name: 'Test Node',
            wires: [],
            inPorts: [],
            outPorts: [],
            links: {},
            inputs: 0,
            outputs: 0,
        };

        beforeEach(() => {
            mockedSelectPaletteNodeById.mockImplementation((state, id) => {
                if (id === 'custom-node') {
                    return testNodeEntity;
                }
                return null as unknown as PaletteNodeEntity;
            });
        });

        it('creates a node with the correct inputs and outputs', async () => {
            const newNode: FlowNodeEntity = {
                ...testFlowNodeEntity,
                id: 'new-node',
                inputs: 1,
                outputs: 3,
            };

            await nodeLogic.createFlowNode(newNode)(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.addFlowNode(
                    expect.objectContaining({
                        id: 'new-node',
                        inputs: 1,
                        outputs: 3,
                        inPorts: expect.arrayContaining([
                            expect.objectContaining({
                                extras: expect.objectContaining({
                                    label: 'Input 1',
                                }),
                            }),
                        ]),
                        outPorts: expect.arrayContaining([
                            expect.objectContaining({
                                extras: expect.objectContaining({
                                    label: 'Output 1',
                                }),
                            }),
                            expect.objectContaining({
                                extras: expect.objectContaining({
                                    label: 'Output 2',
                                }),
                            }),
                            expect.objectContaining({
                                extras: expect.objectContaining({
                                    label: 'Output 3',
                                }),
                            }),
                        ]),
                    })
                )
            );
        });

        it('creates a node with no inputs or outputs', async () => {
            const newNode: FlowNodeEntity = {
                ...testFlowNodeEntity,
                id: 'new-node',
                inputs: 0,
                outputs: 0,
            };

            await nodeLogic.createFlowNode(newNode)(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: flowActions.addFlowNode.type,
                    payload: expect.objectContaining({
                        id: 'new-node',
                        inputs: 0,
                        outputs: 0,
                        inPorts: [],
                        outPorts: [],
                    }),
                })
            );
        });

        it('creates a node with custom input and output labels', async () => {
            const newNode: FlowNodeEntity = {
                ...testFlowNodeEntity,
                id: 'new-node',
                inputs: 1,
                outputs: 2,
            };

            const customNodeEntity: PaletteNodeEntity = {
                ...testNodeEntity,
                definitionScript: `
                    RED.nodes.registerType("custom-node", {
                        inputLabels: function(index) { 
                            return \`Custom Input \${index + 1}\`; 
                        }, 
                        outputLabels: function(index) { 
                            return \`Custom Output \${index + 1}\`; 
                        }
                    });
                `,
            };

            mockedSelectPaletteNodeById.mockImplementation((state, id) => {
                if (id === 'custom-node') {
                    return customNodeEntity;
                }
                return null as unknown as PaletteNodeEntity;
            });

            await nodeLogic.createFlowNode(newNode)(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.addFlowNode(
                    expect.objectContaining({
                        id: 'new-node',
                        inputs: 1,
                        outputs: 2,
                        inPorts: expect.arrayContaining([
                            expect.objectContaining({
                                extras: expect.objectContaining({
                                    label: 'Custom Input 1',
                                }),
                            }),
                        ]),
                        outPorts: expect.arrayContaining([
                            expect.objectContaining({
                                extras: expect.objectContaining({
                                    label: 'Custom Output 1',
                                }),
                            }),
                            expect.objectContaining({
                                extras: expect.objectContaining({
                                    label: 'Custom Output 2',
                                }),
                            }),
                        ]),
                    })
                )
            );
        });
    });

    describe('updateFlowNode', () => {
        const testNodeEntity: PaletteNodeEntity = {
            id: 'node1',
            type: 'custom-node',
            nodeRedId: 'node1',
            nodeRedName: 'Test Node',
            name: 'Test Node',
            module: 'test-module',
            version: '1.0.0',
        };

        const numInputs = 1;
        const numOutputs = 2;

        const testFlowNodeEntity: FlowNodeEntity = {
            id: 'node1',
            type: 'custom-node',
            x: 100,
            y: 200,
            z: 'flow1',
            name: 'Test Node',
            wires: Array.from({ length: numOutputs }, () => []), // Assuming 1 output, no connections yet
            inPorts: Array.from({ length: numInputs }, (_, i) => ({
                id: `in${i}`,
                type: 'default',
                x: 0,
                y: 0,
                name: `Input Port ${i}`,
                alignment: 'left',
                maximumLinks: 1,
                connected: false,
                parentNode: 'node1',
                links: [],
                in: true,
                extras: {
                    label: `Input Port ${i}`,
                },
            })), // 1 input port
            outPorts: Array.from({ length: numOutputs }, (_, i) => ({
                id: `out${i}`,
                type: 'default',
                x: 0,
                y: 0,
                name: `Output Port ${i}`,
                alignment: 'right',
                maximumLinks: 1,
                connected: false,
                parentNode: 'node1',
                links: [],
                in: false,
                extras: {
                    label: `Output Port ${i}`,
                },
            })), // 1 output port
            links: {},
            inputs: numInputs,
            outputs: numOutputs,
        };
        beforeEach(() => {
            mockedSelectFlowNodeById.mockImplementation((state, id) => {
                if (id === 'node1') {
                    return testFlowNodeEntity;
                }
                return null as unknown as FlowNodeEntity;
            });

            mockedSelectPaletteNodeById.mockImplementation((state, id) => {
                if (id === 'custom-node') {
                    return testNodeEntity;
                }
                return null as unknown as PaletteNodeEntity;
            });
        });

        it('updates node inputs and outputs correctly', async () => {
            const changes = {
                inputs: 0,
                outputs: 3,
            };

            await nodeLogic.updateFlowNode('node1', changes)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateFlowNode({
                    id: 'node1',
                    changes: expect.objectContaining({
                        inputs: 0,
                        outputs: 3,
                        // Additional checks for ports and wires if necessary
                    }),
                })
            );
        });

        it('handles changes in node outputs correctly', async () => {
            const changes = {
                outputs: '{"0": "-1", "1": "0"}', // Move output 1 to 0, remove output 0
            };

            await nodeLogic.updateFlowNode('node1', changes)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateFlowNode({
                    id: 'node1',
                    changes: expect.objectContaining({
                        outputs: 1,
                        wires: [[]],
                        outPorts: expect.arrayContaining([
                            expect.objectContaining({
                                id: 'out1',
                                links: [],
                            }),
                        ]),
                        // Verify that the output ports and wires are correctly updated
                    }),
                })
            );
        });

        it('updates node labels based on inputs and outputs', async () => {
            const changes = {
                inputLabels: ['My Input'],
                outputLabels: ['My Output'],
            };

            await nodeLogic.updateFlowNode('node1', changes)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateFlowNode({
                    id: 'node1',
                    changes: expect.objectContaining({
                        inPorts: expect.arrayContaining([
                            expect.objectContaining({
                                extras: expect.objectContaining({
                                    label: changes.inputLabels[0],
                                }),
                            }),
                        ]),
                        outPorts: expect.arrayContaining([
                            expect.objectContaining({
                                extras: expect.objectContaining({
                                    label: changes.outputLabels[0],
                                }),
                            }),
                            expect.objectContaining({
                                extras: expect.objectContaining({
                                    label: 'Output 2',
                                }),
                            }),
                        ]),
                    }),
                })
            );
        });

        it('updates node labels based on inputLabels and outputLabels', async () => {
            const changes = {
                inputs: 1,
                outputs: 1,
            };

            await nodeLogic.updateFlowNode('node1', changes)(
                mockDispatch,
                mockGetState
            );

            // Assuming the getNodeInputsOutputs method generates labels "Input 1" and "Output 1"
            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateFlowNode({
                    id: 'node1',
                    changes: expect.objectContaining({
                        inPorts: expect.arrayContaining([
                            expect.objectContaining({
                                extras: expect.objectContaining({
                                    label: 'Input 1',
                                }),
                            }),
                        ]),
                        outPorts: expect.arrayContaining([
                            expect.objectContaining({
                                extras: expect.objectContaining({
                                    label: 'Output 1',
                                }),
                            }),
                        ]),
                    }),
                })
            );
        });

        it('removes all input ports when inputs set to 0', async () => {
            const changes = {
                inputs: 0, // Set inputs to 0, expecting all input ports to be removed
            };

            await nodeLogic.updateFlowNode('node1', changes)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateFlowNode({
                    id: 'node1',
                    changes: expect.objectContaining({
                        inPorts: [], // Expecting no input ports
                    }),
                })
            );
        });
    });

    describe('selectAllSubflowsAsPaletteNodes', () => {
        it('should convert subflows to palette nodes correctly', () => {
            const subflows = [
                {
                    id: 'subflow1',
                    name: 'Subflow One',
                    category: 'default',
                    color: '#FF0000',
                },
                {
                    id: 'subflow2',
                    name: 'Subflow Two',
                    category: 'custom',
                    color: '#00FF00',
                },
            ] as SubflowEntity[];

            const expectedPaletteNodes = [
                {
                    id: 'subflow:subflow1',
                    nodeRedId: '',
                    nodeRedName: 'Subflow One',
                    name: 'Subflow One',
                    type: 'subflow:subflow1',
                    category: 'default',
                    color: '#FF0000',
                    module: 'subflows',
                    version: '1.0.0',
                },
                {
                    id: 'subflow:subflow2',
                    nodeRedId: '',
                    nodeRedName: 'Subflow Two',
                    name: 'Subflow Two',
                    type: 'subflow:subflow2',
                    category: 'custom',
                    color: '#00FF00',
                    module: 'subflows',
                    version: '1.0.0',
                },
            ];

            mockedSelectAllSubflows.mockImplementation(() => subflows);

            const result = nodeLogic.selectAllSubflowsAsPaletteNodes(
                {} as RootState
            );
            expect(result).toEqual(
                expect.arrayContaining(
                    expectedPaletteNodes.map(it =>
                        expect.objectContaining({
                            ...it,
                        })
                    )
                )
            );
        });

        it('should handle empty subflows array', () => {
            const subflows: SubflowEntity[] = [];

            mockedSelectAllSubflows.mockImplementation(() => subflows);

            const result = nodeLogic.selectAllSubflowsAsPaletteNodes(
                {} as RootState
            );

            expect(result).toEqual([]);
        });
    });

    describe('selectSubflowAsPaletteNodeById', () => {
        it('should convert a subflow entity to a palette node correctly', () => {
            const subflow: SubflowEntity = {
                id: 'subflow1',
                name: 'Subflow One',
                type: 'subflow',
                category: 'default',
                color: '#FF0000',
                info: '',
                env: [],
            };

            const expectedPaletteNode: PaletteNodeEntity = {
                id: 'subflow:subflow1',
                nodeRedId: '',
                nodeRedName: 'Subflow One',
                name: 'Subflow One',
                type: 'subflow:subflow1',
                category: 'default',
                color: '#FF0000',
                module: 'subflows',
                version: '1.0.0',
            };

            mockedSelectFlowEntityById.mockImplementation(() => subflow);

            const result = nodeLogic.selectSubflowAsPaletteNodeById(
                {} as RootState,
                subflow.id
            );

            expect(result).toEqual(
                expect.objectContaining(expectedPaletteNode)
            );
        });

        it('should return undefined for non-subflow entities', () => {
            const flowEntity: FlowEntity = {
                id: 'flow1',
                name: 'Flow One',
                type: 'flow',
                info: '',
                env: [],
                disabled: false,
            };

            mockedSelectFlowEntityById.mockImplementation(() => flowEntity);

            const result = nodeLogic.selectSubflowAsPaletteNodeById(
                {} as RootState,
                flowEntity.id
            );

            expect(result).toBeUndefined();
        });
    });

    describe('selectSubflowEntitiesAsPaletteNodes', () => {
        it('should convert all subflow entities to palette nodes correctly', () => {
            const entities: Record<string, FlowEntity | SubflowEntity> = {
                subflow1: {
                    id: 'subflow1',
                    name: 'Subflow One',
                    type: 'subflow',
                    category: 'default',
                    color: '#FF0000',
                    info: '',
                    env: [],
                },
                subflow2: {
                    id: 'subflow2',
                    name: 'Subflow Two',
                    type: 'subflow',
                    category: 'custom',
                    color: '#00FF00',
                    info: '',
                    env: [],
                },
                flow1: {
                    id: 'flow1',
                    name: 'Flow One',
                    type: 'flow',
                    info: '',
                    env: [],
                    disabled: false,
                },
            };

            const expectedPaletteNodes = {
                'subflow:subflow1': {
                    id: 'subflow:subflow1',
                    nodeRedId: '',
                    nodeRedName: 'Subflow One',
                    name: 'Subflow One',
                    type: 'subflow:subflow1',
                    category: 'default',
                    color: '#FF0000',
                    module: 'subflows',
                    version: '1.0.0',
                },
                'subflow:subflow2': {
                    id: 'subflow:subflow2',
                    nodeRedId: '',
                    nodeRedName: 'Subflow Two',
                    name: 'Subflow Two',
                    type: 'subflow:subflow2',
                    category: 'custom',
                    color: '#00FF00',
                    module: 'subflows',
                    version: '1.0.0',
                },
            };

            mockedSelectFlowEntities.mockImplementation(() => entities);

            const result = nodeLogic.selectSubflowEntitiesAsPaletteNodes(
                {} as RootState
            );

            expect(result).toMatchObject(expectedPaletteNodes);
        });
    });

    describe('selectPaletteNodeByFlowNode', () => {
        it('should return the correct palette node for a given flow node', () => {
            const flowNode: FlowNodeEntity = {
                id: 'node1',
                type: 'custom-node',
                x: 100,
                y: 200,
                z: 'flow1',
                name: 'Test Node',
                wires: [],
                inPorts: [],
                outPorts: [],
                links: {},
                inputs: 1,
                outputs: 1,
            };

            const paletteNode: PaletteNodeEntity = {
                id: 'custom-node',
                type: 'custom-node',
                nodeRedId: 'node1',
                nodeRedName: 'Test Node',
                name: 'Test Node',
                module: 'test-module',
                version: '1.0.0',
            };

            mockedSelectPaletteNodeById.mockImplementation((_state, id) => {
                if (id === 'custom-node') {
                    return paletteNode;
                }
                return undefined as unknown as PaletteNodeEntity;
            });

            const result = nodeLogic.selectPaletteNodeByFlowNode(
                {} as RootState,
                flowNode
            );

            expect(result).toEqual(paletteNode);
        });

        it('should return the correct subflow palette node for a given subflow node', () => {
            const flowNode: FlowNodeEntity = {
                id: 'node1',
                type: 'subflow:subflow1',
                x: 100,
                y: 200,
                z: 'flow1',
                name: 'Test Subflow Node',
                wires: [],
                inPorts: [],
                outPorts: [],
                links: {},
                inputs: 1,
                outputs: 1,
            };

            const subflow: SubflowEntity = {
                id: 'subflow1',
                name: 'Subflow One',
                type: 'subflow',
                category: 'default',
                color: '#FF0000',
                info: '',
                env: [],
            };

            const expectedPaletteNode: PaletteNodeEntity = {
                id: 'subflow:subflow1',
                nodeRedId: '',
                nodeRedName: 'Subflow One',
                name: 'Subflow One',
                type: 'subflow:subflow1',
                category: 'default',
                color: '#FF0000',
                module: 'subflows',
                version: '1.0.0',
            };

            mockedSelectFlowEntityById.mockImplementation((state, id) => {
                if (id === 'subflow1') {
                    return subflow;
                }
                return undefined as unknown as SubflowEntity;
            });

            const result = nodeLogic.selectPaletteNodeByFlowNode(
                {} as RootState,
                flowNode
            );

            expect(result).toMatchObject(expectedPaletteNode);
        });

        it('should return in and out palette nodes for a given flow node', () => {
            const inNode: FlowNodeEntity = {
                id: 'node1',
                type: 'in',
                x: 100,
                y: 200,
                z: 'flow1',
                name: 'In Node',
                wires: [],
                inPorts: [],
                outPorts: [],
                links: {},
                inputs: 1,
                outputs: 1,
            };

            const outNode: FlowNodeEntity = {
                id: 'node2',
                type: 'out',
                x: 100,
                y: 200,
                z: 'flow1',
                name: 'Out Node',
                wires: [],
                inPorts: [],
                outPorts: [],
                links: {},
                inputs: 1,
                outputs: 1,
            };

            const inResult = nodeLogic.selectPaletteNodeByFlowNode(
                {} as RootState,
                inNode
            );

            const outResult = nodeLogic.selectPaletteNodeByFlowNode(
                {} as RootState,
                outNode
            );

            expect(inResult).toMatchObject({
                id: 'in',
                type: 'in',
                name: 'In',
                module: 'subflows',
                version: '1.0.0',
            });

            expect(outResult).toMatchObject({
                id: 'out',
                type: 'out',
                name: 'Out',
                module: 'subflows',
                version: '1.0.0',
            });
        });

        it('should return undefined for a non-existent flow node type', () => {
            const flowNode: FlowNodeEntity = {
                id: 'node1',
                type: 'non-existent-node',
                x: 100,
                y: 200,
                z: 'flow1',
                name: 'Non-existent Node',
                wires: [],
                inPorts: [],
                outPorts: [],
                links: {},
                inputs: 1,
                outputs: 1,
            };

            mockedSelectPaletteNodeById.mockImplementation(
                () => undefined as unknown as PaletteNodeEntity
            );

            const result = nodeLogic.selectPaletteNodeByFlowNode(
                {} as RootState,
                flowNode
            );

            expect(result).toBeUndefined();
        });
    });

    describe('selectInOutPaletteNodeEntities()', () => {
        let nodeLogic: NodeLogic;

        beforeEach(() => {
            nodeLogic = new NodeLogic();
        });

        it('should return in and out palette node entities', () => {
            const result = nodeLogic.selectInOutPaletteNodeEntities();

            expect(result).toMatchObject({
                in: expect.objectContaining({
                    id: 'in',
                    type: 'in',
                    name: 'In',
                    module: 'subflows',
                    version: '1.0.0',
                }),
                out: expect.objectContaining({
                    id: 'out',
                    type: 'out',
                    name: 'Out',
                    module: 'subflows',
                    version: '1.0.0',
                }),
            });
        });

        it('should memoize the result', () => {
            const firstResult = nodeLogic.selectInOutPaletteNodeEntities();
            const secondResult = nodeLogic.selectInOutPaletteNodeEntities();

            expect(firstResult).toBe(secondResult);
        });
    });
});
