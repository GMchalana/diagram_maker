// app/page.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import { toPng } from 'html-to-image';
import 'reactflow/dist/style.css';

type CustomNodeData = {
  label: string;
};

const CustomNode = ({
  id,
  data,
  selected,
}: {
  id: string;
  data: CustomNodeData;
  selected?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  return (
    <div 
      className={`p-2 rounded-md bg-gray-800 border-2 ${selected ? 'border-indigo-500' : 'border-indigo-400'} min-w-[120px]`}
    >
      {/* Source Handle (top) */}
      <Handle 
        type="source" 
        position={Position.Top} 
        className="!bg-indigo-400 !h-2 !w-2"
      />
      
      {/* Node Content */}
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
          autoFocus
          className="bg-gray-700 text-white px-1 w-full outline-none"
        />
      ) : (
        <div
          onDoubleClick={() => setIsEditing(true)}
          className="text-white cursor-text text-center"
        >
          {data.label}
        </div>
      )}

      {/* Target Handle (bottom) */}
      <Handle 
        type="target" 
        position={Position.Bottom} 
        className="!bg-indigo-400 !h-2 !w-2" 
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export default function FlowchartMaker() {
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([
    {
      id: '1',
      type: 'custom',
      position: { x: 250, y: 5 },
      data: { label: 'Start' },
    },
    {
      id: '2',
      type: 'custom',
      position: { x: 250, y: 100 },
      data: { label: 'Process' },
    },
    {
      id: '3',
      type: 'custom',
      position: { x: 250, y: 200 },
      data: { label: 'End' },
    },
  ]);
  
  const [edges, setEdges] = useState<Edge[]>([
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
  ]);
  
  const flowRef = useRef<HTMLDivElement>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)),
    []
  );

  const addNode = () => {
    const newNode: Node<CustomNodeData> = {
      id: `${Date.now()}`,
      type: 'custom',
      data: { label: `Step ${nodes.length + 1}` },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const exportAsImage = useCallback(async () => {
    if (flowRef.current === null) return;

    try {
      const dataUrl = await toPng(flowRef.current, {
        backgroundColor: '#111827',
        filter: (node) => !node?.classList?.contains('react-flow__controls'),
      });

      const link = document.createElement('a');
      link.download = 'flowchart.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting image:', err);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <header className="w-full bg-black bg-opacity-30 backdrop-blur border-b border-gray-700 py-4 px-6 flex items-center justify-between shadow-sm">
        <h1 className="text-2xl font-bold text-indigo-400">Dennam.lk</h1>
        <p className="text-sm text-gray-400 hidden sm:block">Flowchart Maker</p>
      </header>

      <main className="flex-grow flex flex-col items-center p-6">
        <div className="w-full max-w-6xl bg-black bg-opacity-30 backdrop-blur rounded-3xl shadow-xl p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-center text-indigo-300 mb-6">
            📊 Flowchart Maker
          </h2>

          <div className="flex gap-4 mb-4">
            <button
              onClick={addNode}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Add Node
            </button>
            <button
              onClick={exportAsImage}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Export as PNG
            </button>
          </div>

          <div 
            ref={flowRef}
            className="h-[600px] border border-gray-600 rounded-lg overflow-hidden"
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              connectionRadius={20}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      </main>

      <footer className="bg-black bg-opacity-30 border-t border-gray-700 text-center py-4 text-sm text-gray-400 backdrop-blur shadow-inner">
        &copy; {new Date().getFullYear()} Dennam.lk. Developed by Chalana Prabhashwara.
      </footer>
    </div>
  );
}