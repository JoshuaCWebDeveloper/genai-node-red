import { Point } from '@projectstorm/geometry';
import { CanvasWidget, ListenerHandle } from '@projectstorm/react-canvas-core';
import {
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
import { v4 as uuidv4 } from 'uuid';

import { useAppDispatch, useAppLogic, useAppSelector } from '../../redux/hooks';
import { SerializedGraph } from '../../redux/modules/flow/graph.logic';
import { PaletteNodeEntity } from '../../redux/modules/palette/node.slice';
import { ItemTypes } from '../node/draggable-item-types'; // Assuming ItemTypes is defined elsewhere
import { createEngine } from './engine';
import { CustomDiagramModel } from './model';
import { CustomNodeModel } from './node';

const StyledContainer = styled.div`
    height: 100%;
    width: 100%;
    background-color: var(--color-background-main);
`;

const StyledCanvasWidget = styled(CanvasWidget)`
    background-color: var(--color-background-main);
    background-image: linear-gradient(
            0deg,
            transparent 24%,
            var(--color-border-light) 25%,
            transparent 26%,
            transparent 74%,
            var(--color-border-light) 75%,
            transparent 77%,
            transparent
        ),
        linear-gradient(
            90deg,
            transparent 24%,
            var(--color-border-light) 25%,
            transparent 26%,
            transparent 74%,
            var(--color-border-light) 75%,
            transparent 77%,
            transparent
        );
    background-size: 50px 50px;
    /* border: 1px solid #ccc; Adds a border around the canvas */
    height: 100%;
    overflow: auto; /* Allows scrolling within the canvas */
`;

const StyledEmptyFlowMessage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 5em;
    color: var(--color-text-light);
    font-weight: bold;
    text-align: center;
    flex-direction: column;
    height: calc(100% - 40px);
    background-color: var(--color-background-element-light);
    border: 2px dashed var(--color-border-medium);
    border-radius: 10px;
    padding: 20px;
    margin: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

    i {
        display: block;
    }

    p {
        margin-bottom: 0;
        text-wrap: pretty;
    }
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

// engine.registerListener({
//     _globalEngine: (event: BaseEvent) => {
//         console.log('Global Engine event fired: ', event);
//     },
// });

const createModel = (flowId: string) => {
    return new CustomDiagramModel({ id: flowId });
};

export type FlowCanvasProps = {
    flowId?: string;
};

// FlowCanvasContainer initializes and displays the flow canvas.
// It sets up the diagram engine and model for rendering nodes and connections.
// It now accepts initialDiagram as props to allow hardcoded diagrams with nodes and links.
export const FlowCanvas: React.FC<FlowCanvasProps> = ({ flowId }) => {
    const dispatch = useAppDispatch();
    const nodeLogic = useAppLogic().node;
    const flowLogic = useAppLogic().flow;

    const [engine] = useState(createEngine());
    const listenerHandleRef = useRef<ListenerHandle | null>(null);

    const model = useMemo(() => {
        if (!flowId) {
            return null;
        }

        const newModel = createModel(flowId);
        newModel.setGridSize(20);
        engine.setModel(newModel);

        return newModel;
    }, [flowId, engine]);

    const serializedGraph = useAppSelector(state =>
        flowLogic.graph.selectSerializedGraphByFlowId(
            state,
            model?.getID() ?? ''
        )
    );

    const registerModelChangeListener = useCallback(() => {
        // Event listener for any change in the model
        const handleModelChange = debounce(() => {
            if (!model) {
                return;
            }

            // Serialize the current state of the diagram
            // serialize() is defined with the incorrect type
            const serializedModel =
                model.serialize() as unknown as SerializedGraph;
            // Dispatch an action to update the Redux state with the serialized model
            dispatch(
                flowLogic.graph.updateFlowFromSerializedGraph(serializedModel)
            );
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
    }, [dispatch, engine, flowLogic, model]);

    const deregisterModelChangeListener = useCallback(() => {
        // Cleanup: use the ref to access the handle for deregistering listeners
        if (listenerHandleRef.current) {
            engine.deregisterListener(listenerHandleRef.current);
            listenerHandleRef.current = null;
        }
    }, [engine]);

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
        engine,
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
    }, [engine]);

    const [, drop] = useDrop(() => ({
        accept: ItemTypes.NODE,
        drop: (entity: PaletteNodeEntity, monitor) => {
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
                {
                    id: uuidv4(),
                    type: entity.type,
                    x: 0,
                    y: 0,
                    z: '',
                    name: '',
                    inputs: 1,
                    outputs: 1,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
                entity
            );

            const node = new CustomNodeModel({
                name: entity.name,
                color: entity.color,
                extras: {
                    entity,
                    config,
                },
            });

            node.setPosition(nodePosition);

            const ports = flowLogic.node.getNodeInputsOutputs(config, entity);
            ports.inputs.forEach(input => {
                node.addPort(
                    new DefaultPortModel({
                        in: true,
                        name: uuidv4(),
                        alignment: PortModelAlignment.LEFT,
                        extras: {
                            label: input,
                        },
                    })
                );
            });
            ports.outputs.forEach(output => {
                node.addPort(
                    new DefaultPortModel({
                        in: false,
                        name: uuidv4(),
                        alignment: PortModelAlignment.RIGHT,
                        extras: {
                            label: output,
                        },
                    })
                );
            });

            model?.addNode(node);
            engine.repaintCanvas();
        },
    }));

    // The CanvasWidget component is used to render the flow canvas within the UI.
    // The "canvas-widget" className can be targeted for custom styling.
    return (
        <StyledContainer
            className="flow-canvas-container"
            ref={drop}
            tabIndex={0}
        >
            {model ? (
                <StyledCanvasWidget engine={engine} className="flow-canvas" />
            ) : (
                <StyledEmptyFlowMessage>
                    <i className="fa-solid fa-edit" />
                    <p>Open flow to edit</p>
                </StyledEmptyFlowMessage>
            )}
        </StyledContainer>
    );
};

export default FlowCanvas;
