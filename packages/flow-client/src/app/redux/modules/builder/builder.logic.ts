import { AppDispatch, RootState } from '../../store';
import { FlowLogic } from '../flow/flow.logic';
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
                    /* empty */
                },
                FLOW: () => {
                    /* empty */
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
                    /* empty */
                },
                FLOW: () => {
                    /* empty */
                },
                NODE: () => dispatch(this.flow.node.editor.save()),
            })[editing.type]();
        };
    }
}
