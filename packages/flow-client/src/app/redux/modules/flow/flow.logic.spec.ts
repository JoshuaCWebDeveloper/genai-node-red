import '../../../../../vitest-esbuild-compat';

import { RootState } from '../../store';
import { builderActions } from '../builder/builder.slice';
import { FlowLogic } from './flow.logic';
import { flowActions } from './flow.slice';
import { GraphLogic } from './graph.logic';
import { NodeLogic } from './node.logic';
import { TreeLogic } from './tree.logic';

vi.mock('../builder/builder.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('../builder/builder.slice')
    >();
    return {
        ...originalModule,
        selectNewFlowCounter: vi.fn(() => 0),
    };
});

vi.mock('./flow.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('./flow.slice')
    >();
    return {
        ...originalModule,
        flowActions: {
            addFlowEntity: vi.fn(),
        },
    };
});

const mockDispatch = vi.fn();
const mockGetState = vi.fn(() => ({})) as unknown as () => RootState;

describe('flow.logic', () => {
    let flowLogic: FlowLogic;

    beforeEach(() => {
        vi.clearAllMocks();
        flowLogic = new FlowLogic();
    });

    describe('Getters', () => {
        it('graph', () => {
            const graph = flowLogic.graph;
            expect(graph).toBeInstanceOf(GraphLogic);
        });

        it('node', () => {
            const node = flowLogic.node;
            expect(node).toBeInstanceOf(NodeLogic);
        });

        it('tree', () => {
            const tree = flowLogic.tree;
            expect(tree).toBeInstanceOf(TreeLogic);
        });
    });

    describe('createNewFlow', () => {
        it('should dispatch actions to create a new flow', () => {
            const thunk = flowLogic.createNewFlow();
            thunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.addFlowEntity(
                    expect.objectContaining({
                        type: 'flow',
                        name: 'New Flow',
                    })
                )
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.addNewFlow(expect.any(String))
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.setActiveFlow(expect.any(String))
            );
        });

        it('should not set active flow if open is false', () => {
            const thunk = flowLogic.createNewFlow({}, false);
            thunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.addFlowEntity(
                    expect.objectContaining({
                        type: 'flow',
                        name: 'New Flow',
                    })
                )
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.addNewFlow(expect.any(String))
            );
            expect(mockDispatch).not.toHaveBeenCalledWith(
                builderActions.setActiveFlow(expect.any(String))
            );
        });
    });

    describe('createNewSubflow', () => {
        it('should dispatch actions to create a new subflow', () => {
            const thunk = flowLogic.createNewSubflow();
            thunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.addFlowEntity(
                    expect.objectContaining({
                        type: 'subflow',
                        name: 'New Subflow',
                    })
                )
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.addNewFlow(expect.any(String))
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.setActiveFlow(expect.any(String))
            );
        });

        it('should not set active subflow if open is false', () => {
            const thunk = flowLogic.createNewSubflow({}, false);
            thunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.addFlowEntity(
                    expect.objectContaining({
                        type: 'subflow',
                        name: 'New Subflow',
                    })
                )
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.addNewFlow(expect.any(String))
            );
            expect(mockDispatch).not.toHaveBeenCalledWith(
                builderActions.setActiveFlow(expect.any(String))
            );
        });
    });
});
