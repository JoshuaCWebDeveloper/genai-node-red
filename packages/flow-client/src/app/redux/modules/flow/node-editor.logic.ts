import { createSelector } from '@reduxjs/toolkit';

import {
    createNodeInstance,
    executeNodeFn,
    finalizeNodeEditor,
} from '../../../red/execute-script';
import { AppDispatch, RootState } from '../../store';
import {
    EditingState,
    builderActions,
    selectEditing,
} from '../builder/builder.slice';
import {
    FlowNodeEntity,
    SubflowEntity,
    flowActions,
    selectFlowEntityById,
    selectFlowNodeById,
} from './flow.slice';
import { NodeLogic } from './node.logic';

export class NodeEditorLogic {
    private propertiesForms: Record<string, HTMLFormElement> = {};
    private nodeInstances: Record<string, FlowNodeEntity> = {};

    constructor(private node: NodeLogic) {}

    setPropertiesForm(propertiesForm: HTMLFormElement | null) {
        return async (dispatch: AppDispatch) => {
            if (propertiesForm) {
                const propertiesFormHandle = `properties-form-${Date.now()}`;
                this.propertiesForms[propertiesFormHandle] = propertiesForm;
                dispatch(
                    builderActions.updateEditingData({
                        propertiesFormHandle,
                    })
                );
            } else {
                dispatch(
                    builderActions.updateEditingData({
                        propertiesFormHandle: undefined,
                    })
                );
            }
        };
    }

    selectEditorState = createSelector(
        [state => state, selectEditing],
        (state, editing: EditingState) => {
            if (!editing) {
                return;
            }
            const {
                id,
                data: { propertiesFormHandle, nodeInstanceHandle },
            } = editing;
            const propertiesForm = propertiesFormHandle
                ? this.propertiesForms[propertiesFormHandle]
                : undefined;
            const nodeInstance = nodeInstanceHandle
                ? this.nodeInstances[nodeInstanceHandle]
                : undefined;
            const editingFlowNode = selectFlowNodeById(state, id);
            const editingPaletteNode = this.node.selectPaletteNodeByFlowNode(
                state,
                editingFlowNode
            );
            return {
                editingData: editing.data,
                editingFlowNode,
                editingPaletteNode,
                propertiesForm,
                nodeInstance,
            };
        }
    );

    selectNodeFormFields = createSelector(
        [this.selectEditorState],
        editorState => {
            type FormField =
                | HTMLInputElement
                | HTMLSelectElement
                | HTMLTextAreaElement;

            const { propertiesForm: form } = editorState ?? {};
            if (!form) {
                return {};
            }

            // Select all form field elements (input, select, textarea) that have an id starting with 'node-input' or 'node-config-input'
            const elementTypes = ['input', 'select', 'textarea'];
            const idPrefixes = ['node-input', 'node-config-input'];
            const selector = elementTypes
                .flatMap(type =>
                    idPrefixes.map(prefix => `${type}[id^="${prefix}"]`)
                )
                .join(', ');
            const prefixRegex = new RegExp(`^(${idPrefixes.join('|')})-`);
            const formFields: NodeListOf<FormField> =
                form.querySelectorAll(selector);
            const fieldsMap: Record<string, FormField> = {};
            formFields.forEach(field => {
                const key = field.id.replace(prefixRegex, '');
                fieldsMap[key] = field;
            });
            return fieldsMap;
        }
    );

    cancel() {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            const { nodeInstance, editingPaletteNode, propertiesForm } =
                this.selectEditorState(getState()) ?? {};

            if (!nodeInstance || !editingPaletteNode || !propertiesForm) {
                return;
            }

            executeNodeFn(
                ['oneditcancel'],
                editingPaletteNode,
                nodeInstance,
                (propertiesForm?.getRootNode() as ShadowRoot) ?? undefined
            );
        };
    }

    delete() {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            const {
                nodeInstance,
                editingFlowNode,
                editingPaletteNode,
                propertiesForm,
            } = this.selectEditorState(getState()) ?? {};

            if (nodeInstance && editingPaletteNode && propertiesForm) {
                // exec oneditsave
                executeNodeFn(
                    ['oneditdelete'],
                    editingPaletteNode,
                    nodeInstance,
                    (propertiesForm?.getRootNode() as ShadowRoot) ?? undefined
                );
            }

            if (editingFlowNode) {
                // TODO: Implement logic method for removing any old input links (if necessary)
                dispatch(flowActions.removeFlowNode(editingFlowNode.id));
            }
        };
    }

    save() {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            const {
                editingData,
                nodeInstance,
                editingFlowNode,
                editingPaletteNode,
                propertiesForm,
            } = this.selectEditorState(getState()) ?? {};

            if (
                !editingData ||
                !nodeInstance ||
                !editingFlowNode ||
                !editingPaletteNode ||
                !propertiesForm
            ) {
                return;
            }

            // exec oneditsave
            executeNodeFn(
                ['oneditsave'],
                editingPaletteNode,
                nodeInstance,
                (propertiesForm?.getRootNode() as ShadowRoot) ?? undefined
            );

            // get our form data
            const formData = Object.fromEntries(
                Object.entries(this.selectNodeFormFields(getState())).map(
                    ([key, field]) => {
                        if (field.type === 'checkbox') {
                            return [key, (field as HTMLInputElement).checked];
                        } else if (field.type === 'select-multiple') {
                            return [
                                key,
                                Array.from(
                                    (field as HTMLSelectElement).selectedOptions
                                ).map(option => option.value),
                            ];
                        } else {
                            return [key, field.value];
                        }
                    }
                )
            );

            // collect node updates
            const nodeUpdates: Partial<FlowNodeEntity> = {};
            Object.keys(editingPaletteNode.defaults ?? {}).forEach(key => {
                if (
                    Object.prototype.hasOwnProperty.call(editingFlowNode, key)
                ) {
                    nodeUpdates[key] =
                        nodeInstance[key as keyof typeof nodeInstance];
                }
                if (Object.prototype.hasOwnProperty.call(formData, key)) {
                    nodeUpdates[key] = formData[key];
                }
            });
            // collect credentials
            if (editingPaletteNode.credentials) {
                nodeUpdates.credentials = {};
                Object.keys(editingPaletteNode.credentials).forEach(key => {
                    if (!formData[key]) {
                        return;
                    }
                    if (
                        editingPaletteNode.credentials?.[key].type ===
                        'password'
                    ) {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        nodeUpdates.credentials![`has_${key}`] =
                            !!formData[key];
                        if (formData[key] === '__PWRD__') {
                            return;
                        }
                    }
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    nodeUpdates.credentials![key] = formData[key];
                });
            }

            // if this is a subflow instance
            if (editingFlowNode.type.startsWith('subflow:')) {
                // set subflow env (special handling by Node RED)
                if (Object.prototype.hasOwnProperty.call(nodeInstance, 'env')) {
                    nodeUpdates.env = nodeInstance.env;
                }
            }

            // update node
            dispatch(
                this.node.updateFlowNode(editingFlowNode.id, {
                    ...nodeUpdates,
                    info: editingData.info,
                    icon: editingData.icon,
                    inputLabels: editingData.inputLabels,
                    outputLabels: editingData.outputLabels,
                })
            );
        };
    }

    load() {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            const { editingFlowNode, editingPaletteNode, propertiesForm } =
                this.selectEditorState(getState()) ?? {};

            if (!editingFlowNode || !editingPaletteNode || !propertiesForm) {
                return;
            }

            // apply node values to form fields
            const formFields = this.selectNodeFormFields(getState());
            Object.entries(editingFlowNode).forEach(([key, value]) => {
                if (!Object.prototype.hasOwnProperty.call(formFields, key)) {
                    return;
                }
                const field = formFields[key];
                if (field.type === 'checkbox') {
                    (field as HTMLInputElement).checked = Boolean(value);
                } else if (field.type === 'select-multiple') {
                    const arrayValue = Array.isArray(value) ? value : [value];
                    Array.from((field as HTMLSelectElement).options).forEach(
                        option => {
                            option.selected = arrayValue.includes(option.value);
                        }
                    );
                } else {
                    field.value = value as string;
                }
            });
            // apply credentials
            if (editingPaletteNode.credentials) {
                const credentials = editingFlowNode.credentials ?? {};
                Object.keys(editingPaletteNode.credentials).forEach(key => {
                    if (
                        !Object.prototype.hasOwnProperty.call(formFields, key)
                    ) {
                        return;
                    }
                    const value = credentials[key];
                    if (
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        editingPaletteNode.credentials![key].type !== 'password'
                    ) {
                        formFields[key].value = value as string;
                        return;
                    }
                    if (value) {
                        formFields[key].value = value as string;
                        return;
                    }
                    if (credentials[`has_${key}`]) {
                        formFields[key].value = '__PWRD__';
                        return;
                    }
                    formFields[key].value = '';
                });
            }
            // create node instance
            const nodeInstance = createNodeInstance(editingFlowNode);
            // attach subflow template if applicable
            if (editingFlowNode.type.startsWith('subflow:')) {
                nodeInstance.subflow = selectFlowEntityById(
                    getState(),
                    editingFlowNode.type.split(':')[1]
                ) as SubflowEntity;
            }
            // exec oneditprepare
            const context =
                (propertiesForm.getRootNode() as ShadowRoot) ?? undefined;
            executeNodeFn(
                ['oneditprepare'],
                editingPaletteNode,
                nodeInstance,
                context
            );
            finalizeNodeEditor(propertiesForm, context);
            const formSize = propertiesForm.getBoundingClientRect();
            executeNodeFn(
                ['oneditresize', formSize],
                editingPaletteNode,
                nodeInstance,
                context
            );

            const nodeInstanceHandle = `node-instance-${Date.now()}`;
            this.nodeInstances[nodeInstanceHandle] = nodeInstance;
            dispatch(
                builderActions.updateEditingData({
                    nodeInstanceHandle,
                })
            );
        };
    }

    close() {
        return async (dispatch: AppDispatch) => {
            this.nodeInstances = {};
            this.propertiesForms = {};
            dispatch(
                builderActions.updateEditingData({
                    propertiesFormHandle: undefined,
                    nodeInstanceHandle: undefined,
                })
            );
        };
    }
}
