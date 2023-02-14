import React from "react";
import { Image, StyleSheet, useColorScheme, View } from "react-native";
import { Colors } from "./Colors";
import { Life } from "./Life";

export function Header() {
  const isDarkMode = useColorScheme() === "dark";
  return (
    <View style={[styles.background, { backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }]}>
      <Life/>
      <Image
        source={require("../../assets/icon.png")}
        style={{ width: 60, height: 60, margin: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    padding: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logo: {
    overflow: "visible",
    resizeMode: "cover",
  },
  subtitle: {
    color: "#333",
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
  },
  title: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "700",
    textAlign: "center",
  },
});
