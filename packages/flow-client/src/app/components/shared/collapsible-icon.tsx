import React from 'react';
import styled from 'styled-components';

const StyledCollapsibleIcon = styled.i`
    cursor: pointer;
    padding-right: 1em;
    width: 1.5em;
`;

export type CollapsibleIconProps = {
    isCollapsed: boolean;
};

export const CollapsibleIcon: React.FC<CollapsibleIconProps> = ({
    isCollapsed,
}) => {
    return (
        <StyledCollapsibleIcon
            className={`fas ${
                isCollapsed ? 'fa-chevron-right' : 'fa-chevron-down'
            }`}
        ></StyledCollapsibleIcon>
    );
};

export default CollapsibleIcon;
