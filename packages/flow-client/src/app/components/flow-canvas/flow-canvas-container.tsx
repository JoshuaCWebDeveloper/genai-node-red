import { CanvasWidget } from '@projectstorm/react-canvas-core';
import {
    DefaultLinkModel,
    DefaultNodeModel,
    DiagramModel,
} from '@projectstorm/react-diagrams';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { createEngine } from './custom-engine';

const StyledCanvasWidget = styled(CanvasWidget)`
    background-color: #f0f0f0; /* Light grey background */
    border: 1px solid #ccc; /* Adds a border around the canvas */
    height: calc(
        100vh - 60px
    ); /* Adjust height if you have a header or toolbar */
    overflow: auto; /* Allows scrolling within the canvas */
`;

const engine = createEngine();

export type FlowCanvasContainerProps = {
    initialDiagram?: {
        nodes?: DefaultNodeModel[];
        links?: DefaultLinkModel[];
    };
};

// FlowCanvasContainer initializes and displays the flow canvas.
// It sets up the diagram engine and model for rendering nodes and connections.
// It now accepts initialDiagram as props to allow hardcoded diagrams with nodes and links.
export const FlowCanvasContainer: React.FC<FlowCanvasContainerProps> = ({
    initialDiagram = {},
}) => {
    const model = new DiagramModel();

    // Your existing setup code for adding nodes and links to the model

    engine.setModel(model);

    useEffect(() => {
        const canvas = document.querySelector('.canvas-widget');
        const handleZoom = (event: Event) =>
            engine.increaseZoomLevel(event as WheelEvent);

        canvas?.addEventListener('wheel', handleZoom);

        return () => {
            canvas?.removeEventListener('wheel', handleZoom);
        };
    }, []);

    // Add initial nodes and links to the model if any
    initialDiagram.nodes?.forEach(node => model.addNode(node));
    initialDiagram.links?.forEach(link => model.addLink(link));

    // Configure engine and model as needed
    engine.setModel(model);

    // The CanvasWidget component is used to render the flow canvas within the UI.
    // The "canvas-widget" className can be targeted for custom styling.
    return <StyledCanvasWidget engine={engine} className="flow-canvas" />;
};

export default FlowCanvasContainer;
