import '../../../../../vitest-esbuild-compat';
import { MockedFunction } from 'vitest';
import { RootState } from '../../store';
import { NodeEntity, selectAllNodes, selectNodeById } from '../node/node.slice';
import { FlowLogic, NodeModel, SerializedGraph } from './flow.logic';
import {
    FlowEntity,
    FlowNodeEntity,
    SubflowEntity,
    flowActions,
    selectEntityById,
    selectFlowNodesByFlowId,
    selectFlows,
    selectSubflows,
} from './flow.slice';

vi.mock('../node/node.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('../node/node.slice')
    >();
    return {
        ...originalModule,
        selectAllNodes: vi.fn(() => []),
        selectNodeById: vi.fn(() => null),
    };
});

// Mock the selectFlowNodesByFlowId selector if used within the method
vi.mock('./flow.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('./flow.slice')
    >();
    return {
        ...originalModule,
        selectFlows: vi.fn(() => []),
        selectSubflows: vi.fn(() => []),
        selectFlowNodesByFlowId: vi.fn(() => []),
        selectEntityById: vi.fn(() => null),
    };
});

const mockDispatch = vi.fn();
const mockGetState = vi.fn(() => ({})) as unknown as () => RootState;

const mockedSelectAllNodes = selectAllNodes as MockedFunction<
    typeof selectAllNodes
>;
const mockedSelectNodeById = selectNodeById as MockedFunction<
    typeof selectNodeById
>;
const mockedSelectEntityById = selectEntityById as MockedFunction<
    typeof selectEntityById
>;
const mockedSelectFlowNodesByFlowId = selectFlowNodesByFlowId as MockedFunction<
    typeof selectFlowNodesByFlowId
>;
const mockedSelectFlows = selectFlows as MockedFunction<typeof selectFlows>;
const mockedSelectSubflows = selectSubflows as MockedFunction<
    typeof selectSubflows
>;

describe('flow.logic', () => {
    let flowLogic: FlowLogic;
    const testNode = {
        id: 'node1',
        type: 'default',
        x: 100,
        y: 200,
        ports: [],
        name: 'Node 1',
        color: 'rgb(0,192,255)',
        extras: {
            entity: {
                type: 'nodeType',
                id: 'node1',
                nodeRedId: 'node1',
                name: 'Node 1',
                module: 'node-module',
                version: '1.0.0',
            },
        },
        locked: false,
        selected: false,
    } as NodeModel;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        flowLogic = new FlowLogic();
    });

    describe('getNodeInputsOutputs', () => {
        const baseNodeProps = {
            id: 'test-node',
            nodeRedId: 'test-node',
            module: 'module',
            version: 'version',
            name: 'name',
            type: 'type',
        };

        it('should extract inputs and outputs with default labels when no custom labels are provided', () => {
            const entity = {
                ...baseNodeProps,
                id: 'test-node',
            };

            const instance = {
                inputs: 2,
                outputs: 1,
            } as FlowNodeEntity;

            const { inputs, outputs } = flowLogic.getNodeInputsOutputs(
                instance,
                entity
            );

            expect(inputs).toEqual(['Input 1', 'Input 2']);
            expect(outputs).toEqual(['Output 1']);
        });

        it('should correctly deserialize and use custom input and output label functions', () => {
            const entity = {
                ...baseNodeProps,
                id: 'test-node',
                type: 'test-node',
                definitionScript: `
                    RED.nodes.registerType("test-node", {
                        inputLabels: function(index) { 
                            return \`Custom Input \${index + 1}\`; 
                        }, 
                        outputLabels: function(index) { 
                            return \`Custom Output \${index + 1}\`; 
                        }
                    });
                `,
            };

            const instance = {
                inputs: 2,
                outputs: 2,
            } as FlowNodeEntity;

            const { inputs, outputs } = flowLogic.getNodeInputsOutputs(
                instance,
                entity
            );

            expect(inputs).toEqual(['Custom Input 1', 'Custom Input 2']);
            expect(outputs).toEqual(['Custom Output 1', 'Custom Output 2']);
        });

        it('should handle nodes without inputs or outputs', () => {
            const node = {
                ...baseNodeProps,
                id: 'test-node',
            };

            const { inputs, outputs } = flowLogic.getNodeInputsOutputs(
                {} as FlowNodeEntity,
                node
            );

            expect(inputs).toEqual([]);
            expect(outputs).toEqual([]);
        });
    });

    describe('updateFlowFromSerializedGraph', () => {
        it('correctly creates a flow from a serialized graph', async () => {
            const serializedGraph = {
                id: 'flow1',
                offsetX: 0,
                offsetY: 0,
                zoom: 100,
                gridSize: 20,
                layers: [],
                locked: false,
                selected: false,
                extras: {},
                // Other necessary properties for the test
            };

            await flowLogic.updateFlowFromSerializedGraph(serializedGraph)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.upsertEntity(
                    expect.objectContaining({
                        id: 'flow1',
                        type: 'tab',
                        // Other properties as they should be in the action payload
                    })
                )
            );
        });

        it('correctly creates a node from a serialized graph', async () => {
            const serializedGraph = {
                id: 'flow1',
                offsetX: 0,
                offsetY: 0,
                zoom: 100,
                gridSize: 20,
                locked: false,
                selected: false,
                layers: [
                    {
                        type: 'diagram-nodes' as const,
                        models: {
                            node1: testNode,
                        },
                        id: 'layer1',
                        isSvg: false,
                        transformed: true,
                        locked: false,
                        selected: false,
                        extras: {},
                    },
                ],
            };

            await flowLogic.updateFlowFromSerializedGraph(serializedGraph)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.upsertEntities(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: 'node1',
                            // Verify other properties as needed
                        }),
                    ])
                )
            );
        });

        it('correctly adds wires based on the serialized graph', async () => {
            const serializedGraph = {
                id: 'flow1',
                offsetX: 0,
                offsetY: 0,
                zoom: 100,
                gridSize: 20,
                layers: [],
                locked: false,
                selected: false,
            } as SerializedGraph;
            serializedGraph.layers.push(
                {
                    id: 'layer1',
                    isSvg: false,
                    transformed: true,
                    type: 'diagram-nodes' as const,
                    locked: false,
                    selected: false,
                    extras: {},
                    models: {
                        node1: {
                            ...testNode,
                            id: 'node1',
                            x: 100,
                            y: 200,
                            locked: false,
                            selected: false,
                            extras: {
                                entity: {} as NodeEntity,
                            },
                            ports: [
                                {
                                    id: 'port1',
                                    type: 'out',
                                    x: 0,
                                    y: 0,
                                    name: 'Out',
                                    alignment: 'right',
                                    parentNode: 'node1',
                                    links: ['link1'],
                                    in: false,
                                    extras: {
                                        label: 'Output',
                                    },
                                },
                            ],
                        },
                        node2: {
                            ...testNode,
                            id: 'node2',
                            x: 400,
                            y: 200,
                            locked: false,
                            selected: false,
                            extras: {
                                entity: {} as NodeEntity,
                            },
                            ports: [
                                {
                                    id: 'port2',
                                    type: 'in',
                                    x: 0,
                                    y: 0,
                                    name: 'In',
                                    alignment: 'left',
                                    parentNode: 'node2',
                                    links: ['link1'],
                                    in: true,
                                    extras: {
                                        label: 'Input',
                                    },
                                },
                            ],
                        },
                    },
                },
                {
                    id: 'layer2',
                    isSvg: false,
                    transformed: true,
                    type: 'diagram-links' as const,
                    locked: false,
                    selected: false,
                    extras: {},
                    models: {
                        link1: {
                            id: 'link1',
                            type: 'default',
                            source: 'node1',
                            sourcePort: 'port1',
                            target: 'node2',
                            targetPort: 'port2',
                            points: [],
                            labels: [],
                            width: 3,
                            color: 'black',
                            curvyness: 50,
                            selectedColor: 'blue',
                            locked: false,
                            selected: false,
                            extras: {},
                        },
                    },
                }
            );

            await flowLogic.updateFlowFromSerializedGraph(serializedGraph)(
                mockDispatch,
                mockGetState
            );

            // Verify that the dispatch was called with actions that reflect the correct wiring
            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.upsertEntities(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: 'node1',
                            wires: [['node2']], // node1 is connected to node2
                        }),
                        expect.objectContaining({
                            id: 'node2',
                            wires: [], // node2 has no outgoing connections
                        }),
                    ])
                )
            );
        });
    });

    describe('updateFlowNode', () => {
        const testNodeEntity: NodeEntity = {
            id: 'node1',
            type: 'custom-node',
            nodeRedId: 'node1',
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
            mockedSelectEntityById.mockImplementation((state, id) => {
                if (id === 'node1') {
                    return testFlowNodeEntity;
                }
                return null as unknown as FlowNodeEntity;
            });

            mockedSelectNodeById.mockImplementation((state, id) => {
                if (id === 'custom-node') {
                    return testNodeEntity;
                }
                return null as unknown as NodeEntity;
            });
        });

        it('updates node inputs and outputs correctly', async () => {
            const changes = {
                inputs: 0,
                outputs: 3,
            };

            await flowLogic.updateFlowNode('node1', changes)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateEntity({
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

            await flowLogic.updateFlowNode('node1', changes)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateEntity({
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
                inputs: 1,
                outputs: 1,
            };

            await flowLogic.updateFlowNode('node1', changes)(
                mockDispatch,
                mockGetState
            );

            // Assuming the getNodeInputsOutputs method generates labels "Input 1" and "Output 1"
            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateEntity({
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

            await flowLogic.updateFlowNode('node1', changes)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateEntity({
                    id: 'node1',
                    changes: expect.objectContaining({
                        inPorts: [], // Expecting no input ports
                    }),
                })
            );
        });
    });

    describe('selectSerializedGraphByFlowId', () => {
        it('returns null for non-existent flow', () => {
            const result = flowLogic.selectSerializedGraphByFlowId.resultFunc(
                {}, // Mock state
                null as unknown as FlowEntity, // Mock flow (non-existent)
                [] // Mock flowNodes
            );

            expect(result).toBeNull();
        });

        it('correctly serializes a flow with nodes and links', () => {
            const mockNodeEntity: NodeEntity = {
                id: 'node2',
                nodeRedId: 'node2',
                name: 'Node 2',
                type: 'custom-node',
                module: 'node-module',
                version: '1.0.0',
                defaults: {
                    property1: { value: 'default1' },
                    property2: { value: 42 },
                },
                inputs: 1,
                outputs: 2,
                color: 'rgb(255,0,0)',
                icon: 'icon.png',
                label: 'Node 2 Label',
                labelStyle: 'node-label',
            };

            const mockFlow = {
                id: 'flow1',
                type: 'tab',
                label: 'My Flow',
                disabled: false,
                info: '',
                env: [],
            } as FlowEntity;

            const mockNodes = [
                {
                    id: 'node1',
                    type: 'custom-node',
                    x: 100,
                    y: 200,
                    ports: [],
                    name: 'Node 1',
                    color: 'rgb(0,192,255)',
                    extras: {
                        entity: {
                            type: 'nodeType',
                            id: 'node1',
                            nodeRedId: 'node1',
                            name: 'Node 1',
                            module: 'node-module',
                            version: '1.0.0',
                        },
                        config: {},
                    },
                    locked: false,
                    selected: false,
                    z: '123',
                    inputs: 1,
                    outputs: 1,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
            ];

            // Mock the selector responses
            mockedSelectAllNodes.mockImplementation(() => [mockNodeEntity]);
            mockedSelectEntityById.mockImplementation(() => mockFlow);
            mockedSelectFlowNodesByFlowId.mockImplementation(() => mockNodes);

            const result = flowLogic.selectSerializedGraphByFlowId.resultFunc(
                {}, // Mock state
                mockFlow, // Mock flow
                mockNodes // Mock flowNodes
            );

            expect(result).toEqual(
                expect.objectContaining({
                    id: 'flow1',
                    layers: expect.arrayContaining([
                        expect.objectContaining({
                            type: 'diagram-nodes',
                            models: expect.objectContaining({
                                node1: expect.objectContaining({
                                    id: 'node1',
                                    name: 'Node 1',
                                }),
                            }),
                        }),
                        expect.objectContaining({
                            type: 'diagram-links',
                            // Test for links if necessary
                        }),
                    ]),
                })
            );
        });
    });

    describe('selectFlowTree', () => {
        it('should construct a tree from flows and subflows', () => {
            const state = {
                flows: [
                    {
                        id: 'flow1',
                        label: 'Main Flow',
                        treePath: '/flows/main',
                    },
                    {
                        id: 'flow2',
                        label: 'Secondary Flow',
                        treePath: '/flows/secondary',
                    },
                ] as FlowEntity[],
                subflows: [
                    {
                        id: 'subflow1',
                        name: 'Subflow A',
                        treePath: '/subflows/groupA',
                    },
                    {
                        id: 'subflow2',
                        name: 'Subflow B',
                        treePath: '/subflows/groupB',
                    },
                ] as SubflowEntity[],
            };

            mockedSelectFlows.mockImplementation(() => state.flows);
            mockedSelectSubflows.mockImplementation(() => state.subflows);

            const flowLogic = new FlowLogic();
            const tree = flowLogic.selectFlowTree(state);

            expect(tree).toEqual([
                {
                    id: 'flows',
                    name: 'flows',
                    parentPath: '',
                    children: [
                        {
                            id: 'main',
                            name: 'main',
                            parentPath: '/flows',
                            children: [
                                {
                                    id: 'flow1',
                                    name: 'Main Flow',
                                    parentPath: '/flows/main',
                                },
                            ],
                        },
                        {
                            id: 'secondary',
                            name: 'secondary',
                            parentPath: '/flows',
                            children: [
                                {
                                    id: 'flow2',
                                    name: 'Secondary Flow',
                                    parentPath: '/flows/secondary',
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 'subflows',
                    name: 'subflows',
                    parentPath: '',
                    children: [
                        {
                            id: 'groupA',
                            name: 'groupA',
                            parentPath: '/subflows',
                            children: [
                                {
                                    id: 'subflow1',
                                    name: 'Subflow A',
                                    parentPath: '/subflows/groupA',
                                },
                            ],
                        },
                        {
                            id: 'groupB',
                            name: 'groupB',
                            parentPath: '/subflows',
                            children: [
                                {
                                    id: 'subflow2',
                                    name: 'Subflow B',
                                    parentPath: '/subflows/groupB',
                                },
                            ],
                        },
                    ],
                },
            ]);
        });
    });
});
