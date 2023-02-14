import * as React from "react";
import { View, StyleSheet, Text, Platform, StatusBar } from "react-native";
import { Dimensions } from "react-native";
import { Camera, CameraType } from "expo-camera";
// import * as mobilenet from "@tensorflow-models/mobilenet";
import * as posenet from "@tensorflow-models/posenet";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { GLView, ExpoWebGLRenderingContext } from "expo-gl";
import Svg, { Circle, Rect, G, Line } from "react-native-svg";
import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";

import {
  fetch,
  decodeJpeg,
  cameraWithTensors,
  bundleResourceIO,
} from "@tensorflow/tfjs-react-native";
import { useEffect, useState } from "react";
import { globalStyles } from "../GlobalStyles";

//uses expo camera, adds tensors
const TensorCamera_ = cameraWithTensors(Camera);

let model: posenet.PoseNet;
let detector: poseDetection.PoseDetector | null;
let frameCount = 0;
let predictionRate = 1;

let elbowAngle = 999;
let backAngle = 0;
let reps = 0;
let UP = false;

const TensorCamera: React.FC = (): React.ReactElement => {
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const camera = React.useRef(null);
  const [modelReady, setModelReady] = useState(false);
  const [pose, setPose] = useState<posenet.Pose | null>(null);

  const tensorDims = { height: 200, width: 152, depth: 3 };

  useEffect(() => {
    (async () => {
      //------------------------PERMISSIONS-------------------------
      const { status }: any =
        await Camera.requestCameraPermissionsAsync().catch((e) =>
          console.log(e)
        );
      setHasPermission(status === "granted");

      //-------------------------TF_INIT-----------------------------
      await tf.ready().catch((e) => console.log(e));
      tf.getBackend();

      model = await posenet.load({
        architecture: "MobileNetV1",
        outputStride: 16,
        inputResolution: { width: tensorDims.width, height: tensorDims.height },
        multiplier: 0.75,
        quantBytes: 2,
      });

      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      setModelReady(true);
    })();
  }, []);

  const handleCameraStream = (
    images: IterableIterator<tf.Tensor3D>,
    updateCameraPreview: () => void,
    gl: ExpoWebGLRenderingContext,
    cameraTexture: WebGLTexture
  ) => {
    if (!images) return;
    const loop = async () => {
      if (frameCount % predictionRate === 0) {
        const imageTensor = images.next().value;

        let flipHorizontal = Platform.OS === "ios" ? true : false;
        // try {
        const _pose = await model.estimateSinglePose(imageTensor, {
          flipHorizontal,
        });
        const poses = await detector?.estimatePoses(imageTensor);
        setPose(_pose);
        tf.dispose([imageTensor]);
      }
      frameCount++;
      requestAnimationFrame(loop);
    };
    loop();
  };

  const renderPose = () => {
    updatePosition();

    const MIN_KEYPOINT_SCORE = 0.3;
    if (pose != null) {
      const keypoints = pose.keypoints
        .filter((k) => k.score > MIN_KEYPOINT_SCORE)
        .map((k, i) => {
          return (
            <Circle
              key={`skeletonkp_${i}`}
              cx={k.position.x}
              cy={k.position.y}
              r="2"
              strokeWidth="0"
              fill="blue"
            />
          );
        });

      const adjacentKeypoints = posenet.getAdjacentKeyPoints(
        pose.keypoints,
        MIN_KEYPOINT_SCORE
      );
      const skeleton = adjacentKeypoints.map(([from, to], i) => {
        return (
          <Line
            key={`skeletonls_${i}`}
            x1={from.position.x}
            y1={from.position.y}
            x2={to.position.x}
            y2={to.position.y}
            stroke="magenta"
            strokeWidth="1"
          />
        );
      });

      return (
        <Svg
          height="100%"
          width="100%"
          viewBox={`0 0 ${tensorDims.width} ${tensorDims.height}`}
        >
          {skeleton}
          {keypoints}
        </Svg>
      );
    } else {
      return null;
    }
  };

  const updateArmAngle = () => {
    if (!pose) return;
    let leftWrist = pose.keypoints[15];
    let leftShoulder = pose.keypoints[11];
    let leftElbow = pose.keypoints[13];

    let angle =
      (Math.atan2(
        leftWrist.position.y - leftElbow.position.y,
        leftWrist.position.x - leftElbow.position.x
      ) -
        Math.atan2(
          leftShoulder.position.y - leftElbow.position.y,
          leftShoulder.position.x - leftElbow.position.x
        )) *
      (180 / Math.PI);

    if (angle < 0) {
      //angle = angle + 360;
    }

    if (
      leftWrist.score > 0.3 &&
      leftElbow.score > 0.3 &&
      leftShoulder.score > 0.3
    ) {
      //console.log(angle);
      elbowAngle = angle;
    } else {
      //console.log('Cannot see elbow');
    }
  };

  const isElbowAboveNose = () => {
    if (!pose) return;
    let elbowAboveNose = false;
    if (pose.keypoints[0].position.y > pose.keypoints[15].position.y) {
      elbowAboveNose = true;
    }
    return elbowAboveNose;
  };

  const updatePosition = () => {
    updateArmAngle();
    var elbowAboveNose = isElbowAboveNose();
    if (!elbowAngle) return;
    if (elbowAngle > 170 && elbowAngle < 200 && UP == false) {
      reps = reps + 1;
      UP = true;
    }
    if (
      elbowAboveNose &&
      Math.abs(elbowAngle) > 70 &&
      Math.abs(elbowAngle) < 100
    ) {
      UP = false;
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  if (!modelReady) {
    return <Text>Loading</Text>;
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.textWrapper}>
        <Text style={globalStyles.text}>{`Reps: ${reps}`}</Text>
        <Text style={globalStyles.text}>{`elbow angle: ${elbowAngle}`}</Text>
        <Text style={globalStyles.text}>
          {" "}
          {`position: ${UP === true ? "UP" : "DOWN"}`}
        </Text>
      </View>
      <TensorCamera_
        ref={camera}
        style={styles.camera}
        type={CameraType.front}
        cameraTextureHeight={1920}
        cameraTextureWidth={1080}
        onReady={handleCameraStream}
        resizeHeight={tensorDims.height}
        resizeWidth={tensorDims.width}
        resizeDepth={tensorDims.depth}
        autorender={true}
        useCustomShadersToResize={true}
      />
      <View style={styles.modelResults}>{renderPose()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  },
  camera: {
    position: "absolute",
    // left: 50,
    // top: 100,
    // width: 600 / 2,
    // height: 800 / 2,
    width: "100%",
    height: "100%",
    zIndex: 1,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 0,
  },
  modelResults: {
    position: "absolute",
    // left: 50,
    // top: 100,
    width: "100%",
    height: "100%",
    zIndex: 20,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 0,
  },
  textWrapper: {
    position: "absolute",
    zIndex: 30,
    top: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    color: "white",
    backgroundColor: "black",
    padding: 20,
    borderRadius: 10,
  },
});

export default TensorCamera;
