import React from 'react';
import styled from 'styled-components';
import { NodeEntity } from '../../redux/modules/node/node.slice';
import Node from './node';

export type CategoryProps = {
    title: string;
    nodes: Array<NodeEntity>;
};

const StyledCategory = styled.div`
    margin-bottom: 30px;

    h3 {
        color: #333;
        margin: 0 20px;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    li {
        background-color: #fff;
        border: 1px solid #ddd;
        padding: 10px 15px;
        margin: 0 20px 10px;
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
                    <Node key={node.id} node={node} />
                ))}
            </ul>
        </StyledCategory>
    );
};

export default Category;