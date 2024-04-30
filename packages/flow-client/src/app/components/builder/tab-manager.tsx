import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { FlowCanvas } from '../flow-canvas/flow-canvas';
import {
    builderActions,
    selectOpenFlows,
    selectActiveFlow,
} from '../../redux/modules/builder/builder.slice';

// Styled components for the tab manager
const StyledTabManager = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    .tab-list {
        display: flex;
        background-color: var(--color-background-element-light);
        border: 1px none var(--color-border-light);
        color: var(--color-text-sharp);
        padding: 0.5rem;
    }

    .tab-item {
        margin-right: 0.5rem;
        cursor: pointer;
        padding: 0.5rem;
        display: flex;
        align-items: center;

        &:hover {
            background-color: #555;
        }

        .close-btn {
            margin-left: 10px;
            color: red;
            cursor: pointer;
        }
    }

    .active-tab {
        background-color: #777;
    }
`;

export const TabManager = () => {
    const dispatch = useDispatch();
    const openFlows = useSelector(selectOpenFlows);
    const activeFlow = useSelector(selectActiveFlow);

    // Function to switch the active tab
    const switchTab = (tabId: string) => {
        dispatch(builderActions.setActiveFlow(tabId));
    };

    // Function to close a tab
    const closeTab = (tabId: string) => {
        dispatch(builderActions.closeFlow(tabId));
    };

    return (
        <StyledTabManager className="tab-manager">
            <div className="tab-list">
                {openFlows.map(tabId => (
                    <div
                        key={tabId}
                        className={`tab-item ${
                            tabId === activeFlow ? 'active-tab' : ''
                        }`}
                        onClick={() => switchTab(tabId)}
                    >
                        {tabId}
                        <span
                            className="close-btn"
                            onClick={e => {
                                e.stopPropagation(); // Prevent tab switch when closing
                                closeTab(tabId);
                            }}
                        >
                            &times;
                        </span>
                    </div>
                ))}
            </div>

            <FlowCanvas key={activeFlow} flowId={activeFlow ?? undefined} />
        </StyledTabManager>
    );
};

export default TabManager;
