import React from 'react';
import styled from 'styled-components';

import { PaletteNodeEntity } from '../../redux/modules/palette/node.slice';
import NodeRedNode from '../node/node-red-node';

export type NodeProps = {
    node: PaletteNodeEntity; // Extend this interface based on your node's properties
};

// Styled component for the node item
const StyledNodeItem = styled.li<{ node: PaletteNodeEntity }>`
    &.node-item {
    }
`;

export const Node: React.FC<NodeProps> = ({ node }) => {
    return (
        <StyledNodeItem node={node} className="node-item">
            <NodeRedNode entity={node} />
        </StyledNodeItem>
    );
};

export default Node;
