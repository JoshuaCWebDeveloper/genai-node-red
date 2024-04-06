import {
    AbstractReactFactory,
    CanvasWidget,
    LayerModel,
    LayerModelGenerics,
    SelectionBoxLayerFactory,
} from '@projectstorm/react-canvas-core';
import {
    DefaultDiagramState,
    DefaultLabelFactory,
    DefaultLinkFactory,
    DefaultLinkModel,
    DefaultNodeFactory,
    DefaultNodeModel,
    DefaultPortFactory,
    DiagramModel,
    LinkLayerFactory,
    NodeLayerFactory,
    PathFindingLinkFactory,
} from '@projectstorm/react-diagrams';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { DiagramEngine } from '@projectstorm/react-diagrams';

const StyledCanvasWidget = styled(CanvasWidget)`
    background-color: #f0f0f0; /* Light grey background */
    border: 1px solid #ccc; /* Adds a border around the canvas */
    height: calc(
        100vh - 60px
    ); /* Adjust height if you have a header or toolbar */
    overflow: auto; /* Allows scrolling within the canvas */
`;

class CustomEngine extends DiagramEngine {
    public increaseZoomLevel(event: WheelEvent): void {
        const model = this.getModel();
        if (model) {
            const zoomFactor = 0.1; // Adjust this value based on your needs
            const oldZoomLevel = model.getZoomLevel();
            const newZoomLevel = Math.max(
                oldZoomLevel + event.deltaY * -zoomFactor,
                50
            );

            // Calculate the new offset
            const boundingRect = (
                event.currentTarget as Element
            )?.getBoundingClientRect();
            const clientX = event.clientX - boundingRect.left;
            const clientY = event.clientY - boundingRect.top;
            const deltaX = clientX - model.getOffsetX();
            const deltaY = clientY - model.getOffsetY();
            const zoomRatio = newZoomLevel / oldZoomLevel;
            const newOffsetX = clientX - deltaX * zoomRatio;
            const newOffsetY = clientY - deltaY * zoomRatio;

            model.setZoomLevel(newZoomLevel);
            model.setOffset(newOffsetX, newOffsetY);
            this.repaintCanvas();
        }
    }
}

const createEngine = (options = {}) => {
    const engine = new CustomEngine(options);
    // register model factories
    engine
        .getLayerFactories()
        .registerFactory(
            new NodeLayerFactory() as unknown as AbstractReactFactory<
                LayerModel<LayerModelGenerics>,
                DiagramEngine
            >
        );
    engine
        .getLayerFactories()
        .registerFactory(
            new LinkLayerFactory() as unknown as AbstractReactFactory<
                LayerModel<LayerModelGenerics>,
                DiagramEngine
            >
        );
    engine.getLayerFactories().registerFactory(new SelectionBoxLayerFactory());
    engine.getLabelFactories().registerFactory(new DefaultLabelFactory());
    engine.getNodeFactories().registerFactory(new DefaultNodeFactory()); // i cant figure out why
    engine.getLinkFactories().registerFactory(new DefaultLinkFactory());
    engine.getLinkFactories().registerFactory(new PathFindingLinkFactory());
    engine.getPortFactories().registerFactory(new DefaultPortFactory());
    // register the default interaction behaviours
    engine.getStateMachine().pushState(new DefaultDiagramState());
    return engine;
};

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
    return <StyledCanvasWidget engine={engine} className="canvas-widget" />;
};

export default FlowCanvasContainer;
