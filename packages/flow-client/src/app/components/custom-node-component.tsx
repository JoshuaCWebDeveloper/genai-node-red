import { DefaultNodeModel } from '@projectstorm/react-diagrams';

// createCustomNodeModel is a utility function for creating custom node models.
// It takes a name and color as parameters and returns a DefaultNodeModel instance.
// This function is essential for adding custom nodes to the flow canvas, allowing for dynamic
// node creation based on user interaction or predefined criteria.
export const createCustomNodeModel = (
    name: string,
    color: string
): DefaultNodeModel => {
    const node = new DefaultNodeModel({
        name: name,
        color: color,
    });
    // Additional customization of the node can be done here

    return node;
};
