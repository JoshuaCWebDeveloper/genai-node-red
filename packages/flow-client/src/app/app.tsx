import styled from 'styled-components';

import { FlowCanvasContainer } from './components/flow-canvas/flow-canvas-container'; // Ensure the path is correct
import NodePalette from './components/node-palette/node-palette'; // Import NodePalette

// StyledApp defines the main application container styles.
// It ensures the flow canvas takes up the full viewport height for better visibility.
const StyledApp = styled.div`
    height: 100vh; // Full viewport height

    header {
        height: 60px; /* Example height */
        background-color: #333; /* Dark background for contrast */
        color: white; /* Light text for readability */
        display: flex;
        align-items: center;
        padding: 0 20px; /* Padding on the sides */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Adds a subtle shadow for depth */
    }

    .builder-container {
        display: flex;
        flex-direction: row;
        height: calc(100% - 60px);

        .node-palette {
            width: 200px;
        }

        .flow-canvas {
            flex: 1;
        }
    }
`;

// App is the main functional component of the application.
// It renders the FlowCanvasContainer component within a styled div.
export function App() {
    return (
        <StyledApp>
            <header className="toolbar">
                <h1>Flow Canvas</h1>
            </header>
            <div className="builder-container">
                <NodePalette />
                <FlowCanvasContainer />
            </div>
        </StyledApp>
    );
}

export default App;
