import styled from 'styled-components';

import { NodeEntity } from '../../redux/modules/node/node.slice';
import environment from '../../../environment';
import { FlowNodeEntity } from '../../redux/modules/flow/flow.slice';

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

    .name {
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
    entity: NodeEntity;
    instance?: FlowNodeEntity;
    children?: React.ReactNode;
};

export const NodeRedNode = ({
    entity,
    instance,
    children,
}: NodeRedNodeProps) => {
    return (
        <StyledNode node={entity} className="node node-red">
            {entity.icon && (
                <img
                    className="icon"
                    src={`${environment.NODE_RED_API_ROOT}/icons/node-red/${entity.icon}`}
                    alt="Node Icon"
                />
            )}
            <span className="name">{instance?.name || entity.type}</span>
            {children}
        </StyledNode>
    );
};

export default NodeRedNode;
