import { MockedFunction } from 'vitest';
import '../../../../../vitest-esbuild-compat';

import { RootState } from '../../store';
import {
    PaletteNodeEntity,
    selectPaletteNodeById,
} from '../palette/node.slice';
import { FlowNodeEntity, flowActions, selectFlowNodeById } from './flow.slice';
import { NodeLogic } from './node.logic';

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

        selectFlowNodeById: vi.fn(() => null),
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

describe('node.logic', () => {
    let nodeLogic: NodeLogic;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        nodeLogic = new NodeLogic();
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

            const { inputs, outputs } = nodeLogic.getNodeInputsOutputs(
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

            const { inputs, outputs } = nodeLogic.getNodeInputsOutputs(
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

            const { inputs, outputs } = nodeLogic.getNodeInputsOutputs(
                {} as FlowNodeEntity,
                node
            );

            expect(inputs).toEqual([]);
            expect(outputs).toEqual([]);
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
});
