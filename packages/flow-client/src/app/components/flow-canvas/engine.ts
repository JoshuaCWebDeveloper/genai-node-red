import { Point } from '@projectstorm/geometry';
import {
    AbstractReactFactory,
    BaseEvent,
    CanvasEngineOptions,
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
import { DropTargetMonitor } from 'react-dnd';

import { CustomDiagramModel } from './model';
import { CustomNodeFactory } from './node';
import { SerializedGraph } from '../../redux/modules/flow/flow.logic';

export class CustomEngine extends DiagramEngine {
    constructor(options?: CanvasEngineOptions) {
        super(options);

        this.registerListener({
            eventDidFire: (event: BaseEvent) => {
                const e = event as unknown as BaseEvent & {
                    function: string;
                    globalName: string;
                    global: boolean;
                };
                // ignore global events
                if (e.function === '_globalEngine' || e.global) {
                    return;
                }
                e.globalName = `CustomEngine:${e.function}`;
                this.fireEvent(e, '_globalEngine');
            },
            _globalEngine: (event: BaseEvent) => {
                const e = event as unknown as BaseEvent & {
                    function: string;
                    globalName: string;
                    global: boolean;
                };
                e.global = true;
                this.fireEvent(e, e.globalName);
            },
        });
    }

    public override setModel(model: CustomDiagramModel): void {
        const ret = super.setModel(model);

        // Add a global event listener to the model
        const handleGlobalEvent = (event: BaseEvent) => {
            const e = event as unknown as BaseEvent & {
                function: string;
                entity: () => void;
                globalName: string;
            };
            e.globalName = `${e.entity.constructor.name}:${e.function}`;
            this.fireEvent(e, '_globalEngine');
        };
        model.registerListener({
            eventDidFire: (event: BaseEvent) => {
                const e = event as unknown as BaseEvent & {
                    function: string;
                };
                // ignore global events
                if (e.function === '_globalPassthrough') {
                    return;
                }
                handleGlobalEvent(e);
            },
            _globalPassthrough: handleGlobalEvent,
        });

        return ret;
    }

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

    public calculateDropPosition(
        monitor: DropTargetMonitor,
        canvas: HTMLCanvasElement
    ): Point {
        // Get the monitor's client offset
        const monitorOffset = monitor.getClientOffset();

        // Get the initial client offset (cursor position at drag start)
        const initialClientOffset = monitor.getInitialClientOffset();

        // Get the initial source client offset (dragged item's position at drag start)
        const initialSourceClientOffset =
            monitor.getInitialSourceClientOffset();

        if (
            !monitorOffset ||
            !initialClientOffset ||
            !initialSourceClientOffset
        ) {
            throw new Error(
                `Unable to get monitor offsets: ${monitorOffset}, ${initialClientOffset}, ${initialSourceClientOffset}`
            );
        }

        // Get the current zoom level from the engine's model
        const zoomLevel = this.getModel().getZoomLevel() / 100; // Convert to decimal

        // Calculate the cursor's offset within the dragged item
        const cursorOffsetX =
            initialClientOffset.x - initialSourceClientOffset.x;
        const cursorOffsetY =
            initialClientOffset.y - initialSourceClientOffset.y;

        // Get the bounding rectangle of the canvas widget
        const canvasRect = canvas.getBoundingClientRect();

        // Calculate the correct position by subtracting the canvas's top and left offsets
        const canvasOffsetX = (monitorOffset.x - canvasRect.left) / zoomLevel;
        const canvasOffsetY = (monitorOffset.y - canvasRect.top) / zoomLevel;

        const correctedX = canvasOffsetX - cursorOffsetX;
        const correctedY = canvasOffsetY - cursorOffsetY;

        return new Point(correctedX, correctedY);
    }

    public applySerializedGraph(serializedGraph: SerializedGraph) {
        const model = this.getModel();

        // don't overwrite some properties
        serializedGraph.offsetX = model.getOffsetX() ?? 0;
        serializedGraph.offsetY = model.getOffsetY() ?? 0;
        serializedGraph.zoom = model.getZoomLevel() ?? 1;
        serializedGraph.gridSize = model.getOptions().gridSize ?? 20;
        // order our layers: links, nodes
        serializedGraph.layers.sort((a, b) => {
            if (a.type === 'diagram-links') return -1;
            if (b.type === 'diagram-links') return 1;
            return 0;
        });

        model.deserializeModel(serializedGraph, this);

        return this.repaintCanvas(true);
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
