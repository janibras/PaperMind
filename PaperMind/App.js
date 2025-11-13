import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Alert, TextInput } from 'react-native';
import Canvas from './components/Canvas';
import { saveMap, loadMap, exportMapText, importMapText } from './storage';

export default function App() {
  const [mapData, setMapData] = useState(null);
  const [editingName, setEditingName] = useState('My PaperMind');
  const canvasRef = useRef();

  useEffect(() => {
    (async () => {
      const saved = await loadMap();
      if (saved) setMapData(saved);
      else {
        // initial map skeleton
        setMapData({
          name: 'PaperMind root',
          nodes: {
            'n1': { id: 'n1', x: 150, y: 200, text: 'PaperMind' }
          },
          edges: []
        });
      }
    })();
  }, []);

  const handleSave = async () => {
    await saveMap(mapData);
    Alert.alert('Saved', 'Map saved locally.');
  };

  const handleExport = async () => {
    const text = await exportMapText(mapData);
    // show export text so user can copy
    Alert.alert('Export JSON', text.slice(0, 200) + (text.length>200 ? '…' : ''));
  };

  const handleImport = async () => {
    Alert.prompt(
      'Import JSON',
      'Paste JSON of a map to import',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import', onPress: async (value) => {
            try {
              const imported = await importMapText(value);
              setMapData(imported);
              Alert.alert('Imported');
            } catch (e) {
              Alert.alert('Error', 'Invalid JSON');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  if (!mapData) {
    return <View style={styles.center}><Text>Loading…</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{editingName}</Text>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.btn} onPress={() => canvasRef.current?.addNode()}>
            <Text>Add Node</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => canvasRef.current?.clearSelection()}>
            <Text>Clear Sel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={handleSave}>
            <Text>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={handleExport}>
            <Text>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={handleImport}>
            <Text>Import</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Canvas ref={canvasRef} map={mapData} onChange={setMapData} style={styles.canvas} />

      <View style={styles.footer}>
        <TextInput
          style={styles.input}
          value={editingName}
          onChangeText={setEditingName}
          placeholder="Map name"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f8' },
  header: { padding: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 18, fontWeight: '600' },
  controls: { flexDirection: 'row', marginTop: 8, gap: 8 },
  btn: { padding: 8, backgroundColor: '#eee', borderRadius: 8, marginRight: 8 },
  canvas: { flex: 1 },
  footer: { padding: 8, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  input: { height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8 }
});
