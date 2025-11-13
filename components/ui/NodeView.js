import React, { useRef } from 'react';
import { View, Text, PanResponder, Animated, TouchableOpacity } from 'react-native';

export default function NodeView({ node, viewport, onMove, onTap, onDelete, isSelected }) {
  const pan = useRef(new Animated.ValueXY({ x: node.x*viewport.scale + viewport.tx, y: node.y*viewport.scale + viewport.ty })).current;

  // Keep position synced when viewport changes
  React.useEffect(() => {
    pan.setValue({ x: node.x*viewport.scale + viewport.tx, y: node.y*viewport.scale + viewport.ty });
  }, [node.x, node.y, viewport.scale, viewport.tx, viewport.ty]);

  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({ x: pan.x._value, y: pan.y._value });
      pan.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (e, gestureState) => {
      pan.flattenOffset();
      const finalX = (pan.x._value - viewport.tx)/viewport.scale;
      const finalY = (pan.y._value - viewport.ty)/viewport.scale;
      onMove(finalX, finalY);
    }
  });

  return (
    <Animated.View
      {...responder.panHandlers}
      style={{
        position: 'absolute',
        left: pan.x,
        top: pan.y,
        transform: []
      }}
    >
      <TouchableOpacity onPress={onTap} onLongPress={onDelete} activeOpacity={0.9} style={{
        minWidth: 100,
        padding: 10,
        backgroundColor: isSelected ? '#ffd' : '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        elevation: 2
      }}>
        <Text>{node.text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
