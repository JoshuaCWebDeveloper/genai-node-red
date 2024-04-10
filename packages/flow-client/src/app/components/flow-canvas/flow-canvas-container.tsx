import { CanvasWidget } from '@projectstorm/react-canvas-core';
import {
    DefaultLinkModel,
    DefaultPortModel,
    DiagramModel,
    PortModelAlignment,
} from '@projectstorm/react-diagrams';
import React, { useEffect } from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';

import { ItemTypes } from '../node/draggable-item-types'; // Assuming ItemTypes is defined elsewhere

import { NodeEntity } from '../../redux/modules/node/node.slice';
import { createEngine } from './custom-engine';
import { CustomNodeModel } from './node';
import { useAppLogic } from '../../redux/hooks';

const StyledCanvasWidget = styled(CanvasWidget)`
    background-color: #f0f0f0; /* Light grey background */
    background-image: linear-gradient(
            0deg,
            transparent 24%,
            rgba(0, 0, 0, 0.1) 25%,
            rgba(0, 0, 0, 0.1) 26%,
            transparent 27%,
            transparent 74%,
            rgba(0, 0, 0, 0.1) 75%,
            rgba(0, 0, 0, 0.1) 76%,
            transparent 77%,
            transparent
        ),
        linear-gradient(
            90deg,
            transparent 24%,
            rgba(0, 0, 0, 0.1) 25%,
            rgba(0, 0, 0, 0.1) 26%,
            transparent 27%,
            transparent 74%,
            rgba(0, 0, 0, 0.1) 75%,
            rgba(0, 0, 0, 0.1) 76%,
            transparent 77%,
            transparent
        );
    background-size: 50px 50px;
    border: 1px solid #ccc; /* Adds a border around the canvas */
    height: calc(
        100vh - 60px
    ); /* Adjust height if you have a header or toolbar */
    overflow: auto; /* Allows scrolling within the canvas */
`;

const engine = createEngine();

export type FlowCanvasContainerProps = {
    initialDiagram?: {
        nodes?: CustomNodeModel[];
        links?: DefaultLinkModel[];
    };
};

// FlowCanvasContainer initializes and displays the flow canvas.
// It sets up the diagram engine and model for rendering nodes and connections.
// It now accepts initialDiagram as props to allow hardcoded diagrams with nodes and links.
export const FlowCanvasContainer: React.FC<FlowCanvasContainerProps> = ({
    initialDiagram = {},
}) => {
    const nodeLogic = useAppLogic().node;

    const model = new DiagramModel();
    model.setGridSize(20);

    // Your existing setup code for adding nodes and links to the model

    engine.setModel(model);

    useEffect(() => {
        const canvas = document.querySelector('.flow-canvas');
        const handleZoom = (event: Event) =>
            engine.increaseZoomLevel(event as WheelEvent);
        const disableContextMenu = (event: Event) => event.preventDefault();

        canvas?.addEventListener('wheel', handleZoom);
        canvas?.addEventListener('contextmenu', disableContextMenu);

        return () => {
            canvas?.removeEventListener('wheel', handleZoom);
            canvas?.removeEventListener('contextmenu', disableContextMenu);
        };
    }, []);

    // Add initial nodes and links to the model if any
    initialDiagram.nodes?.forEach(node => model.addNode(node));
    initialDiagram.links?.forEach(link => model.addLink(link));

    // Configure engine and model as needed
    engine.setModel(model);

    const [, drop] = useDrop(() => ({
        accept: ItemTypes.NODE,
        drop: (entity: NodeEntity, monitor) => {
            // Get the monitor's client offset
            const monitorOffset = monitor.getClientOffset();

            // Get the initial client offset (cursor position at drag start)
            const initialClientOffset = monitor.getInitialClientOffset();

            // Get the initial source client offset (dragged item's position at drag start)
            const initialSourceClientOffset =
                monitor.getInitialSourceClientOffset();

            // Get the current zoom level from the engine's model
            const zoomLevel = engine.getModel().getZoomLevel() / 100; // Convert to decimal

            if (
                !monitorOffset ||
                !initialClientOffset ||
                !initialSourceClientOffset
            ) {
                return;
            }

            // Calculate the cursor's offset within the dragged item
            const cursorOffsetX =
                initialClientOffset.x - initialSourceClientOffset.x;
            const cursorOffsetY =
                initialClientOffset.y - initialSourceClientOffset.y;

            // Find the canvas widget element
            const canvasElement = document.querySelector('.flow-canvas > svg');

            if (!canvasElement) {
                return;
            }

            // Get the bounding rectangle of the canvas widget
            const canvasRect = canvasElement.getBoundingClientRect();

            // Calculate the correct position by subtracting the canvas's top and left offsets
            const canvasOffsetX =
                (monitorOffset.x - canvasRect.left) / zoomLevel;
            const canvasOffsetY =
                (monitorOffset.y - canvasRect.top) / zoomLevel;

            const correctedX = canvasOffsetX - cursorOffsetX;
            const correctedY = canvasOffsetY - cursorOffsetY;

            const node = new CustomNodeModel(entity, {
                name: entity.type,
                color: entity.color,
            });

            node.setPosition(correctedX, correctedY);

            const ports = nodeLogic.getNodeInputsOutputs(entity);
            ports.inputs.forEach(input => {
                node.addPort(
                    new DefaultPortModel({
                        in: true,
                        name: input,
                        label: input,
                        alignment: PortModelAlignment.LEFT,
                    })
                );
            });
            ports.outputs.forEach(output => {
                node.addPort(
                    new DefaultPortModel({
                        in: false,
                        name: output,
                        label: output,
                        alignment: PortModelAlignment.RIGHT,
                    })
                );
            });

            model.addNode(node);
            engine.repaintCanvas();
        },
    }));

    // The CanvasWidget component is used to render the flow canvas within the UI.
    // The "canvas-widget" className can be targeted for custom styling.
    return (
        <div ref={drop} style={{ height: '100%', width: '100%' }}>
            <StyledCanvasWidget engine={engine} className="flow-canvas" />
        </div>
    );
};

export default FlowCanvasContainer;
