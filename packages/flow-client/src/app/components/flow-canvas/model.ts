import {
    BaseEvent,
    BaseModel,
    DiagramModel,
    LayerModel,
    LinkModel,
    NodeModel,
    PointModel,
    PortModel,
} from '@projectstorm/react-diagrams';

export class CustomDiagramModel extends DiagramModel {
    private attachNodeListeners(node: NodeModel) {
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
    }

    // Custom method to add a node and register an event listener
    override addNode(node: NodeModel): NodeModel {
        const ret = super.addNode(node);
        this.attachNodeListeners(node);
        return ret;
    }

    // Custom method to add a link and register an event listener
    override addLink(link: LinkModel): LinkModel {
        const ret = super.addLink(link);
        this.attachLinkListeners(link);
        return ret;
    }

    override addLayer(layer: LayerModel): void {
        const ret = super.addLayer(layer);
        Object.values(layer.getModels()).forEach((model: BaseModel) => {
            if (model instanceof LinkModel) {
                this.attachLinkListeners(model);
            } else if (model instanceof NodeModel) {
                this.attachNodeListeners(model);
            }
        });
        return ret;
    }
}
