import {
    AbstractReactFactory,
    DefaultDiagramState,
    DefaultLabelFactory,
    DefaultLinkFactory,
    DefaultPortFactory,
    DiagramEngine,
    LayerModel,
    LayerModelGenerics,
    LinkLayerFactory,
    NodeLayerFactory,
    PathFindingLinkFactory,
    SelectionBoxLayerFactory,
} from '@projectstorm/react-diagrams';

import { CustomNodeFactory } from './node';

export class CustomEngine extends DiagramEngine {
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

export const createEngine = (options = {}) => {
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
    engine.getNodeFactories().registerFactory(new CustomNodeFactory()); // i cant figure out why
    engine.getLinkFactories().registerFactory(new DefaultLinkFactory());
    engine.getLinkFactories().registerFactory(new PathFindingLinkFactory());
    engine.getPortFactories().registerFactory(new DefaultPortFactory());
    // register the default interaction behaviours
    engine.getStateMachine().pushState(new DefaultDiagramState());
    return engine;
};
