import styled from 'styled-components';

import { NodeEntity } from '../../redux/modules/node/node.slice';
import environment from '../../../environment';

// Styled component for the node item
const StyledNode = styled.div<{ node: NodeEntity }>`
    align-items: center;
    ${props =>
        props.node.color ? `background-color: ${props.node.color};` : ''}
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 0px 1px inset;
    display: flex;
    padding: 10px 15px;
    position: relative;
    height: 35px;

    .type {
        flex: 1;
        text-align: ${props => props.node.align || 'left'};
    }

    .icon {
        width: 20px; // Adjust based on your needs
        height: 20px; // Adjust based on your needs
        margin-right: 10px; // Space between the icon and the text
    }
`;

export type NodeRedNodeProps = {
    node: NodeEntity;
    children?: React.ReactNode;
};

export const NodeRedNode = ({ node, children }: NodeRedNodeProps) => {
    return (
        <StyledNode node={node} className="node node-red">
            {node.icon && (
                <img
                    className="icon"
                    src={`${environment.NODE_RED_API_ROOT}/icons/node-red/${node.icon}`}
                    alt="Node Icon"
                />
            )}
            <span className="type">{node.type}</span>
            {children}
        </StyledNode>
    );
};

export default NodeRedNode;
