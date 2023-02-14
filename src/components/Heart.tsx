import Svg, { Path, LinearGradient, Stop, Line} from "react-native-svg";
import { StyleSheet, View } from "react-native";
import * as React from "react"


interface HeartProps {
  full: boolean,
}

const Heart:React.FC<HeartProps> = ({full} : HeartProps) => {
  return (
    <Svg
      width="20"
      height="19"
      viewBox="0 0 20 19"
      style={styles.heartShape}
    >
      <LinearGradient id="lgrad" x1="0%" y1="50%" x2="100%" y2="50%" >
          <Stop offset="0%" stopColor="rgb(197,0,0)" stopOpacity="1.00" />
          <Stop offset="100%" stopColor="rgb(255,0,0)" stopOpacity="1.00" />

      </LinearGradient>

      <Path
        d="M10 18.35L8.55 17.03C3.4 12.36 0 9.27 0 5.5C0 2.41 2.42 0 5.5 0C7.24 0 8.91 0.81 10 2.08C11.09 0.81 12.76 0 14.5 0C17.58 0 20 2.41 20 5.5C20 9.27 16.6 12.36 11.45 17.03L10 18.35Z"
        fill={`${full ? "url(#lgrad)": "#E2DDDD"}`}
      />
    </Svg>
  );
}

export default Heart;

const styles = StyleSheet.create({
  heartShape: {
    marginRight: 10,
    width: 30,
    height: 30
  }
});