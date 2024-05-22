import { MockedFunction } from 'vitest';
import '../../../../../vitest-esbuild-compat';

import { RootState } from '../../store';
import {
    PaletteNodeEntity,
    selectAllPaletteNodes,
} from '../palette/node.slice';
import {
    FlowEntity,
    flowActions,
    selectFlowEntityById,
    selectFlowNodesByFlowId,
} from './flow.slice';
import { GraphLogic, NodeModel, SerializedGraph } from './graph.logic';

vi.mock('../palette/node.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('../palette/node.slice')
    >();
    return {
        ...originalModule,
        selectAllPaletteNodes: vi.fn(() => []),
    };
});

// Mock the selectFlowNodesByFlowId selector if used within the method
vi.mock('./flow.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('./flow.slice')
    >();
    return {
        ...originalModule,

        selectFlowNodesByFlowId: vi.fn(() => []),
        selectFlowEntityById: vi.fn(() => null),
    };
});

const mockDispatch = vi.fn();
const mockGetState = vi.fn(() => ({})) as unknown as () => RootState;

const mockedSelectAllPaletteNodes = selectAllPaletteNodes as MockedFunction<
    typeof selectAllPaletteNodes
>;

const mockedSelectFlowEntityById = selectFlowEntityById as MockedFunction<
    typeof selectFlowEntityById
>;

const mockedSelectFlowNodesByFlowId = selectFlowNodesByFlowId as MockedFunction<
    typeof selectFlowNodesByFlowId
>;

describe('graph.logic', () => {
    let graphLogic: GraphLogic;
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
        graphLogic = new GraphLogic();
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

            await graphLogic.updateFlowFromSerializedGraph(serializedGraph)(
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

            await graphLogic.updateFlowFromSerializedGraph(serializedGraph)(
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

            await graphLogic.updateFlowFromSerializedGraph(serializedGraph)(
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

            await graphLogic.updateFlowFromSerializedGraph(serializedGraph)(
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

    describe('selectSerializedGraphByFlowId', () => {
        it('returns null for non-existent flow', () => {
            const result = graphLogic.selectSerializedGraphByFlowId.resultFunc(
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

            const result = graphLogic.selectSerializedGraphByFlowId.resultFunc(
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
});
