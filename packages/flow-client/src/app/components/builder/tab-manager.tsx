import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

import { useAppSelector } from '../../redux/hooks';
import {
    builderActions,
    selectActiveFlow,
    selectNewFlowCounter,
    selectOpenFlows,
} from '../../redux/modules/builder/builder.slice';
import {
    flowActions,
    selectFlowEntities,
} from '../../redux/modules/flow/flow.slice';
import { FlowCanvas } from '../flow-canvas/flow-canvas';

const StyledTabManager = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
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
`;

export const TabManager = () => {
    const dispatch = useDispatch();
    const flowEntities = useAppSelector(selectFlowEntities);
    const openFlows = useAppSelector(selectOpenFlows);
    const activeFlow = useAppSelector(selectActiveFlow);
    const flowCounter = useAppSelector(selectNewFlowCounter);

    const tabContentRef = useRef<HTMLDivElement>(null);

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

    const createNewTab = useCallback(() => {
        const flowId = uuidv4();
        dispatch(
            flowActions.addFlowEntity({
                id: flowId,
                type: 'flow',
                name: `New Flow${flowCounter ? ` ${flowCounter}` : ''}`,
                disabled: false,
                info: '',
                env: [],
            })
        );
        dispatch(builderActions.addNewFlow(flowId));
        dispatch(builderActions.setActiveFlow(flowId));
    }, [dispatch, flowCounter]);

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
        <StyledTabManager>
            <div className="tab-container">
                <div
                    className="tab-content"
                    onWheel={handleWheel}
                    ref={tabContentRef}
                >
                    <div className="tab-list">
                        {openFlows
                            .map(flowId => flowEntities[flowId])
                            .filter(it => it)
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
                                    <p>{flowEntity.name}</p>
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

                <button className="new-tab" onClick={createNewTab}>
                    <i className="fa fa-plus"></i>
                </button>
            </div>

            <FlowCanvas key={activeFlow} flowId={activeFlow ?? undefined} />
        </StyledTabManager>
    );
};

export default TabManager;
