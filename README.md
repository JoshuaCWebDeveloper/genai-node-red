# GenaiNodeRed

## Flow Client - Custom Frontend Client for Node-RED

This documentation serves as a record of the existing functionality of our app that has already been implemented, along with technical implementation details that future developers and newcomers can refer to.

### Feature Overview

-   **Flow Canvas**: Users can add, arrange, and connect nodes on a scalable and navigable canvas that supports zooming and panning.
-   **Node Palette**: A sidebar displays nodes categorized by type or functionality, with search and filter capabilities to streamline finding and selecting nodes.
-   **Drag-and-Drop Interface**: Enables users to drag nodes from the node palette onto the canvas, facilitating intuitive flow construction.
-   **Node Connection Functionality**: Supports drawing connections between nodes with enhanced visual feedback and auto-attachment features for ease of use.
-   **Node Editor UI**: Provides a user-friendly interface for configuring and editing node properties, allowing detailed customization of node attributes.

### Technical Implementation

-   **Flow Canvas**:

    -   Implemented using `@projectstorm/react-diagrams` to provide a scalable and interactive diagramming interface.
    -   Supports high-performance rendering even with a large number of nodes and connections.

-   **Node Palette**:

    -   Developed with React components, allowing dynamic searching and filtering of nodes.
    -   Utilizes `react-dnd` for drag-and-drop capabilities from the palette to the canvas.

-   **Drag-and-Drop Interface**:

    -   Integrates `react-dnd` to handle complex drag-and-drop scenarios, enhancing the user experience by allowing nodes to be visually dragged across the interface.

-   **Node Connection Functionality**:

    -   Utilizes `@projectstorm/react-diagrams` for creating and managing connections with visual feedback and auto-attachment logic to simplify the connection process.

-   **Node Editor UI**:
    -   Implements UI components for editing node properties, including individual node attributes and dialog boxes for configuration.
    -   Re-implements a significant portion of Node-RED's editor logic within our flow-client to ensure accurate rendering and functionality of Node-RED nodes.

### Libraries and Frameworks

-   **@projectstorm/react-diagrams**: Used for creating and managing the diagram canvas, custom nodes, ports, and links.
-   **react-dnd**: Utilized for adding drag-and-drop functionality to the node palette and canvas, enhancing the interactive experience.
-   **react-hook-form**: Considered for future enhancements to handle form state and validation within the application.

### Nx Overview

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ **This workspace has been generated by [Nx, Smart Monorepos · Fast CI.](https://nx.dev)** ✨

### Running tasks with Nx

-   Use `npx nx serve flow-client` for development.
-   Build with `npx nx build flow-client` for production.

### Additional Resources

-   [Nx Console for enhanced development experience](https://nx.dev/nx-console)
-   [Explore the project graph with `npx nx graph`](https://nx.dev/core-features/explore-graph)
-   [Set up CI with Nx](https://nx.dev/recipes/ci)

## Planning Session - Template

### Scope

### Feature/Task Breakdown

## Project Management - SCRUM Flow

### Backlog

The backlog is organized by epic, with each task having a unique ID, description, priority, associated epic, and detailed descriptions all in one place, using nested lists to preserve the structure of task details.

#### Epic: Flow and Subflow Management

-   **FM-01**: Develop UI for creating and managing new flows/subflows.
    -   **Objective**: Facilitate the creation and management of new flows and subflows within the application.
    -   **Technical Requirements**: Implement a user interface that allows for the easy organization and management of flows and subflows.
-   **FM-02**: Implement flow/subflow organization mechanisms.
    -   **Objective**: Provide mechanisms for organizing and managing flows and subflows.
    -   **Technical Requirements**: Develop features that allow users to segment their work into manageable, modular flows and subflows.

#### Epic: Backend Integration and Data Management

-   **IR-01**: Establish API communication for flow management.
    -   **Objective**: Enable communication between the frontend client and the Node-RED backend for flow management.
    -   **Technical Requirements**: Design and implement a service layer in the frontend that communicates with Node-RED's backend APIs.
-   **IR-02**: Implement import/export functionality for flows.
    -   **Objective**: Allow users to import and export their flows in JSON format.
    -   **Technical Requirements**: Develop functionality within the frontend client that enables users to easily import and export their flows, facilitating sharing, backup, and migration of work.
-   **IR-03**: Ensure authentication and authorization mechanisms.
    -   **Objective**: Implement security measures for accessing and managing flows.
    -   **Technical Requirements**: Design and integrate authentication and authorization mechanisms to protect user data and flows.
-   **IR-04**: Saving Flows to `flows.json`
    -   **Description**: Integrate with the Node-RED API to save the current state of flows to a `flows.json` file.
    -   **Priority**: High
    -   **Technical Requirements**: Implement features that interact with Node-RED's backend API to save and retrieve flow data, ensuring user progress is not lost.

#### Epic: UI/UX Design and Responsive Layout

-   **UX-03**: Implement responsive design.
    -   **Objective**: Ensure the frontend client is accessible and usable across various devices.
    -   **Technical Requirements**: Adopt a responsive design approach that allows the frontend client to adapt to different screen sizes and resolutions, ensuring a consistent user experience.
-   **UX-04**: Implement Visual Indicators for Node Connection Compatibility.
    -   **Objective**: Enhance the user experience by introducing visual indicators that provide immediate feedback on the compatibility of connections between nodes during the drag-and-drop operation.
    -   **Technical Requirements**:
        -   Develop a system to visually indicate when a connection being dragged is compatible or incompatible with a potential target port.
        -   Customize port and link models to include compatibility information, allowing for dynamic styling based on the context of the drag-and-drop operation.
        -   Implement custom widgets for ports and links that change appearance (e.g., color, icons) to reflect compatibility status.
        -   Utilize the event system in `@projectstorm/react-diagrams` to update the appearance of ports and links in real-time during drag-and-drop actions.
    -   **Justification**: This feature aims to simplify the process of creating connections by reducing the need for trial and error, thereby improving the overall user experience. By providing clear visual cues, users can easily identify valid connection paths, leading to more efficient flow construction.
    -   **Implementation Notes**:
        -   Consider the development effort and complexity involved in customizing the underlying library. This task may require extensive testing to ensure a seamless integration with existing functionalities.
        -   Prioritize user feedback on the current version of the flow builder to determine the necessity and priority of this enhancement.
    -   **Future Considerations**:
        -   Gather user feedback on the implementation to assess its effectiveness and explore further enhancements based on real-world usage.

#### Epic: Quality Assurance and Debugging

-   **QA-01**: Incorporate basic debugging tools.
    -   **Objective**: Enhance the development experience by providing tools for testing and troubleshooting flows.
    -   **Technical Requirements**: Integrate debugging tools into the frontend client that assist developers and users in identifying and resolving issues within their flows.
-   **QA-02**: Plan and implement a logging system.
    -   **Objective**: Facilitate the monitoring and troubleshooting of the frontend client.
    -   **Technical Requirements**: Develop a logging system that captures and stores important events and errors, aiding in the analysis and debugging of the application.
-   **QA-03**: Write unit and integration tests.
    -   **Objective**: Ensure the reliability and functionality of the frontend components and services.
    -   **Technical Requirements**: Plan and execute unit and integration tests that cover critical aspects of the frontend client, using testing frameworks compatible with the project's technology stack.
-   **QA-04**: Execute end-to-end tests for critical flows.
    -   **Objective**: Validate the end-to-end functionality and user experience of critical user flows.
    -   **Technical Requirements**: Design and conduct end-to-end tests that simulate real user interactions, ensuring that key features and flows work as expected.

#### Epic: Deployment and CI/CD

-   **CD-01**: Configure build process for deployment.
    -   **Objective**: Prepare the frontend client for production deployment.
    -   **Technical Requirements**: Set up and configure the build process, optimizing the application for performance and security in a production environment.

#### Epic: Documentation and Community Engagement

-   **CE-01**: Create project documentation.
    -   **Objective**: Provide comprehensive documentation for the project.
    -   **Technical Requirements**: Develop detailed documentation that covers the setup, features, and usage of the frontend client, assisting users and developers in understanding and working with the application.
-   **CE-02**: Engage with the community for feedback.
    -   **Objective**: Gather feedback and insights from the community.
    -   **Technical Requirements**: Establish channels for communication with the user and developer community, encouraging feedback and collaboration to improve the project.

#### Epic: Enhanced Node Interaction

-   **ENI-01**: Implement Context Menu for Node Options
    -   **Description**: Develop a context menu that provides additional configuration options for nodes directly on the canvas.
    -   **Priority**: Medium
    -   **Technical Requirements**: Implement UI components that allow users to access and modify node settings through a context-sensitive menu.

### Scrum Board

| To Do | In Progress | In Review | Done |
| ----- | ----------- | --------- | ---- |
|       |             |           |      |

### Progress Tracking

Use the Scrum Board to visually track the progress of tasks through the To Do, In Progress, In Review, and Done columns. This method provides a clear view of the project's progress and helps identify any bottlenecks or areas that require additional focus.

### TODO Notes

-   Inject functionality
-   Debug functionality
-   Display junctions
-   Display comments
-   Support for Complete, catch, status nodes
-   Support for Link in, link cal, and link out nodes
-   Config node support
-   New layout (a la vscode):
    -   Primary side bar with file tree, config nodes, context data, info
    -   Secondary side bar with node palette and help browser
    -   Tabs up top
    -   Console on bottom (debug output)
    -   Light and dark modes (set somewhere in the header)
    -   All panels have close buttons and all panels can be toggled in header
