import { Point } from '@projectstorm/geometry';
import { CanvasWidget, ListenerHandle } from '@projectstorm/react-canvas-core';
import {
    DefaultLinkModel,
    DefaultPortModel,
    PortModelAlignment,
} from '@projectstorm/react-diagrams';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';

import { useAppDispatch, useAppLogic, useAppSelector } from '../../redux/hooks';
import { SerializedGraph } from '../../redux/modules/flow/flow.logic';
import {
    FlowNodeEntity,
    selectAllEntities,
    selectFlows,
} from '../../redux/modules/flow/flow.slice';
import { NodeEntity } from '../../redux/modules/node/node.slice';
import { ItemTypes } from '../node/draggable-item-types'; // Assuming ItemTypes is defined elsewhere
import { createEngine } from './engine';
import { CustomDiagramModel } from './model';
import { CustomNodeModel } from './node';

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

const debounce = (func: (...args: unknown[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: unknown[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const LogFlowSlice = () => {
    const flowSlice = useAppSelector(selectAllEntities);

    useEffect(() => {
        console.log('Flow state: ', flowSlice);
    }, [flowSlice]);

    return null; // This component does not render anything
};

const engine = createEngine();

// engine.registerListener({
//     _globalEngine: (event: BaseEvent) => {
//         console.log('Global Engine event fired: ', event);
//     },
// });

export type FlowCanvasProps = {
    initialDiagram?: {
        nodes?: CustomNodeModel[];
        links?: DefaultLinkModel[];
    };
};

// FlowCanvasContainer initializes and displays the flow canvas.
// It sets up the diagram engine and model for rendering nodes and connections.
// It now accepts initialDiagram as props to allow hardcoded diagrams with nodes and links.
export const FlowCanvas: React.FC<FlowCanvasProps> = ({
    initialDiagram = {},
}) => {
    const dispatch = useAppDispatch();
    const nodeLogic = useAppLogic().node;
    const flowLogic = useAppLogic().flow;
    const existingFlows = useAppSelector(selectFlows);

    const [model] = useState(
        new CustomDiagramModel({ id: existingFlows[0]?.id })
    );

    const serializedGraph = useAppSelector(state =>
        flowLogic.selectSerializedGraphByFlowId(state, model.getID())
    );

    // Inside your component
    const listenerHandleRef = useRef<ListenerHandle | null>(null);

    useMemo(() => {
        model.setGridSize(20);

        // Add initial nodes and links to the model if any
        initialDiagram.nodes?.forEach(node => model.addNode(node));
        initialDiagram.links?.forEach(link => model.addLink(link));

        // Configure engine and model as needed
        engine.setModel(model);
    }, [initialDiagram.links, initialDiagram.nodes, model]);

    const registerModelChangeListener = useCallback(() => {
        // Event listener for any change in the model
        const handleModelChange = debounce(() => {
            // Serialize the current state of the diagram
            // serialize() is defined with the incorrect type
            const serializedModel =
                model.serialize() as unknown as SerializedGraph;
            // Dispatch an action to update the Redux state with the serialized model
            dispatch(flowLogic.updateFlowFromSerializedGraph(serializedModel));
        }, 500);

        // Register event listeners and store the handle in the ref
        listenerHandleRef.current = engine.registerListener({
            'CustomDiagramModel:nodesUpdated': handleModelChange,
            'CustomNodeModel:positionChanged': handleModelChange,
            'DefaultLinkModel:targetPortChanged': handleModelChange,
            'DefaultLinkModel:sourcePortChanged': handleModelChange,
            'DefaultLinkModel:pointsUpdated': handleModelChange,
            'PointModel:positionChanged': handleModelChange,
            // Add more listeners as needed
        });
    }, [dispatch, flowLogic, model]);

    const deregisterModelChangeListener = useCallback(() => {
        // Cleanup: use the ref to access the handle for deregistering listeners
        if (listenerHandleRef.current) {
            engine.deregisterListener(listenerHandleRef.current);
            listenerHandleRef.current = null;
        }
    }, []);

    useEffect(() => {
        let isCleanupCalled = false;

        (async () => {
            // we deserialize our graph in the same effect so that it doesn't trigger event handlers
            if (serializedGraph) {
                await engine.applySerializedGraph(serializedGraph);
            }

            if (!isCleanupCalled) {
                // apply listeners
                registerModelChangeListener();
            }
        })();

        return () => {
            // remove listeners
            deregisterModelChangeListener();
            isCleanupCalled = true;
        };
    }, [
        deregisterModelChangeListener,
        registerModelChangeListener,
        serializedGraph,
    ]);

    useEffect(() => {
        const canvas = document.querySelector('.flow-canvas');
        const canvasContainer = document.querySelector(
            '.flow-canvas-container'
        );

        const handleZoom = (event: Event) =>
            engine.increaseZoomLevel(event as WheelEvent);
        const disableContextMenu = (event: Event) => event.preventDefault();

        canvas?.addEventListener('wheel', handleZoom);
        canvas?.addEventListener('contextmenu', disableContextMenu);

        // Disable key events from outside our canvas
        const actionEventBus = engine.getActionEventBus();
        const originalFireAction =
            actionEventBus.fireAction.bind(actionEventBus);
        actionEventBus.fireAction = actionEvent => {
            // Check if the event is a key event (keydown or keyup)
            if (['keydown', 'keyup'].includes(actionEvent.event.type)) {
                // Check if the event target is not our canvas, then exit
                if (
                    !canvasContainer?.contains(actionEvent.event.target as Node)
                ) {
                    return;
                }
            }
            // Call the original fireAction method
            originalFireAction(actionEvent);
        };

        return () => {
            canvas?.removeEventListener('wheel', handleZoom);
            canvas?.removeEventListener('contextmenu', disableContextMenu);
            actionEventBus.fireAction = originalFireAction;
        };
    }, []);

    const [, drop] = useDrop(() => ({
        accept: ItemTypes.NODE,
        drop: (entity: NodeEntity, monitor) => {
            // Find the canvas widget element
            const canvasElement = document.querySelector(
                '.flow-canvas > svg'
            ) as HTMLCanvasElement;

            if (!canvasElement) {
                console.error('Error finding canvas element');
                return;
            }

            let nodePosition: Point;

            try {
                nodePosition = engine.calculateDropPosition(
                    monitor,
                    canvasElement
                );
            } catch (error) {
                console.error('Error calculating drop position:', error);
                return;
            }

            const config = nodeLogic.applyConfigDefaults(
                {} as FlowNodeEntity,
                entity
            );

            const node = new CustomNodeModel({
                name: entity.type,
                color: entity.color,
                extras: {
                    entity,
                    config,
                },
            });

            node.setPosition(nodePosition);

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
        <div
            className="flow-canvas-container"
            ref={drop}
            style={{ height: '100%', width: '100%' }}
            tabIndex={0}
        >
            <LogFlowSlice />
            <StyledCanvasWidget engine={engine} className="flow-canvas" />
        </div>
    );
};

export default FlowCanvas;
