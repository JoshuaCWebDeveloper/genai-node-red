import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

import { useAppDispatch, useAppLogic, useAppSelector } from '../../redux/hooks';
import {
    builderActions,
    selectActiveFlow,
    selectNewFolderCounter,
} from '../../redux/modules/builder/builder.slice';
import { flowActions } from '../../redux/modules/flow/flow.slice';
import { TreeItemData } from '../../redux/modules/flow/tree.logic';
import { Tooltip } from '../shared/tooltip';
import { TreeItem } from './tree-item';

const StyledFlowTree = styled.div`
    color: var(--color-text-sharp);
    display: flex;
    flex-direction: column;
    overflow: visible;
    padding: 0;
    position: relative;
    width: 100%;
    height: 100%;

    .actions {
        display: flex;
        justify-content: end;

        background-color: var(--color-background-main);
        position: absolute;
        top: -20px;
        right: 0;

        button {
            background-color: inherit;
            color: inherit;
            cursor: pointer;
            border: 0;
            outline: 0;

            &:last-child {
                padding-right: 0;
            }
        }
    }

    .tree-content {
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--color-background-element-medium)
            var(--color-background-element-light);
    }
`;

// FlowTree component using react-arborist
export const FlowTree = () => {
    const dispatch = useAppDispatch();
    const flowLogic = useAppLogic().flow;
    const { tree, items } = useAppSelector(flowLogic.tree.selectFlowTree);
    const activeFlow = useAppSelector(selectActiveFlow);
    const folderCounter = useAppSelector(selectNewFolderCounter);

    const [selectedItemId, setSelectedItemId] = useState<string | undefined>();

    const selectedItem = selectedItemId ? items[selectedItemId] : undefined;

    const getSelectedDirectory = useCallback(
        (defaultId = '') => {
            if (!selectedItem) {
                return defaultId;
            }

            return selectedItem.type === 'directory'
                ? selectedItem.id
                : selectedItem.directory;
        },
        [selectedItem]
    );

    const handleNewFolder = useCallback(() => {
        const folderId = uuidv4();
        dispatch(
            flowActions.addDirectory({
                id: folderId,
                type: 'directory',
                name: `New Folder ${folderCounter}`,
                directory: getSelectedDirectory(),
            })
        );
        dispatch(builderActions.addNewFolder(folderId));
        setSelectedItemId(folderId);
    }, [dispatch, folderCounter, getSelectedDirectory]);

    const handleNewFlow = useCallback(() => {
        const flowId = uuidv4();
        dispatch(
            flowLogic.createNewFlow({
                id: flowId,
                directory: getSelectedDirectory(),
            })
        );
        setSelectedItemId(flowId);
    }, [dispatch, flowLogic, getSelectedDirectory]);

    const handleNewSubflow = useCallback(() => {
        const subflowId = uuidv4();
        dispatch(
            flowLogic.createNewSubflow({
                id: subflowId,
                directory: getSelectedDirectory(),
            })
        );
        setSelectedItemId(subflowId);
    }, [dispatch, flowLogic, getSelectedDirectory]);

    const handleItemSelect = useCallback((item: TreeItemData) => {
        setSelectedItemId(item.id);
    }, []);

    const handleContentBlur = useCallback(
        (e: React.FocusEvent<HTMLDivElement>) => {
            if (e.currentTarget.contains(e.relatedTarget)) {
                return;
            }

            const actionsContainer = document.querySelector('.actions');
            if (
                actionsContainer &&
                actionsContainer.contains(e.relatedTarget)
            ) {
                return;
            }

            setSelectedItemId(undefined);
        },
        []
    );

    // select flow when it becomes active
    useEffect(() => {
        if (activeFlow) {
            setSelectedItemId(activeFlow);
        }
    }, [activeFlow]);

    return (
        <StyledFlowTree className="flow-tree">
            <div className="actions">
                <button
                    className="new-folder"
                    onClick={handleNewFolder}
                    data-tooltip-content="New Folder"
                    data-tooltip-id="action-tooltip"
                >
                    <i className="fas fa-folder-plus"></i>
                </button>

                <button
                    className="new-flow"
                    onClick={handleNewFlow}
                    data-tooltip-content="New Flow"
                    data-tooltip-id="action-tooltip"
                >
                    <i className="fas fa-file-circle-plus"></i>
                </button>

                <button
                    className="new-subflow"
                    onClick={handleNewSubflow}
                    data-tooltip-content="New Subflow"
                    data-tooltip-id="action-tooltip"
                >
                    <i className="fas fa-calendar-plus"></i>
                </button>
            </div>

            <div
                className="tree-content"
                tabIndex={0}
                onBlur={handleContentBlur}
            >
                {tree
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(item => (
                        <TreeItem
                            item={item}
                            key={item.id}
                            selectedItem={selectedItem}
                            onSelect={handleItemSelect}
                        />
                    ))}
            </div>

            <Tooltip id="action-tooltip" />
        </StyledFlowTree>
    );
};

export default FlowTree;
