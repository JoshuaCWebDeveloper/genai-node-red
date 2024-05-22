import '../../../../../vitest-esbuild-compat';

import { FlowLogic } from './flow.logic';
import { GraphLogic } from './graph.logic';
import { NodeLogic } from './node.logic';
import { TreeLogic } from './tree.logic';

describe('flow.logic', () => {
    let flowLogic: FlowLogic;

    beforeEach(() => {
        flowLogic = new FlowLogic();
    });

    it('graph', () => {
        const graph = flowLogic.graph;
        expect(graph).toBeInstanceOf(GraphLogic);
    });

    it('node', () => {
        const node = flowLogic.node;
        expect(node).toBeInstanceOf(NodeLogic);
    });

    it('tree', () => {
        const tree = flowLogic.tree;
        expect(tree).toBeInstanceOf(TreeLogic);
    });
});
