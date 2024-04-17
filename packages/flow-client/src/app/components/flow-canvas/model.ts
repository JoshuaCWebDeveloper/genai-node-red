import {
    DiagramModel,
    NodeModel,
    LinkModel,
    BaseEvent,
    PortModel,
    PointModel,
} from '@projectstorm/react-diagrams';

export class CustomDiagramModel extends DiagramModel {
    // Custom method to add a node and register an event listener
    override addNode(node: NodeModel): NodeModel {
        const ret = super.addNode(node);
        // Register an event listener for the node
        node.registerListener({
            eventDidFire: (e: BaseEvent) => {
                //console.log(`Node event fired: `, event);
                this.fireEvent(e, '_globalPassthrough');
            },
        });

        // also fire the event for every port on our node
        Object.values(node.getPorts()).forEach((port: PortModel) => {
            port.registerListener({
                eventDidFire: (event: BaseEvent) => {
                    this.fireEvent(event, '_globalPassthrough');
                },
            });
        });
        return ret;
    }

    // Custom method to add a link and register an event listener
    override addLink(link: LinkModel): LinkModel {
        const ret = super.addLink(link);
        // intercept points
        const linkAddPoint = link.addPoint.bind(link);
        link.addPoint = <P extends PointModel>(point: P) => {
            const ret = linkAddPoint(point);
            point.registerListener({
                eventDidFire: (e: BaseEvent) => {
                    this.fireEvent(e, '_globalPassthrough');
                },
            });
            link.fireEvent(
                {
                    link,
                    isCreated: true,
                },
                'pointsUpdated'
            );
            return ret;
        };
        // Register an event listener for the link
        link.registerListener({
            eventDidFire: (e: BaseEvent) => {
                //console.log(`Link event fired: `, event);
                this.fireEvent(e, '_globalPassthrough');
            },
        });
        return ret;
    }
}
