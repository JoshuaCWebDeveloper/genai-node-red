import {
    AbstractReactFactory,
    DefaultNodeModel,
    GenerateModelEvent,
    GenerateWidgetEvent,
    PortModel,
    PortModelAlignment,
    PortWidget,
} from '@projectstorm/react-diagrams';
import React, { useCallback } from 'react';
import styled from 'styled-components';

import { useAppDispatch, useAppLogic } from '../../redux/hooks';
import {
    EDITING_TYPE,
    builderActions,
} from '../../redux/modules/builder/builder.slice';
import { FlowNodeEntity } from '../../redux/modules/flow/flow.slice';
import { PaletteNodeEntity } from '../../redux/modules/palette/node.slice';
import NodeRedNode from '../node/node-red-node';
import { CustomEngine } from './engine';

// Styled components for the node and its elements
const StyledNode = styled.div<{
    borderColor?: string;
    largestGroupSize: number;
}>`
    text-wrap: nowrap;

    .node.node-red {
        height: ${props =>
            35 +
            (props.largestGroupSize > 2
                ? (props.largestGroupSize - 2) * 13 + 10
                : 0)}px;
    }

    &.in-out .node.node-red {
        background-color: #ddd;
        border-color: #666;
        padding: 5px;
        width: 50px;
        height: 50px;

        .name {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            color: #666;

            & > span:first-child {
                font-size: 10px;
            }

            & > span:last-child {
                font-size: 32px;
                line-height: 26px;
            }
        }
    }

    &.selected .node.node-red {
        border: 2px #007bff solid;
        transform: translate(-1px, 0px);
    }

    &.in-out.selected .node.node-red {
        transform: translate(0px, 0px);
    }

    .aligned-ports {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin: auto;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;

        &.alignment-left,
        &.alignment-right {
            height: calc(100% + 20px);

            .port {
                margin: 1px 0;
            }
        }

        &.alignment-left {
            left: -6px;
            right: initial;

            .tooltip {
                right: 20px;
                left: initial;

                &::after {
                    border-left-color: black;
                    top: 0;
                    bottom: 0;
                    left: calc(100% - 1px);
                    right: initial;
                }
            }
        }

        &.alignment-right {
            right: -6px;
            left: initial;

            .tooltip {
                left: 20px;
                right: initial;

                &::after {
                    border-right-color: black;
                    top: 0;
                    bottom: 0;
                    right: calc(100% - 1px);
                    left: initial;
                }
            }
        }

        &.alignment-top,
        &.alignment-bottom {
            width: calc(100% + 20px);

            .port {
                margin: 0 1px;
            }
        }

        &.alignment-top {
            top: -6px;
            bottom: initial;
        }

        &.alignment-bottom {
            bottom: -6px;
            top: initial;
        }
    }

    .port {
        background-color: #ddd;
        border: 1px #777 solid;
        border-radius: 4px;
        display: inline-block;
        padding: 5px;
        position: relative;
        height: 12px;
        width: 12px;

        &:hover .tooltip {
            visibility: visible;
        }
    }

    .tooltip {
        background-color: black;
        border-radius: 2px;
        color: #fff;
        font-size: 0.7em;
        line-height: 1.1em;
        margin: auto;
        padding: 2px 6px;
        position: absolute;
        top: -100px;
        right: -100px;
        bottom: -100px;
        left: -100px;
        text-align: center;
        visibility: hidden;
        width: max-content;
        height: 1.5em;
        z-index: 1;

        /* Tooltip arrow */
        &::after {
            border-color: transparent transparent transparent transparent;
            border-style: solid;
            border-width: 5px;
            content: ' ';
            margin: auto;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            height: 0px;
        }
    }
`;

export type NodeProps = {
    node: CustomNodeModel;
    engine: CustomEngine;
};

export const Node: React.FC<NodeProps> = ({ node, engine }) => {
    const dispatch = useAppDispatch();
    const builderLogic = useAppLogic().builder;

    // Convert the ports model to an array for rendering
    const alignmentOrder = [
        PortModelAlignment.TOP,
        PortModelAlignment.RIGHT,
        PortModelAlignment.BOTTOM,
        PortModelAlignment.LEFT,
    ];
    const groupedPorts = Object.values(node.getPorts()).reduce<PortModel[][]>(
        (acc, curr) => {
            const alignmentIndex = alignmentOrder.indexOf(
                curr.getOptions().alignment ?? alignmentOrder[0]
            );
            if (alignmentIndex !== -1) {
                acc[alignmentIndex].push(curr);
            }
            return acc;
        },
        alignmentOrder.map(() => [])
    );
    const largestGroupSize = Math.max(
        ...groupedPorts.map(group => group.length)
    );

    const handleDoubleClick = useCallback(() => {
        if (['in', 'out'].includes(node.config?.type ?? '')) {
            dispatch(builderLogic.editFlowEntityById(node.config?.z ?? ''));
        } else {
            dispatch(
                builderActions.setEditing({
                    id: node.getID(),
                    type: EDITING_TYPE.NODE,
                    data: {
                        entityType: node.entity?.type,
                        info: node.config?.info,
                        name: node.config?.name,
                        icon: node.config?.icon,
                        inputLabels: node.config?.inputLabels,
                        outputLabels: node.config?.outputLabels,
                    },
                })
            );
        }
    }, [builderLogic, dispatch, node]);

    const entity = node.entity ?? ({} as PaletteNodeEntity);

    return (
        <StyledNode
            className={`${node.isSelected() ? 'selected' : ''} ${
                node.config?.type === 'in' ? 'in-out in' : ''
            } ${node.config?.type === 'out' ? 'in-out out' : ''}`}
            largestGroupSize={largestGroupSize}
            onDoubleClick={handleDoubleClick}
        >
            <NodeRedNode entity={entity} instance={node.config}>
                {/* Render ports */}

                {groupedPorts.map((alignedPorts, index) => (
                    <div
                        key={index}
                        className={`aligned-ports alignment-${alignmentOrder[index]}`}
                    >
                        {alignedPorts.map((port, index) => (
                            <PortWidget
                                key={index}
                                engine={engine}
                                port={port}
                                className={`alignment-${
                                    port.getOptions().alignment
                                }`}
                            >
                                {/* Tooltip added here */}
                                <div className="tooltip">
                                    {port.getOptions().extras.label}
                                </div>
                                {/* You can still display the port's name or any other elements here if needed */}
                            </PortWidget>
                        ))}
                    </div>
                ))}
            </NodeRedNode>
            {/* You can add more custom UI elements here */}
        </StyledNode>
    );
};

// Assuming createCustomNodeModel exists, and you're adding to this file
export class CustomNodeModel extends DefaultNodeModel {
    public entity?: PaletteNodeEntity;
    public config?: FlowNodeEntity;

    constructor(options: {
        extras: {
            entity: PaletteNodeEntity;
            config: FlowNodeEntity;
            [index: string]: unknown;
        };
        [index: string]: unknown;
    }) {
        super({
            ...options,
            type: 'custom-node',
        });
        this.entity = options?.extras?.entity;
        this.config = options?.extras?.config;
    }
}

// Factory for the custom node, if you're using TypeScript, you might need to extend the appropriate factory class
export class CustomNodeFactory extends AbstractReactFactory<
    CustomNodeModel,
    CustomEngine
> {
    constructor() {
        super('custom-node');
    }

    generateReactWidget(
        event: GenerateWidgetEvent<CustomNodeModel>
    ): JSX.Element {
        return <Node node={event.model} engine={this.engine} />;
    }

    generateModel(_event: GenerateModelEvent) {
        return new CustomNodeModel(_event.initialConfig);
    }
}
