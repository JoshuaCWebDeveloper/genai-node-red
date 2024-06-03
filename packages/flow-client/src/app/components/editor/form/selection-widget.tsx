import { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { Tooltip } from '../../shared/tooltip';

const StyledSelectionWidget = styled.div<{ showButtons: boolean }>`
    padding-top: 10px;
    position: absolute;
    top: calc(var(--editor-form-input-height) + 30px);
    left: 0;
    z-index: 100;

    &:before {
        --arrow-width: 15px;

        background-color: var(--color-background-element-focus);
        border: 1px solid var(--color-border-medium);
        border-bottom: 0;
        border-right: 0;
        box-shadow: rgba(0, 0, 0, 0.15) -1px -1px 1px 0px;
        content: '';
        position: absolute;
        top: 2px;
        left: calc(
            var(--editor-form-input-height) / 2 - var(--arrow-width) / 2
        );
        transform: rotate(45deg);
        width: var(--arrow-width);
        height: var(--arrow-width);
    }

    button {
        background-color: var(--color-background-element-focus);
        border: 1px solid var(--color-border-medium);
        border-bottom: 0;
        cursor: pointer;
        padding-top: 0.15rem;
        position: absolute;
        top: -10px;
        right: 0;
        width: 30px;
        height: 20px;

        &:hover {
            background-color: var(--color-background-element-sharp);
        }

        &.save {
            border-radius: 0 var(--editor-form-input-border-radius) 0 0;
            box-shadow: rgba(0, 0, 0, 0.15) 1px -1px 1px 0px;
        }

        &.cancel {
            border-radius: var(--editor-form-input-border-radius) 0 0 0;
            box-shadow: rgba(0, 0, 0, 0.15) -1px -1px 1px 0px;
            right: 29px;
        }
    }

    .selection-box,
    .selection-content {
        border-radius: var(--editor-form-input-border-radius)
            ${({ showButtons }) =>
                showButtons ? '0' : 'var(--editor-form-input-border-radius)'}
            var(--editor-form-input-border-radius)
            var(--editor-form-input-border-radius);
    }

    .selection-box {
        background-color: var(--color-background-element-focus);
        border: 1px solid var(--color-border-medium);
        box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 2px 1px;
        width: 100%;
        height: 100%;
    }

    .selection-content {
        background-color: transparent;
        clip-path: border-box;
        overflow: auto;
        position: absolute;
        top: 11px;
        left: 1px;
        scrollbar-color: var(--color-background-element-medium)
            var(--color-background-element-light);
        scrollbar-width: thin;
        width: calc(100% - 2px);
        height: calc(100% - 12px);
    }
`;

export type SelectionWidgetProps = {
    children: React.ReactNode;
    className?: string;
    id?: string;
    initialOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    showButtons?: boolean;
    triggerSelector: string;
    [key: string]: unknown;
};

// eslint-disable-next-line no-empty-pattern
export const SelectionWidget = ({
    children,
    className = '',
    id,
    onOpen,
    onClose,
    onSave,
    onCancel,
    showButtons = true,
    showWidget = false,
    triggerSelector,
    ...props
}: SelectionWidgetProps) => {
    const defaultId = useRef(`selection-widget-tooltip-${Date.now()}`);
    const widgetId = id || defaultId.current;

    const openWidget = useCallback(() => {
        onOpen?.();
    }, [onOpen]);

    const closeWidget = useCallback(() => {
        onClose?.();
    }, [onClose]);

    const handleTriggerClick = useCallback(() => {
        if (showWidget) {
            closeWidget();
        } else {
            openWidget();
        }
    }, [closeWidget, openWidget, showWidget]);

    const handleWidgetBlur = useCallback(
        (event: React.FocusEvent<HTMLDivElement>) => {
            // ignore bubbled events
            if (event.currentTarget.contains(event.relatedTarget)) {
                return;
            }

            // ignore if the event originates from the button
            if (event.relatedTarget?.matches(triggerSelector)) {
                return;
            }

            closeWidget();
        },
        [closeWidget, triggerSelector]
    );

    const handleSave = useCallback(() => {
        onSave?.();
        closeWidget();
    }, [closeWidget, onSave]);

    const handleCancel = useCallback(() => {
        onCancel?.();
        closeWidget();
    }, [closeWidget, onCancel]);

    const widgetRef = useCallback((widget: HTMLDivElement) => {
        if (!widget) {
            return;
        }

        widget.focus();
    }, []);

    useEffect(() => {
        document
            .querySelector(triggerSelector)
            ?.addEventListener('click', handleTriggerClick);
        return () => {
            document
                .querySelector(triggerSelector)
                ?.removeEventListener('click', handleTriggerClick);
        };
    }, [onOpen, onClose, triggerSelector, handleTriggerClick]);

    if (!showWidget) {
        return null;
    }

    return (
        <StyledSelectionWidget
            showButtons={showButtons}
            className={`selection-widget ${className}`}
            ref={widgetRef}
            tabIndex={0}
            onBlur={handleWidgetBlur}
            id={widgetId}
            {...props}
        >
            {showButtons && (
                <>
                    <button
                        className="save"
                        onClick={handleSave}
                        data-tooltip-id={`${widgetId}-tooltip`}
                        data-tooltip-content="Save"
                    >
                        <i className="fa-solid fa-check" />
                    </button>

                    <button
                        className="cancel"
                        onClick={handleCancel}
                        data-tooltip-id={`${widgetId}-tooltip`}
                        data-tooltip-content="Cancel"
                    >
                        <i className="fa-solid fa-times" />
                    </button>
                </>
            )}

            <div className="selection-box"></div>

            <div className="selection-content">{children}</div>

            <Tooltip id={`${widgetId}-tooltip`} />
        </StyledSelectionWidget>
    );
};

export default SelectionWidget;
