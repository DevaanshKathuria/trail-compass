import React, { useEffect, useState } from "react";
import { View, StyleSheet, Share } from "react-native";
import { Card, List, IconButton, Text, Snackbar } from "react-native-paper";
import { loadPins, savePins } from "../storage";
import { toCardinal } from "../utils/geo";

export default function PinsScreen() {
  const [pins, setPins] = useState([]);
  const [snack, setSnack] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      const saved = await loadPins();
      if (mounted) {
        setPins(saved || [])
      };
    };
    loadData();
    return () => { mounted = false };
  }, []);

  const remove = async (id) => {
    try {
      const nextPins = pins.filter(p => p.id !== id);
      setPins(nextPins);
      await savePins(nextPins);
      setSnack("Pin Deleted");
    } catch (e) {
      setSnack("Failed to delete pin");
    }
  };

  const sharePin = async (p) => {
    try {
      const cardinal = toCardinal(p.heading);
      const date = new Date(p.ts).toLocaleString();
      const message = `Location Pin: Latitude: ${p.lat} Longitude: ${p.lon} Heading: ${cardinal}Saved on: ${date}`;
      await Share.share({ message });
      setSnack("Pin Shared");
    } catch (e) {
      setSnack("Failed to share pin");
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Saved Pins" />
        <Card.Content>
          {pins.length === 0 ? (
            <Text>No pins yet. Drop one from Compass.</Text>
          ) : (
            <List.Section>
              {pins.map((p) => (
                <List.Item
                  key={p.id}
                  title={`${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}`}
                  description={new Date(p.ts).toLocaleString()}
                  left={(props) => <List.Icon {...props} icon="map-marker" />}
                  right={() => (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <IconButton icon="share-variant" onPress={() => sharePin(p)} />
                      <IconButton icon="delete" onPress={() => remove(p.id)} />
                    </View>
                  )}
                />
              ))}
            </List.Section>
          )}
        </Card.Content>
      </Card>

      <Snackbar visible={!!snack} onDismiss={() => setSnack("")} duration={1200}>
        {snack}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderRadius: 16 },
});