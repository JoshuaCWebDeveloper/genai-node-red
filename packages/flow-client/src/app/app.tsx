import styled from 'styled-components';

import { FlowCanvas } from './components/flow-canvas/flow-canvas'; // Ensure the path is correct
import { NodeEditor } from './components/node-editor';
import { NodePalette } from './components/node-palette/node-palette'; // Import NodePalette
import { Header } from './components/header/header'; // Import the new Header component
import themes, { Theme } from './themes';
import { useAppSelector } from './redux/hooks';
import { selectTheme } from './redux/modules/builder/builder.slice';

// StyledApp defines the main application container styles.
// It ensures the flow canvas takes up the full viewport height for better visibility.
const StyledApp = styled.div`
    height: 100vh; // Full viewport height

    header {
        height: 40px;
    }
`;

// App is the main functional component of the application.
// It renders the FlowCanvasContainer component within a styled div.
export function App() {
    const theme = useAppSelector(selectTheme);
    const GlobalTheme = themes[theme];

    return (
        <StyledApp>
            <div className="builder-container">
                <NodePalette />
                <FlowCanvas />
                <NodeEditor />
            </div>
            <GlobalTheme />

            <Header />
        </StyledApp>
    );
}

export default App;
