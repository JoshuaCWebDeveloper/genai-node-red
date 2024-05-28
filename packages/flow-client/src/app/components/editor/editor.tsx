import { useCallback } from 'react';
import styled from 'styled-components';

import { useAppDispatch, useAppLogic, useAppSelector } from '../../redux/hooks';
import {
    builderActions,
    selectEditing,
} from '../../redux/modules/builder/builder.slice';
import { ConfirmableDeleteButton } from '../shared/confirmable-delete-button';
import { FlowEditor } from './flow-editor';
import { NodeEditor } from './node-editor';
import { SubflowEditor } from './subflow-editor';

const StyledEditor = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: flex-end;
    }

    .editor-pane {
        display: flex;
        flex-direction: column;

        position: absolute;
        right: 0;
        width: 30%;
        height: 100%;
        background-color: white;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        min-width: 505px;
    }

    .editor-content {
        flex: 1;
        position: relative;
    }
`;

export const Editor = () => {
    const dispatch = useAppDispatch();
    const builderLogic = useAppLogic().builder;

    const editing = useAppSelector(selectEditing);

    const closeEditor = useCallback(() => {
        dispatch(builderActions.clearEditing());
    }, [dispatch]);

    const handleCancel = useCallback(() => {
        dispatch(builderLogic.editorCancel());

        closeEditor();
    }, [builderLogic, closeEditor, dispatch]);

    const handleDelete = useCallback(() => {
        dispatch(builderLogic.editorDelete());

        closeEditor();
    }, [builderLogic, closeEditor, dispatch]);

    const handleSave = useCallback(() => {
        dispatch(builderLogic.editorSave());

        // close editor
        closeEditor();
    }, [builderLogic, closeEditor, dispatch]);

    if (!editing) return null;

    return (
        <StyledEditor>
            <div className="overlay" onClick={handleSave}></div>
            <div className="editor-pane">
                <div className="editor-header">
                    <button className="save" onClick={handleSave}>
                        <i className="fas fa-save"></i> Save Changes
                    </button>

                    <button className="cancel" onClick={handleCancel}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="editor-content">
                    {
                        {
                            NODE: <NodeEditor />,
                            SUBFLOW: <SubflowEditor />,
                            FLOW: <FlowEditor />,
                        }[editing.type]
                    }
                </div>

                <div className="actions danger">
                    <ConfirmableDeleteButton
                        onDelete={handleDelete}
                        contentBefore="Delete"
                    />
                </div>
            </div>
        </StyledEditor>
    );
};

export default Editor;
