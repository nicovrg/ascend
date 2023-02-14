import { StyleSheet, View } from "react-native";
import Heart from "./Heart";

export function Life() {
  return(
    <View style={styles.lifeBar}>
      <Heart full={true}/>
      <Heart full={true}/>
      <Heart full={false}/>
    </View>
    )
}
  
const styles = StyleSheet.create({
  lifeBar: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    alignItems:"center",
  }
});