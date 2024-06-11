import React, { useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { Panel, PanelProps } from './panel';
import { Tooltip } from '../shared/tooltip';

const StyledTabbedSidebar = styled(Panel)`
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;

    .tab-header {
        --tabbed-sidebar-button-dimension: calc(
            var(--builder-tab-container-height) - 2px
        );
        display: flex;
        justify-content: center;

        flex: 0 0 var(--builder-tab-container-height);
        overflow: hidden;
        padding: 2px 15px;

        .tab-list {
            display: flex;
            /* flex: 0 1 calc(var(--tabbed-sidebar-button-dimension) * 4); */
            flex: 0 1 fit-content;
            flex-wrap: wrap;
        }

        button {
            background-color: transparent;
            border: none;
            color: var(--color-text-main);
            cursor: pointer;
            font-size: 1em;
            padding: 0.5rem;
            transition: background-color 0.3s;
            height: var(--tabbed-sidebar-button-dimension);
            width: var(--tabbed-sidebar-button-dimension);

            &.active {
                border-bottom: 2px solid var(--color-border-sharp);
            }
        }
    }

    ul.tab-dropdown {
        background-color: var(--color-background-main);
        border-bottom: 1px solid var(--color-border-light);
        list-style: none;
        margin: 0;
        padding: 0;
        position: absolute;
        top: var(--builder-tab-container-height);
        width: 100%;
        z-index: 20;

        li {
            cursor: pointer;
            padding: 2px 15px;

            i {
                margin-right: 5px;
                width: 20px;
                height: 20px;
            }

            &:hover {
                background-color: var(--color-background-element-medium);
            }

            &.active {
                background-color: var(--color-background-element-sharp);
            }
        }
    }

    .tab-content {
        flex: 1;
        overflow: hidden;
    }
`;

export type SidebarTabProps = {
    active?: boolean;
    name: string;
    icon: string;
    children: React.ReactNode;
};

export const SidebarTab = ({ children, active = false }: SidebarTabProps) => {
    return active ? children : null;
};

const isSidebarTab = (child: React.ReactNode) =>
    React.isValidElement(child) &&
    typeof child.type === 'function' &&
    child.type.name === SidebarTab.name;

export type TabbedSidebarProps = {
    className?: string;
    initialTab?: string;
    children: React.ReactNode;
} & PanelProps;

export const TabbedSidebar = ({
    children,
    initialTab,
    className = '',
    ...props
}: TabbedSidebarProps) => {
    // get all children that are SidebarTabs
    const [sidebarTabs, sidebarIds] = useMemo(() => {
        const tabs = React.Children.toArray(children)
            .filter(isSidebarTab)
            .map(child => {
                const tab = child as React.ReactElement<SidebarTabProps>;
                return {
                    id: tab.props.name,
                    icon: tab.props.icon,
                    component: child,
                };
            });
        return [
            Object.fromEntries(tabs.map(tab => [tab.id, tab])),
            tabs.map(tab => tab.id),
        ];
    }, [children]);

    const [activeTab, setActiveTab] = useState(initialTab ?? sidebarIds[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showNumTabs, setShowNumTabs] = useState(4);
    const tooltipId = useRef(`tabbed-sidebar-tooltip-${Math.random()}`);

    let slicedTabIds = sidebarIds.slice(0, showNumTabs);
    if (!slicedTabIds.includes(activeTab)) {
        slicedTabIds = [...slicedTabIds.slice(0, -1), activeTab];
    }

    const headerRef = useCallback(
        (node: HTMLDivElement) => {
            if (!node) {
                return;
            }

            // get tab element
            const tabElement = node.querySelector(
                '.tab-list button'
            ) as HTMLElement;

            if (!tabElement) {
                return;
            }

            const padding =
                parseInt(getComputedStyle(node).paddingLeft) +
                parseInt(getComputedStyle(node).paddingRight);

            let newNumTabs = Math.floor(
                (node.offsetWidth - padding) / tabElement.offsetWidth
            );

            // if this is less than the number of tabs we have, then we should show the dropdown
            if (newNumTabs < sidebarIds.length) {
                // remove a tab from our count to make space for our dropdown button
                newNumTabs--;
            }

            setShowNumTabs(newNumTabs);
        },
        [sidebarIds.length]
    );

    const handleDropdownItemClick = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            setActiveTab(e.currentTarget.dataset.id as string);
            setIsDropdownOpen(false);
        },
        []
    );

    return (
        <StyledTabbedSidebar
            {...props}
            className={`tabbed sidebar ${className}`}
        >
            <div className="tab-header" ref={headerRef}>
                <div className="tab-list">
                    {slicedTabIds.map(tabId => (
                        <button
                            key={tabId}
                            onClick={() => setActiveTab(tabId)}
                            className={`${activeTab === tabId ? 'active' : ''}`}
                            data-tooltip-id={tooltipId.current}
                            data-tooltip-content={tabId}
                        >
                            <i
                                className={`fas fa-${sidebarTabs[tabId].icon}`}
                            />
                        </button>
                    ))}
                </div>

                {sidebarIds.length > showNumTabs && (
                    <button
                        className="toggle-dropdown"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        data-tooltip-id={tooltipId.current}
                        data-tooltip-content="More"
                    >
                        <i className="fas fa-chevron-down" />
                    </button>
                )}
            </div>

            {isDropdownOpen && (
                <ul className="tab-dropdown">
                    {sidebarIds.map(tabId => (
                        <li
                            key={tabId}
                            data-id={tabId}
                            onClick={handleDropdownItemClick}
                            className={`${activeTab === tabId ? 'active' : ''}`}
                        >
                            <i
                                className={`fas fa-${sidebarTabs[tabId].icon}`}
                            />
                            {tabId}
                        </li>
                    ))}
                </ul>
            )}

            <div className="tab-content">
                {React.Children.map(children, child => {
                    // if the child isn't a tab
                    if (!isSidebarTab(child)) {
                        return child;
                    }
                    // else, the child is a tab, set it's active prop
                    const tab = child as React.ReactElement<SidebarTabProps>;
                    return React.cloneElement(tab, {
                        active: tab.props.name === activeTab,
                    });
                })}
            </div>

            <Tooltip id={tooltipId.current} />
        </StyledTabbedSidebar>
    );
};

export default TabbedSidebar;
