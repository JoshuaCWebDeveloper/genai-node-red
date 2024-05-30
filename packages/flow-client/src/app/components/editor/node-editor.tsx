import { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { useAppDispatch, useAppLogic, useAppSelector } from '../../redux/hooks';
import { selectEditing } from '../../redux/modules/builder/builder.slice';
import {
    FlowNodeEntity,
    selectFlowNodeById,
} from '../../redux/modules/flow/flow.slice';
import { selectPaletteNodeById } from '../../redux/modules/palette/node.slice';
import { RedUiContainer } from './red-ui-container';

const StyledNodeEditor = styled.div`
    height: 100%;

    .red-ui-container {
        height: 100%;
    }
`;

const StyledRedUi = styled.div`
    .red-ui-tray {
        background-color: transparent;
        color: var(--color-text-sharp);
        right: 0px;
        transition: right 0.25s ease 0s;
        z-index: auto;
        top: 0px;
        width: 100%;
    }

    .red-ui-tabs {
        background-color: transparent;

        ul {
            min-width: initial !important;

            li {
                background-color: transparent;
                border-color: var(--color-border-light);
                border-bottom-color: transparent;
                width: 23.5%;

                a.red-ui-tab-label {
                    color: var(--color-text-sharp);
                }

                .red-ui-tabs-fade {
                    background: none;
                }

                &.active {
                    background-color: var(--color-background-main);
                    border-color: var(--color-border-medium);
                    border-bottom: none;

                    a.red-ui-tab-label {
                        color: var(--color-text-sharp);
                    }

                    .red-ui-tabs-fade {
                        background: none;
                    }
                }

                &:not(.active) {
                    a.red-ui-tab-label:hover {
                        background-color: var(
                            --color-background-element-medium
                        );
                        color: var(--color-text-sharp);

                        & + .red-ui-tabs-fade {
                            background: none;
                        }
                    }
                }
            }
        }

        .red-ui-tab-link-buttons {
            background-color: transparent;

            & a {
                background-color: transparent;
                border-color: var(--color-border-medium);
                color: var(--color-text-sharp) !important;

                &:not(.disabled):not(:disabled) {
                    &:hover {
                        background-color: var(--color-background-element-light);
                        color: var(--color-text-sharp) !important;
                    }

                    &:not(.single).selected {
                        background-color: var(
                            --color-background-element-medium
                        );
                        color: var(--color-text-sharp) !important;
                    }

                    &:focus {
                        color: var(--color-text-sharp) !important;
                    }
                }
            }
        }
    }

    .red-ui-tray-body-wrapper {
        overflow: visible !important;
        height: calc(100% - 35px - 83px);
    }

    .red-ui-tray-body {
        display: flex;
        flex-direction: column;
        height: 100%;

        & > .red-ui-tabs {
            flex: 0 0 35px;
            height: initial;
        }

        .tray-content-wrapper {
            overflow-y: auto;
            flex: 1;
        }
    }

    .red-ui-tray-content {
        overflow: visible;
        padding-top: 1px;
        height: calc(100% - 1px);
    }

    &.red-ui-editor .red-ui-tray #dialog-form {
        height: calc(100% - 110px);

        & > :last-child:after {
            content: '';
            display: block;
            height: 20px;
        }
    }

    .red-ui-tray-footer {
        background-color: transparent;
        position: static;

        button {
            background-color: var(--color-background-element-light) !important;
            border-color: var(--color-border-light);
            color: var(--color-text-sharp) !important;

            &.red-ui-button.toggle.selected {
                background-color: var(
                    --color-background-element-medium
                ) !important;

                &:not(.disabled):not(:disabled) {
                    color: var(--color-text-sharp) !important;
                }
            }
        }
    }
`;

export type NodeEditorProps = Record<string, never>;

// eslint-disable-next-line no-empty-pattern
export const NodeEditor = ({}: NodeEditorProps) => {
    const dispatch = useAppDispatch();
    const flowLogic = useAppLogic().flow;
    const editing = useAppSelector(selectEditing);
    const editingNode = useAppSelector(state =>
        selectFlowNodeById(state, editing?.id ?? '')
    ) as FlowNodeEntity;
    const editingNodeEntity = useAppSelector(state =>
        selectPaletteNodeById(state, editingNode?.type)
    );
    const { propertiesForm } =
        useAppSelector(flowLogic.node.editor.selectEditorState) ?? {};

    const loaded = useRef(false);

    const propertiesFormRefCallback = useCallback(
        (formElement: HTMLFormElement | null) => {
            dispatch(flowLogic.node.editor.setPropertiesForm(formElement));
        },
        [dispatch, flowLogic]
    );

    useEffect(() => {
        // close editor
        return () => {
            dispatch(flowLogic.node.editor.close());
        };
    }, [dispatch, flowLogic.node.editor]);

    useEffect(() => {
        if (!propertiesForm || loaded.current) {
            return;
        }

        // load editor
        dispatch(flowLogic.node.editor.load());

        // set loaded
        loaded.current = true;
    }, [dispatch, flowLogic.node.editor, propertiesForm]);

    if (!editingNode) return null;

    return (
        <StyledNodeEditor>
            <RedUiContainer>
                <StyledRedUi className="red-ui-editor">
                    <div className="red-ui-tray ui-draggable">
                        <div
                            className="red-ui-tray-body-wrapper"
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="red-ui-tray-body editor-tray-body">
                                <div className="red-ui-tabs red-ui-tabs-collapsible">
                                    <div>
                                        <ul>
                                            <li
                                                className="red-ui-tab red-ui-tab-pinned active"
                                                id="red-ui-tab-editor-tab-properties"
                                            >
                                                <a
                                                    href="#editor-tab-properties"
                                                    className="red-ui-tab-label"
                                                >
                                                    <i className="red-ui-tab-icon fa fa-cog"></i>
                                                    <span
                                                        className="red-ui-text-bidi-aware"
                                                        dir=""
                                                    >
                                                        Properties
                                                    </span>
                                                </a>
                                                <span className="red-ui-tabs-fade"></span>
                                                <span className="red-ui-tabs-badges"></span>
                                            </li>
                                            <li
                                                className="red-ui-tab red-ui-tab-pinned"
                                                id="red-ui-tab-editor-tab-description"
                                            >
                                                <a
                                                    href="#editor-tab-description"
                                                    className="red-ui-tab-label"
                                                >
                                                    <i className="red-ui-tab-icon fa fa-file-lines"></i>
                                                    <span
                                                        className="red-ui-text-bidi-aware"
                                                        dir=""
                                                    >
                                                        Description
                                                    </span>
                                                </a>
                                                <span className="red-ui-tabs-fade"></span>
                                                <span className="red-ui-tabs-badges"></span>
                                            </li>
                                            <li
                                                className="red-ui-tab red-ui-tab-pinned"
                                                id="red-ui-tab-editor-tab-appearance"
                                            >
                                                <a
                                                    href="#editor-tab-appearance"
                                                    className="red-ui-tab-label"
                                                >
                                                    <i className="red-ui-tab-icon fa fa-object-group"></i>
                                                    <span
                                                        className="red-ui-text-bidi-aware"
                                                        dir=""
                                                    >
                                                        Appearance
                                                    </span>
                                                </a>
                                                <span className="red-ui-tabs-fade"></span>
                                                <span className="red-ui-tabs-badges"></span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="red-ui-tab-link-buttons">
                                        <a
                                            href="#editor-tab-properties"
                                            className="red-ui-tab-link-button active selected"
                                            id="red-ui-tab-editor-tab-properties-link-button"
                                        >
                                            <i className="fa fa-cog"></i>
                                        </a>
                                        <a
                                            href="#editor-tab-description"
                                            className="red-ui-tab-link-button"
                                            id="red-ui-tab-editor-tab-description-link-button"
                                        >
                                            <i className="fa fa-file-lines"></i>
                                        </a>
                                        <a
                                            href="#editor-tab-appearance"
                                            className="red-ui-tab-link-button"
                                            id="red-ui-tab-editor-tab-appearance-link-button"
                                        >
                                            <i className="fa fa-object-group"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="tray-content-wrapper">
                                    <div className="red-ui-tray-content">
                                        <form
                                            id="dialog-form"
                                            className="dialog-form form-horizontal"
                                            ref={propertiesFormRefCallback}
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    editingNodeEntity.editorTemplate ??
                                                    '',
                                            }}
                                        ></form>
                                    </div>

                                    <div
                                        className="red-ui-tray-content"
                                        style={{
                                            display: 'none',
                                        }}
                                    ></div>
                                    <div
                                        className="red-ui-tray-content"
                                        style={{
                                            display: 'none',
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="red-ui-tray-footer">
                            <div className="red-ui-tray-footer-left">
                                <button type="button" className="red-ui-button">
                                    <i className="fa fa-book"></i>
                                </button>
                                <button
                                    type="button"
                                    className="red-ui-toggleButton red-ui-button toggle single selected"
                                >
                                    <i className="fa fa-circle-thin"></i>
                                    <span
                                        style={{
                                            marginLeft: '5px',
                                        }}
                                    >
                                        Enabled
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div className="red-ui-tray-resize-handle ui-draggable-handle"></div>
                    </div>
                </StyledRedUi>
            </RedUiContainer>
        </StyledNodeEditor>
    );
};

export default NodeEditor;
