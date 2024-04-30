import styled from 'styled-components';

import { TreeItem as TreeItemData } from '../../redux/modules/flow/flow.logic';

const StyledTreeItem = styled.div`
    padding: 10px;
    margin: 5px;
`;

export type TreeItemProps = {
    item: TreeItemData;
};

export const TreeItem = ({ item }: TreeItemProps) => {
    return (
        <StyledTreeItem>
            <p>{item.name}</p>

            {item.children && (
                <div className="contents">
                    {item.children.map(child => (
                        <TreeItem item={child} key={child.id} />
                    ))}
                </div>
            )}
        </StyledTreeItem>
    );
};

export default TreeItem;
