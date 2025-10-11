import { View, StyleSheet, Alert } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import BackgroundView from "@/components/view/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import { useLocalSearchParams, useRouter } from "expo-router";
import TextButton from "@/components/button/TextButton";
import theme from "@/styles/theme";
import BouncingCircles from "@/components/BouncingCircles";
import RNSoundLevel from "react-native-sound-level";
import StyledModal from "@/components/view/StyledModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Accelerometer } from "expo-sensors";
import { CameraView, useCameraPermissions } from "expo-camera";
import { getAuth } from "@react-native-firebase/auth";
import { startSession as apiStartSession } from "@/services/backendSessionService";
import axios from "axios";
import { PauseSolid, PlaySolid } from "@/assets/icons/heroicons";
import { useKeepAwake } from "expo-keep-awake";
import ThemedText from "@/components/ThemedText";
import { connectToWearable } from "../../../utils/ble/bleClient";
import { parseSensorData, SensorReading } from "../../../utils/ble/sensorData";
import { PreferencesService } from "@/services/firebasePreferencesService";
import { feedbackNudge } from "@/services/firebaseNudgesService";
// import firestore from "@react-native-firebase/firestore";
import { Device } from "react-native-ble-plx";
import { serverTimestamp } from "@react-native-firebase/firestore";
import { useSessionSettingsState } from "@/utils/sessionSettingsStore";

function useNudgePolling({
  userId,
  getEnvData,
}: {
  userId: string | undefined | null;
  getEnvData: () => {
    light: number | null;
    noise: number | null;
    motion: number | null;
    temp: number | null;
    humidity: number | null;
    session_length: number;
  };
}) {
  const cooldownRef = useRef<{ [userId: string]: number }>({});
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const getEnvDataRef = useRef(getEnvData);
  const [timeInterval, setTimeInterval] = useState(300000);

  useEffect(() => {
    const fetchNudgeFrequency = async () => {
      try {
        const nudgesFrequency = await PreferencesService.getNudgeFrequency();
        const interval =
          nudgesFrequency === "High"
            ? 60000
            : nudgesFrequency === "Mid"
            ? 180000
            : 300000;
        console.log("The user has a nudge frequency of ", interval);
        setTimeInterval(interval);
      } catch (error) {
        console.error("Failed to get nudge frequency:", error);
      }
    };

    fetchNudgeFrequency();
  }, []);

  useEffect(() => {
    getEnvDataRef.current = getEnvData;
  }, [getEnvData]);

  useEffect(() => {
    if (!userId || typeof userId !== "string") return;
    function pollNudge() {
      const now = Date.now();
      const key = String(userId);
      const lastNudge = cooldownRef.current[key] || 0;
      /*       if (now - lastNudge < 3 * 60 * 1000) return; */
      console.log("Polling nudge for user:", userId);
      const env = getEnvDataRef.current();
      fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/get_nudge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          light: env.light,
          noise: env.noise,
          motion: env.motion,
          temp: env.temp,
          humidity: env.humidity,
          session_length: env.session_length,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.nudge && typeof data.nudge === "string") {
            cooldownRef.current[key] = Date.now();
            Alert.alert(
              "Nudge",
              data.nudge,
              [
                {
                  text: "Yes",
                  onPress: () => sendFeedback("Yes"),
                },
                {
                  text: "Snooze",
                  onPress: () => sendFeedback("Snooze"),
                },
                {
                  text: "Not Now",
                  style: "cancel",
                  onPress: () => sendFeedback("Not Now"),
                },
              ],
              { cancelable: true }
            );
            function sendFeedback(response: string) {
              try {
                feedbackNudge({
                  nudge_text: data.nudge,
                  response: response,
                  timestamp: serverTimestamp() as any,
                });
              } catch (error) {
                console.error("Error sending feedback:", error);
              }
            }
          }
        })
        .catch(() => {});
    }

    pollingRef.current = setInterval(pollNudge, timeInterval);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [userId, timeInterval]);
}

const SessionScreen = () => {
  useKeepAwake();
  const currentUser = getAuth().currentUser;
  const { sessionType, sessionDuration } = useSessionSettingsState();

  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const [elapsed, setElapsed] = useState(0);
  const [isStopwatchRunning, setStopwatchRunning] = useState(true);
  const [dB, setDB] = useState<number>(-120);
  const fakeConvertedDBRef = useRef(-1);
  const [fakeRenderDB, setFakeRenderDB] = useState(-1);

  const [motionData, setMotionData] = useState({ x: 0, y: 0, z: 0 });
  const [motionMagnitude, setMotionMagnitude] = useState(0);

  const [lighting, setLighting] = useState<number | null>(null);
  const [pictureSize, setPictureSize] = useState<string | undefined>(undefined);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  const [noiseReadings, setNoiseReadings] = useState<number[]>([]);
  const [motionReadings, setMotionReadings] = useState<number[]>([]);
  const [lightReadings, setLightReadings] = useState<number[]>([]);

  const [tempReadings, setTempReadings] = useState<number[]>([]);
  const [humidityReadings, setHumidityReadings] = useState<number[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const { "microphone-enabled": microphoneEnabled, "device-type": deviceType } =
    useLocalSearchParams();

  const [endSessionModalVisible, setEndSessionModalVisible] = useState(false);
  const [timeUpModalVisible, setTimeUpModalVisible] = useState(false);
  const [shownTimeUpModal, setShownTimeUpModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [bleDevice, setBleDevice] = useState<Device | null>(null);
  const [isUsingBLE, setIsUsingBLE] = useState(false);
  const [latestBLEData, setLatestBLEData] = useState<SensorReading | null>(
    null
  );
  const [bleConnectionResolved, setBleConnectionResolved] = useState(false);

  useEffect(() => {
    const startSession = async () => {
      try {
        //if this screen was pushed from connectingToBluetooth.tsx, deviceType param will be set to bluetooth

        console.log("Current user:", currentUser);
        if (!currentUser) {
          console.error("No authenticated user found");
          return;
        }

        console.log("Starting session for user:", currentUser.uid);

        const response = await apiStartSession({
          user_id: currentUser.uid,
        });

        setSessionId(response.session_id);
        console.log("Session started:", response.session_id);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(
            "Failed to start session:",
            error.response?.data?.error || error.message
          );
        } else {
          console.error("Error starting session:", error);
        }
      }
    };

    startSession();
  }, []);

  useEffect(() => {
    console.log("Device type param:", deviceType);
    if (deviceType === "bluetooth") {
      const connectBLE = async () => {
        try {
          console.log("Attempting to connect to BLE device...");
          const device = await connectToWearable((sensorData) => {
            setLatestBLEData(sensorData);
          });
          setBleDevice(device);
          setIsUsingBLE(true);
          setBleConnectionResolved(true);
          console.log(
            "Successfully connected to BLE device - isUsingBLE set to true"
          );
        } catch (error) {
          console.error("Failed to connect to BLE device:", error);
          setIsUsingBLE(false);
          setBleConnectionResolved(true);
          Alert.alert(
            "Bluetooth Connection Failed",
            `Could not connect to ADHD_Wearable device. Using phone sensors instead.\n\nError: ${
              error instanceof Error ? error.message : String(error)
            }`,
            [{ text: "OK" }]
          );
        }
      };

      connectBLE();
    } else {
      setBleConnectionResolved(true);
    }
  }, [deviceType]);

  const uid = currentUser?.uid;

  useNudgePolling({
    userId: uid,
    getEnvData: () => {
      if (isUsingBLE && latestBLEData) {
        const magnitude = Math.sqrt(
          latestBLEData.accel.x * latestBLEData.accel.x +
            latestBLEData.accel.y * latestBLEData.accel.y +
            latestBLEData.accel.z * latestBLEData.accel.z
        );
        const env = {
          light: latestBLEData.light,
          noise: latestBLEData.sound,
          motion: magnitude,
          session_length: Math.floor(elapsed / 1000),
          temp: latestBLEData.temp,
          humidity: latestBLEData.humidity,
        };
        console.log("getEnvData called (BLE):", env);
        return env;
      } else {
        const env = {
          light: lighting,
          noise: fakeRenderDB !== -1 ? fakeRenderDB : null,
          motion: motionMagnitude,
          session_length: Math.floor(elapsed / 1000),
          temp:
            tempReadings.length > 0
              ? Math.round(
                  tempReadings.reduce((a, b) => a + b, 0) / tempReadings.length
                )
              : null,
          humidity:
            humidityReadings.length > 0
              ? Math.round(
                  humidityReadings.reduce((a, b) => a + b, 0) /
                    humidityReadings.length
                )
              : null,
        };
        console.log("getEnvData called (phone):", env);
        return env;
      }
    },
  });

  useEffect(() => {
    console.log("Camera permission state:", permission);
    if (!permission?.granted) {
      console.log("Requesting camera permission...");
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (isStopwatchRunning) {
      startTimeRef.current = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        const newElapsed = Date.now() - startTimeRef.current;
        setElapsed(newElapsed);
        // console.log(
        //   sessionType === "timed"
        //     ? sessionDuration! * 60 * 1000 - newElapsed
        //     : false
        // );
        if (
          sessionType === "timed" &&
          sessionDuration! * 60 * 1000 - newElapsed < 0
        ) {
          if (!shownTimeUpModal) {
            setShownTimeUpModal(true);
            setTimeUpModalVisible(true);
          }
        }
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStopwatchRunning, sessionType, sessionDuration]);

  const collectSessionData = () => {
    let avgNoiseLevel,
      avgMotionLevel,
      avgLightLevel,
      avgTempLevel,
      avgHumidityLevel;

    if (isUsingBLE && latestBLEData) {
      avgNoiseLevel = latestBLEData.sound;
      avgLightLevel = latestBLEData.light;
      avgTempLevel = latestBLEData.temp;
      avgHumidityLevel = latestBLEData.humidity;
      const magnitude = Math.sqrt(
        latestBLEData.accel.x * latestBLEData.accel.x +
          latestBLEData.accel.y * latestBLEData.accel.y +
          latestBLEData.accel.z * latestBLEData.accel.z
      );
      avgMotionLevel = Math.round(magnitude * 1000) / 1000;
    } else {
      avgNoiseLevel =
        noiseReadings.length > 0
          ? Math.round(
              noiseReadings.reduce((sum, reading) => sum + reading, 0) /
                noiseReadings.length
            )
          : fakeRenderDB;

      avgMotionLevel =
        motionReadings.length > 0
          ? Math.round(
              (motionReadings.reduce((sum, reading) => sum + reading, 0) /
                motionReadings.length) *
                1000
            ) / 1000
          : motionMagnitude;

      avgLightLevel =
        lightReadings.length > 0
          ? Math.round(
              lightReadings.reduce((sum, reading) => sum + reading, 0) /
                lightReadings.length
            )
          : lighting;

      avgTempLevel =
        tempReadings.length > 0
          ? Math.round(
              tempReadings.reduce((a, b) => a + b, 0) / tempReadings.length
            )
          : null;
      avgHumidityLevel =
        humidityReadings.length > 0
          ? Math.round(
              humidityReadings.reduce((a, b) => a + b, 0) /
                humidityReadings.length
            )
          : null;
    }

    console.log("Session averages calculated:", {
      noise: { average: avgNoiseLevel, source: isUsingBLE ? "BLE" : "phone" },
      motion: { average: avgMotionLevel, source: isUsingBLE ? "BLE" : "phone" },
      light: { average: avgLightLevel, source: isUsingBLE ? "BLE" : "phone" },
      temp: { average: avgTempLevel, source: isUsingBLE ? "BLE" : "phone" },
      humidity: {
        average: avgHumidityLevel,
        source: isUsingBLE ? "BLE" : "phone",
      },
    });

    return {
      session_id: sessionId,
      noise_level: avgNoiseLevel,
      motion_level: avgMotionLevel,
      light_level: avgLightLevel,
      temp_level: avgTempLevel,
      humidity_level: avgHumidityLevel,
      user_id: currentUser?.uid,
      elapsed_time: elapsed,
      session_type: sessionType,
      scheduled_session_duration:
        sessionType === "timed" ? sessionDuration! * 60 : null,
      noise_sample_count: isUsingBLE ? 1 : noiseReadings.length,
      motion_sample_count: isUsingBLE ? 1 : motionReadings.length,
      light_sample_count: isUsingBLE ? 1 : lightReadings.length,
      temp_sample_count: isUsingBLE ? 1 : tempReadings.length,
      humidity_sample_count: isUsingBLE ? 1 : humidityReadings.length,
      data_source: isUsingBLE ? "bluetooth" : "phone",
    };
  };

  // #region Microphone
  useEffect(() => {
    const shouldUsePhoneSensors = bleConnectionResolved && !isUsingBLE;

    if (
      microphoneEnabled === "true" &&
      isStopwatchRunning &&
      shouldUsePhoneSensors
    ) {
      console.log("Starting phone microphone...");
      RNSoundLevel.start();

      RNSoundLevel.onNewFrame = (data) => {
        setDB(data.value);
        const readableDB = Math.round(data.value + 110);
        fakeConvertedDBRef.current = readableDB;
      };

      const dBUpdateInterval = setInterval(() => {
        if (isStopwatchRunning) {
          setFakeRenderDB(fakeConvertedDBRef.current);
          if (dB != -120) {
            setNoiseReadings((prev) => [...prev, dB]);
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
  }, [
    microphoneEnabled,
    isStopwatchRunning,
    bleConnectionResolved,
    isUsingBLE,
  ]);
  // #endregion

  // #region Accelerometer (Motion)
  useEffect(() => {
    let accelerometerSubscription: any = null;

    const shouldUsePhoneSensors = bleConnectionResolved && !isUsingBLE;

    if (isStopwatchRunning && shouldUsePhoneSensors) {
      console.log("Starting phone accelerometer...");
      accelerometerSubscription = Accelerometer.addListener(({ x, y, z }) => {
        setMotionData({ x, y, z });

        const magnitude = Math.sqrt(x * x + y * y + z * z);
        setMotionMagnitude(magnitude);

        setMotionReadings((prev) => [...prev, magnitude]);
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
  }, [isStopwatchRunning, bleConnectionResolved, isUsingBLE]);
  // #endregion

  // #region Lighting (camera brightness)
  useEffect(() => {
    let lightingInterval: any;

    const shouldUsePhoneSensors = bleConnectionResolved && !isUsingBLE;

    if (
      isStopwatchRunning &&
      permission?.granted &&
      isCameraReady &&
      shouldUsePhoneSensors
    ) {
      console.log("Starting phone camera for lighting...");
      const initDelay = setTimeout(() => {
        lightingInterval = setInterval(async () => {
          try {
            if (!cameraRef.current) {
              console.log("Camera ref not available yet");
              return;
            }

            console.log("Attempting to take picture for lighting...");
            cameraRef.current.resumePreview();
            const photo = await cameraRef.current.takePictureAsync({
              base64: true,
              quality: 0.1,
              skipProcessing: true,
            });
            cameraRef.current.pausePreview();

            if (photo.base64) {
              const avg = estimateBrightness(photo.base64);
              setLighting(avg);

              if (avg !== null && avg > 0) {
                setLightReadings((prev) => [...prev, avg]);
              }
            } else {
              console.warn("No base64 data from camera");
            }
          } catch (err) {
            console.warn("Camera error:", err);
            setLighting(null);
          }
        }, 5000);
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
  }, [
    isStopwatchRunning,
    permission?.granted,
    isCameraReady,
    bleConnectionResolved,
    isUsingBLE,
  ]);

  function estimateBrightness(base64: string): number {
    try {
      const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, "");

      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      let sum = 0;
      let count = 0;

      const skipPixels = 100;

      for (let i = 0; i < bytes.length; i += skipPixels) {
        sum += bytes[i];
        count++;
      }

      const avg = count > 0 ? (sum / count / 255) * 100 : 0;
      const result = Math.round(Math.max(0, Math.min(100, avg)));

      console.log(
        `Brightness calculation: ${count} samples, avg=${avg.toFixed(
          2
        )}, result=${result}`
      );
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

  const getSmallestCameraResolution = async () => {
    const sizes = await cameraRef.current!.getAvailablePictureSizesAsync();
    const smallestSize = sizes
      .filter((s) => /^\d+x\d+$/.test(s))
      .sort((a, b) => {
        const [aw, ah] = a.split("x").map(Number);
        const [bw, bh] = b.split("x").map(Number);
        return aw * ah - bw * bh;
      })[0];

    console.log("Using smallest camera resolution:", smallestSize);
    return smallestSize;
  };
  // #endregion

  return (
    <BackgroundView>
      {permission?.granted && (
        <CameraView
          ref={cameraRef}
          style={{ width: 1, height: 1, position: "absolute", top: -100 }}
          facing="front"
          pictureSize={pictureSize}
          videoStabilizationMode="off"
          autofocus="off"
          active={isStopwatchRunning}
          onCameraReady={() => {
            console.log("Camera is ready!");
            getSmallestCameraResolution().then((size) => {
              setPictureSize(size);
            });
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
        <ThemedText style={[globalStyles.header1, styles.stopwatchText]}>
          {formatTime(
            sessionType === "untimed"
              ? elapsed
              : Math.abs(sessionDuration! * 60 * 1000 - elapsed)
          )}
        </ThemedText>
        <ThemedText style={globalStyles.mutedText}>
          {isStopwatchRunning
            ? isUsingBLE && latestBLEData
              ? `Collecting data via Bluetooth...`
              : `Collecting ambient data...`
            : "Paused"}
        </ThemedText>
        <ThemedText style={globalStyles.mutedText}>
          {isStopwatchRunning &&
            (isUsingBLE && latestBLEData
              ? `Sound level: ${latestBLEData.sound} dB (BLE)`
              : fakeRenderDB !== -1
              ? `Sound level: ${fakeRenderDB} dB`
              : "")}
        </ThemedText>
        <ThemedText style={globalStyles.mutedText}>
          {isStopwatchRunning &&
            (isUsingBLE && latestBLEData
              ? `Motion: ${Math.sqrt(
                  latestBLEData.accel.x ** 2 +
                    latestBLEData.accel.y ** 2 +
                    latestBLEData.accel.z ** 2
                ).toFixed(3)} (BLE)`
              : `Motion magnitude: ${motionMagnitude.toFixed(3)}`)}
        </ThemedText>
        <ThemedText style={globalStyles.mutedText}>
          {isUsingBLE && latestBLEData
            ? `Lighting: ${latestBLEData.light}/100 (BLE)`
            : lighting !== null
            ? `Lighting: ${lighting}/100`
            : ""}
        </ThemedText>
        <ThemedText style={globalStyles.mutedText}>
          {isUsingBLE && latestBLEData
            ? `Temperature: ${latestBLEData.temp}°C (BLE)`
            : "Temperature: Not available on phone"}
        </ThemedText>
        <ThemedText style={globalStyles.mutedText}>
          {isUsingBLE && latestBLEData
            ? `Humidity: ${latestBLEData.humidity}% (BLE)`
            : "Humidity: Not available on phone"}
        </ThemedText>
        {!permission?.granted && (
          <TextButton
            title="Enable Camera for Lighting"
            onPress={requestPermission}
            variant="secondary"
            style={{ marginTop: 20 }}
          />
        )}
      </View>

      <View
        style={[
          styles.bottomStickyView,
          { paddingBottom: useSafeAreaInsets().bottom },
        ]}
      >
        <TextButton
          title=""
          icon={
            isStopwatchRunning ? (
              <PauseSolid size={18} color={theme.colors.text} />
            ) : (
              // <Ionicons name="pause" size={18} color={theme.colors.text} />
              <PlaySolid size={18} color={theme.colors.text} />
              // <Ionicons name="play" size={18} color={theme.colors.text} />
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
      </View>

      <StyledModal
        title={"End Session"}
        body={"Are you sure you want to end the session?"}
        visible={endSessionModalVisible}
        setModalVisibleCallback={setEndSessionModalVisible}
        type="ask"
        onSubmit={() => {
          const sessionData = collectSessionData();
          router.replace({
            pathname: "/session/survey",
            params: {
              sessionData: JSON.stringify(sessionData),
            },
          });
        }}
        submitButtonText="End Session"
      />

      <StyledModal
        title={"Congratulations!"}
        body={"Times Up! End the session now?"}
        visible={timeUpModalVisible}
        setModalVisibleCallback={setTimeUpModalVisible}
        type="ask"
        onSubmit={() => {
          const sessionData = collectSessionData();
          router.replace({
            pathname: "/session/survey",
            params: {
              sessionData: JSON.stringify(sessionData),
            },
          });
        }}
        submitButtonText="End Session"
      />
    </BackgroundView>
  );
};

export default SessionScreen;

const styles = StyleSheet.create({
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
