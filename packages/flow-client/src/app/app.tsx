import React from 'react';
import styled from 'styled-components';
import FlowCanvasContainer from './components/flow-canvas-container'; // Ensure the path is correct
import {
    DefaultNodeModel,
    DefaultLinkModel,
} from '@projectstorm/react-diagrams';

// StyledApp defines the main application container styles.
// It ensures the flow canvas takes up the full viewport height for better visibility.
const StyledApp = styled.div`
    height: 100vh; // Full viewport height
`;

const Toolbar = styled.div`
    height: 60px; /* Example height */
    background-color: #333; /* Dark background for contrast */
    color: white; /* Light text for readability */
    display: flex;
    align-items: center;
    padding: 0 20px; /* Padding on the sides */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Adds a subtle shadow for depth */
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
        color: 'rgb(0,192,255)',
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
            <Toolbar>
                <h1>Flow Canvas</h1>
            </Toolbar>
            <FlowCanvasContainer initialDiagram={diagramData} />
        </StyledApp>
    );
}

export default App;
