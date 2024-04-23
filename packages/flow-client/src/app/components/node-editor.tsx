import root from 'react-shadow/styled-components';
import styled from 'styled-components';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    createNodeInstance,
    executeNodeFn,
    finalizeNodeEditor,
} from '../red/execute-script';
import { useAppDispatch, useAppLogic, useAppSelector } from '../redux/hooks';
import {
    builderActions,
    selectEditing,
} from '../redux/modules/builder/builder.slice';

import faCssUrl from '@fortawesome/fontawesome-free/css/all.css?url';
import jqueryUiCssUrl from '../red/jquery-ui.css?url';
import redCssUrl from '../red/red-style.css?url';
import redTypedInputCssUrl from '../red/red-typed-input.css?url';
import {
    FlowNodeEntity,
    selectEntityById,
} from '../redux/modules/flow/flow.slice';
import { selectNodeById } from '../redux/modules/node/node.slice';
import environment from '../../environment';

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
        position: absolute;
        right: 0;
        width: 30%;
        height: 100%;
        background-color: white;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        min-width: 505px;
    }
`;

const StyledRedUi = styled.div`
    .ui-icon,
    .ui-widget-content .ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_444444_256x240.png');
    }

    .ui-widget-header .ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_444444_256x240.png');
    }

    .ui-state-hover .ui-icon,
    .ui-state-focus .ui-icon,
    .ui-button:hover .ui-icon,
    .ui-button:focus .ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_555555_256x240.png');
    }

    .ui-state-active .ui-icon,
    .ui-button:active .ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_ffffff_256x240.png');
    }

    .ui-state-highlight .ui-icon,
    .ui-button .ui-state-highlight.ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_777620_256x240.png');
    }

    .ui-state-error .ui-icon,
    .ui-state-error-text .ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_cc0000_256x240.png');
    }

    .ui-button .ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_777777_256x240.png');
    }

    .red-ui-tray {
        right: 0px;
        transition: right 0.25s ease 0s;
        z-index: auto;
        top: 0px;
        width: 100%;
    }

    .red-ui-tabs ul {
        min-width: initial !important;
    }

    .red-ui-tabs li {
        width: 23.5%;
    }

    .red-ui-tray-body-wrapper {
        overflow: visible !important;
        height: calc(100% - 208px);
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
            flex: 1;
        }
    }

    .red-ui-tray-content {
        overflow: visible;
        height: 100%;
    }

    .red-ui-tray-footer {
        margin-top: 90px;
        position: static;
    }
`;

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const selectNodeFormFields = (form: HTMLFormElement) => {
    // Select all form field elements (input, select, textarea) that have an id starting with 'node-input' or 'node-config-input'
    const elementTypes = ['input', 'select', 'textarea'];
    const idPrefixes = ['node-input', 'node-config-input'];
    const selector = elementTypes
        .flatMap(type => idPrefixes.map(prefix => `${type}[id^="${prefix}"]`))
        .join(', ');
    const prefixRegex = new RegExp(`^(${idPrefixes.join('|')})-`);
    const formFields: NodeListOf<FormField> = form.querySelectorAll(selector);
    const fieldsMap: Record<string, FormField> = {};
    formFields.forEach(field => {
        const key = field.id.replace(prefixRegex, '');
        fieldsMap[key] = field;
    });
    return fieldsMap;
};

export const NodeEditor = () => {
    const dispatch = useAppDispatch();
    const flowLogic = useAppLogic().flow;

    const [propertiesForm, setPropertiesForm] =
        useState<HTMLFormElement | null>(null);
    const [loadedCss, setLoadedCss] = useState<{
        'jquery-ui.css': boolean;
        'red-style.css': boolean;
        'red-typed-input.css': boolean;
    }>({
        'jquery-ui.css': false,
        'red-style.css': false,
        'red-typed-input.css': false,
    });
    const loaded = useRef(false);
    const [nodeInstance, setNodeInstance] = useState(
        createNodeInstance({} as FlowNodeEntity)
    );
    const editing = useAppSelector(selectEditing);
    const editingNode = useAppSelector(state =>
        selectEntityById(state, editing ?? '')
    ) as FlowNodeEntity;
    const editingNodeEntity = useAppSelector(state =>
        selectNodeById(state, editingNode?.type)
    );

    const propertiesFormRefCallback = useCallback(
        (formElement: HTMLFormElement | null) => {
            setPropertiesForm(formElement);
        },
        []
    );

    const handleCssOnLoad = useCallback(
        (e: React.SyntheticEvent<HTMLLinkElement>) => {
            const cssFile = new URL(e.currentTarget.href).pathname
                .split('/')
                .pop() as keyof typeof loadedCss;
            setLoadedCss(prev => ({ ...prev, [cssFile]: true }));
        },
        []
    );

    const closeEditor = useCallback(() => {
        setNodeInstance(createNodeInstance({} as FlowNodeEntity));
        dispatch(builderActions.clearEditing());
        loaded.current = false;
        setLoadedCss({
            'jquery-ui.css': false,
            'red-style.css': false,
            'red-typed-input.css': false,
        });
        setPropertiesForm(null);
    }, [dispatch]);

    const handleCancel = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            executeNodeFn(
                ['oneditcancel'],
                editingNodeEntity,
                nodeInstance,
                (propertiesForm?.getRootNode() as ShadowRoot) ?? undefined
            );
            closeEditor();
        },
        [closeEditor, editingNodeEntity, nodeInstance, propertiesForm]
    );

    const handleSave = useCallback(() => {
        const form = propertiesForm;
        if (!form) {
            return;
        }
        // exec oneditsave
        executeNodeFn(
            ['oneditsave'],
            editingNodeEntity,
            nodeInstance,
            (propertiesForm?.getRootNode() as ShadowRoot) ?? undefined
        );
        // get our form data
        const formData = Object.fromEntries(
            Object.entries(selectNodeFormFields(form)).map(([key, field]) => [
                key,
                field.value,
            ])
        );
        // collect node updates
        const nodeUpdates: Partial<FlowNodeEntity> = {};
        Object.keys(editingNodeEntity.defaults ?? {}).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(nodeInstance, key)) {
                nodeUpdates[key] =
                    nodeInstance[key as keyof typeof nodeInstance];
            }
            if (Object.prototype.hasOwnProperty.call(formData, key)) {
                nodeUpdates[key] = formData[key];
            }
        });
        // update node
        console.log(nodeUpdates.outputs);
        dispatch(flowLogic.updateFlowNode(editingNode.id, nodeUpdates));
        // close editor
        closeEditor();
    }, [
        closeEditor,
        dispatch,
        editingNode?.id,
        editingNodeEntity,
        flowLogic,
        nodeInstance,
        propertiesForm,
    ]);

    useEffect(() => {
        if (
            !propertiesForm ||
            loaded.current ||
            !loadedCss['jquery-ui.css'] ||
            !loadedCss['red-style.css'] ||
            !loadedCss['red-typed-input.css']
        ) {
            return;
        }
        // apply node values to form fields
        const formFields = selectNodeFormFields(propertiesForm);
        Object.entries(editingNode).forEach(([key, value]) => {
            if (Object.prototype.hasOwnProperty.call(formFields, key)) {
                formFields[key].value = value as string;
            }
        });
        // exec oneditprepare
        const nodeInstance = createNodeInstance(editingNode);
        const context =
            (propertiesForm.getRootNode() as ShadowRoot) ?? undefined;
        executeNodeFn(
            ['oneditprepare'],
            editingNodeEntity,
            nodeInstance,
            context
        );
        finalizeNodeEditor(propertiesForm, context);
        const formSize = propertiesForm.getBoundingClientRect();
        executeNodeFn(
            ['oneditresize', formSize],
            editingNodeEntity,
            nodeInstance,
            context
        );
        setNodeInstance(nodeInstance);
        // set loaded
        loaded.current = true;
    }, [editingNode, editingNodeEntity, loadedCss, propertiesForm]);

    if (!editingNode) return null;

    return (
        <StyledEditor>
            <div className="overlay" onClick={handleSave}></div>
            <div className="editor-pane">
                <root.div className="editor-template">
                    <link rel="stylesheet" href={faCssUrl} />
                    <link
                        rel="stylesheet"
                        href={jqueryUiCssUrl}
                        onLoad={handleCssOnLoad}
                    />
                    <link
                        rel="stylesheet"
                        href={redCssUrl}
                        onLoad={handleCssOnLoad}
                    />
                    <link
                        rel="stylesheet"
                        href={redTypedInputCssUrl}
                        onLoad={handleCssOnLoad}
                    />

                    <StyledRedUi className="red-ui-editor ">
                        <div className="red-ui-tray ui-draggable">
                            <div className="red-ui-tray-header editor-tray-header">
                                <div className="red-ui-tray-titlebar">
                                    <ul className="red-ui-tray-breadcrumbs">
                                        <li>
                                            Edit {editingNodeEntity.type} node
                                        </li>
                                    </ul>
                                </div>
                                <div className="red-ui-tray-toolbar">
                                    <button
                                        className="ui-button ui-corner-all ui-widget leftButton"
                                        id="node-dialog-delete"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="ui-button ui-corner-all ui-widget"
                                        id="node-dialog-cancel"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="ui-button ui-corner-all ui-widget primary"
                                        id="node-dialog-ok"
                                        onClick={handleSave}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
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
                                    <button
                                        type="button"
                                        className="red-ui-button"
                                    >
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
                </root.div>
                {/* Add more node details here */}
            </div>
        </StyledEditor>
    );
};

export default NodeEditor;
