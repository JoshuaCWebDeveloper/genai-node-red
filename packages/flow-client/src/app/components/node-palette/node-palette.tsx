import styled from 'styled-components';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    nodeActions,
    selectFilteredNodes,
} from '../../redux/modules/node/node.slice';
import NodeList from './node-list';
import SearchBar from './search-bar';

const StyledNodePalette = styled.div`
    background-color: #f0f0f0;
    padding: 20px 0;
    border-right: 1px solid #ddd;
`;

export const NodePalette = () => {
    const dispatch = useAppDispatch();

    const nodes = useAppSelector(selectFilteredNodes);
    const handleSearch = (query: string) => {
        dispatch(nodeActions.setSearchQuery(query));
    };

    return (
        <StyledNodePalette className="node-palette">
            <SearchBar onSearch={handleSearch} />
            <NodeList nodes={nodes} />
        </StyledNodePalette>
    );
};

export default NodePalette;
