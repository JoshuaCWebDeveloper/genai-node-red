import React from 'react';
import styled from 'styled-components';
import { NodeEntity } from '../../redux/modules/node/node.slice';
import environment from '../../../environment';

export type NodeProps = {
    node: NodeEntity; // Extend this interface based on your node's properties
};

// Styled component for the node item
const StyledNodeItem = styled.li<{ node: NodeEntity }>`
    &.node-item {
        ${props =>
            props.node.color ? `background-color: ${props.node.color};` : ''}
        padding: 10px; // Add padding to ensure content is not overlapped by background image
        display: flex;
        align-items: center; // Center the content vertically

        .type {
            flex: 1;
            text-align: ${props => props.node.align || 'left'};
        }
    }
`;

// Optionally, if you're using SVGs or another component-based approach for icons
const Icon = styled.img`
    width: 20px; // Adjust based on your needs
    height: 20px; // Adjust based on your needs
    margin-right: 10px; // Space between the icon and the text
`;

export const Node: React.FC<NodeProps> = ({ node }) => {
    return (
        <StyledNodeItem node={node} className="node-item">
            {node.icon && (
                <Icon
                    src={`${environment.NODE_RED_API_ROOT}/icons/node-red/${node.icon}`}
                    alt="Node Icon"
                />
            )}
            <span className="type">{node.type}</span>
            {/* Additional node details can be displayed here */}
        </StyledNodeItem>
    );
};

export default Node;
