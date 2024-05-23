# GenaiNodeRed

## Flow Client - Custom Frontend Client for Node-RED

This documentation serves as a record of the existing functionality of our app that has already been implemented, along with technical implementation details that future developers and newcomers can refer to.

### Feature Overview

-   **Flow Canvas**: Users can add, arrange, and connect nodes on a scalable and navigable canvas that supports zooming and panning.
-   **Node Palette**: A sidebar displays nodes categorized by type or functionality, with search and filter capabilities to streamline finding and selecting nodes.
-   **Drag-and-Drop Interface**: Enables users to drag nodes from the node palette onto the canvas, facilitating intuitive flow construction.
-   **Node Connection Functionality**: Supports drawing connections between nodes with enhanced visual feedback and auto-attachment features for ease of use.
-   **Node Editor UI**: Provides a user-friendly interface for configuring and editing node properties, allowing detailed customization of node attributes.
-   **Builder Layout**: Features a primary sidebar with sections for file tree, config nodes, context data, and general information, enhancing navigation and accessibility. A secondary sidebar includes the node palette and a new help browser section. Tabs at the top of the interface allow users to manage multiple flows or views simultaneously. A console at the bottom displays debug outputs and system messages, aiding in troubleshooting and development. A theme switcher in the header allows users to toggle between light and dark modes.
-   **Tabbed Layout for Multiple Flows**: A dynamic tab system at the top of the interface where each tab represents an open flow. Each tab can host an instance of the flow-canvas component, maintaining the state of each flow independently. Functionality to add, close, and switch tabs without losing work, with prompt saving or caching options.
-   **File Tree in Primary Sidebar**: A collapsible file tree that displays all available flows and subflows categorized by projects or folders. Users can interact with the file tree to open a flow in a new tab, delete a flow, or create a new flow.

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

-   **File tree**:
    -   A few different React libraries were evaluated, but it was decided to go with a custom solution to display the file tree.

### Libraries and Frameworks

-   **@projectstorm/react-diagrams**: Used for creating and managing the diagram canvas, custom nodes, ports, and links.
-   **react-dnd**: Utilized for adding drag-and-drop functionality to the node palette and canvas, enhancing the interactive experience.
-   **react-hook-form**: Considered for future enhancements to handle form state and validation within the application.
-   **react-tooltip**: Used for tooltips in the flow builder.

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

## Project Management - SCRUM Flow

### Backlog

The backlog is organized by epic, with each task having a unique ID, description, priority, associated epic, and detailed descriptions all in one place, using nested lists to preserve the structure of task details.

#### Epic: Subflows

-   **SF-01**: Implement Flow/Subflow Organization and Creation Mechanisms
    -   **Objective**: Provide mechanisms for organizing, managing, and creating subflows.
    -   **Technical Requirements**: Develop features that allow users to segment their work into manageable, modular subflows and create new subflows via a user interface.
    -   **Note**: Ensure the node palette displays available subflows for easy access.
-   **SF-02**: Subflow Instance Management
    -   **Objective**: Allow users to instantiate and manage subflows within main flows.
    -   **Technical Requirements**: Develop functionality to drag and drop subflows from the node palette into the main flow canvas as nodes, and edit properties of a subflow instance node in the node editor dialog.
    -   **Note**: Support nesting of subflows within other subflows.
-   **SF-03**: Edit and Update Subflows
    -   **Objective**: Provide functionality for editing existing subflows, including interface customization.
    -   **Technical Requirements**: Implement an editing interface that allows users to modify subflows and propagate changes to all instances of the subflow. Include capabilities to customize the user interface of subflows, allowing for adjustments in how subflows are presented and interacted with.
-   **SF-04**: Refactor Flow Slice to Manage Entity Collections
    -   **Objective**: Enhance data management by refactoring the flow slice to handle separate entity collections of flows/subflows, nodes, and directories.
    -   **Technical Requirements**: Redesign the state management to segregate and manage distinct collections for better modularity and maintainability.

#### Epic: Backend Integration and Data Management

-   **IR-01**: Establish API communication for flow management.
    -   **Objective**: Enable communication between the frontend client and the Node-RED backend for flow management.
    -   **Technical Requirements**: Design and implement a service layer in the frontend that communicates with Node-RED's backend APIs.
-   **IR-02**: Implement Import/Export Functionality for Flows
    -   **Objective**: Allow users to import and export their flows in JSON format.
    -   **Technical Requirements**: Develop functionality within the frontend client that enables users to easily import and export their flows, facilitating sharing, backup, and migration of work.
    -   **Additional Details**: Extend the import/export functionality to include subflows, allowing users to manage subflow data alongside main flows.
-   **IR-03**: Ensure Authentication and Authorization Mechanisms
    -   **Objective**: Implement security measures for accessing and managing flows.
    -   **Technical Requirements**: Design and integrate authentication and authorization mechanisms to protect user data and flows.
    -   **Additional Details**: Update the authentication and authorization mechanisms to include access control for subflows, ensuring secure management of subflow data.
-   **IR-04**: Saving Flows to `flows.json`
    -   **Description**: Integrate with the Node-RED API to save the current state of flows to a `flows.json` file.
    -   **Priority**: High
    -   **Technical Requirements**: Implement features that interact with Node-RED's backend API to save and retrieve flow data, ensuring user progress is not lost.

#### Epic: UI/UX Design and Responsive Layout

-   **UX-01**: Implement Undo/Redo Functionality

    -   **Description**: Add undo and redo capabilities to the flow canvas to allow users to revert and reapply actions easily.
    -   **Priority**: Medium
    -   **Technical Requirements**: Develop a history management system that tracks user actions and allows them to be reversed or reapplied.

-   **UX-02**: Enhance Zoom and Navigation Controls
    -   **Description**: Improve the zoom and navigation controls on the flow canvas to better manage viewing large and complex flows.
    -   **Priority**: Medium
    -   **Technical Requirements**: Implement a minimap and enhanced zoom controls that provide a better overview and navigation experience.
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
-   **UX-05**: Implement Search Functionality within the File Tree
    -   **Description**: Develop a search feature that allows users to quickly locate specific flows within the file tree.
    -   **Priority**: Medium
    -   **Technical Requirements**: Implement a search input field integrated into the file tree component. The search should dynamically filter the tree view based on user input, highlighting and expanding the relevant sections that match the search criteria.
    -   **Justification**: This feature will enhance the usability of the application by reducing the time and effort needed to navigate through large numbers of flows, especially in complex projects.
    -   **Implementation Notes**:
        -   Consider using a debounce mechanism to optimize search performance and reduce the load on the rendering process.
        -   Ensure that the search functionality is accessible and easy to use across various devices and screen sizes.
    -   **Future Considerations**:
        -   Evaluate user feedback on the search functionality to determine if further enhancements are needed.
        -   Explore the possibility of adding advanced search options, such as regex or filter by tags.

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

-   **ENI-13**: Implement Subflow Templates and Reusability
    -   **Description**: Develop tools that support the creation and management of subflow templates, enhancing the reusability of subflows across different projects or flows.
    -   **Priority**: Medium
    -   **Technical Requirements**: Implement a template system for subflows that can be saved and reused.
    -   **Status**: Backlog

#### Epic: Collaboration and Version Control

-   **CV-01**: Implement Collaboration Tools

    -   **Description**: Develop tools that support multiple users working on the same flow simultaneously.
    -   **Priority**: High
    -   **Technical Requirements**: Integrate real-time editing capabilities, user presence indicators, and section locking mechanisms.

-   **CV-02**: Integrate Version Control
    -   **Description**: Integrate version control mechanisms to manage and track changes in flow designs.
    -   **Priority**: High
    -   **Technical Requirements**: Implement or integrate with a version control system to allow users to manage versions of their flows, including viewing, reverting, and managing changes.
    -   **Additional Details**: Ensure the version control system accommodates subflows, allowing users to track changes and manage versions effectively.

### Scrum Board

| To Do | In Progress | In Review | Done  |
| ----- | ----------- | --------- | ----- |
| SF-03 | SF-02       |           | SF-04 |
|       |             |           | SF-01 |

### Progress Tracking

Use the Scrum Board to visually track the progress of tasks through the To Do, In Progress, In Review, and Done columns. This method provides a clear view of the project's progress and helps identify any bottlenecks or areas that require additional focus.

### TODO Notes

-   Inject functionality
-   Debug functionality
-   Display junctions
-   Display comments
-   Support for Complete, catch, status nodes
-   Support for Link in, link cal, and link out nodes
-   Config node support - including in subflows
