import { useEffect } from 'react';
import styled from 'styled-components';

import {
    useGetNodeScriptsQuery,
    useGetNodesQuery,
} from '../../redux/modules/api/node.api';
import { ConsolePanel } from './console-panel';
import { Error } from './error';
import { Loading } from './loading';
import { NodeEditor } from './node-editor';
import { PrimarySidebar } from './primary-sidebar';
import { SecondarySidebar } from './secondary-sidebar';
import { TabManager } from './tab-manager';

const StyledBuilder = styled.div`
    display: flex;
    flex-direction: row;
    position: relative;
    height: calc(100% - 60px);

    .primary-sidebar {
        border-right-style: solid;
        width: 150px;
    }

    .center {
        flex: 1;

        display: flex;
        flex-direction: column;
    }

    .tab-list {
        border-top-style: solid;
        flex: 0 0 40px;
    }

    .console-panel {
        border-top-style: solid;
    }

    .secondary-sidebar {
        border-left-style: solid;
        width: 200px;
    }
`;

export function Builder() {
    const { error, isLoading } = useGetNodesQuery();
    const { error: nodeScriptsError, isLoading: nodeScriptsLoading } =
        useGetNodeScriptsQuery();

    useEffect(() => {
        if (error) {
            console.error('GetNodes error: ', error);
        }
        if (nodeScriptsError) {
            console.error('GetNodeScripts error: ', nodeScriptsError);
        }
    }, [error, nodeScriptsError]);

    if (isLoading || nodeScriptsLoading) return <Loading />;
    if (error || nodeScriptsError)
        return <Error message="Request error, please try again." />;

    return (
        <StyledBuilder className="builder">
            <PrimarySidebar />
            <div className="center">
                <TabManager />
                <ConsolePanel />
            </div>
            <SecondarySidebar />
            <NodeEditor />
        </StyledBuilder>
    );
}

export default Builder;
