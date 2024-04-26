// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import jQuery from './jquery';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { applyJqueryUi } from './jquery-ui';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { applyJqueryMigrate } from './jquery-migrate';
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createRedValidators } from './red-validators';

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
                getType: () => undefined,
                node: () => undefined,
                registerType(..._args: unknown[]): unknown {
                    // not implemented
                    return undefined;
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
                context: {
                    stores: [],
                },
                httpNodeRoot: '/',
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
            validators: undefined as unknown as ReturnType<
                typeof createRedValidators
            >,
            get editor() {
                if (!initialized.editor) {
                    initialized.editor = true;
                    RedEditor.init();
                }
                return RedEditor;
            },
            utils: undefined as unknown as ReturnType<typeof createRedUtils>,
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

    // apply utils first
    RED.utils = createRedUtils(RED);

    // Mock jQuery
    RED.$ = ((selector: string, context: JqueryContext = jQueryContext) =>
        jQuery(selector, context)) as typeof jQuery;
    Object.assign(RED.$, jQuery);
    // jQuery plugins
    applyJqueryMigrate(
        RED.$,
        // migrateMute doesn't mute enough
        Object.assign({}, window, {
            document: window.document,
            console: {
                warn: () => undefined,
                error: () => undefined,
                log: () => undefined,
                info: () => undefined,
                debug: () => undefined,
                trace: () => undefined,
            },
        })
    );
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

    RED.validators = createRedValidators(RED, RED.$);
    RED.tabs = createRedTabs(RED, RED.$);
    RED.popover = createMockPopover(RED.$);

    const RedEditor = createMockEditor(RED, RED.$);

    return RED;
};
