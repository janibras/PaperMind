import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'papermind_map_v1';

export async function saveMap(map) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function loadMap() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function exportMapText(map) {
  return JSON.stringify(map);
}

export async function importMapText(text) {
  return JSON.parse(text);
}