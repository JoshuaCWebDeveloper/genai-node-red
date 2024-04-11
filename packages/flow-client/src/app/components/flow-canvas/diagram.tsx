import {
    DiagramModel,
    LinkModel,
    LinkModelGenerics,
} from '@projectstorm/react-diagrams';

type Point = {
    x: number;
    y: number;
};

export class CustomDiagramModel extends DiagramModel {
    addLink(link: LinkModel<LinkModelGenerics>): LinkModel<LinkModelGenerics> {
        const addedLink = super.addLink(link);
        // After adding the link, attach event listeners
        this.attachLinkListeners(addedLink);
        return addedLink;
    }

    private attachLinkListeners(link: LinkModel<LinkModelGenerics>) {
        // Logic to attach event listeners goes here
        // Since the actual DOM element might not yet be available immediately after adding the link,
        // you might need to defer this operation or use a MutationObserver as discussed in Option 3.
        setTimeout(() => this.setupLinkDragEvents(link), 50); // Example delay
    }

    private setupLinkDragEvents(link: LinkModel<LinkModelGenerics>) {
        // Assuming you have a way to identify the DOM element for the link
        const linkElement = document.querySelector(
            `[data-linkid="${link.getID()}"]`
        );
        if (linkElement) {
            linkElement.addEventListener('dragstart', () => {
                // Your drag start logic here
            });
            linkElement.addEventListener('dragend', e => {
                const dropPosition = this.getDropPosition(e);
                // Now you have the drop position, you can proceed to find the nearest node or port
                this.attachLinkToNearestNode(link, dropPosition);
            });
        }
    }

    private getDropPosition(event: DragEvent): Point {
        const engine = this.engine;
        // Assuming `event` is the native drop event
        const { clientX, clientY } = event;

        // Translate screen coordinates to diagram coordinates
        // This step is crucial because the diagram might be zoomed or scrolled
        const relativePoint = engine.getRelativeMousePoint({
            clientX,
            clientY,
        });

        return relativePoint;
    }

    private attachLinkToNearestNode(
        link: LinkModel<LinkModelGenerics>,
        dropPosition: Point
    ) {
        // Example pseudocode
        const dropPosition = this.getDropPosition(); // Implement this based on your app's logic
        let nearestNode = null;
        let minDistance = Infinity;

        this.getNodes().forEach(node => {
            const nodePosition = this.getNodePosition(node); // Implement this
            const distance = this.calculateDistance(dropPosition, nodePosition); // Implement this

            if (distance < minDistance) {
                nearestNode = node;
                minDistance = distance;
            }
        });

        if (nearestNode) {
            // Logic to attach the link to the nearestNode's port
            // This might involve finding a specific port on the node and setting the link's target port
        }
    }
}
