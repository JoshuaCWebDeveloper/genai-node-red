import {
    FormEvent,
    KeyboardEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import styled from 'styled-components';

const StyledRenameForm = styled.form`
    display: flex;

    input,
    button {
        background-color: transparent;
        border: 0;
        color: inherit;
        font-size: inherit;
        font-family: inherit;
        outline: 0;
        padding: 0;
        margin: 0 0 -2px;
        min-width: 0;
    }

    button {
        padding: 0 5px;
    }
`;

export type RenameFormProps = {
    className?: string;
    initialName: string;
    onRename?: (e: FormEvent, name: string) => void;
    onCancel?: (e: FormEvent | KeyboardEvent) => void;
};

export const RenameForm = ({
    className = '',
    initialName,
    onRename,
    onCancel,
}: RenameFormProps) => {
    const [newName, setNewName] = useState<string>(initialName);
    const resetButtonId = useRef(`rename-form-reset-${Date.now()}`);
    const inputId = useRef(`rename-form-input-${Date.now()}`);

    const handleChange = useCallback((e: FormEvent) => {
        setNewName((e.target as HTMLInputElement).value);
    }, []);

    const handleKeydown = useCallback(
        (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onCancel?.(e);
                    break;
            }
        },
        [onCancel]
    );

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            onRename?.(e, newName);
        },
        [onRename, newName]
    );

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLFormElement>) => {
            if (
                e.relatedTarget &&
                (e.relatedTarget as HTMLElement).id === resetButtonId.current
            ) {
                return;
            }
            handleSubmit(e);
        },
        [handleSubmit]
    );

    const handleResetClick = useCallback(
        (e: FormEvent) => {
            onCancel?.(e);
        },
        [onCancel]
    );

    // focus input on rename
    useEffect(() => {
        const input = document.getElementById(
            inputId.current
        ) as HTMLInputElement;
        input?.focus();
        input?.select();
    }, []);

    return (
        <StyledRenameForm
            className={`rename-form ${className}`}
            onSubmit={handleSubmit}
            onBlur={handleBlur}
        >
            <input
                type="text"
                name="title"
                id={inputId.current}
                value={newName}
                onChange={handleChange}
                onKeyDown={handleKeydown}
            />

            <button
                type="reset"
                onClick={handleResetClick}
                id={resetButtonId.current}
            >
                <i className="fas fa-times"></i>
            </button>
        </StyledRenameForm>
    );
};

export default RenameForm;
