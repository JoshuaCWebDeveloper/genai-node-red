import type { RedType } from './mock-red';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createRedCodeEditor } from './red-code-editor';

type TypeEditorDefinition = {
    show: (options: Record<string, unknown>) => void;
};

type CustomEditTypes = Record<string, TypeEditorDefinition>;

export type RedEditorType = {
    init: () => void;
    generateViewStateId: () => void;
    edit: () => void;
    editConfig: () => void;
    editFlow: () => void;
    editSubflow: () => void;
    editGroup: () => void;
    editJavaScript: (options: Record<string, unknown>) => void;
    editExpression: (options: Record<string, unknown>) => void;
    editJSON: (options: Record<string, unknown>) => void;
    editMarkdown: (options: Record<string, unknown>) => void;
    editText: (options: Record<string, unknown>) => void;
    editBuffer: (options: Record<string, unknown>) => void;
    buildEditForm: () => void;
    validateNode: () => void;
    updateNodeProperties: () => void;
    showIconPicker: (...args: unknown[]) => void;
    showTypeEditor: (type: string, options: Record<string, unknown>) => void;
    registerTypeEditor: (
        type: string,
        definition: TypeEditorDefinition
    ) => void;
    createEditor: (
        options: Record<string, unknown>
    ) => ReturnType<typeof createRedCodeEditor>;
    customEditTypes: CustomEditTypes;
    registerEditPane: (
        type: string,
        definition: object,
        filter?: (...args: unknown[]) => void
    ) => void;
    codeEditor: ReturnType<typeof createRedCodeEditor>;
};

export const createMockEditor = (RED: RedType, $: unknown) => {
    type FilteredEditPanes = Record<string, (...args: unknown[]) => void>;
    type EditPanes = Record<string, object>;

    const customEditTypes: CustomEditTypes = {};
    const filteredEditPanes: FilteredEditPanes = {};
    const editPanes: EditPanes = {};
    const editStack: {
        type: string;
        name?: string;
        id?: string;
    }[] = [];

    const getEditStackTitle = (): string => {
        let label = '';
        for (let i = editStack.length - 1; i < editStack.length; i++) {
            const node = editStack[i];
            label = node.type;
            if (node.type === 'group') {
                label = RED._('group.editGroup', {
                    name: RED.utils.sanitize(node.name ?? node.id ?? ''),
                });
            } else if (node.type === '_expression') {
                label = RED._('expressionEditor.title');
            } else if (node.type === '_js') {
                label = RED._('jsEditor.title');
            } else if (node.type === '_text') {
                label = RED._('textEditor.title');
            } else if (node.type === '_json') {
                label = RED._('jsonEditor.title');
            } else if (node.type === '_markdown') {
                label = RED._('markdownEditor.title');
            } else if (node.type === '_buffer') {
                label = RED._('bufferEditor.title');
            } else if (node.type === 'subflow') {
                label = RED._('subflow.editSubflow', {
                    name: RED.utils.sanitize(node.name ?? ''),
                });
            } else if (node.type.indexOf('subflow:') === 0) {
                label = 'Sublow';
            }
        }
        return label;
    };

    return new Proxy(
        {
            init: function (): void {
                RED.editor.codeEditor.init();
            },
            generateViewStateId: () => undefined,
            edit: () => undefined,
            editConfig: () => undefined,
            editFlow: () => undefined,
            editSubflow: () => undefined,
            editGroup: () => undefined,
            editJavaScript: function (options: Record<string, unknown>): void {
                this.showTypeEditor('_js', options);
            },
            editExpression: function (options: Record<string, unknown>): void {
                this.showTypeEditor('_expression', options);
            },
            editJSON: function (options: Record<string, unknown>): void {
                this.showTypeEditor('_json', options);
            },
            editMarkdown: function (options: Record<string, unknown>): void {
                this.showTypeEditor('_markdown', options);
            },
            editText: function (options: Record<string, unknown>): void {
                if (options.mode === 'markdown') {
                    this.showTypeEditor('_markdown', options);
                } else {
                    this.showTypeEditor('_text', options);
                }
            },
            editBuffer: function (options: Record<string, unknown>): void {
                this.showTypeEditor('_buffer', options);
            },
            buildEditForm: () => undefined,
            validateNode: () => undefined,
            updateNodeProperties: () => undefined,

            showIconPicker: function (..._args: unknown[]): void {
                // RED.editor.iconPicker.show.apply(null, args);
            },

            /**
             * Show a type editor.
             * @param type - the type to display
             * @param options - options for the editor
             */
            showTypeEditor: (
                type: string,
                options: Record<string, unknown>
            ): void => {
                if (
                    Object.prototype.hasOwnProperty.call(customEditTypes, type)
                ) {
                    if (editStack.length > 0) {
                        options.parent = editStack[editStack.length - 1].id;
                    }
                    editStack.push({ type: type });
                    options.title = options.title || getEditStackTitle();
                    options.onclose = (): void => {
                        editStack.pop();
                    };
                    customEditTypes[type].show(options);
                } else {
                    console.log('Unknown type editor:', type);
                }
            },

            /**
             * Register a type editor.
             * @param {string} type - the type name
             * @param {object} definition - the editor definition
             * @function
             * @memberof RED.editor
             */
            registerTypeEditor: function (
                type: string,
                definition: TypeEditorDefinition
            ): void {
                customEditTypes[type] = definition;
            },

            /**
             * Create a editor ui component
             * @param {object} options - the editor options
             * @returns The code editor
             * @memberof RED.editor
             */
            createEditor(options: Record<string, unknown>) {
                return this.codeEditor.create(options);
            },

            get customEditTypes() {
                return customEditTypes;
            },

            registerEditPane: function (
                type: string,
                definition: object,
                filter?: (...args: unknown[]) => void
            ): void {
                if (filter) {
                    filteredEditPanes[type] = filter;
                }
                editPanes[type] = definition;
            },

            codeEditor: createRedCodeEditor(RED, $),
        },
        // proxy handler
        {
            get: function (target, prop: string | symbol) {
                if (prop in target) {
                    return target[prop as keyof typeof target];
                } else {
                    console.error(
                        `Attempted to access RED editor property: \`${String(
                            prop
                        )}\` but it was not emulated.`
                    );
                    return undefined;
                }
            },
        }
    );
};
