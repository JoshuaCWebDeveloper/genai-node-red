import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    builderActions,
    selectEditing,
} from '../../redux/modules/builder/builder.slice';

const StyledFlowEditor = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 2rem;
    background: transparent;

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
    }

    .EasyMDEContainer {
        .editor-toolbar {
            background-color: var(--color-background-element-light);

            button {
                color: var(--color-text-sharp);

                &.active {
                    background-color: var(--color-background-element-medium);
                }
            }
        }

        .CodeMirror {
            background-color: var(--color-background-element-light);
            color: var(--color-text-sharp);
        }
    }

    input:focus,
    .EasyMDEContainer .CodeMirror-focused {
        background-color: var(--color-background-element-focus);
        border-color: var(--color-border-medium);
        outline: none;
    }
`;

export type FlowEditorProps = Record<string, never>;

// eslint-disable-next-line no-empty-pattern
export const FlowEditor = ({}: FlowEditorProps) => {
    const dispatch = useAppDispatch();
    const editing = useAppSelector(selectEditing);
    const isEditing = editing ? true : false;
    const initialData = useRef({
        ...editing?.data,
    });

    const editorRef = useRef<HTMLTextAreaElement>(null);
    const easyMDERef = useRef<EasyMDE | null>(null);

    useEffect(() => {
        if (!isEditing || !editorRef.current) {
            return;
        }

        const easyMDE = new EasyMDE({ element: editorRef.current });
        easyMDE.value(initialData.current.info ?? '');
        easyMDE.codemirror.on('change', () => {
            dispatch(
                builderActions.updateEditingData({
                    info: easyMDE.value(),
                })
            );
        });
        easyMDERef.current = easyMDE;

        return () => {
            easyMDE.toTextArea();
            easyMDERef.current = null;
        };
    }, [dispatch, isEditing]);

    const handleNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!editing) {
                return;
            }

            dispatch(
                builderActions.updateEditingData({
                    name: e.target.value,
                })
            );
        },
        [dispatch, editing]
    );

    const handleDescriptionClick = useCallback(() => {
        if (easyMDERef.current) {
            easyMDERef.current.codemirror.focus();
            const doc = easyMDERef.current.codemirror.getDoc();
            const totalLines = doc.lineCount();
            const lastLine = doc.getLine(totalLines - 1);
            const lastCharPos = lastLine.length;
            doc.setCursor(totalLines - 1, lastCharPos);
        }
    }, []);

    if (!isEditing) {
        return null;
    }

    return (
        <StyledFlowEditor>
            <div>
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={editing?.data.name ?? ''}
                    onChange={handleNameChange}
                />
            </div>
            <div>
                <label htmlFor="description" onClick={handleDescriptionClick}>
                    Description:
                </label>
                <textarea id="description" ref={editorRef}></textarea>
            </div>
        </StyledFlowEditor>
    );
};

export default FlowEditor;
