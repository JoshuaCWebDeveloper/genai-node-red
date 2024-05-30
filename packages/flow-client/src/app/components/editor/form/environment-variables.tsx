import { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { createMockRed } from '../../../red/mock-red';
import { EnvironmentVariable } from '../../../redux/modules/flow/flow.slice';
import { RedUiContainer } from '../red-ui-container';
import EditorForm from './editor-form';

const StyledEnvironmentVariables = styled.div`
    height: 100%;

    .editor-form {
        gap: 0;
        padding: 0;
        height: 100%;

        label {
            cursor: default;
        }
    }
`;

export type EnvironmentVariablesProps = {
    className?: string;
    environmentVariables: EnvironmentVariable[];
    onChange?: (environmentVariables: EnvironmentVariable[]) => void;
};

export const EnvironmentVariables = ({
    className = '',
    environmentVariables,
    onChange,
}: EnvironmentVariablesProps) => {
    const RED = useRef(createMockRed());
    const storedEnvironmentVariables = useRef<EnvironmentVariable[]>(
        environmentVariables.map(it => ({ ...it }))
    );

    const handleVariablesChange = useCallback(
        (variables: EnvironmentVariable[]) => {
            onChange?.(variables);
        },
        [onChange]
    );

    const listRef = useCallback(
        (listElement: HTMLDivElement) => {
            // Initialize the editable list
            const $list = RED.current.$(listElement);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            $list.editableList({
                addButton: true,
                removable: true,
                sortable: true,
                addItem: function (
                    container: HTMLDivElement,
                    index: number,
                    data: EnvironmentVariable
                ) {
                    const row = RED.current.$('<div/>').appendTo(container);
                    const nameInput = RED.current
                        .$('<input/>', {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                            type: 'text',
                            placeholder: 'Name',
                            class: 'node-input-prop-property-name',
                        })
                        .appendTo(row);
                    const valueInput = RED.current
                        .$('<input/>', {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                            type: 'text',
                            placeholder: 'Value',
                            class: 'node-input-prop-property-value',
                        })
                        .appendTo(row)
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        .typedInput({
                            default: data.type,
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

                    nameInput.val(data.name);
                    valueInput.typedInput('value', data.value);

                    nameInput.on('change', updateVariables);
                    valueInput.on('change', updateVariables);

                    if (index > storedEnvironmentVariables.current.length) {
                        updateVariables();
                    }
                },
                removeItem: function (
                    _container: HTMLDivElement,
                    _index: number
                ) {
                    updateVariables();
                },
                sortItems: function (_items: unknown[]) {
                    updateVariables();
                },
            });

            const updateVariables = () => {
                storedEnvironmentVariables.current = $list
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    .editableList('items')
                    .map(function () {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        const $element = this as typeof $list;
                        return {
                            name: $element
                                .find('.node-input-prop-property-name')
                                .val(),
                            value: $element
                                .find('.node-input-prop-property-value')
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-expect-error
                                .typedInput('value'),
                            type: $element
                                .find('.node-input-prop-property-value')
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-expect-error
                                .typedInput('type'),
                        };
                    })
                    .toArray();

                handleVariablesChange(storedEnvironmentVariables.current);
            };

            storedEnvironmentVariables.current.forEach(variable => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                $list.editableList('addItem', variable);
            });
        },
        [handleVariablesChange]
    );

    useEffect(() => {
        storedEnvironmentVariables.current = environmentVariables.map(it => ({
            ...it,
        }));
    }, [environmentVariables]);

    return (
        <RedUiContainer className={`environment-variables ${className}`}>
            <StyledEnvironmentVariables>
                <EditorForm>
                    <label>Environment Variables:</label>
                    <div ref={listRef}></div>
                </EditorForm>
            </StyledEnvironmentVariables>
        </RedUiContainer>
    );
};

export default EnvironmentVariables;
