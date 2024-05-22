import { GraphLogic } from './graph.logic';
import { NodeLogic } from './node.logic';
import { TreeLogic } from './tree.logic';

export class FlowLogic {
    public readonly graph: GraphLogic;
    public readonly node: NodeLogic;
    public readonly tree: TreeLogic;

    constructor() {
        this.graph = new GraphLogic();
        this.node = new NodeLogic();
        this.tree = new TreeLogic();
    }
}
