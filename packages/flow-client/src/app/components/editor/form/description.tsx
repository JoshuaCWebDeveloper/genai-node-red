import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const StyledDescription = styled.div`
    .EasyMDEContainer {
        .editor-toolbar {
            background-color: var(--color-background-element-light);
            border-color: var(--color-border-light);

            button {
                color: var(--color-text-sharp);

                &.active {
                    background-color: var(--color-background-element-medium);
                }
            }
        }

        .CodeMirror {
            background-color: var(--color-background-element-light);
            border-color: var(--color-border-light);
            color: var(--color-text-sharp);

            .CodeMirror-cursor {
                border-color: var(--color-text-sharp);
            }
        }

        .CodeMirror-focused {
            background-color: var(--color-background-element-focus);
            border-color: var(--color-border-medium);
            outline: none;
        }
    }
`;

export type DescriptionProps = {
    description: string;
    onChange?: (description: string) => void;
    className?: string;
    [index: string]: unknown;
};

export const Description = ({
    description,
    onChange,
    className = '',
    ...props
}: DescriptionProps) => {
    const initialDescription = useRef(description);
    const [textarea, setTextarea] = useState<HTMLTextAreaElement | null>(null);
    const easyMDERef = useRef<EasyMDE | null>(null);

    const textareaRef = useCallback((textarea: HTMLTextAreaElement) => {
        setTextarea(textarea);
    }, []);

    useEffect(() => {
        if (!textarea) {
            return;
        }

        const easyMDE = new EasyMDE({ element: textarea });
        easyMDE.value(initialDescription.current);
        easyMDE.codemirror.on('change', () => {
            onChange?.(easyMDE.value());
        });
        easyMDERef.current = easyMDE;

        return () => {
            easyMDE.toTextArea();
            easyMDERef.current = null;
        };
    }, [onChange, textarea]);

    useEffect(() => {
        if (!easyMDERef.current) {
            return;
        }

        const cursor = easyMDERef.current.codemirror.getCursor();
        easyMDERef.current.value(description);
        easyMDERef.current.codemirror.setCursor(cursor);
    }, [description]);

    const handleLabelClick = useCallback(() => {
        if (!easyMDERef.current) {
            return;
        }

        easyMDERef.current.codemirror.focus();
        const doc = easyMDERef.current.codemirror.getDoc();
        const totalLines = doc.lineCount();
        const lastLine = doc.getLine(totalLines - 1);
        const lastCharPos = lastLine.length;
        doc.setCursor(totalLines - 1, lastCharPos);
    }, []);

    return (
        <StyledDescription className={`description ${className}`}>
            <label htmlFor="description" onClick={handleLabelClick}>
                Description:
            </label>
            <textarea id="description" ref={textareaRef} {...props}></textarea>
        </StyledDescription>
    );
};

export default Description;
