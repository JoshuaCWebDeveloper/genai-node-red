import styled from 'styled-components';

import { useAppDispatch, useAppLogic, useAppSelector } from '../../redux/hooks';
import {
    paletteNodeActions,
    selectFilteredNodes,
} from '../../redux/modules/palette/node.slice';
import NodeList from './node-list';
import SearchBar from './search-bar';

const StyledNodePalette = styled.div`
    padding: 0 0 20px;
    width: 100%;
    height: 100%;

    .search-bar {
        background-color: var(--color-background-element-medium);
        color: var(--color-text-sharp);
        border: 0;
        margin-bottom: 20px;
        display: block;
        width: 100%;
        height: calc(var(--builder-tab-container-height) + 1px);
        padding: 10px;
        border-bottom: 1px solid #ddd;

        &::placeholder {
            color: var(--color-text-medium);
        }
    }
`;

export const NodePalette = () => {
    const dispatch = useAppDispatch();
    const flowLogic = useAppLogic().flow;
    const nodes = useAppSelector(selectFilteredNodes);
    const subflows = useAppSelector(
        flowLogic.node.selectAllSubflowsAsPaletteNodes
    );

    const handleSearch = (query: string) => {
        dispatch(paletteNodeActions.setSearchQuery(query));
    };

    return (
        <StyledNodePalette className="node-palette">
            <SearchBar onSearch={handleSearch} />
            <NodeList nodes={[...nodes, ...subflows]} />
        </StyledNodePalette>
    );
};

export default NodePalette;
