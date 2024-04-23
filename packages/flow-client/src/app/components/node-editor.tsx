import root from 'react-shadow/styled-components';
import styled from 'styled-components';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    createNodeInstance,
    executeNodeFn,
    finalizeNodeEditor,
} from '../red/execute-script';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
    builderActions,
    selectEditing,
} from '../redux/modules/builder/builder.slice';

import faCssUrl from '@fortawesome/fontawesome-free/css/all.css?url';
import redCssUrl from '../red/red-style.css?url';
import {
    FlowNodeEntity,
    selectEntityById,
} from '../redux/modules/flow/flow.slice';
import { selectNodeById } from '../redux/modules/node/node.slice';

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
    }
`;

const StyledRedUi = styled.div`
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
    const [propertiesForm, setpropertiesForm] =
        useState<HTMLFormElement | null>(null);
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

        },
        []
    );

    const closeEditor = useCallback(() => {
        setNodeInstance(createNodeInstance({} as FlowNodeEntity));
        dispatch(builderActions.clearEditing());
        loaded.current = false;
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
        // update node
        dispatch(
            flowActions.updateEntity({
                id: editingNode.id,
                changes: formData,
            })
        );
        // close editor
        closeEditor();
    }, [
        closeEditor,
        dispatch,
        editingNode?.id,
        executeNodeFn,
        nodeInstance,
        propertiesForm,
    ]);

    useEffect(() => {
        if (!propertiesForm || loaded.current) {
            return;
        }
        // apply node values to form fields
        const formFields = selectNodeFormFields(propertiesForm);
        Object.entries(editingNode).forEach(([key, value]) => {
            if (formFields[key]) {
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
                    <link rel="stylesheet" href={redCssUrl} />
                    <link rel="stylesheet" href={faCssUrl} />

                    <StyledRedUi className="red-ui-editor ">
                        <div className="red-ui-tray ui-draggable">
                            <div className="red-ui-tray-header editor-tray-header">
                                <div className="red-ui-tray-titlebar">
                                    <ul className="red-ui-tray-breadcrumbs">
                                        <li>Edit function node</li>
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
                                    <div>
                                        <div className="red-ui-tray-content">
                                            <form
                                                className="dialog-form form-horizontal"
                                                ref={propertiesFormRefCallback}
                                            >
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            editingNodeEntity.editorTemplate ??
                                                            '',
                                                    }}
                                                ></div>
                                            </form>
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
