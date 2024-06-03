import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';

const StyledTabbedEditor = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;

    .tab-headers {
        display: flex;
        border-bottom: 1px solid var(--color-border-light);

        .header {
            cursor: pointer;
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            color: var(--color-text-sharp);
            font-weight: normal;
            padding: 0.5rem 1rem;

            &:hover {
                background: var(--color-background-element-light);
            }

            &.active {
                background: var(--color-background-element-medium);
                border-bottom: 2px solid var(--color-border-medium);
                color: var(--color-text-sharp);
                font-weight: bold;
            }

            i {
                margin-right: 5px;
            }
        }
    }

    .tab-content {
        --tab-padding: 1rem;

        flex: 1;
        color: var(--color-text-sharp);
        overflow: hidden;
        padding: var(--tab-padding);
        position: relative;

        & > .tab {
            background: var(--color-background-main);
            position: absolute;
            top: var(--tab-padding);
            left: var(--tab-padding);
            width: calc(100% - var(--tab-padding) * 2);
            height: calc(100% - var(--tab-padding) * 2);
            z-index: 0;

            &.active {
                z-index: 1;
            }
        }
    }
`;

export type TabProps = {
    name: string;
    icon: string;
    children: ReactNode;
};

export const Tab: React.FC<TabProps> = ({ children }) => {
    return children;
};

export const TabPresets = {
    properties: {
        name: 'Properties',
        icon: 'cog',
    },
    description: {
        name: 'Description',
        icon: 'info',
    },
    appearance: {
        name: 'Appearance',
        icon: 'paint-brush',
    },
};

export enum STRATEGY {
    RENDER = 'RENDER',
    Z_INDEX = 'Z_INDEX',
}

export type TabbedEditorProps = {
    children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
    className?: string;
    strategy?: STRATEGY;
};

export const TabbedEditor: React.FC<TabbedEditorProps> = ({
    children,
    className = '',
    strategy = STRATEGY.RENDER,
}) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <StyledTabbedEditor className={`tabbed-editor ${className}`}>
            <div className="tab-headers">
                {React.Children.map(children, (tab, index) => (
                    <div
                        className={`header ${
                            index === activeTab ? 'active' : ''
                        }`}
                        key={index}
                        onClick={() => setActiveTab(index)}
                    >
                        <i className={`fas fa-${tab.props.icon}`} />
                        {tab.props.name}
                    </div>
                ))}
            </div>

            <div className="tab-content">
                {
                    {
                        RENDER: React.Children.toArray(children)[activeTab],
                        Z_INDEX: React.Children.map(
                            children,
                            (child, index) => {
                                return (
                                    <div
                                        key={index}
                                        className={`tab ${
                                            index === activeTab ? 'active' : ''
                                        }`}
                                    >
                                        {child}
                                    </div>
                                );
                            }
                        ),
                    }[strategy]
                }
            </div>
        </StyledTabbedEditor>
    );
};

export default TabbedEditor;
