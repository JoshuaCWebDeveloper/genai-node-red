import { v4 as uuidv4 } from 'uuid';

import { AppDispatch, RootState } from '../../store';
import { GraphLogic } from './graph.logic';
import { NodeLogic } from './node.logic';
import { TreeLogic } from './tree.logic';
import { builderActions, selectNewFlowCounter } from '../builder/builder.slice';
import { flowActions } from './flow.slice';

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
}
