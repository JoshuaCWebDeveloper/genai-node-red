import React from 'react';
import styled from 'styled-components';
import { NodeEntity } from '../../redux/modules/node/node.slice';
import Node from './node';
import DraggableNodeWrapper from './draggable-node-wrapper'; // Import the DraggableNodeWrapper

export type CategoryProps = {
    title: string;
    nodes: Array<NodeEntity>;
};

const StyledCategory = styled.div`
    margin-bottom: 30px;

    h3 {
        color: var(--color-text);
        margin: 0 20px;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    .draggable-wrapper {
        margin: 0 20px 10px;
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
