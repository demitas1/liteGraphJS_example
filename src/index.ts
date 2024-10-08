import { LGraph, LGraphCanvas, LiteGraph, LGraphNode } from 'litegraph.js';
import 'litegraph.js/css/litegraph.css';

interface ConstantNode extends LGraphNode {
    setValue(value: number): void;
}

window.addEventListener('load', () => {
    const graph = new LGraph();

    const canvasElement = document.getElementById('mycanvas') as HTMLCanvasElement;

    // Set canvas size to match window size
    function resizeCanvas() {
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const canvas = new LGraphCanvas("#mycanvas", graph);

    const node_const = LiteGraph.createNode("basic/const") as ConstantNode;
    node_const.pos = [200, 200];
    graph.add(node_const);
    node_const.setValue(4.5);

    const node_watch = LiteGraph.createNode("basic/watch");
    node_watch.pos = [700, 200];
    graph.add(node_watch);

    node_const.connect(0, node_watch, 0);

    graph.start();
});
