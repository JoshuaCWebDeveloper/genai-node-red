import React from 'react';
import styled from 'styled-components';

import { NodeEntity } from '../../redux/modules/node/node.slice';
import NodeRedNode from '../node/node-red-node';

export type NodeProps = {
    node: NodeEntity; // Extend this interface based on your node's properties
};

// Styled component for the node item
const StyledNodeItem = styled.li<{ node: NodeEntity }>`
    &.node-item {
    }
`;

export const Node: React.FC<NodeProps> = ({ node }) => {
    return (
        <StyledNodeItem node={node} className="node-item">
            <NodeRedNode node={node} />
        </StyledNodeItem>
    );
};

export default Node;
