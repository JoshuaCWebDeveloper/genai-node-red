import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { useAppDispatch, useAppLogic, useAppSelector } from '../../redux/hooks';
import {
    builderActions,
    selectActiveFlow,
    selectOpenFlows,
    selectTheme,
} from '../../redux/modules/builder/builder.slice';
import { selectFlowEntities } from '../../redux/modules/flow/flow.slice';
import { Theme } from '../../themes';
import { FlowCanvas } from '../flow-canvas/flow-canvas';

const StyledTabManager = styled.div<{ dropdownX: number; customTheme: Theme }>`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    text-wrap: nowrap;

    .tab-container {
        background-color: var(--color-background-element-light);
        display: flex;
        flex: 0 0 var(--builder-tab-container-height);
        overflow: hidden;
        min-height: 0;
    }

    .tab-content {
        height: 100%;
        overflow-x: auto;
        overflow-y: hidden;

        scrollbar-width: thin;
        scrollbar-color: var(--color-background-element-medium)
            var(--color-background-element-light);
    }

    .tab-list {
        display: flex;
        color: var(--color-text-sharp);
        font-size: 0.8em;
        padding: 0;
        height: 100%;
    }

    .tab-item {
        flex: 0;
        margin-right: 1rem;
        cursor: pointer;
        padding: 0.5rem 1rem;
        display: flex;
        align-items: center;
        margin: 0;
        border-radius: 0;
        text-wrap: nowrap;
        transition: background-color 0.3s;

        p i {
            font-size: 0.7em;
            margin-right: 0.5em;
            vertical-align: middle;
        }

        .close-btn {
            margin-left: 10px;
            color: var(--color-danger);
            cursor: pointer;
            display: inline-block;
            line-height: 0;
            padding: 0;
            border-radius: 2px;
            visibility: hidden;
            width: 20px;
            height: 20px;

            i {
                padding: 3px 5px;
                width: 100%;
                height: 100%;
            }

            &:hover {
                background-color: var(--color-background-element-medium);
            }
        }

        &:hover .close-btn,
        &.active-tab .close-btn {
            visibility: visible;
        }

        &:hover {
            border-bottom: 1px solid var(--color-border-light);
        }

        &.active-tab {
            background-color: var(--color-background-main);
            border-top: 2px solid var(--color-border-sharp);
        }
    }

    .new-tab {
        border: 0;
        color: var(--color-text-sharp);
        cursor: pointer;
        padding: 0.5rem 1rem;
        display: flex;
        align-items: center;
        margin: 0;
        border-radius: 0;
        background-color: var(--color-background-element-light);

        &:hover {
            /* background-color: var(--color-background-element-medium); */
            border-bottom: 1px solid var(--color-border-light);
            /* border: 0; */
        }

        &:active {
            background-color: var(--color-background-element-medium);
        }
    }

    .new-flow-dropdown {
        position: absolute;
        background-color: var(--color-background-element-light);
        border: 1px solid var(--color-border-light);
        border-radius: 0px;
        box-shadow: 0 2px 5px
            rgba(
                0,
                0,
                0,
                ${props =>
                    ({
                        dark: 1,
                        light: 0.2,
                    }[props.customTheme])}
            );
        z-index: 100;
        top: calc(
            var(--builder-tab-container-height) - 2px
        ); // Position below the button
        left: ${props => props.dropdownX}px;
        width: auto;
        min-width: 150px;

        p {
            border-bottom: 1px solid var(--color-border-light);
            margin: 0;
            padding: 4px 10px;
            font-weight: bold;
            color: var(--color-text-sharp);
        }

        ul {
            list-style: none;
            padding: 0;
            margin: 0;

            li {
                padding: 4px 10px;
                cursor: pointer;
                color: var(--color-text-sharp);
                transition: background-color 0.3s;

                &:hover {
                    background-color: var(--color-background-element-medium);
                }
            }
        }
    }
`;

export const TabManager = () => {
    const dispatch = useAppDispatch();
    const flowLogic = useAppLogic().flow;
    const flowEntities = useAppSelector(selectFlowEntities);
    const openFlows = useAppSelector(selectOpenFlows);
    const activeFlow = useAppSelector(selectActiveFlow);
    const theme = useAppSelector(selectTheme);

    const tabContentRef = useRef<HTMLDivElement>(null);
    // State to toggle dropdown visibility
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownX, setDropdownX] = useState(0);

    const switchTab = useCallback(
        (tabId: string) => {
            dispatch(builderActions.setActiveFlow(tabId));
        },
        [dispatch]
    );

    const closeTab = useCallback(
        (tabId: string) => {
            dispatch(builderActions.closeFlow(tabId));
        },
        [dispatch]
    );

    const handleNewTabClick = useCallback(
        (e: React.MouseEvent) => {
            // Adjust dropdown position to align with the button's horizontal position
            setDropdownX(
                e.currentTarget.getBoundingClientRect().left -
                    (document
                        .querySelector('.tab-manager')
                        ?.getBoundingClientRect().left ?? 0)
            );
            setShowDropdown(!showDropdown);
        },
        [showDropdown]
    );

    const createNewFlow = useCallback(() => {
        dispatch(flowLogic.createNewFlow());
        setShowDropdown(false); // Hide dropdown after selection
    }, [dispatch, flowLogic]);

    const createNewSubflow = useCallback(() => {
        dispatch(flowLogic.createNewSubflow());
        setShowDropdown(false); // Hide dropdown after selection
    }, [dispatch, flowLogic]);

    useEffect(() => {
        if (activeFlow) {
            document.getElementById(`tab-${activeFlow}`)?.scrollIntoView();
        }
    }, [activeFlow]);

    const handleWheel = useCallback((event: React.WheelEvent) => {
        const container = tabContentRef.current;
        if (container) {
            container.scrollLeft += event.deltaY;
        }
    }, []);

    return (
        <StyledTabManager
            dropdownX={dropdownX}
            className="tab-manager"
            customTheme={theme}
        >
            <div className="tab-container">
                <div
                    className="tab-content"
                    onWheel={handleWheel}
                    ref={tabContentRef}
                >
                    <div className="tab-list">
                        {openFlows
                            .map(
                                flowId =>
                                    flowEntities[flowId] ?? {
                                        id: flowId,
                                        type: 'flow',
                                        name: '...',
                                    }
                            )
                            .map(flowEntity => (
                                <div
                                    key={flowEntity.id}
                                    id={`tab-${flowEntity.id}`}
                                    className={`tab-item ${
                                        flowEntity.id === activeFlow
                                            ? 'active-tab'
                                            : ''
                                    }`}
                                    onClick={() => switchTab(flowEntity.id)}
                                >
                                    <p>
                                        {flowEntity.type === 'flow' ? (
                                            <i className="fas fa-map"></i>
                                        ) : (
                                            <i className="fas fa-sitemap"></i>
                                        )}

                                        {flowEntity.name}
                                    </p>

                                    <span
                                        className="close-btn"
                                        onClick={e => {
                                            e.stopPropagation(); // Prevent tab switch when closing
                                            closeTab(flowEntity.id);
                                        }}
                                    >
                                        <i className="fa fa-times"></i>
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>

                <button className="new-tab" onClick={handleNewTabClick}>
                    <i className="fa fa-plus"></i>
                </button>
            </div>

            {showDropdown && (
                <div className="new-flow-dropdown">
                    <p>New...</p>

                    <ul>
                        <li onClick={createNewFlow}>New Flow</li>
                        <li onClick={createNewSubflow}>New Subflow</li>
                    </ul>
                </div>
            )}

            <FlowCanvas key={activeFlow} flowId={activeFlow ?? undefined} />
        </StyledTabManager>
    );
};

export default TabManager;
