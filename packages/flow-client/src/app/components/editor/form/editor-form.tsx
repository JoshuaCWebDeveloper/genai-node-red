import React from 'react';
import styled from 'styled-components';

const StyledEditorForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 2rem;
    background: transparent;
    height: 100%;

    label {
        font-size: 1rem;
        font-weight: 600;
        display: block;
        margin-bottom: 5px;
    }

    input,
    textarea {
        background-color: var(--color-background-element-light);
        color: var(--color-text-sharp);
        width: 100%;
        padding: 0.75rem;
        font-size: 1rem;
        border: 1px solid var(--color-border-light);
        border-radius: 4px;
        transition: border-color 0.2s;

        &:focus {
            background-color: var(--color-background-element-focus);
            border-color: var(--color-border-medium);
            outline: none;
        }
    }
`;

export type EditorFormProps = {
    className?: string;
    children: React.ReactNode;
    [key: string]: unknown;
};

// eslint-disable-next-line no-empty-pattern
export const EditorForm = ({
    children,
    className = '',
    ...props
}: EditorFormProps) => {
    return (
        <StyledEditorForm className={`editor-form ${className}`} {...props}>
            {children}
        </StyledEditorForm>
    );
};

export default EditorForm;
