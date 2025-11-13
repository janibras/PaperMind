import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, PanResponder, Text, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import NodeView from './NodeView';

const { width, height } = Dimensions.get('window');

function uid(prefix='n') {
  return prefix + Math.random().toString(36).slice(2,9);
}

const Canvas = forwardRef(({ map, onChange, style }, ref) => {
  const [viewport, setViewport] = useState({ tx: 0, ty: 0, scale: 1 });
  const [dragging, setDragging] = useState(null);
  const [selected, setSelected] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);

  useImperativeHandle(ref, () => ({
    addNode: () => {
      const id = uid('n');
      const n = { id, x: (width/2 - viewport.tx)/viewport.scale, y: (height/2 - viewport.ty)/viewport.scale, text: 'Node' };
      const newMap = { ...map, nodes: { ...map.nodes, [id]: n } };
      onChange(newMap);
    },
    clearSelection: () => {
      setSelected(null);
      setConnectFrom(null);
    }
  }));

  // node move handler
  const updateNodePos = (id, x, y) => {
    const node = map.nodes[id];
    if (!node) return;
    const updated = { ...map, nodes: { ...map.nodes, [id]: { ...node, x, y } } };
    onChange(updated);
  };

  const toggleConnect = (id) => {
    if (!connectFrom) {
      setConnectFrom(id);
      setSelected(id);
      return;
    }
    if (connectFrom === id) {
      setConnectFrom(null);
      setSelected(null);
      return;
    }
    // add edge
    const newEdge = { from: connectFrom, to: id, id: uid('e') };
    const newMap = { ...map, edges: [...(map.edges || []), newEdge] };
    onChange(newMap);
    setConnectFrom(null);
    setSelected(null);
  };

  const deleteNode = (id) => {
    const nodes = { ...map.nodes };
    delete nodes[id];
    const edges = (map.edges || []).filter(e => e.from !== id && e.to !== id);
    onChange({ ...map, nodes, edges });
  };

  // render edges as lines
  const edges = (map.edges || []).map(e => {
    const a = map.nodes[e.from];
    const b = map.nodes[e.to];
    if (!a || !b) return null;
    return { x1: a.x*viewport.scale + viewport.tx, y1: a.y*viewport.scale + viewport.ty, x2: b.x*viewport.scale + viewport.tx, y2: b.y*viewport.scale + viewport.ty, id: e.id };
  }).filter(Boolean);

  return (
    <View style={[{ flex: 1, backgroundColor: '#fff' }, style]}>
      <Svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
        {edges.map(line => (
          <Line key={line.id} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#999" strokeWidth={2} />
        ))}
      </Svg>

      {Object.values(map.nodes).map(node => (
        <NodeView
          key={node.id}
          node={node}
          viewport={viewport}
          onMove={(nx, ny) => updateNodePos(node.id, nx, ny)}
          onTap={() => toggleConnect(node.id)}
          onDelete={() => deleteNode(node.id)}
          isSelected={selected === node.id}
        />
      ))}
    </View>
  );
});

export default Canvas;
