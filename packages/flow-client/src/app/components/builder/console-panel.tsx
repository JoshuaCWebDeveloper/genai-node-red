import { useState } from 'react';
import styled from 'styled-components';

import {
    builderActions,
    selectShowConsolePanel,
} from '../../redux/modules/builder/builder.slice';
import { Panel } from './panel';

// StyledConsolePanel extends the Panel component with specific styles for the console
const StyledConsolePanel = styled(Panel)`
    padding: 10px;
    height: 150px; // Fixed height for the console area
    overflow-y: auto; // Make it scrollable
    font-family: monospace;
`;

// Console component to display debug outputs and system messages
export const ConsolePanel = () => {
    const [logs, setLogs] = useState<string[]>([]);

    // Function to simulate receiving a new log message
    const addLog = (message: string) => {
        setLogs(prevLogs => [...prevLogs, message]);
    };

    // Function to clear the console
    const clearLogs = () => {
        setLogs([]);
    };

    return (
        <StyledConsolePanel
            className="console-panel"
            isVisibleSelector={selectShowConsolePanel}
            closeAction={builderActions.toggleConsolePanel}
        >
            <button onClick={() => addLog('New log entry')}>Add Log</button>
            <button onClick={clearLogs}>Clear</button>

            {logs.map((log, index) => (
                <div key={index}>{log}</div>
            ))}
        </StyledConsolePanel>
    );
};

export default ConsolePanel;
