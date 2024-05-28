import React, {
    FormEvent,
    KeyboardEvent,
    MouseEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { useAppLogic, useAppSelector } from '../../redux/hooks';
import {
    builderActions,
    selectNewTreeItem,
} from '../../redux/modules/builder/builder.slice';
import { flowActions } from '../../redux/modules/flow/flow.slice';
import {
    TreeDirectory,
    TreeItemData,
} from '../../redux/modules/flow/tree.logic';
import { CollapsibleIcon } from '../shared/collapsible-icon';
import { Tooltip } from '../shared/tooltip';
import { RenameForm } from './rename-form';
import ConfirmableDeleteButton, {
    useConfirmableDelete,
} from '../shared/confirmable-delete-button';

const StyledTreeItem = styled.div<{ level: number }>`
    padding: 0;
    margin: 0;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    & > .name {
        display: flex;
        align-items: center;
        font-size: 0.8em;
        outline: 0;
        padding: 5px 0;
        padding-left: ${props => props.level * 20 + 5}px;
        height: 25px;

        & > i {
            padding-right: 5px;
            width: 20px;
        }

        .title {
            flex: 1;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            text-wrap: nowrap;
            height: 100%;
            min-width: 0;
        }

        form.title {
            overflow: visible;
        }

        .delete {
            visibility: hidden;

            &.confirming {
                visibility: visible;
            }
        }

        &:hover {
            background-color: var(
                --color-background-element-medium
            ); // Darker background on hover/active

            .delete {
                visibility: visible;
            }
        }

        &.selected {
            background-color: var(
                --color-background-element-sharp
            ); // Darker background on hover/active

            .title {
                cursor: text;
            }
        }

        &.dragging {
            opacity: 0.4;
        }

        &.drop-over {
            background-color: #25375e;
        }
    }
`;

const TreeItemType = 'TREE_ITEM';

const usePrevious = <T,>(value: T) => {
    const ref = useRef<T>(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
};

export type TreeItemProps = {
    selectedItem?: TreeItemData;
    item: TreeItemData;
    level?: number;
    onSelect?: (item: TreeItemData) => void;
};

export const TreeItem = ({
    selectedItem,
    item,
    level = 0,
    onSelect,
}: TreeItemProps) => {
    const dispatch = useDispatch();
    const flowLogic = useAppLogic().flow;
    const newTreeItem = useAppSelector(selectNewTreeItem);

    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isRenaming, setIsRenaming] = useState(false);
    const { deleteRef, triggerDelete } = useConfirmableDelete();

    const isSelected = selectedItem?.id === item.id;
    const canDelete =
        item.type !== 'directory' ||
        (!item.children.length && !flowLogic.tree.directoryIsDefault(item));
    const treeItemId = `tree-item-${item.id.replaceAll(/[/\s]/g, '-')}`;

    const [{ isDragging }, drag] = useDrag(
        {
            type: TreeItemType,
            item,
            canDrag: () => !isRenaming,
            collect: monitor => ({
                isDragging: monitor.isDragging(),
            }),
        },
        [item.id, isRenaming]
    );

    const [{ isOver }, drop] = useDrop<
        TreeItemData,
        TreeItemData,
        { isOver: boolean }
    >(
        {
            accept: TreeItemType,
            canDrop: draggedItem => {
                // Prevent dropping into itself and allow only if the target is a folder
                return item.type === 'directory' && draggedItem.id !== item.id;
            },
            drop: draggedItem => {
                // Handle the drop logic here, e.g., moving the dragged item into this item's children
                const actionPayload = {
                    id: draggedItem.id,
                    changes: {
                        directory: flowLogic.tree.directoryIsDefault(
                            item as TreeDirectory
                        )
                            ? undefined
                            : item.id,
                    },
                };
                dispatch(
                    draggedItem.type === 'directory'
                        ? flowActions.updateDirectory(actionPayload)
                        : flowActions.updateFlowEntity(actionPayload)
                );
                return draggedItem;
            },
            collect: monitor => ({
                isOver: monitor.isOver({ shallow: true }),
            }),
        },
        [item.id]
    );

    const dragAndDrop = useCallback(
        (e: HTMLDivElement) => {
            drag(e);
            drop(e);
        },
        [drag, drop]
    );

    const handleNameClick = useCallback(() => {
        // don't handle this click if we're currently renaming
        if (isRenaming) {
            return;
        }

        if (item.type === 'directory') {
            setIsCollapsed(!isCollapsed);
        } else {
            dispatch(builderActions.setActiveFlow(item.id));
        }

        onSelect?.(item);
    }, [dispatch, isCollapsed, isRenaming, item, onSelect]);

    const startRename = useCallback(() => {
        setIsRenaming(true);
    }, []);

    const stopRename = useCallback(() => {
        setIsRenaming(false);
        if (item.id === newTreeItem) {
            dispatch(builderActions.clearNewTreeItem());
        }
    }, [dispatch, item.id, newTreeItem]);

    const handleTitleClick = useCallback(
        (e: MouseEvent) => {
            if (!isSelected) {
                return;
            }
            e.stopPropagation();
            startRename();
        },
        [isSelected, startRename]
    );

    const handleRename = useCallback(
        (e: FormEvent, newName: string) => {
            if (!isRenaming) {
                return;
            }

            const actionPayload = {
                id: item.id,
                changes: {
                    name: newName,
                },
            };

            dispatch(
                item.type === 'directory'
                    ? flowActions.updateDirectory(actionPayload)
                    : flowActions.updateFlowEntity(actionPayload)
            );

            stopRename();
        },
        [isRenaming, item.id, item.type, dispatch, stopRename]
    );

    const handleDelete = useCallback(
        (e: React.MouseEvent | React.KeyboardEvent) => {
            e.stopPropagation();
            if (!canDelete) {
                return;
            }

            dispatch(
                item.type === 'directory'
                    ? flowActions.removeDirectory(item.id)
                    : flowActions.removeFlowEntity(item.id)
            );
        },
        [canDelete, dispatch, item.id, item.type]
    );

    const handleNameKeydown = useCallback(
        (e: KeyboardEvent) => {
            // ignore if renaming
            if (isRenaming) {
                return;
            }

            switch (e.key) {
                case 'Delete':
                    triggerDelete(e);
                    break;
            }
        },
        [isRenaming, triggerDelete]
    );

    // open when descendent flow becomes selected
    useEffect(() => {
        if (item.type !== 'directory') {
            return;
        }

        if (
            selectedItem?.directoryPath.startsWith(
                flowLogic.tree.getFilePath(item)
            )
        ) {
            setIsCollapsed(false);
        }
    }, [selectedItem, item, flowLogic]);

    // open when we are dropped over with a delay
    useEffect(() => {
        if (!isOver || item.type !== 'directory') {
            return;
        }

        const timeoutId = setTimeout(() => {
            setIsCollapsed(false);
        }, 600);

        return () => clearTimeout(timeoutId);
    }, [isOver, item.type]);

    // open when a child is added
    const numberChildren =
        item.type === 'directory' ? (item as TreeDirectory).children.length : 0;
    const prevNumberChildren = usePrevious(numberChildren);
    useEffect(() => {
        if (numberChildren <= prevNumberChildren) {
            return;
        }

        if (item.type !== 'directory') {
            return;
        }

        setIsCollapsed(false);
    }, [item.type, numberChildren, prevNumberChildren]);

    // scroll to when we become selected
    useEffect(() => {
        if (!isSelected) {
            return;
        }
        const treeItem = document.getElementById(treeItemId);
        if (treeItem) {
            treeItem.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            });
        }
    }, [isSelected, treeItemId]);

    // rename when newly created
    useEffect(() => {
        if (item.id === newTreeItem) {
            startRename();
        }
    }, [item.id, newTreeItem, startRename]);

    // Wrap the returned JSX with the drag and drop refs
    return (
        <StyledTreeItem level={level} id={treeItemId} className={`item`}>
            <div
                className={`name ${isSelected ? 'selected' : ''} ${
                    isDragging ? 'dragging' : ''
                } ${isOver ? 'drop-over' : ''}`}
                onClick={handleNameClick}
                onKeyDown={handleNameKeydown}
                ref={dragAndDrop}
                tabIndex={0}
            >
                {item.type === 'directory' ? (
                    <CollapsibleIcon isCollapsed={isCollapsed} />
                ) : item.type === 'flow' ? (
                    <i className="fas fa-map"></i>
                ) : (
                    <i className="fas fa-sitemap"></i>
                )}

                {isRenaming ? (
                    <RenameForm
                        className="title renaming"
                        onRename={handleRename}
                        onCancel={stopRename}
                        initialName={item.name}
                    />
                ) : (
                    <p
                        className="title"
                        onClick={handleTitleClick}
                        data-tooltip-content={flowLogic.tree.getFilePath(item)}
                        data-tooltip-id={treeItemId + '-tooltip'}
                    >
                        {item.name}
                    </p>
                )}

                {canDelete ? (
                    <ConfirmableDeleteButton
                        ref={deleteRef}
                        onDelete={handleDelete}
                    />
                ) : null}
            </div>

            {!isCollapsed && item.type === 'directory' && (
                <div className="contents">
                    {item.children
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(child => (
                            <TreeItem
                                item={child}
                                key={child.id}
                                selectedItem={selectedItem}
                                level={level + 1}
                                onSelect={onSelect}
                            />
                        ))}
                </div>
            )}

            <Tooltip id={treeItemId + '-tooltip'} />
        </StyledTreeItem>
    );
};

export default TreeItem;
