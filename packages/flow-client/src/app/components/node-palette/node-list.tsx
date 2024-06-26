import React from 'react';
import styled from 'styled-components';

import { PaletteNodeEntity } from '../../redux/modules/palette/node.slice';
import Category from './category'; // Ensure this is correctly imported

export type NodeListProps = {
    nodes: Array<PaletteNodeEntity>;
};

const StyledNodeList = styled.div`
    list-style: none;
    padding: 0;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: var(--color-background-element-medium)
        var(--color-background-element-light);
    height: calc(100% - 50px);
`;

export const NodeList: React.FC<NodeListProps> = ({ nodes }) => {
    // Example categorization logic (you'll need to adjust this based on your actual data structure)
    const categories = nodes.reduce<Record<string, Array<PaletteNodeEntity>>>(
        (acc, node) => {
            const category = node.category || 'Other'; // Now using 'category' field
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(node);
            return acc;
        },
        {}
    );

    return (
        <StyledNodeList>
            {Object.entries(categories).map(([title, nodes]) => (
                <Category key={title} title={title} nodes={nodes} />
            ))}
        </StyledNodeList>
    );
};

export default NodeList;
