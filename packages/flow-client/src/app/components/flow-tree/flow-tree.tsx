import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

import { useAppDispatch, useAppLogic, useAppSelector } from '../../redux/hooks';
import {
    builderActions,
    selectActiveFlow,
    selectNewFlowCounter,
    selectNewFolderCounter,
} from '../../redux/modules/builder/builder.slice';
import { TreeItemData } from '../../redux/modules/flow/flow.logic';
import { flowActions } from '../../redux/modules/flow/flow.slice';
import { TreeItem } from './tree-item';

const StyledFlowTree = styled.div`
    color: var(--color-text-sharp);
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: 0;
    width: 100%;
    height: 100%;

    .actions {
        display: flex;
        justify-content: end;
        padding-right: 25px;
        height: var(--builder-tab-container-height);

        button {
            background-color: inherit;
            color: inherit;
            border: 0;
            outline: 0;
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
    const { tree, items } = useAppSelector(flowLogic.selectFlowTree);
    const activeFlow = useAppSelector(selectActiveFlow);
    const flowCounter = useAppSelector(selectNewFlowCounter);
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
            flowActions.addEntity({
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
            flowActions.addEntity({
                id: flowId,
                type: 'tab',
                label: `New Flow${flowCounter ? ` ${flowCounter}` : ''}`,
                disabled: false,
                info: '',
                env: [],
                directory: getSelectedDirectory(),
            })
        );
        dispatch(builderActions.addNewFlow(flowId));
        dispatch(builderActions.openFlow(flowId));
        dispatch(builderActions.setActiveFlow(flowId));
    }, [dispatch, flowCounter, getSelectedDirectory]);

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
                <button className="new-folder" onClick={handleNewFolder}>
                    <i className="fas fa-folder-plus"></i>
                </button>
                <button className="new-flow" onClick={handleNewFlow}>
                    <i className="fas fa-file-circle-plus"></i>
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
        </StyledFlowTree>
    );
};

export default FlowTree;
