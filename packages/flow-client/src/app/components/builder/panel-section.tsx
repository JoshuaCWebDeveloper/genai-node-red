import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { CollapsibleIcon } from '../shared/collapsible-icon';

const StyledPanelSectionContainer = styled.div`
    display: flex;
    flex-direction: column;

    height: 100%;
`;

const StyledPanelSection = styled.div`
    border: 1px solid var(--color-border);
    border-radius: 5px;
    padding: 10px;
    min-height: 0;

    h1 {
        cursor: pointer;
        display: flex;
        font-size: 0.8em;
        font-weight: bold;
        margin: 0 0 5px 0;
        line-height: 1em;
        text-transform: uppercase;
    }
`;

export type PanelSectionContainerProps = {
    children: React.ReactNode;
};

export const PanelSectionContainer: React.FC<PanelSectionContainerProps> = ({
    children,
}) => {
    return (
        <StyledPanelSectionContainer>{children}</StyledPanelSectionContainer>
    );
};

export type PanelSectionProps = {
    className?: string;
    title: string;
    collapsible?: boolean;
    initialCollapsed?: boolean;
    children: React.ReactNode;
};

export const PanelSection: React.FC<PanelSectionProps> = ({
    className = '',
    title,
    collapsible = false,
    initialCollapsed = false,
    children,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

    const toggleCollapse = useCallback(
        () => setIsCollapsed(!isCollapsed),
        [isCollapsed]
    );

    return (
        <StyledPanelSection
            className={`panel-section ${className} ${
                isCollapsed ? 'collapsed' : ''
            }`}
        >
            <h1 onClick={toggleCollapse}>
                {collapsible && <CollapsibleIcon isCollapsed={isCollapsed} />}
                {title}
            </h1>

            {!isCollapsed && children}
        </StyledPanelSection>
    );
};

export default PanelSection;
