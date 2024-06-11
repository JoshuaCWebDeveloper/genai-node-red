import React, { Fragment, useState } from 'react';
import styled, { css } from 'styled-components';

import environment from '../../../../environment';
import { useGetIconsQuery } from '../../../redux/modules/api/icon.api';
import { SelectionWidget } from './selection-widget';

const StyledIcon = styled.div<{ dropdownActive: boolean }>`
    position: relative;

    .select-icon {
        display: flex;
        align-items: center;
        justify-content: center;

        background-color: var(--color-background-element-light);
        border: 1px solid var(--color-border-light);
        border-radius: var(--editor-form-input-border-radius);
        cursor: pointer;
        padding: 0px;
        width: var(--editor-form-input-height);
        height: var(--editor-form-input-height);

        ${({ dropdownActive }) =>
            dropdownActive &&
            css`
                background-color: var(--color-background-element-focus);
                border-color: var(--color-border-medium);
            `}
    }

    .icon-picker {
        width: 200px;
        height: 250px;

        .selection-content {
            padding: 5px;
        }

        h6 {
            margin: 0;
            display: block;
            background-color: rgba(0, 0, 0, 0.3);
        }

        .icon-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: space-between;

            padding: 5px 3px 15px;

            &:last-child {
                padding-bottom: 0;
            }
        }

        .icon-item {
            cursor: pointer;

            &:hover {
                border-color: blue;
            }

            &.selected {
                border-color: blue;
            }
        }
    }

    .select-icon img,
    .icon-item {
        background: rgba(0, 0, 0, 0.2);
        padding: 5px;
        width: calc(var(--editor-form-input-height) / 1.3);
        height: calc(var(--editor-form-input-height) / 1.3);
    }
`;

export type IconProps = {
    className?: string;
    icon: string;
    onChange?: (icon: string) => void;
    [key: string]: unknown;
};

export const Icon: React.FC<IconProps> = ({
    className = '',
    icon,
    onChange,
    ...props
}) => {
    const { data: icons, error, isLoading } = useGetIconsQuery();
    const [selectedCategory, selectedIcon] = icon.split('/');
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    if (isLoading) return <div>Loading icons...</div>;
    if (error) return <div>Error loading icons</div>;

    const handleIconClick = (icon: string, category: string) => {
        const newIcon = `${category}/${icon}`;
        onChange?.(newIcon);
        setShowDropdown(false);
    };

    return (
        <StyledIcon
            className={`icon ${className}`}
            dropdownActive={showDropdown}
            {...props}
        >
            <label>Icon: </label>

            <button type="button" className="select-icon">
                <img
                    src={`${environment.NODE_RED_API_ROOT}/icons/${icon}`}
                    alt={icon}
                />
            </button>

            <SelectionWidget
                className="icon-picker"
                onOpen={() => setShowDropdown(true)}
                onClose={() => setShowDropdown(false)}
                showButtons={false}
                showWidget={showDropdown}
                triggerSelector=".select-icon"
            >
                {icons &&
                    Object.entries(icons)
                        .filter(([_, iconList]) => iconList.length > 0)
                        .map(([category, iconList]) => (
                            <Fragment key={category}>
                                <h6>{category}</h6>

                                <div className="icon-grid">
                                    {iconList.map(icon => (
                                        <img
                                            key={icon}
                                            className={`icon-item ${
                                                category === selectedCategory &&
                                                icon === selectedIcon
                                                    ? 'selected'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                handleIconClick(icon, category)
                                            }
                                            src={`${environment.NODE_RED_API_ROOT}/icons/${category}/${icon}`}
                                            alt={icon}
                                        />
                                    ))}
                                </div>
                            </Fragment>
                        ))}
            </SelectionWidget>
        </StyledIcon>
    );
};

export default Icon;
