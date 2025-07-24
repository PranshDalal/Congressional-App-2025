import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import { useLocalSearchParams, useRouter } from "expo-router";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import BouncingCircles from "@/components/BouncingCircles";
import RNSoundLevel from "react-native-sound-level";
import StyledModal from "@/components/StyledModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { Accelerometer } from "expo-sensors";
import { CameraView, useCameraPermissions } from "expo-camera";
import auth from "@react-native-firebase/auth";
import axios from "axios";

const SessionScreen = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const [elapsed, setElapsed] = useState(0);
  const [isStopwatchRunning, setStopwatchRunning] = useState(true);
  const [dB, setDB] = useState<number | null>(null);
  const fakeConvertedDBRef = useRef(-1);
  const [fakeRenderDB, setFakeRenderDB] = useState(-1);

  const [motionData, setMotionData] = useState({ x: 0, y: 0, z: 0 });
  const [motionMagnitude, setMotionMagnitude] = useState(0);

  const [lighting, setLighting] = useState<number | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  const [noiseReadings, setNoiseReadings] = useState<number[]>([]);
  const [motionReadings, setMotionReadings] = useState<number[]>([]);
  const [lightReadings, setLightReadings] = useState<number[]>([]);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const { "microphone-enabled": microphoneEnabled } = useLocalSearchParams();

  const [endSessionModalVisible, setEndSessionModalVisible] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const startSession = async () => {
      try {
        const currentUser = auth().currentUser;
        console.log("Current user:", currentUser);
        if (!currentUser) {
          console.error('No authenticated user found');
          return;
        }

        console.log("Starting session for user:", currentUser.uid);

        const response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/start_session`, {
          user_id: currentUser.uid,
        });

        setSessionId(response.data.session_id);
        console.log('Session started:', response.data.session_id);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Failed to start session:', error.response?.data?.error || error.message);
        } else {
          console.error('Error starting session:', error);
        }
      }
    };

    startSession();
  }, []); 

  useEffect(() => {
    console.log('Camera permission state:', permission);
    if (!permission?.granted) {
      console.log('Requesting camera permission...');
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (isStopwatchRunning) {
      startTimeRef.current = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current);
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStopwatchRunning]);

  const collectSessionData = () => {
    const avgNoiseLevel = noiseReadings.length > 0 
      ? Math.round(noiseReadings.reduce((sum, reading) => sum + reading, 0) / noiseReadings.length)
      : fakeRenderDB;

    const avgMotionLevel = motionReadings.length > 0
      ? Math.round((motionReadings.reduce((sum, reading) => sum + reading, 0) / motionReadings.length) * 1000) / 1000 
      : motionMagnitude;

    const avgLightLevel = lightReadings.length > 0
      ? Math.round(lightReadings.reduce((sum, reading) => sum + reading, 0) / lightReadings.length)
      : lighting;

    console.log('📊 Session averages calculated:', {
      noise: { readings: noiseReadings.length, average: avgNoiseLevel },
      motion: { readings: motionReadings.length, average: avgMotionLevel },
      light: { readings: lightReadings.length, average: avgLightLevel }
    });

    return {
      session_id: sessionId,
      noise_level: avgNoiseLevel,
      motion_level: avgMotionLevel,
      light_level: avgLightLevel,
      user_id: auth().currentUser?.uid,
      elapsed_time: elapsed,
      noise_sample_count: noiseReadings.length,
      motion_sample_count: motionReadings.length,
      light_sample_count: lightReadings.length,
    };
  };

  // #region Microphone
  useEffect(() => {
    if (microphoneEnabled === "true" && isStopwatchRunning) {
      RNSoundLevel.start();

      RNSoundLevel.onNewFrame = (data) => {
        setDB(data.value);
        const readableDB = Math.round(data.value + 110);
        fakeConvertedDBRef.current = readableDB;
      };

      const dBUpdateInterval = setInterval(() => {
        if (isStopwatchRunning) {
          setFakeRenderDB(fakeConvertedDBRef.current);
          if (fakeConvertedDBRef.current > 0) {
            setNoiseReadings(prev => [...prev, fakeConvertedDBRef.current]);
          }
        } else {
          setFakeRenderDB(-1);
        }
      }, 1000);

      return () => {
        RNSoundLevel.stop();
        clearInterval(dBUpdateInterval);
      };
    }
  }, [microphoneEnabled, isStopwatchRunning]);
  // #endregion

  // #region Accelerometer (Motion)
  useEffect(() => {
    let accelerometerSubscription: any = null;

    if (isStopwatchRunning) {
      accelerometerSubscription = Accelerometer.addListener(({ x, y, z }) => {
        setMotionData({ x, y, z });

        const magnitude = Math.sqrt(x * x + y * y + z * z);
        setMotionMagnitude(magnitude);
        
        setMotionReadings(prev => [...prev, magnitude]);
      });

      Accelerometer.setUpdateInterval(200); 
    } else {
      if (accelerometerSubscription) {
        accelerometerSubscription.remove();
      }
      setMotionMagnitude(0);
    }

    return () => {
      if (accelerometerSubscription) {
        accelerometerSubscription.remove();
      }
    };
  }, [isStopwatchRunning]);
  // #endregion

  // #region Lighting (camera brightness)
  useEffect(() => {
    let lightingInterval: any;

    if (isStopwatchRunning && permission?.granted && isCameraReady) {
      const initDelay = setTimeout(() => {
        lightingInterval = setInterval(async () => {
          try {
            if (!cameraRef.current) {
              console.log("Camera ref not available yet");
              return;
            }

            console.log("Attempting to take picture for lighting...");
            const photo = await cameraRef.current.takePictureAsync({
              base64: true,
              quality: 0.1,
              skipProcessing: true,
            });

            if (photo.base64) {
              const avg = estimateBrightness(photo.base64);
              setLighting(avg);
              
              if (avg !== null && avg > 0) {
                setLightReadings(prev => [...prev, avg]);
              }
            } else {
              console.warn("No base64 data from camera");
            }
          } catch (err) {
            console.warn("Camera error:", err);
            setLighting(null);
          }
        }, 2000); 
      }, 1000); 

      return () => {
        clearTimeout(initDelay);
        if (lightingInterval) {
          clearInterval(lightingInterval);
        }
      };
    }

    return () => {
      if (lightingInterval) {
        clearInterval(lightingInterval);
      }
    };
  }, [isStopwatchRunning, permission?.granted, isCameraReady]);

  function estimateBrightness(base64: string): number {
    try {
      const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '');

      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      let sum = 0;
      let count = 0;
      
      for (let i = 0; i < bytes.length; i += 1000) {
        sum += bytes[i];
        count++;
      }
      
      const avg = count > 0 ? (sum / count / 255) * 100 : 0;
      const result = Math.round(Math.max(0, Math.min(100, avg)));
      
      console.log(`Brightness calculation: ${count} samples, avg=${avg.toFixed(2)}, result=${result}`);
      return result;
    } catch (err) {
      console.warn("Brightness estimation error:", err);
      let sum = 0;
      let count = 0;
      
      for (let i = 0; i < base64.length; i += 100) {
        const charCode = base64.charCodeAt(i);
        sum += charCode;
        count++;
      }
      
      const fallback = Math.round((sum / count / 255) * 100);
      console.log("Using fallback brightness calculation:", fallback);
      return fallback;
    }
  }
  // #endregion


  return (
    <BackgroundView style={styles.container}>
      {permission?.granted && (
        <CameraView
          ref={cameraRef}
          style={{ width: 1, height: 1, position: "absolute", top: -100 }}
          facing="front"
          onCameraReady={() => {
            console.log("Camera is ready!");
            setIsCameraReady(true);
          }}
          onMountError={(error) => {
            console.error("Camera mount error:", error);
            setIsCameraReady(false);
          }}
        />
      )}
      <BouncingCircles paused={!isStopwatchRunning} />
      <View style={styles.content}>
        <Text style={[globalStyles.header1, styles.stopwatchText]}>
          {formatTime(elapsed)}
        </Text>
        <Text style={globalStyles.mutedText}>
          {isStopwatchRunning ? "Collecting ambient data..." : "Paused"}
        </Text>
        <Text style={globalStyles.mutedText}>
          {isStopwatchRunning && fakeRenderDB !== -1
            ? "Sound level: " + fakeRenderDB + " dB"
            : ""}
        </Text>
        <Text style={globalStyles.mutedText}>
          {isStopwatchRunning
            ? `Motion magnitude: ${motionMagnitude.toFixed(3)}`
            : ""}
        </Text>
        <Text style={globalStyles.mutedText}>
          {lighting !== null ? `Lighting: ${lighting}/100` : ""}
        </Text>
        {!permission?.granted && (
          <TextButton
            title="Enable Camera for Lighting"
            onPress={requestPermission}
            variant="secondary"
            style={{ marginTop: 20 }}
          />
        )}
      </View>

      <SafeAreaView edges={["bottom"]} style={styles.bottomStickyView}>
        <TextButton
          title=""
          icon={
            isStopwatchRunning ? (
              <Ionicons name="pause" size={18} color={theme.colors.text} />
            ) : (
              <Ionicons name="play" size={18} color={theme.colors.text} />
            )
          }
          variant="secondary"
          onPress={() => setStopwatchRunning((r) => !r)}
          width="45%"
        />
        <TextButton
          title="End Session"
          onPress={() => setEndSessionModalVisible(true)}
          width="45%"
        />
      </SafeAreaView>

      <StyledModal
        title={"End Session"}
        body={"Are you sure you want to end the session?"}
        visible={endSessionModalVisible}
        setModalVisibleCallback={setEndSessionModalVisible}
        type="ask"
        onSubmit={() => {
          const sessionData = collectSessionData();
          router.push({
            pathname: "/session/survey",
            params: {
              sessionData: JSON.stringify(sessionData)
            }
          });
        }}
        submitButtonText="End Session"
      />
    </BackgroundView>
  );
};

export default SessionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
    ...globalStyles.centered,
  },
  bottomStickyView: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingTop: theme.spacing.md,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
  },
  stopwatchText: {
    fontSize: theme.fontSize.bigBoy,
    color: theme.colors.text,
  },
});

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}