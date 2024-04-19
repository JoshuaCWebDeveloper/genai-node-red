import {
    AbstractReactFactory,
    DefaultNodeModel,
    GenerateModelEvent,
    GenerateWidgetEvent,
    PortWidget,
} from '@projectstorm/react-diagrams';
import React from 'react';
import styled from 'styled-components';

import { useAppDispatch } from '../../redux/hooks';
import { builderActions } from '../../redux/modules/builder/builder.slice';
import { NodeEntity } from '../../redux/modules/node/node.slice';
import NodeRedNode from '../node/node-red-node';
import { CustomEngine } from './engine';
import { FlowNodeEntity } from '../../redux/modules/flow/flow.slice';

// Styled components for the node and its elements
const StyledNode = styled.div<{ borderColor?: string }>`
    &.selected .node.node-red {
        border: 2px #007bff solid;
    }

    .ports-container {
        display: flex;
        flex-direction: column;
    }

    .port {
        background-color: #ddd;
        border: 1px #ccc solid;
        border-radius: 4px;
        display: inline-block;
        margin: auto;
        padding: 5px;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        height: 12px;
        width: 12px;

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

        &.alignment-top {
            top: -6px;
            bottom: initial;
        }

        &.alignment-bottom {
            bottom: -6px;
            top: initial;
        }

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

    // Convert the ports model to an array for rendering
    const ports = Object.values(node.getPorts());

    const handleDoubleClick = () => {
        dispatch(builderActions.setEditing(node.getID()));
    };

    const entity = node.entity ?? ({} as NodeEntity);

    return (
        <StyledNode
            className={node.isSelected() ? 'selected' : ''}
            onDoubleClick={handleDoubleClick}
        >
            <NodeRedNode entity={entity} instance={node.config}>
                {/* Render ports */}

                {ports.map((port, index) => (
                    <PortWidget
                        key={index}
                        engine={engine}
                        port={port}
                        className={`alignment-${port.getOptions().alignment}`}
                    >
                        {/* Tooltip added here */}
                        <div className="tooltip">{port.getName()}</div>
                        {/* You can still display the port's name or any other elements here if needed */}
                    </PortWidget>
                ))}
            </NodeRedNode>
            {/* You can add more custom UI elements here */}
        </StyledNode>
    );
};

// Assuming createCustomNodeModel exists, and you're adding to this file
export class CustomNodeModel extends DefaultNodeModel {
    public entity?: NodeEntity;
    public config?: FlowNodeEntity;

    constructor(options: {
        extras: {
            entity: NodeEntity;
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
