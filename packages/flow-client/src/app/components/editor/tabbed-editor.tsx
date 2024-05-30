import React, { useState, ReactNode } from 'react';
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
        flex: 1;
        color: var(--color-text-sharp);
        overflow: hidden;
        padding: 1rem;
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

export type TabbedEditorProps = {
    children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
    className?: string;
};

export const TabbedEditor: React.FC<TabbedEditorProps> = ({
    children,
    className = '',
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
                {React.Children.toArray(children)[activeTab]}
            </div>
        </StyledTabbedEditor>
    );
};

export default TabbedEditor;
