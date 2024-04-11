# GenaiNodeRed

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ **This workspace has been generated by [Nx, Smart Monorepos · Fast CI.](https://nx.dev)** ✨

## Custom Frontend Client for Node-RED - Planning Session

### Project Scope

The custom frontend client for Node-RED will focus on providing an intuitive and efficient user experience for building and managing flows. The core functionalities will include:

-   **Flow Builder**: This is the most critical part of the application. It will allow users to add nodes to a canvas through drag and drop, finish connections between nodes, and access node options via a context menu. The flow builder will enable users to visually create and edit flows, making the process as intuitive as possible.

-   **Display of Available Nodes**: A sidebar on the left-hand side of the interface will display the available nodes. This sidebar will categorize nodes by their types or functionalities, allowing users to easily find and select the nodes they need for their flows.

-   **Creation of New Flows and Subflows**: Users will be able to create new flows and subflows within the application. This functionality will support organizing complex projects by allowing users to segment their work into manageable, modular flows and subflows.

-   **Saving Flows**: The client will integrate with the Node-RED API to save the current state of flows to a `flows.json` file, mirroring the functionality of the existing Node-RED frontend. This feature ensures that users can persist their work and retrieve it later, maintaining continuity in their project development.

### Additional MVP Considerations

-   **Node Configuration and Editing**: Provide a user-friendly interface for configuring and editing node properties to tailor the behavior of each node within the flows.

-   **Flow Debugging and Testing Tools**: Incorporate basic debugging tools to assist users in testing and troubleshooting their flows, enhancing the development experience.

-   **Import/Export Flows**: Enable users to import and export their flows in JSON format, facilitating easy sharing, backup, and migration of work.

-   **Responsive Design**: Ensure the frontend client is accessible and usable across various devices by adopting a responsive design approach.

### Development Environment Setup

-   Ensure Node.js and npm are installed.
-   Set up Nx workspace specifically for the Node-RED frontend client.
-   Install necessary libraries and frameworks (e.g., Angular, React, or Vue.js).

### UI/UX Design

-   Sketch initial design mockups for the main interface.
-   Plan the user flow and interaction with the Node-RED backend.
-   Use tools like Figma or Sketch for high-fidelity prototypes.

### Integration with Node-RED Backend

-   Explore Node-RED's API documentation for integration points.
-   Design a service layer in the frontend to communicate with Node-RED's backend.
-   Implement authentication and authorization if required.

### Development

-   Start coding based on the designs and integration plans.
-   Follow best coding practices and ensure code quality with linting and code reviews.
-   Use Nx commands to run and build the project efficiently.

### Testing

-   Plan unit and integration tests for the frontend components and services.
-   Use Nx to execute tests across the monorepo.
-   Consider end-to-end testing for critical user flows.

### Deployment

-   Configure the build process for production deployment.
-   Choose a hosting platform (e.g., Netlify, Vercel, AWS).
-   Set up continuous integration and deployment (CI/CD) pipelines.

### Running tasks with Nx

-   Use `npx nx serve flow-client` for development.
-   Build with `npx nx build flow-client` for production.

### Additional Resources

-   [Nx Console for enhanced development experience](https://nx.dev/nx-console)
-   [Explore the project graph with `npx nx graph`](https://nx.dev/core-features/explore-graph)
-   [Set up CI with Nx](https://nx.dev/recipes/ci)

## Connect with us!

-   [Join the community](https://nx.dev/community)
-   [Subscribe to the Nx Youtube Channel](https://www.youtube.com/@nxdevtools)
-   [Follow us on Twitter](https://twitter.com/nxdevtools)

## Project Management - SCRUM Flow

### Backlog

The backlog is organized by epic, with each task having a unique ID, description, priority, associated epic, and detailed descriptions all in one place, using nested lists to preserve the structure of task details.

#### Epic: Flow Builder

-   **FB-01** (Priority: 1): Design the flow canvas for placing and connecting nodes.
    -   **Objective**: Create a user-friendly and intuitive canvas area where users can add, arrange, and connect nodes to form flows.
    -   **Technical Requirements**:
        -   Implement a scalable and navigable canvas that supports zooming and panning.
        -   Design considerations must include how nodes will be displayed, selected, and how connections between nodes will be visualized.
        -   The canvas should support high performance, even with a large number of nodes and connections.
        -   Integration points with `@projectstorm/react-diagrams` need to be identified and utilized for rendering the canvas and its elements.
        -   To accomplish this task, the following components from `@projectstorm/react-diagrams` and React will be utilized:
            1. **DiagramEngine**: Manages the rendering and operation of the diagram, handling the setup and rendering of the canvas, nodes, and links.
            2. **DiagramModel**: Represents the model of the diagram, including nodes, links, and their connections. This is used by the `DiagramEngine` to render the diagram.
            3. **CanvasWidget**: Renders the flow canvas, taking a `DiagramEngine` as a prop and displaying the diagram based on the current model.
            4. **DefaultNodeModel** and **DefaultPortModel**: Used for creating nodes with ports that can be connected with links. These models support the basic functionality needed for the initial task.
            5. **DefaultLinkModel**: Represents the connections between ports on different nodes, supporting straight and curved links that can be styled.
-   **FB-02** (Priority: 2): Implement the node palette with search and filter capabilities.
    -   **Objective**: Develop a sidebar or palette that displays available nodes, allowing users to search and filter nodes to find what they need quickly.
    -   **Technical Requirements**:
        -   The node palette should categorize nodes based on their type or functionality to help users find the appropriate nodes for their flows.
        -   Implement search functionality that allows users to type in keywords to filter and quickly locate specific nodes.
        -   Each node in the palette should have a visual representation (icon and label) that makes it easy to identify.
        -   Ensure that the node palette is responsive and accessible, with considerations for keyboard navigation and screen readers.
        -   The implementation should be modular, allowing for easy updates or additions of new node types in the future.
    -   **Implementation Details**:
        -   **Components to Create**:
            1. **NodePalette**: The main container component for the node palette. It will host the search bar, node categories, and the list of nodes.
            2. **SearchBar**: A component for the search functionality. It will allow users to filter nodes based on keywords.
            3. **NodeCategory**: A component to display each category of nodes. It can be expandable to show or hide the nodes under each category.
            4. **NodeItem**: Represents an individual node in the palette. It will display the node's icon and label. Interaction with a node item will trigger CSS style changes and tooltips for immediate feedback but does not involve a selection state.
        -   **Interaction Feedback**:
            -   Implement CSS styles to change the appearance of a node item on hover or when the user interacts with it, providing visual feedback.
            -   Use tooltips to display brief information about the node, such as its purpose or usage tips, when the user hovers over a node item.
        -   **Libraries and Frameworks**:
            -   Utilize React for building the UI components.
            -   Consider using a state management library (e.g., Redux or Context API) to manage the state of the node palette, especially the active filters and search query.
            -   For UI elements (like expandable lists and search bars), consider using a component library like Material-UI or Ant Design to speed up development.
        -   **Data Handling**:
            -   The node palette will need to fetch the list of available nodes from the backend or a static JSON file during the initial load.
            -   Implement a mechanism to dynamically update the node list when new nodes are added or existing nodes are updated in the backend.
        -   **Accessibility and Responsiveness**:
            -   Ensure that all components are accessible, including keyboard navigation and screen reader support.
            -   Use responsive design principles to make sure the node palette is usable on various screen sizes.
        -   **Redux Toolkit and RTK Query Integration**:
            -   **Slices to Update**:
                1. **nodesSlice**: Manages the state of nodes within the node palette, including the list of nodes, the selected node, any filters applied, and the search query. This consolidation simplifies state management by handling all node-related UI state within a single slice.
                    - **State Structure**:
                        - `nodes`: An array of node objects available in the palette.
                        - `searchQuery`: The current search filter applied to the node list.
                    - **Reducers**:
                        - `setNodes`: Sets the list of nodes.
                        - `setSearchQuery`: Sets the current search query to filter the node list.
            -   **API Slice to Create**:
                1. **nodesApi**: Handles asynchronous requests for fetching nodes from the Node-RED backend. This API slice will use the `Accept` header to differentiate between JSON and HTML responses from the same `/nodes` endpoint.
                    - **Endpoints**:
                        - `getNodes`: Fetches the list of available nodes. This endpoint will conditionally set the `Accept` header to `application/json` for fetching the JSON list of nodes, or to `text/html` for fetching HTML script elements, based on the requirements of the request.
                    - **Integration Details**:
                        - Utilize the `createApi` function from Redux Toolkit Query (RTK Query) to define this API slice.
                        - Ensure that the API service correctly handles the `Accept` header to fetch either JSON data or HTML script elements as needed.
                        - Since the `/nodes` API is read-only and there's no backend support for adding or updating nodes through this API, the slice will focus solely on fetching data.
                        - The search functionality will be implemented as a frontend filter within the `nodesSlice`, leveraging the `searchQuery` state to filter the node list based on the user's input.
-   **FB-03** (Priority: 3): Implement drag-and-drop interface for nodes.
    -   **Objective**: Enable users to drag nodes from the node palette and drop them onto the canvas to add them to their flow.
    -   **Technical Requirements**:
        -   Utilize `react-dnd` for implementing the drag-and-drop functionality, ensuring a smooth and intuitive user experience.
        -   Ensure that nodes can be dragged from the palette and visually follow the cursor until dropped onto the canvas.
        -   On dropping a node onto the canvas, the node should be added to the flow at the drop location, with its position being adjustable by dragging.
        -   Implement visual feedback during the drag operation, such as highlighting potential drop areas or showing a "ghost" of the node being dragged.
        -   Considerations must be made for how the canvas and nodes respond to different screen sizes and resolutions.
    -   **Implementation Details**:
        -   **New Components to Create**:
            1. **DraggableNodeComponent**: A new component that wraps each node in the node palette, making it draggable. This component will handle the drag start and end events, and carry the necessary node data that will be used when the node is dropped onto the canvas.
            2. **DropZoneComponent**: This component will represent areas on the canvas where nodes can be dropped. It will handle the drop events and use the data from the `DraggableNodeComponent` to add a new node to the flow at the drop location.
        -   **Existing Components to Update**:
            1. **NodePalette**: Update to incorporate drag functionality, making each node in the palette draggable.
            2. **FlowCanvasContainer**: Update to include `DropZoneComponent` functionality, allowing it to accept nodes dropped from the node palette.
            3. **Node (custom-node-component.tsx)**: This component, intended for rendering each node on the canvas, may require updates to support being positioned based on where it is dropped and to integrate with the overall drag-and-drop logic.
        -   **Utilize `react-dnd` for Drag-and-Drop Functionality**: `react-dnd` will be used to handle the drag-and-drop operations, providing a flexible and intuitive user experience for adding nodes to the canvas.
        -   **Visual Feedback and User Experience**: Implement visual cues during the drag-and-drop operation, such as changing the cursor, highlighting potential drop zones, and showing a "ghost" image of the node being dragged to provide clear feedback to the user.
        -   **Responsive Design Considerations**: Ensure that the drag-and-drop functionality is fully responsive and provides a consistent experience across different devices and screen sizes.
-   **FB-04** (Priority: 4): Verify and Enhance Node Connection Functionality.
    -   **Objective**: Ensure the existing node connection functionality is working as expected and introduce enhancements for a more intuitive user experience.
    -   **Technical Requirements**:
        -   Verify that users can draw connections between nodes by dragging from one node's output port to another node's input port, utilizing `@projectstorm/react-diagrams` for rendering and logic. Ensure connections are visually distinct, support different styles for enhanced readability, include validation for incompatible node types or ports, and provide visual feedback during the connection process.
        -   Implement state management for the flow canvas that streams changes into our application state, ensuring the state matches the spec for a Node-RED `flows.yaml` file. This will involve capturing the state of nodes, their connections, and any other relevant flow information in a format that is compatible with Node-RED, facilitating seamless integration and future features such as exporting flows.
        -   Explore the feasibility of enhancing the connection drawing process to allow for auto-attachment of connections to the nearest appropriate port (input or output) when a user draws a connection over a node. This feature aims to simplify the process of creating connections by reducing the precision required to attach a wire to a specific port, thereby improving the user experience.
    -   **Implementation Details**:
        -   **State Management for Flow Canvas**:
            -   To manage the state of the flow canvas effectively, including nodes, their connections, and other relevant flow information, new files dedicated to flow management will be introduced:
                1. **Flow Slice (`flow/flow.slice.ts`)**: Manages the state of the flow canvas, including nodes, connections, and flow configurations.
                2. **Flow Logic (`flow/flow.logic.ts`)**: Encapsulates the business logic for managing flows, including the creation, update, and deletion of nodes and connections.
                3. **Flow Slice Tests (`flow/flow.slice.spec.ts`)**: Ensures the flow slice correctly manages the state of the flow canvas.
                4. **Flow Logic Tests (`flow/flow.logic.spec.ts`)**: Validates the business logic for flow management.
            -   These files will work together to ensure a robust state management system for the flow canvas, enhancing node connection functionality and ensuring a seamless user experience.
        -   **Enhancements to Connection Drawing Process**:
            -   **User Experience (UX) Improvements**: Simplify the process of creating connections with intuitive auto-attachment to the nearest valid port and provide visual feedback during the process.
            -   **Technical Feasibility**: Implement port proximity detection and valid port identification to support auto-attachment features.
            -   **Implementation Strategies**: Explore extending or customizing `@projectstorm/react-diagrams` for auto-attachment functionality and develop custom drag-and-drop logic as needed.
-   **FB-05** (Priority: 5): Implement editor UI for nodes.
    -   **Objective**: Provide a user-friendly interface for configuring and editing node properties.
    -   **Technical Requirements**:
        -   Implement UI components for editing node properties, including individual node attributes and dialog boxes for configuration.

#### Epic: Node Management Interface

-   **NMI-01**: Design sidebar for displaying nodes.
    -   **Objective**: Create a sidebar interface for displaying available nodes to the user.
    -   **Technical Requirements**: The sidebar should categorize nodes by type/functionality and provide an easy-to-navigate interface.
-   **NMI-02**: Categorize nodes by type/functionality.
    -   **Objective**: Organize nodes in the sidebar based on their type or functionality.
    -   **Technical Requirements**: Implement a categorization system within the UI that allows for easy filtering and selection of node types.

#### Epic: Flow and Subflow Management

-   **FM-01**: Develop UI for creating new flows/subflows.
    -   **Objective**: Facilitate the creation of new flows and subflows within the application.
    -   **Technical Requirements**: Implement a user interface that allows for the easy organization and management of flows and subflows.
-   **FM-02**: Implement flow/subflow organization mechanisms.
    -   **Objective**: Provide mechanisms for organizing and managing flows and subflows.
    -   **Technical Requirements**: Develop features that allow users to segment their work into manageable, modular flows and subflows.

#### Epic: Integration with Node-RED Backend

-   **IR-01**: Establish API communication for flow management.
    -   **Objective**: Enable communication between the frontend client and the Node-RED backend for flow management.
    -   **Technical Requirements**: Design and implement a service layer in the frontend that communicates with Node-RED's backend APIs.
-   **IR-02**: Implement import/export functionality for flows.
    -   **Objective**: Allow users to import and export their flows in JSON format.
    -   **Technical Requirements**: Develop functionality within the frontend client that enables users to easily import and export their flows, facilitating sharing, backup, and migration of work.
-   **IR-03**: Ensure authentication and authorization mechanisms.
    -   **Objective**: Implement security measures for accessing and managing flows.
    -   **Technical Requirements**: Design and integrate authentication and authorization mechanisms to protect user data and flows.

#### Epic: UI/UX Design and Responsive Layout

-   **UX-01**: Sketch initial design mockups.
    -   **Objective**: Create initial design concepts for the main interface of the frontend client.
    -   **Technical Requirements**: Use tools like Figma or Sketch to develop initial design mockups that outline the user interface and user experience.
-   **UX-02**: Develop high-fidelity prototypes.
    -   **Objective**: Refine design mockups into high-fidelity prototypes.
    -   **Technical Requirements**: Utilize UI/UX design tools to create detailed and interactive prototypes that closely represent the final product.
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

#### Epic: Debugging and Testing Tools

-   **DT-01**: Incorporate basic debugging tools.
    -   **Objective**: Enhance the development experience by providing tools for testing and troubleshooting flows.
    -   **Technical Requirements**: Integrate debugging tools into the frontend client that assist developers and users in identifying and resolving issues within their flows.
-   **DT-02**: Plan and implement a logging system.
    -   **Objective**: Facilitate the monitoring and troubleshooting of the frontend client.
    -   **Technical Requirements**: Develop a logging system that captures and stores important events and errors, aiding in the analysis and debugging of the application.

#### Epic: Development Environment and Tooling Setup

-   **DE-01**: Set up Nx workspace and necessary libraries.
    -   **Objective**: Prepare the development environment for the Node-RED frontend client project.
    -   **Technical Requirements**: Ensure Node.js and npm are installed, set up an Nx workspace specifically for the project, and install necessary libraries and frameworks.
-   **DE-02**: Configure code quality tools and practices.
    -   **Objective**: Maintain high code quality throughout the development process.
    -   **Technical Requirements**: Implement linting, code reviews, and other best practices to ensure the codebase remains clean, efficient, and maintainable.

#### Epic: Testing and Quality Assurance

-   **QA-01**: Write unit and integration tests.
    -   **Objective**: Ensure the reliability and functionality of the frontend components and services.
    -   **Technical Requirements**: Plan and execute unit and integration tests that cover critical aspects of the frontend client, using testing frameworks compatible with the project's technology stack.
-   **QA-02**: Execute end-to-end tests for critical flows.
    -   **Objective**: Validate the end-to-end functionality and user experience of critical user flows.
    -   **Technical Requirements**: Design and conduct end-to-end tests that simulate real user interactions, ensuring that key features and flows work as expected.

#### Epic: Deployment and CI/CD

-   **CD-01**: Configure build process for deployment.
    -   **Objective**: Prepare the frontend client for production deployment.
    -   **Technical Requirements**: Set up and configure the build process, optimizing the application for performance and security in a production environment.
-   **CD-02**: Set up CI/CD pipelines.
    -   **Objective**: Automate the testing, building, and deployment processes.
    -   **Technical Requirements**: Implement continuous integration and continuous deployment pipelines that streamline the development workflow, ensuring that changes are automatically tested and deployed.

#### Epic: Documentation and Community Engagement

-   **CE-01**: Create project documentation.
    -   **Objective**: Provide comprehensive documentation for the project.
    -   **Technical Requirements**: Develop detailed documentation that covers the setup, features, and usage of the frontend client, assisting users and developers in understanding and working with the application.
-   **CE-02**: Engage with the community for feedback.
    -   **Objective**: Gather feedback and insights from the community.
    -   **Technical Requirements**: Establish channels for communication with the user and developer community, encouraging feedback and collaboration to improve the project.

### Scrum Board

| To Do | In Progress | In Review | Done  |
| ----- | ----------- | --------- | ----- |
| FB-05 |             |           | FB-01 |
|       |             |           | FB-02 |
|       |             |           | FB-03 |
|       |             |           | FB-04 |

### Progress Tracking

Use the Scrum Board to visually track the progress of tasks through the To Do, In Progress, In Review, and Done columns. This method provides a clear view of the project's progress and helps identify any bottlenecks or areas that require additional focus.

## Flow Builder Development - Technical Details

The Flow Builder is the cornerstone of our custom frontend client for Node-RED, enabling users to visually create and edit flows with ease. To achieve a robust, intuitive, and efficient development of this epic, we have selected the following key libraries:

### @projectstorm/react-diagrams

-   **Purpose**: Serves as the core library for rendering the flow diagrams. It provides the functionality to create custom nodes, ports, and links, making it ideal for building complex, interactive diagrams with drag-and-drop capabilities.
-   **Documentation**: [https://projectstorm.gitbook.io/react-diagrams/](https://projectstorm.gitbook.io/react-diagrams/)

### react-dnd

-   **Purpose**: Facilitates the drag-and-drop functionality within the flow builder, allowing users to drag nodes from the sidebar into the canvas and arrange them to form flows. Its flexible API supports complex drag-and-drop scenarios, which are essential for a seamless user experience in flow construction.
-   **Documentation**: [https://react-dnd.github.io/react-dnd/about](https://react-dnd.github.io/react-dnd/about)

### react-hook-form

-   **Purpose**: Used for managing forms within the application, particularly for node configuration dialogs. React Hook Form provides an efficient, flexible, and extensible way to handle form state and validation, improving the performance and user experience of form interactions.
-   **Documentation**: [https://react-hook-form.com/](https://react-hook-form.com/)

### Integration Strategy

-   **@projectstorm/react-diagrams** will be utilized to construct the visual flow editor interface, enabling the creation, connection, and configuration of nodes within a flow.
-   **react-dnd** will be integrated with @projectstorm/react-diagrams to enhance the user interface with drag-and-drop capabilities, allowing for an intuitive method of adding and organizing nodes within the flow canvas.
-   **react-hook-form** will be employed in modal dialogs for node configuration, ensuring that form data is efficiently managed and validated, providing a user-friendly configuration experience.

By leveraging these libraries, we aim to build a Flow Builder that is not only powerful and flexible but also intuitive and user-friendly. This will enable users to efficiently create and manage their Node-RED flows directly within our custom frontend client.
