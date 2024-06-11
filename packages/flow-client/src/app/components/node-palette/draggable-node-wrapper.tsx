import React from 'react';
import { useDrag } from 'react-dnd';

import { ItemTypes } from '../node/draggable-item-types'; // Adjust the path as necessary
import { PaletteNodeEntity } from '../../redux/modules/palette/node.slice';

export type DraggableNodeWrapperProps = {
    node: PaletteNodeEntity;
    children: React.ReactNode;
};

export const DraggableNodeWrapper: React.FC<DraggableNodeWrapperProps> = ({
    node,
    children,
}) => {
    const [, drag] = useDrag(
        () => ({
            type: ItemTypes.NODE,
            item: node,
            collect: monitor => ({
                isDragging: !!monitor.isDragging(),
            }),
        }),
        [node]
    );

    return (
        <div className="draggable-wrapper" ref={drag}>
            {children}
        </div>
    );
};

export default DraggableNodeWrapper;
