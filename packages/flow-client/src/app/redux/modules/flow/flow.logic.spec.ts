import { RootState } from '../../store';
import { FlowLogic, NodeModel, SerializedGraph } from './flow.logic';
import { flowActions } from './flow.slice';

// Mock the selectFlowNodesByFlowId selector if used within the method
vi.mock('./flow.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('./flow.slice')
    >();
    return {
        ...originalModule,
        selectFlowNodesByFlowId: vi.fn(() => []),
    };
});

const mockDispatch = vi.fn();
const mockGetState = vi.fn(() => ({})) as unknown as () => RootState;

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
    } as NodeModel;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        flowLogic = new FlowLogic();
    });

    it('correctly creates a flow from a serialized graph', async () => {
        const serializedGraph = {
            id: 'flow1',
            offsetX: 0,
            offsetY: 0,
            zoom: 100,
            gridSize: 20,
            layers: [],
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
            layers: [
                {
                    type: 'diagram-nodes' as const,
                    models: {
                        node1: testNode,
                    },
                    id: 'layer1',
                    isSvg: false,
                    transformed: true,
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
        } as SerializedGraph;
        serializedGraph.layers.push(
            {
                id: 'layer1',
                isSvg: false,
                transformed: true,
                type: 'diagram-nodes' as const,
                models: {
                    node1: {
                        ...testNode,
                        id: 'node1',
                        x: 100,
                        y: 200,
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
                                label: 'Output',
                            },
                        ],
                    },
                    node2: {
                        ...testNode,
                        id: 'node2',
                        x: 400,
                        y: 200,
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
                                label: 'Input',
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
