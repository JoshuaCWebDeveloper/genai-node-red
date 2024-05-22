import { createSelector } from '@reduxjs/toolkit';
import {
    DirectoryEntity,
    selectAllDirectories,
    selectAllFlowEntities,
} from './flow.slice';

type TreeItem = {
    id: string;
    name: string;
    directory: string;
    directoryPath: string;
};

export type TreeDirectory = TreeItem & {
    type: 'directory';
    children: TreeItemData[];
};

export type TreeFile = TreeItem & {
    type: 'file';
};

export type TreeItemData = TreeDirectory | TreeFile;

export class TreeLogic {
    public directoryIsDefault(item: TreeDirectory) {
        return ['flows', 'subflows'].includes(item.id);
    }

    public getFilePath(item: TreeItemData) {
        const parent = item.directoryPath ? `${item.directoryPath}` : '';
        return item.name ? `${parent}/${item.name}` : parent;
    }

    private createTreeDirectory(
        directory: DirectoryEntity,
        defaultDirectory: string
    ) {
        return {
            id: directory.id,
            name: directory.name,
            type: 'directory',
            directory: directory.directory ?? defaultDirectory,
            directoryPath: '',
            children: [],
        } as TreeDirectory;
    }

    private addTreeDirectory(
        treeItems: Record<string, TreeItemData>,
        directories: DirectoryEntity[],
        defaultDirectory: string,
        directory: DirectoryEntity
    ) {
        // create item
        const item = this.createTreeDirectory(directory, defaultDirectory);
        // get the parent directory
        let parent = treeItems[item.directory] as TreeDirectory;
        if (!parent) {
            const parentEntity = directories.find(
                it => it.id === item.directory
            );
            if (!parentEntity) {
                throw new Error(`Directory ${item.directory} not found`);
            }
            parent = this.addTreeDirectory(
                treeItems,
                directories,
                defaultDirectory,
                parentEntity
            );
        }
        // update item
        item.directoryPath = this.getFilePath(parent);
        parent.children?.push(item);
        treeItems[item.id] = item;
        // return item
        return item;
    }

    selectFlowTree = createSelector(
        [state => state, selectAllDirectories, selectAllFlowEntities],
        (state, directories, flowEntities) => {
            // collect tree hierarchy
            const rootDirectory = {
                id: '',
                name: '',
                type: 'directory',
                directory: '',
                directoryPath: '',
                children: [],
            } as TreeDirectory;
            const flowsDirectory = {
                id: 'flows',
                name: 'Flows',
                type: 'directory',
                directory: rootDirectory.id,
                directoryPath: '',
                children: [],
            } as TreeDirectory;
            const subflowsDirectory = {
                id: 'subflows',
                name: 'Subflows',
                type: 'directory',
                directory: rootDirectory.id,
                directoryPath: '',
                children: [],
            } as TreeDirectory;
            rootDirectory.children?.push(flowsDirectory, subflowsDirectory);
            const treeItems = {
                [rootDirectory.id]: rootDirectory,
                [flowsDirectory.id]: flowsDirectory,
                [subflowsDirectory.id]: subflowsDirectory,
            } as Record<string, TreeItemData>;

            // loop directories
            directories.forEach(directory => {
                // if we've already created it
                if (treeItems[directory.id]) {
                    // nothing to do
                    return;
                }
                // else, create it
                this.addTreeDirectory(
                    treeItems,
                    directories,
                    rootDirectory.id,
                    directory
                );
            });

            // loop flows and subflows
            flowEntities.forEach(entity => {
                const directoryId =
                    entity.directory ||
                    (entity.type === 'flow'
                        ? flowsDirectory.id
                        : subflowsDirectory.id);
                const directory = treeItems[directoryId] as TreeDirectory;
                const item = {
                    id: entity.id,
                    name: entity.name,
                    type: 'file',
                    directory: directoryId,
                    directoryPath: `${directory.directoryPath}/${directory.name}`,
                } as TreeFile;
                directory.children.push(item);
                treeItems[item.id] = item;
            });

            return { tree: rootDirectory.children, items: treeItems };
        }
    );
}
