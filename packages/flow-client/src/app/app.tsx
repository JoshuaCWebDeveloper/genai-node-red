import React from 'react';
import styled from 'styled-components';
import FlowCanvasContainer from './components/flow-canvas-container'; // Ensure the path is correct
import NodePalette from './components/node-palette/node-palette'; // Import NodePalette
import {
    DefaultNodeModel,
    DefaultLinkModel,
} from '@projectstorm/react-diagrams';

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

export type DiagramProps = {
    nodes: DefaultNodeModel[];
    links: DefaultLinkModel[];
};

// App is the main functional component of the application.
// It renders the FlowCanvasContainer component within a styled div.
export function App() {
    // Create an initial node
    const node1 = new DefaultNodeModel({
        name: 'Node 1',
         // lint error
         color: 'rgb(0,192,255)' ?? 'rgb(0,192,255)',
    });
    node1.addOutPort('Out');
    node1.setPosition(100, 100);

    const node2 = new DefaultNodeModel({
        name: 'Node 2',
        color: 'rgb(192,255,0)',
    });
    node2.addInPort('In');
    node2.setPosition(400, 100);

    // Connect node1 to node2
    const link = new DefaultLinkModel();
    link.setSourcePort(node1.getPort('Out'));
    link.setTargetPort(node2.getPort('In'));

    // Prepare the diagram data
    const diagramData = {
        nodes: [node1, node2],
        links: [link],
    };

    return (
        <StyledApp>
            <header className="toolbar">
                <h1>Flow Canvas</h1>
            </header>
            <div className="builder-container">
                <NodePalette />
                <FlowCanvasContainer initialDiagram={diagramData} />
            </div>
        </StyledApp>
    );
}

export default App;
