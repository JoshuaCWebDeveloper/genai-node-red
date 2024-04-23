// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import jQuery from './jquery';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { applyJqueryUi } from './jquery-ui';
import { RedEditorType, createMockEditor } from './mock-editor';
import { JqueryContext, createMockJquery } from './mock-jquery';
import { createMockPopover } from './mock-popover';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createRedTabs } from './red-tabs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createRedUtils } from './red-utils';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createRedI18n } from './red-i18n';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { applyTypedInput } from './red-typed-input';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { applyEditableList } from './red-editable-list';

export type RedType = {
    nodes: {
        registerType(..._args: unknown[]): unknown;
    };
    editor: RedEditorType;
    utils: {
        sanitize(input: string): string;
        validateTypedProperty(..._args: unknown[]): unknown;
    };
    events: {
        on(..._args: unknown[]): unknown;
    };
    settings: {
        get(..._args: unknown[]): unknown;
    };
    text: {
        bidi: {
            setTextDirection(..._args: unknown[]): unknown;
        };
    };
    _(messagePath: string, ..._args: unknown[]): string;
    $: ReturnType<typeof createMockJquery>;
    tabs: ReturnType<typeof createRedTabs>;
    popover: ReturnType<typeof createMockPopover>;
    validators: {
        number(..._args: unknown[]): unknown;
        regex(..._args: unknown[]): unknown;
        typedInput(..._args: unknown[]): unknown;
    };
};

export const createMockRed = (
    jQueryContext: JqueryContext = window.document
) => {
    const initialized = {
        editor: false,
    };

    const RED = new Proxy(
        // target RED object
        {
            nodes: {
                registerType(..._args: unknown[]): unknown {
                    // not implemented
                    return undefined;
                },
            },
            validators: {
                number: function (blankAllowed: boolean, _mopt: unknown) {
                    return function (v: string, opt: Record<string, unknown>) {
                        if (blankAllowed && (v === '' || v === undefined)) {
                            return true;
                        }
                        if (v !== '') {
                            if (
                                /^NaN$|^[+-]?[0-9]*\.?[0-9]*([eE][-+]?[0-9]+)?$|^[+-]?(0b|0B)[01]+$|^[+-]?(0o|0O)[0-7]+$|^[+-]?(0x|0X)[0-9a-fA-F]+$/.test(
                                    v
                                )
                            ) {
                                return true;
                            }
                            if (/^\${[^}]+}$/.test(v)) {
                                // Allow ${ENV_VAR} value
                                return true;
                            }
                        }
                        if (!isNaN(v as unknown as number)) {
                            return true;
                        }
                        if (opt && opt.label) {
                            return RED._('validator.errors.invalid-num-prop', {
                                prop: opt.label,
                            });
                        }
                        return opt
                            ? RED._('validator.errors.invalid-num')
                            : false;
                    };
                },
                regex: function (re: RegExp, _mopt: Record<string, unknown>) {
                    return function (v: string, opt: Record<string, unknown>) {
                        if (re.test(v)) {
                            return true;
                        }
                        if (opt && opt.label) {
                            return RED._(
                                'validator.errors.invalid-regex-prop',
                                {
                                    prop: opt.label,
                                }
                            );
                        }
                        return opt
                            ? RED._('validator.errors.invalid-regexp')
                            : false;
                    };
                },
                typedInput: function (
                    ptypeName: string | Record<string, unknown>,
                    isConfig: boolean,
                    _mopt: Record<string, unknown>
                ) {
                    let options: Record<string, unknown>;
                    if (typeof ptypeName === 'string') {
                        options = {};
                        options.typeField = ptypeName;
                        options.isConfig = isConfig;
                        options.allowBlank = false;
                    }

                    return function (v: string, opt: Record<string, unknown>) {
                        let ptype = options.type;
                        if (!ptype && options.typeField) {
                            ptype =
                                (
                                    document.querySelector(
                                        '#node-' +
                                            (options.isConfig
                                                ? 'config-'
                                                : '') +
                                            'input-' +
                                            options.typeField
                                    ) as HTMLInputElement
                                )?.value ||
                                RED.validators[
                                    options.typeField as keyof typeof RED.validators
                                ];
                        }
                        if (options.allowBlank && v === '') {
                            return true;
                        }
                        if (options.allowUndefined && v === undefined) {
                            return true;
                        }
                        const result = RED.utils.validateTypedProperty(
                            v,
                            ptype,
                            opt
                        );
                        if (result === true || opt) {
                            // Valid, or opt provided - return result as-is
                            return result;
                        }
                        // No opt - need to return false for backwards compatibilty
                        return false;
                    };
                },
            },
            events: {
                on(event: string, _handler: (...args: unknown[]) => unknown) {
                    console.debug(
                        'Ignoring node event handler for event: ',
                        event
                    );
                },
            },
            library: {
                create: () => undefined,
            },
            settings: {
                get(name: string, defaultValue: unknown) {
                    console.debug(
                        'Returning default Node-RED value for setting: ',
                        name
                    );
                    return defaultValue;
                },
            },
            text: {
                bidi: {
                    setTextDirection: () => undefined,
                    enforceTextDirectionWithUCC: (value: unknown) => value,
                    resolveBaseTextDir: () => 'ltr',
                    prepareInput: () => undefined,
                },
                format: {
                    getHtml: function (..._args: unknown[]) {
                        return {};
                    },
                    attach: function (..._args: unknown[]) {
                        return true;
                    },
                },
            },
            tray: {
                resize: () => undefined,
            },
            _: undefined as unknown as (...args: unknown[]) => string,
            $: undefined as unknown as ReturnType<typeof createMockJquery>,
            tabs: undefined as unknown as ReturnType<typeof createRedTabs>,
            popover: undefined as unknown as ReturnType<
                typeof createMockPopover
            >,
            get editor() {
                if (!initialized.editor) {
                    initialized.editor = true;
                    RedEditor.init();
                }
                return RedEditor;
            },
            utils: createRedUtils(),
        } as RedType,
        // proxy handler
        {
            get: function (target, prop) {
                if (prop in target) {
                    return target[prop as keyof typeof target];
                } else {
                    console.error(
                        `Attempted to access RED property: \`${String(
                            prop
                        )}\` but it was not emulated.`
                    );
                    return undefined;
                }
            },
        }
    );

    // Mock jQuery
    RED.$ = ((selector: string, context: JqueryContext = jQueryContext) =>
        jQuery(selector, context)) as typeof jQuery;
    Object.assign(RED.$, jQuery);
    // jQuery plugins
    applyJqueryUi(RED.$);
    const jQueryUi = RED.$ as typeof jQuery & {
        widget: (name: string, widget: Record<string, unknown>) => void;
    };
    applyTypedInput(RED, RED.$);
    applyEditableList(RED, RED.$);
    // Mock Plugins
    jQueryUi.widget('mocked.autoComplete', {});

    // i18n
    const i18n = createRedI18n(RED, RED.$);
    i18n.init();
    RED._ = i18n._;

    RED.tabs = createRedTabs(RED, RED.$);
    RED.popover = createMockPopover(RED.$);

    const RedEditor = createMockEditor(RED, RED.$);

    return RED;
};
