import { useEffect } from 'react';
import styled from 'styled-components';
// Replace the following lines
// import { useDispatch, useSelector } from 'react-redux';
import { useAppDispatch, useAppLogic, useAppSelector } from '../../redux/hooks';
import {
    useGetNodeScriptsQuery,
    useGetNodesQuery,
} from '../../redux/modules/api/node.api';
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
    const nodeLogic = useAppLogic().node;

    const { data: rawNodes, error, isLoading } = useGetNodesQuery();
    const {
        data: nodeScripts,
        error: nodeScriptsError,
        isLoading: nodeScriptsLoading,
    } = useGetNodeScriptsQuery();

    useEffect(() => {
        if (rawNodes) {
            dispatch(nodeActions.setNodes(rawNodes));
        }
    }, [dispatch, rawNodes]);

    useEffect(() => {
        if (nodeScripts) {
            dispatch(nodeLogic.setNodeScripts(nodeScripts));
        }
    }, [dispatch, nodeScripts, nodeLogic]);

    useEffect(() => {
        if (error) {
            console.error('GetNodes error: ', error);
        }
        if (nodeScriptsError) {
            console.error('GetNodeScripts error: ', nodeScriptsError);
        }
    }, [error, nodeScriptsError]);

    const nodes = useAppSelector(selectFilteredNodes);
    const handleSearch = (query: string) => {
        dispatch(nodeActions.setSearchQuery(query));
    };

    if (isLoading || nodeScriptsLoading) return <p>Loading...</p>;
    if (error || nodeScriptsError)
        return <p className="error">Request error, please try again.</p>;

    return (
        <StyledNodePalette className="node-palette">
            <SearchBar onSearch={handleSearch} />
            <NodeList nodes={nodes} />
        </StyledNodePalette>
    );
};

export default NodePalette;
