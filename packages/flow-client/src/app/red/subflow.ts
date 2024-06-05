import {
    EnvVarType,
    EnvironmentVariable,
    SubflowEntity,
} from '../redux/modules/flow/flow.slice';

export const createSubflowEditorTemplate = (_subflow: SubflowEntity) => {
    return `
    <div class="form-row">
        <label for="node-input-name"><i class="fa fa-tag"></i> <span data-i18n="common.label.name"></span></label>
        <input type="text" id="node-input-name" style="width: calc(100% - 105px)" data-i18n="[placeholder]common.label.name">
    </div>
    <div id="subflow-input-ui"></div>
    `;
};

type JQuery = {
    (selector: string | JQuery, context?: unknown): JQuery;
    append(...elements: JQuery[]): JQuery;
    val(value: string): JQuery;
    typedInput(method: string, ...args: unknown[]): string;
    typedInput(options: Record<string, unknown>): JQuery;
    text(value: string): JQuery;
    text(): string;
    addClass(value: string): JQuery;
    appendTo(element: JQuery): JQuery;
    children(selector: string): JQuery;
    find(selector: string): JQuery;
    each(callback: (index: number, element: JQuery) => void): JQuery;
};

type NodeInstance = {
    env?: EnvironmentVariable[];
    subflow: SubflowEntity;
};

const subflowDefinition = (
    RED: {
        nodes: { registerType: (type: string, node: unknown) => void };
    },
    $: JQuery
) => {
    return () =>
        RED.nodes.registerType('subflow:__DEFINS__subflow.id__ENDDEFINS__', {
            type: 'subflow',
            oneditprepare: function (this: NodeInstance) {
                const $subflowInputUi = $('#subflow-input-ui');

                const initialEnv = Object.fromEntries(
                    (this.env ?? []).map(env => [env.name, env])
                );
                const nodeEnv = (this.subflow?.env ?? []).map(
                    env => initialEnv[env.name] ?? env
                );

                for (const env of nodeEnv) {
                    const $formRow = $('<div>').addClass('form-row');
                    $formRow.append(
                        $('<label>').addClass('env-name').text(env.name)
                    );
                    const $valueInput = $('<input/>', {
                        type: 'text',
                        placeholder: 'Value',
                        class: 'node-input-prop-property-value',
                    })
                        .appendTo($formRow)
                        .typedInput({
                            types: [
                                'str',
                                'num',
                                'bool',
                                'json',
                                're',
                                'date',
                                'jsonata',
                                'bin',
                                'env',
                                'node',
                                'cred',
                            ],
                        });
                    $valueInput.typedInput('value', env.value);
                    $valueInput.typedInput('type', env.type);
                    $subflowInputUi.append($formRow);
                }
            },
            oneditsave: function (this: NodeInstance) {
                const defaultEnv = Object.fromEntries(
                    (this.subflow?.env ?? []).map(env => [env.name, env])
                );
                const newEnv: EnvironmentVariable[] = [];
                $('#subflow-input-ui')
                    .children('.form-row')
                    .each((_index, element) => {
                        const $formRow = $(element);
                        const $valueInput = $formRow.find('input');
                        const name = $formRow.find('.env-name').text();
                        const value = $valueInput.typedInput('value');
                        const type = $valueInput.typedInput(
                            'type'
                        ) as EnvVarType;
                        if (
                            defaultEnv[name]?.value !== value ||
                            defaultEnv[name]?.type !== type
                        ) {
                            newEnv.push({
                                name,
                                value,
                                type,
                            });
                        }
                    });

                this.env = newEnv.length > 0 ? newEnv : undefined;
            },
        });
};

export const createSubflowDefinitionScript = (subflow: SubflowEntity) => {
    const definitionString = subflowDefinition(
        ...([] as unknown as Parameters<typeof subflowDefinition>)
    )
        .toString()
        .slice(5);

    const replaceDefinsVariables = (
        definition: string,
        context: Record<string, unknown>
    ) => {
        return definition.replace(
            /__DEFINS__(.*?)__ENDDEFINS__/g,
            (_, path) => {
                const keys = path.split('.');
                let value = context;
                for (const k of keys) {
                    value = value[k] as Record<string, unknown>;
                }
                return `${value}`;
            }
        );
    };

    return replaceDefinsVariables(definitionString, { subflow });
};
