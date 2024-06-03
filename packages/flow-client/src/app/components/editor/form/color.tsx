import { useCallback, useEffect, useRef, useState } from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import styled, { css } from 'styled-components';
import { Tooltip } from '../../shared/tooltip';
import { SelectionWidget } from './selection-widget';

const StyledColor = styled.div<{ color: string; pickerActive: boolean }>`
    position: relative;

    .color-picker-button {
        background-color: var(--color-background-element-light);
        border: 1px solid var(--color-border-light);
        border-radius: var(--editor-form-input-border-radius);
        cursor: pointer;
        padding: 5px;
        width: var(--editor-form-input-height);
        height: var(--editor-form-input-height);

        ${({ pickerActive }) =>
            pickerActive &&
            css`
                background-color: var(--color-background-element-focus);
                border-color: var(--color-border-medium);
            `}

        i {
            background-color: ${({ color }) => color};
            display: block;
            width: 100%;
            height: 100%;
        }
    }

    .color-picker {
        width: 225px;
        height: 355px;

        .sketch-picker {
            background-color: transparent !important;
            border: none;
            box-shadow: none !important;
            padding: 0;
        }
    }
`;

export type ColorProps = {
    color: string;
    onChange?: (color: string) => void;
    className?: string;
};

// eslint-disable-next-line no-empty-pattern
export const Color = ({ color, onChange, className = '' }: ColorProps) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [currentColor, setCurrentColor] = useState(color);
    const previousColor = useRef(color);
    const tooltipId = useRef(`color-tooltip-${Date.now()}`);

    const openPicker = useCallback(() => {
        setShowColorPicker(true);
        setCurrentColor(color);
        previousColor.current = color;
    }, [color]);

    const closePicker = useCallback(() => {
        setShowColorPicker(false);
        if (currentColor !== previousColor.current) {
            previousColor.current = currentColor;
        }
    }, [currentColor, previousColor]);

    const handleColorChange = useCallback((color: ColorResult) => {
        setCurrentColor(color.hex);
    }, []);

    const handleColorChangeComplete = useCallback(
        (color: ColorResult) => {
            handleColorChange(color);
            onChange?.(color.hex);
        },
        [handleColorChange, onChange]
    );

    const handleCancel = useCallback(() => {
        handleColorChangeComplete({
            hex: previousColor.current,
        } as ColorResult);
    }, [handleColorChangeComplete, previousColor]);

    useEffect(() => {
        if (showColorPicker) {
            const picker = document.querySelector('.color-picker');
            if (picker instanceof HTMLElement) {
                picker.focus();
            }
        }
    }, [showColorPicker]);

    return (
        <StyledColor
            className={`color ${className}`}
            color={currentColor}
            pickerActive={showColorPicker}
        >
            <label>Color: </label>
            <button className="color-picker-button">
                <i />
            </button>

            <SelectionWidget
                className="color-picker"
                icon={currentColor}
                onOpen={openPicker}
                onClose={closePicker}
                onCancel={handleCancel}
                showWidget={showColorPicker}
                triggerSelector=".color-picker-button"
            >
                <SketchPicker
                    color={currentColor}
                    onChange={handleColorChange}
                    onChangeComplete={handleColorChangeComplete}
                    disableAlpha={true}
                    presetColors={[
                        '#DDAA99',
                        '#3FADB5',
                        '#87A980',
                        '#A6BBCF',
                        '#AAAA66',
                        '#C0C0C0',
                        '#C0DEED',
                        '#C7E9C0',
                        '#D7D7A0',
                        '#D8BFD8',
                        '#DAC4B4',
                        '#DEB887',
                        '#DDBD5C',
                        '#E2D96E',
                        '#E6E0F8',
                        '#E7E7AE',
                        '#E9967A',
                        '#F3B567',
                        '#FDD0A2',
                        '#FDF0C2',
                        '#FFAAAA',
                        '#FFCC66',
                        '#FFF0F0',
                        '#FFFFFF',
                    ]}
                />
            </SelectionWidget>

            <Tooltip id={tooltipId.current} />
        </StyledColor>
    );
};

export default Color;
