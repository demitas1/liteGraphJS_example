import { LGraph, LGraphCanvas, LiteGraph, LGraphNode, INodeInputSlot, INodeOutputSlot } from 'litegraph.js';
import 'litegraph.js/css/litegraph.css';

// Add type declarations for File System Access API
declare global {
  interface Window {
    showSaveFilePicker?: (options?: any) => Promise<FileSystemFileHandle>;
    showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
  }
}

interface ConstantNode extends LGraphNode {
  setValue(value: number): void;
}

// Define the MyAddNode class
class MyAddNode extends LGraphNode {
  constructor() {
  super();
  this.addInput("A", "number");
  this.addInput("B", "number");
  this.addOutput("A+B", "number");
  this.properties = { precision: 1 };
  }

  onExecute() {
  let A = this.getInputData(0);
  if (A === undefined) A = 0;
  let B = this.getInputData(1);
  if (B === undefined) B = 0;
  this.setOutputData(0, A + B);
  }
}

// Set the title for the node
MyAddNode.title = "Sum";

// Register the new node type
LiteGraph.registerNodeType("custom/sum", MyAddNode);



window.addEventListener('load', () => {
  const graph = new LGraph();

  const canvasElement = document.getElementById('mycanvas') as HTMLCanvasElement;

  function resizeCanvas() {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const canvas = new LGraphCanvas("#mycanvas", graph);

  createInitialNodes();

  // Save graph to file
  async function saveGraph() {
    const data = JSON.stringify(graph.serialize());

    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'graph.json',
          types: [{
            description: 'JSON File',
            accept: { 'application/json': ['.json'] },
          }],
        });

        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();

        console.log('Graph saved to file');
      } catch (err) {
        console.error('Failed to save graph:', err);
      }
    } else {
      // Fallback for browsers that don't support the File System Access API
      const blob = new Blob([data], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graph.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // Load graph from file
  async function loadGraph() {
    if (window.showOpenFilePicker) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'JSON File',
            accept: { 'application/json': ['.json'] },
          }],
        });

        const file = await handle.getFile();
        const contents = await file.text();

        const data = JSON.parse(contents);
        graph.configure(data);

        console.log('Graph loaded from file');
      } catch (err) {
        console.error('Failed to load graph:', err);
      }
    } else {
      // Fallback for browsers that don't support the File System Access API
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const contents = await file.text();
          const data = JSON.parse(contents);
          graph.configure(data);
          console.log('Graph loaded from file');
        }
      };
      input.click();
    }
  }

  // Attach save and load functions to buttons
  const saveButton = document.getElementById('saveButton');
  const loadButton = document.getElementById('loadButton');

  if (saveButton) saveButton.addEventListener('click', saveGraph);
  if (loadButton) loadButton.addEventListener('click', loadGraph);

  graph.start();

  function createInitialNodes() {
    const node_const = LiteGraph.createNode("basic/const") as ConstantNode;
    node_const.pos = [200, 200];
    graph.add(node_const);
    node_const.setValue(4.5);

    const node_watch = LiteGraph.createNode("basic/watch");
    node_watch.pos = [700, 200];
    graph.add(node_watch);

    const node_sum = LiteGraph.createNode("custom/sum");
    node_sum.pos = [450, 200];
    graph.add(node_sum);

    node_const.connect(0, node_sum, 0);
    node_sum.connect(0, node_watch, 0);
  }
});
