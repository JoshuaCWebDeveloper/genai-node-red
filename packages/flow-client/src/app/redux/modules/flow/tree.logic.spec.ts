import { MockedFunction } from 'vitest';
import '../../../../../vitest-esbuild-compat';

import { RootState } from '../../store';
import {
    DirectoryEntity,
    FlowEntity,
    SubflowEntity,
    selectAllDirectories,
    selectAllFlowEntities,
} from './flow.slice';
import { TreeDirectory, TreeFile, TreeLogic } from './tree.logic';

// Mock the selectFlowNodesByFlowId selector if used within the method
vi.mock('./flow.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('./flow.slice')
    >();
    return {
        ...originalModule,
        selectAllFlowEntities: vi.fn(() => []),
        selectAllDirectories: vi.fn(() => []),
    };
});

const mockGetState = vi.fn(() => ({})) as unknown as () => RootState;

const mockedSelectAllFlowEntities = selectAllFlowEntities as MockedFunction<
    typeof selectAllFlowEntities
>;
const mockedSelectAllDirectories = selectAllDirectories as MockedFunction<
    typeof selectAllDirectories
>;

describe('tree.logic', () => {
    let treeLogic: TreeLogic;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        treeLogic = new TreeLogic();
    });

    describe('directoryIsDefault', () => {
        it('should return true for default directories', () => {
            const defaultFlowDirectory: TreeDirectory = {
                id: 'flows',
                name: 'Flows',
                type: 'directory',
                directory: '',
                directoryPath: '',
                children: [],
            };
            const defaultSubflowDirectory: TreeDirectory = {
                id: 'subflows',
                name: 'Subflows',
                type: 'directory',
                directory: '',
                directoryPath: '',
                children: [],
            };
            expect(treeLogic.directoryIsDefault(defaultFlowDirectory)).toBe(
                true
            );
            expect(treeLogic.directoryIsDefault(defaultSubflowDirectory)).toBe(
                true
            );
        });

        it('should return false for non-default directories', () => {
            const customDirectory: TreeDirectory = {
                id: 'custom',
                name: 'Custom',
                type: 'directory',
                directory: '',
                directoryPath: '',
                children: [],
            };
            expect(treeLogic.directoryIsDefault(customDirectory)).toBe(false);
        });
    });

    describe('getFilePath', () => {
        it('should return the correct file path for a given node ID', () => {
            const treeFile: TreeFile = {
                id: 'node123',
                name: 'node123.json',
                type: 'file',
                directory: 'flows',
                directoryPath: '/flows/nodes',
            };
            const expectedPath = `/flows/nodes/node123.json`;
            expect(treeLogic.getFilePath(treeFile)).toBe(expectedPath);
        });

        it('should handle undefined or null node IDs gracefully', () => {
            const nullTreeItem: TreeFile = {
                id: '',
                name: '',
                type: 'file',
                directory: '',
                directoryPath: '',
            };
            expect(treeLogic.getFilePath(nullTreeItem)).toBe('');
        });
    });

    describe('selectFlowTree', () => {
        it('should construct a tree with custom directories', () => {
            const customDirectories: DirectoryEntity[] = [
                {
                    id: 'custom1',
                    name: 'Custom Directory 1',
                    directory: '',
                    type: 'directory',
                },
                {
                    id: 'custom2',
                    name: 'Custom Directory 2',
                    directory: '',
                    type: 'directory',
                },
            ];
            const customFlows: FlowEntity[] = [
                {
                    id: 'flow3',
                    name: 'Custom Flow 1',
                    directory: 'custom1',
                    type: 'flow',
                    disabled: false,
                    info: '',
                    env: [],
                },
                {
                    id: 'flow4',
                    name: 'Custom Flow 2',
                    directory: 'custom2',
                    type: 'flow',
                    disabled: false,
                    info: '',
                    env: [],
                },
            ];
            const customSubflows: SubflowEntity[] = [
                {
                    id: 'subflow3',
                    name: 'Custom Subflow 1',
                    directory: 'custom1',
                    type: 'subflow',
                    info: '',
                    category: '',
                    env: [],
                    color: '',
                },
                {
                    id: 'subflow4',
                    name: 'Custom Subflow 2',
                    directory: 'custom2',
                    type: 'subflow',
                    info: '',
                    category: '',
                    env: [],
                    color: '',
                },
            ];

            // Mock the selectors
            mockedSelectAllDirectories.mockReturnValue(customDirectories);
            mockedSelectAllFlowEntities.mockReturnValue(
                (customFlows as (FlowEntity | SubflowEntity)[]).concat(
                    customSubflows
                )
            );

            const result = treeLogic.selectFlowTree(mockGetState());

            expect(result).toEqual({
                tree: expect.arrayContaining([
                    {
                        id: 'custom1',
                        name: 'Custom Directory 1',
                        type: 'directory',
                        directory: '',
                        directoryPath: '',
                        children: [
                            {
                                id: 'flow3',
                                name: 'Custom Flow 1',
                                type: 'file',
                                directory: 'custom1',
                                directoryPath: '/Custom Directory 1',
                            },
                            {
                                id: 'subflow3',
                                name: 'Custom Subflow 1',
                                type: 'file',
                                directory: 'custom1',
                                directoryPath: '/Custom Directory 1',
                            },
                        ],
                    },
                    {
                        id: 'custom2',
                        name: 'Custom Directory 2',
                        type: 'directory',
                        directory: '',
                        directoryPath: '',
                        children: [
                            {
                                id: 'flow4',
                                name: 'Custom Flow 2',
                                type: 'file',
                                directory: 'custom2',
                                directoryPath: '/Custom Directory 2',
                            },
                            {
                                id: 'subflow4',
                                name: 'Custom Subflow 2',
                                type: 'file',
                                directory: 'custom2',
                                directoryPath: '/Custom Directory 2',
                            },
                        ],
                    },
                ]),
                items: expect.any(Object),
            });
        });

        it('should ensure default directories are correctly created and populated with flows and subflows', () => {
            const flows: FlowEntity[] = [
                {
                    id: 'flow1',
                    name: 'Main Flow',
                    directory: 'flows',
                    type: 'flow',
                    disabled: false,
                    info: '',
                    env: [],
                },
                {
                    id: 'flow2',
                    name: 'Secondary Flow',
                    directory: 'flows',
                    type: 'flow',
                    disabled: false,
                    info: '',
                    env: [],
                },
            ];
            const subflows: SubflowEntity[] = [
                {
                    id: 'subflow1',
                    name: 'Subflow A',
                    directory: 'subflows',
                    type: 'subflow',
                    info: '',
                    category: '',
                    env: [],
                    color: '',
                },
                {
                    id: 'subflow2',
                    name: 'Subflow B',
                    directory: 'subflows',
                    type: 'subflow',
                    info: '',
                    category: '',
                    env: [],
                    color: '',
                },
            ];

            // Mock the selectors
            mockedSelectAllDirectories.mockReturnValue([]); // No custom directories are provided
            mockedSelectAllFlowEntities.mockReturnValue(
                (flows as (FlowEntity | SubflowEntity)[]).concat(subflows)
            );

            const result = treeLogic.selectFlowTree(mockGetState());

            expect(result.tree).toEqual([
                {
                    id: 'flows',
                    name: 'Flows',
                    type: 'directory',
                    directory: '',
                    directoryPath: '',
                    children: [
                        {
                            id: 'flow1',
                            name: 'Main Flow',
                            type: 'file',
                            directory: 'flows',
                            directoryPath: '/Flows',
                        },
                        {
                            id: 'flow2',
                            name: 'Secondary Flow',
                            type: 'file',
                            directory: 'flows',
                            directoryPath: '/Flows',
                        },
                    ],
                },
                {
                    id: 'subflows',
                    name: 'Subflows',
                    type: 'directory',
                    directory: '',
                    directoryPath: '',
                    children: [
                        {
                            id: 'subflow1',
                            name: 'Subflow A',
                            type: 'file',
                            directory: 'subflows',
                            directoryPath: '/Subflows',
                        },
                        {
                            id: 'subflow2',
                            name: 'Subflow B',
                            type: 'file',
                            directory: 'subflows',
                            directoryPath: '/Subflows',
                        },
                    ],
                },
            ]);
        });

        it('should handle empty directories correctly', () => {
            // Mock empty responses
            mockedSelectAllDirectories.mockReturnValue([]);
            mockedSelectAllFlowEntities.mockReturnValue([]);

            const result = treeLogic.selectFlowTree(mockGetState());

            expect(result.tree).toEqual([
                {
                    id: 'flows',
                    name: 'Flows',
                    type: 'directory',
                    directory: '',
                    directoryPath: '',
                    children: [],
                },
                {
                    id: 'subflows',
                    name: 'Subflows',
                    type: 'directory',
                    directory: '',
                    directoryPath: '',
                    children: [],
                },
            ]);
        });
    });
});
