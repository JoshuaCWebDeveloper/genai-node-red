import React from 'react';
import styled from 'styled-components';
import Node from './node';
import DraggableNodeWrapper from './draggable-node-wrapper'; // Import the DraggableNodeWrapper
import { PaletteNodeEntity } from '../../redux/modules/palette/node.slice';

export type CategoryProps = {
    title: string;
    nodes: Array<PaletteNodeEntity>;
};

const StyledCategory = styled.div`
    margin-bottom: 30px;

    h3 {
        color: var(--color-text);
        margin: 0 10px;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    .draggable-wrapper {
        margin: 0 10px 10px;
    }

    li {
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
`;

export const Category: React.FC<CategoryProps> = ({ title, nodes }) => {
    return (
        <StyledCategory>
            <h3>{title}</h3>
            <ul>
                {nodes.map(node => (
                    <DraggableNodeWrapper key={node.id} node={node}>
                        <Node node={node} />
                    </DraggableNodeWrapper>
                ))}
            </ul>
        </StyledCategory>
    );
};

export default Category;
