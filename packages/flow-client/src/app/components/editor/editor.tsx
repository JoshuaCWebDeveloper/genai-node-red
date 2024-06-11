import { useCallback, useRef } from 'react';
import styled from 'styled-components';

import { useAppDispatch, useAppLogic, useAppSelector } from '../../redux/hooks';
import {
    builderActions,
    selectEditing,
} from '../../redux/modules/builder/builder.slice';
import { ConfirmableDeleteButton } from '../shared/confirmable-delete-button';
import { Tooltip } from '../shared/tooltip';
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

        background-color: var(--color-background-main);
        color: var(--color-text-sharp);
        position: absolute;
        right: 0;
        width: 30%;
        height: 100%;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        min-width: 505px;
    }

    .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;

        p {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;
            gap: 10px;

            font-size: 1em;
            font-weight: 500;
            margin: 0.5rem 0 0.5rem 0.5rem;

            &,
            & > span {
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }

            .edit-template {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: row;
                gap: 10px;

                background-color: var(--color-background-main);
                border: 1px var(--color-border-sharp) solid;
                border-radius: 3px;
                color: var(--color-text-sharp);
                cursor: pointer;
                flex: 0 0 30px;
                font-size: 1em;
                padding: 5px;
                white-space: normal;

                &:hover {
                    background-color: var(--color-background-element-medium);
                }
            }
        }

        .actions {
            display: flex;
            flex-direction: row;
            justify-content: end;

            button {
                background-color: var(--color-background-main);
                border: none;
                color: var(--color-text-sharp);
                cursor: pointer;
                font-size: 1.3em;
                padding: 10px 20px;

                &:hover {
                    background-color: var(--color-background-element-medium);
                }
            }
        }
    }

    .editor-content {
        flex: 1;
        overflow: hidden;
        position: relative;
    }

    .actions.danger {
        display: flex;
        justify-content: center;
        padding: 10px;

        button {
            font-size: 1.4em;
            padding: 15px 10px 10px;

            i {
                margin: 0;
                margin-left: 10px;
            }

            &:hover {
                background-color: var(--color-background-element-medium);
            }
        }
    }
`;

const StyledTooltip = styled(Tooltip)`
    font-size: 1em;
`;

export const Editor = () => {
    const dispatch = useAppDispatch();
    const builderLogic = useAppLogic().builder;
    const editing = useAppSelector(selectEditing);

    const tooltipId = useRef(`tooltip-${Date.now()}`);

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

    const handleEditTemplate = useCallback(() => {
        closeEditor();
        dispatch(
            builderActions.setActiveFlow(
                editing?.data.entityType?.replace('subflow:', '') ?? ''
            )
        );
    }, [closeEditor, dispatch, editing?.data.entityType]);

    if (!editing) return null;

    return (
        <StyledEditor>
            <div className="overlay" onClick={handleSave}></div>
            <div className="editor-pane">
                <div className="editor-header">
                    <p>
                        {
                            {
                                FLOW: 'Edit flow',
                                SUBFLOW: 'Edit subflow',
                                NODE: editing.data.entityType?.startsWith(
                                    'subflow:'
                                ) ? (
                                    <>
                                        <button
                                            className="edit-template"
                                            onClick={handleEditTemplate}
                                            data-tooltip-id={tooltipId.current}
                                            data-tooltip-content="Edit Subflow Template"
                                        >
                                            <i className="fas fa-sitemap"></i>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <span>{`Edit subflow instance: ${editing.data.name}`}</span>
                                    </>
                                ) : (
                                    `Edit ${editing.data.entityType} node`
                                ),
                            }[editing.type]
                        }
                    </p>

                    <div className="actions">
                        <button
                            className="save"
                            data-tooltip-id={tooltipId.current}
                            data-tooltip-content="Save"
                            onClick={handleSave}
                        >
                            <i className="fas fa-save"></i>
                        </button>

                        <button
                            className="cancel"
                            data-tooltip-id={tooltipId.current}
                            data-tooltip-content="Cancel"
                            onClick={handleCancel}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
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

            <StyledTooltip id={tooltipId.current} />
        </StyledEditor>
    );
};

export default Editor;
