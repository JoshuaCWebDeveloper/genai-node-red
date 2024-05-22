import React from 'react';
import { useDrag } from 'react-dnd';

import { NodeEntity } from '../../redux/modules/palette/node.slice';
import { ItemTypes } from '../node/draggable-item-types'; // Adjust the path as necessary

export type DraggableNodeWrapperProps = {
    node: NodeEntity;
    children: React.ReactNode;
};

export const DraggableNodeWrapper: React.FC<DraggableNodeWrapperProps> = ({
    node,
    children,
}) => {
    const [, drag] = useDrag(() => ({
        type: ItemTypes.NODE,
        item: node,
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div className="draggable-wrapper" ref={drag}>
            {children}
        </div>
    );
};

export default DraggableNodeWrapper;
