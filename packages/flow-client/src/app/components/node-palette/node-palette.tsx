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
        background-color: var(--color-background-element-light);
        color: var(--color-text-sharp);
        border: 0;
        margin: 10px 0;
        display: block;
        width: 100%;
        height: 30px;
        padding: 10px;
        border-bottom: 1px solid #ddd;

        &::placeholder {
            color: var(--color-text-medium);
        }

        &:focus {
            background-color: var(--color-background-element-focus);
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
