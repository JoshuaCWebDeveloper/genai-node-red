import { MockedFunction } from 'vitest';
import '../../../../../vitest-esbuild-compat';
import { RootState } from '../../store';
import {
    PaletteNodeEntity,
    selectAllPaletteNodes,
    selectPaletteNodeById,
} from '../palette/node.slice';
import {
    FlowLogic,
    NodeModel,
    SerializedGraph,
    TreeDirectory,
    TreeFile,
} from './flow.logic';
import {
    DirectoryEntity,
    FlowEntity,
    FlowNodeEntity,
    SubflowEntity,
    flowActions,
    selectAllDirectories,
    selectAllFlowEntities,
    selectFlowEntityById,
    selectFlowNodeById,
    selectFlowNodesByFlowId,
} from './flow.slice';

vi.mock('../palette/node.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('../palette/node.slice')
    >();
    return {
        ...originalModule,
        selectAllPaletteNodes: vi.fn(() => []),
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
        selectAllFlowEntities: vi.fn(() => []),
        selectFlowNodesByFlowId: vi.fn(() => []),
        selectFlowEntityById: vi.fn(() => null),
        selectFlowNodeById: vi.fn(() => null),
        selectAllDirectories: vi.fn(() => []),
    };
});

const mockDispatch = vi.fn();
const mockGetState = vi.fn(() => ({})) as unknown as () => RootState;

const mockedSelectAllPaletteNodes = selectAllPaletteNodes as MockedFunction<
    typeof selectAllPaletteNodes
>;
const mockedSelectPaletteNodeById = selectPaletteNodeById as MockedFunction<
    typeof selectPaletteNodeById
>;
const mockedSelectFlowEntityById = selectFlowEntityById as MockedFunction<
    typeof selectFlowEntityById
>;
const mockedSelectFlowNodeById = selectFlowNodeById as MockedFunction<
    typeof selectFlowNodeById
>;
const mockedSelectFlowNodesByFlowId = selectFlowNodesByFlowId as MockedFunction<
    typeof selectFlowNodesByFlowId
>;
const mockedSelectAllFlowEntities = selectAllFlowEntities as MockedFunction<
    typeof selectAllFlowEntities
>;
const mockedSelectAllDirectories = selectAllDirectories as MockedFunction<
    typeof selectAllDirectories
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
                flowActions.upsertFlowEntity(
                    expect.objectContaining({
                        id: 'flow1',
                        type: 'flow',
                        // Other properties as they should be in the action payload
                    })
                )
            );
        });

        it('should not override existing flow properties with new ones', async () => {
            const existingFlow = {
                id: 'flow1',
                name: 'Existing Flow Label',
                type: 'flow',
                extras: { detail: 'Existing details' },
                disabled: false,
                info: '',
                env: [],
            } as FlowEntity;

            const serializedGraph = {
                id: 'flow1',
                extras: { detail: 'New details' },
                layers: [],
                offsetX: 0,
                offsetY: 0,
                zoom: 100,
                gridSize: 20,
                locked: false,
                selected: false,
            } as SerializedGraph;

            mockedSelectFlowEntityById.mockReturnValue(existingFlow);

            await flowLogic.updateFlowFromSerializedGraph(serializedGraph)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.upsertFlowEntity(
                    expect.objectContaining({
                        id: 'flow1',
                        name: 'Existing Flow Label', // Ensure the label is not overridden
                        extras: { detail: 'Existing details' }, // Ensure extras are not overridden
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
                flowActions.upsertFlowNodes(
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
                                entity: {} as PaletteNodeEntity,
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
                                entity: {} as PaletteNodeEntity,
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
                flowActions.upsertFlowNodes(
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
        const testNodeEntity: PaletteNodeEntity = {
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

            await flowLogic.updateFlowNode('node1', changes)(
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

            await flowLogic.updateFlowNode('node1', changes)(
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
                inputs: 1,
                outputs: 1,
            };

            await flowLogic.updateFlowNode('node1', changes)(
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

            await flowLogic.updateFlowNode('node1', changes)(
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
            const mockNodeEntity: PaletteNodeEntity = {
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
                type: 'flow',
                name: 'My Flow',
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
            mockedSelectAllPaletteNodes.mockImplementation(() => [
                mockNodeEntity,
            ]);
            mockedSelectFlowEntityById.mockImplementation(() => mockFlow);
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

    describe('directoryIsDefault', () => {
        it('should return true for default directories', () => {
            const defaultFlowDirectory: TreeDirectory = {
                id: 'flows',
                name: 'Flows',
                type: 'directory',
                directory: '',
                directoryPath: '',
                children: [],
            };
            const defaultSubflowDirectory: TreeDirectory = {
                id: 'subflows',
                name: 'Subflows',
                type: 'directory',
                directory: '',
                directoryPath: '',
                children: [],
            };
            expect(flowLogic.directoryIsDefault(defaultFlowDirectory)).toBe(
                true
            );
            expect(flowLogic.directoryIsDefault(defaultSubflowDirectory)).toBe(
                true
            );
        });

        it('should return false for non-default directories', () => {
            const customDirectory: TreeDirectory = {
                id: 'custom',
                name: 'Custom',
                type: 'directory',
                directory: '',
                directoryPath: '',
                children: [],
            };
            expect(flowLogic.directoryIsDefault(customDirectory)).toBe(false);
        });
    });

    describe('getFilePath', () => {
        it('should return the correct file path for a given node ID', () => {
            const treeFile: TreeFile = {
                id: 'node123',
                name: 'node123.json',
                type: 'file',
                directory: 'flows',
                directoryPath: '/flows/nodes',
            };
            const expectedPath = `/flows/nodes/node123.json`;
            expect(flowLogic.getFilePath(treeFile)).toBe(expectedPath);
        });

        it('should handle undefined or null node IDs gracefully', () => {
            const nullTreeItem: TreeFile = {
                id: '',
                name: '',
                type: 'file',
                directory: '',
                directoryPath: '',
            };
            expect(flowLogic.getFilePath(nullTreeItem)).toBe('');
        });
    });

    describe('selectFlowTree', () => {
        it('should construct a tree with custom directories', () => {
            const customDirectories: DirectoryEntity[] = [
                {
                    id: 'custom1',
                    name: 'Custom Directory 1',
                    directory: '',
                    type: 'directory',
                },
                {
                    id: 'custom2',
                    name: 'Custom Directory 2',
                    directory: '',
                    type: 'directory',
                },
            ];
            const customFlows: FlowEntity[] = [
                {
                    id: 'flow3',
                    name: 'Custom Flow 1',
                    directory: 'custom1',
                    type: 'flow',
                    disabled: false,
                    info: '',
                    env: [],
                },
                {
                    id: 'flow4',
                    name: 'Custom Flow 2',
                    directory: 'custom2',
                    type: 'flow',
                    disabled: false,
                    info: '',
                    env: [],
                },
            ];
            const customSubflows: SubflowEntity[] = [
                {
                    id: 'subflow3',
                    name: 'Custom Subflow 1',
                    directory: 'custom1',
                    type: 'subflow',
                    info: '',
                    category: '',
                    env: [],
                    color: '',
                },
                {
                    id: 'subflow4',
                    name: 'Custom Subflow 2',
                    directory: 'custom2',
                    type: 'subflow',
                    info: '',
                    category: '',
                    env: [],
                    color: '',
                },
            ];

            // Mock the selectors
            mockedSelectAllDirectories.mockReturnValue(customDirectories);
            mockedSelectAllFlowEntities.mockReturnValue(
                (customFlows as (FlowEntity | SubflowEntity)[]).concat(
                    customSubflows
                )
            );

            const result = flowLogic.selectFlowTree(mockGetState());

            expect(result).toEqual({
                tree: expect.arrayContaining([
                    {
                        id: 'custom1',
                        name: 'Custom Directory 1',
                        type: 'directory',
                        directory: '',
                        directoryPath: '',
                        children: [
                            {
                                id: 'flow3',
                                name: 'Custom Flow 1',
                                type: 'file',
                                directory: 'custom1',
                                directoryPath: '/Custom Directory 1',
                            },
                            {
                                id: 'subflow3',
                                name: 'Custom Subflow 1',
                                type: 'file',
                                directory: 'custom1',
                                directoryPath: '/Custom Directory 1',
                            },
                        ],
                    },
                    {
                        id: 'custom2',
                        name: 'Custom Directory 2',
                        type: 'directory',
                        directory: '',
                        directoryPath: '',
                        children: [
                            {
                                id: 'flow4',
                                name: 'Custom Flow 2',
                                type: 'file',
                                directory: 'custom2',
                                directoryPath: '/Custom Directory 2',
                            },
                            {
                                id: 'subflow4',
                                name: 'Custom Subflow 2',
                                type: 'file',
                                directory: 'custom2',
                                directoryPath: '/Custom Directory 2',
                            },
                        ],
                    },
                ]),
                items: expect.any(Object),
            });
        });

        it('should ensure default directories are correctly created and populated with flows and subflows', () => {
            const flows: FlowEntity[] = [
                {
                    id: 'flow1',
                    name: 'Main Flow',
                    directory: 'flows',
                    type: 'flow',
                    disabled: false,
                    info: '',
                    env: [],
                },
                {
                    id: 'flow2',
                    name: 'Secondary Flow',
                    directory: 'flows',
                    type: 'flow',
                    disabled: false,
                    info: '',
                    env: [],
                },
            ];
            const subflows: SubflowEntity[] = [
                {
                    id: 'subflow1',
                    name: 'Subflow A',
                    directory: 'subflows',
                    type: 'subflow',
                    info: '',
                    category: '',
                    env: [],
                    color: '',
                },
                {
                    id: 'subflow2',
                    name: 'Subflow B',
                    directory: 'subflows',
                    type: 'subflow',
                    info: '',
                    category: '',
                    env: [],
                    color: '',
                },
            ];

            // Mock the selectors
            mockedSelectAllDirectories.mockReturnValue([]); // No custom directories are provided
            mockedSelectAllFlowEntities.mockReturnValue(
                (flows as (FlowEntity | SubflowEntity)[]).concat(subflows)
            );

            const result = flowLogic.selectFlowTree(mockGetState());

            expect(result.tree).toEqual([
                {
                    id: 'flows',
                    name: 'Flows',
                    type: 'directory',
                    directory: '',
                    directoryPath: '',
                    children: [
                        {
                            id: 'flow1',
                            name: 'Main Flow',
                            type: 'file',
                            directory: 'flows',
                            directoryPath: '/Flows',
                        },
                        {
                            id: 'flow2',
                            name: 'Secondary Flow',
                            type: 'file',
                            directory: 'flows',
                            directoryPath: '/Flows',
                        },
                    ],
                },
                {
                    id: 'subflows',
                    name: 'Subflows',
                    type: 'directory',
                    directory: '',
                    directoryPath: '',
                    children: [
                        {
                            id: 'subflow1',
                            name: 'Subflow A',
                            type: 'file',
                            directory: 'subflows',
                            directoryPath: '/Subflows',
                        },
                        {
                            id: 'subflow2',
                            name: 'Subflow B',
                            type: 'file',
                            directory: 'subflows',
                            directoryPath: '/Subflows',
                        },
                    ],
                },
            ]);
        });

        it('should handle empty directories correctly', () => {
            // Mock empty responses
            mockedSelectAllDirectories.mockReturnValue([]);
            mockedSelectAllFlowEntities.mockReturnValue([]);

            const result = flowLogic.selectFlowTree(mockGetState());

            expect(result.tree).toEqual([
                {
                    id: 'flows',
                    name: 'Flows',
                    type: 'directory',
                    directory: '',
                    directoryPath: '',
                    children: [],
                },
                {
                    id: 'subflows',
                    name: 'Subflows',
                    type: 'directory',
                    directory: '',
                    directoryPath: '',
                    children: [],
                },
            ]);
        });
    });
});
