import { AppDispatch, RootState } from '../../store';
import { FlowLogic } from '../flow/flow.logic';
import { flowActions } from '../flow/flow.slice';
import { selectEditing } from './builder.slice';

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
                        flowActions.updateFlowEntity({
                            id: editing.id,
                            changes: {
                                name: editing.data.name,
                                info: editing.data.info,
                                env: editing.data.env,
                                color: editing.data.color,
                                icon: editing.data.icon,
                                category: editing.data.category,
                                inputLabels: editing.data.inputLabels,
                                outputLabels: editing.data.outputLabels,
                            },
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
}
