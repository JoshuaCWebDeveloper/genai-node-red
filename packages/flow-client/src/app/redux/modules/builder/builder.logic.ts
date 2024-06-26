import { AppDispatch, RootState } from '../../store';
import { FlowLogic } from '../flow/flow.logic';
import {
    FlowEntity,
    SubflowEntity,
    flowActions,
    selectFlowEntityById,
} from '../flow/flow.slice';
import { EDITING_TYPE, builderActions, selectEditing } from './builder.slice';

export class BuilderLogic {
    constructor(private flow: FlowLogic) {}

    editorCancel() {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            const editing = selectEditing(getState());
            if (!editing) {
                return;
            }

            ({
                SUBFLOW: () => {
                    /* empty */
                },
                FLOW: () => {
                    /* empty */
                },
                NODE: () => dispatch(this.flow.node.editor.cancel()),
            })[editing.type]();
        };
    }

    editorDelete() {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            const editing = selectEditing(getState());
            if (!editing) {
                return;
            }

            ({
                SUBFLOW: () => {
                    dispatch(flowActions.removeFlowEntity(editing.id));
                },
                FLOW: () => {
                    dispatch(flowActions.removeFlowEntity(editing.id));
                },
                NODE: () => dispatch(this.flow.node.editor.delete()),
            })[editing.type]();
        };
    }

    editorSave() {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            const editing = selectEditing(getState());
            if (!editing) {
                return;
            }

            ({
                SUBFLOW: () => {
                    dispatch(
                        this.flow.updateSubflow(editing.id, {
                            name: editing.data.name,
                            info: editing.data.info,
                            env: editing.data.env,
                            color: editing.data.color,
                            icon: editing.data.icon,
                            category: editing.data.category,
                            inputLabels: editing.data.inputLabels,
                            outputLabels: editing.data.outputLabels,
                        })
                    );
                },
                FLOW: () => {
                    dispatch(
                        flowActions.updateFlowEntity({
                            id: editing.id,
                            changes: {
                                name: editing.data.name,
                                info: editing.data.info,
                                env: editing.data.env,
                            },
                        })
                    );
                },
                NODE: () => dispatch(this.flow.node.editor.save()),
            })[editing.type]();
        };
    }

    editFlow(flow: FlowEntity) {
        return async (dispatch: AppDispatch) => {
            dispatch(
                builderActions.setEditing({
                    id: flow.id,
                    type: EDITING_TYPE.FLOW,
                    data: {
                        info: flow.info,
                        name: flow.name,
                        env: flow.env,
                    },
                })
            );
        };
    }

    editSubflow(subflow: SubflowEntity) {
        return async (dispatch: AppDispatch) => {
            dispatch(
                builderActions.setEditing({
                    id: subflow.id,
                    type: EDITING_TYPE.SUBFLOW,
                    data: {
                        info: subflow.info,
                        name: subflow.name,
                        env: subflow.env,

                        color: subflow.color,
                        icon: subflow.icon,
                        category: subflow.category,
                        inputLabels: subflow.inputLabels,
                        outputLabels: subflow.outputLabels,
                    },
                })
            );
        };
    }

    editFlowEntityById(flowId: string) {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            const flow = selectFlowEntityById(getState(), flowId);

            if (!flow) {
                return;
            }

            dispatch(
                {
                    flow: () => this.editFlow(flow as FlowEntity),
                    subflow: () => this.editSubflow(flow as SubflowEntity),
                }[flow.type]()
            );
        };
    }
}
