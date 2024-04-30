import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { useAppLogic, useAppSelector } from '../../redux/hooks';
import { TreeItem } from './tree-item';

// Styled component for custom styling
const StyledFlowTree = styled.div`
    width: 100%;
    height: 100%;
    overflow: auto;
`;

// FlowTree component using react-arborist
export const FlowTree = () => {
    const dispatch = useDispatch();
    const flowLogic = useAppLogic().flow;
    const treeItems = useAppSelector(flowLogic.selectFlowTree);

    return (
        <StyledFlowTree className="flow-tree">
            {treeItems.map(item => (
                <TreeItem item={item} key={item.id} />
            ))}
        </StyledFlowTree>
    );
};

export default FlowTree;
