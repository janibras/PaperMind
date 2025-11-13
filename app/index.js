import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";

const initialNode = { id: 1, label: "PaperMind", x: 200, y: 200 };
const initialLink = [];

export default function App() {
  const [nodes, setNodes] = useState([initialNode]);
  const [links, setLinks] = useState(initialLink);
  const [selectedNode, setSelectedNode] = useState(null);
  const [mapName, setMapName] = useState("My PaperMind");

  useEffect(() => {
    loadMindMap();
  }, []);

  const addNode = () => {
    const newNode = {
      id: Date.now(),
      label: "New Idea",
      x: 150 + Math.random() * 200,
      y: 150 + Math.random() * 200,
    };
    setNodes([...nodes, newNode]);
  };

  const selectNode = (nodeId) => {
    if (selectedNode && selectedNode !== nodeId) {
      setLinks([...links, { from: selectedNode, to: nodeId }]);
      setSelectedNode(null);
    } else {
      setSelectedNode(nodeId);
    }
  };

  const saveMindMap = async () => {
    try {
      const data = JSON.stringify({ nodes, links, mapName });
      await AsyncStorage.setItem("PaperMindData", data);
      Alert.alert("Saved!", "Your mind map has been saved successfully.");
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const loadMindMap = async () => {
    try {
      const saved = await AsyncStorage.getItem("PaperMindData");
      if (saved) {
        const { nodes, links, mapName } = JSON.parse(saved);
        setNodes(nodes);
        setLinks(links);
        setMapName(mapName);
      }
    } catch (error) {
      console.error("Load error:", error);
    }
  };

  const clearSelection = () => setSelectedNode(null);

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter((n) => n.id !== nodeId));
    setLinks(links.filter((l) => l.from !== nodeId && l.to !== nodeId));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{mapName}</Text>

      <Svg height="80%" width="100%">
        {links.map((l, idx) => {
          const from = nodes.find((n) => n.id === l.from);
          const to = nodes.find((n) => n.id === l.to);
          if (!from || !to) return null;
          return (
            <Line
              key={idx}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="gray"
              strokeWidth="2"
            />
          );
        })}

        {nodes.map((n) => (
          <React.Fragment key={n.id}>
            <Circle
              cx={n.x}
              cy={n.y}
              r="30"
              fill={selectedNode === n.id ? "#88f" : "#ddd"}
              stroke="#333"
              strokeWidth="2"
              onPress={() => selectNode(n.id)}
              onLongPress={() => deleteNode(n.id)}
            />
            <SvgText
              x={n.x}
              y={n.y + 5}
              fontSize="10"
              textAnchor="middle"
              fill="#000"
            >
              {n.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>

      <View style={styles.controls}>
        <TouchableOpacity onPress={addNode} style={styles.button}>
          <Text style={styles.buttonText}>Add Node</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={clearSelection} style={styles.button}>
          <Text style={styles.buttonText}>Clear Sel</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={saveMindMap} style={styles.button}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={loadMindMap} style={styles.button}>
          <Text style={styles.buttonText}>Load</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        value={mapName}
        onChangeText={setMapName}
        placeholder="Mind map name"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 10,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#4682b4",
    padding: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
    width: "90%",
  },
});
