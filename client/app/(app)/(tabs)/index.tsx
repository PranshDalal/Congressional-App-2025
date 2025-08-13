import React from "react";
import BackgroundView from "@/components/BackgroundView";
import TextButton from "@/components/button/TextButton";
import { useStartSession } from "@/hooks/useStartSession";
import SizedBox from "@/components/SizedBox";
import ThemedText from "@/components/ThemedText";
import globalStyles from "@/styles/globalStyles";
import { View, Image, Dimensions } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SpeakerWaveOutline, SunOutline } from "@/assets/icons/heroicons";

const { width } = Dimensions.get("window");

const IndexScreen = () => {
  const startSession = useStartSession();

  return (
    <BackgroundView
      withSafeArea
      withScreenPadding
      style={{
        flex: 1,
        justifyContent: "center",
        // backgroundColor: "#121126",
        paddingHorizontal: 25,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 40 }}>
        <Image
          source={require("@/assets/images/hero.png")}
          style={{
            width: width * 0.7,
            height: width * 0.5,
            resizeMode: "contain",
            marginBottom: 30,
            borderRadius: 20,
            shadowColor: "#8a7fe8",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
          }}
        />

        <ThemedText
          style={[
            globalStyles.header2,
            {
              textAlign: "center",
              color: "#8a7fe8",
              fontWeight: "bold",
              fontSize: 28,
              textShadowColor: "rgba(138, 127, 232, 0.3)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 5,
            },
          ]}
        >
          Personalized Environmental Focus Insights for ADHD
        </ThemedText>

        <SizedBox height={12} />

        <ThemedText
          style={{
            textAlign: "center",
            color: "#b3afdb",
            fontSize: 18,
            marginHorizontal: 10,
            fontWeight: "600",
            lineHeight: 24,
          }}
        >
          Understand how noise, light, movement, and more affect your focus —
          personalized for you.
        </ThemedText>

        <SizedBox height={30} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            width: "90%",
            marginBottom: 40,
          }}
        >
          <View style={{ alignItems: "center", width: 60 }}>
            <SunOutline
              size={45}
              color="#b3afdb"
              style={{
                opacity: 0.7,
              }}
            />
            <ThemedText
              style={{
                color: "#b3afdb",
                fontSize: 12,
                marginTop: 6,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Light
            </ThemedText>
          </View>
          <View style={{ alignItems: "center", width: 60 }}>
            <SpeakerWaveOutline
              size={45}
              color="#b3afdb"
              style={{
                opacity: 0.7,
              }}
            />
            <ThemedText
              style={{
                color: "#b3afdb",
                fontSize: 12,
                marginTop: 6,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Noise
            </ThemedText>
          </View>
          {/* <View style={{ alignItems: "center", width: 60 }}>
            <Icon
              name={"run"}
              size={45}
              color="#b3afdb"
              style={{
                opacity: 0.7,
                textShadowColor: "rgba(179, 175, 219, 0.15)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 4,
              }}
            />
            <ThemedText
              style={{
                color: "#b3afdb",
                fontSize: 12,
                marginTop: 6,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Movement
            </ThemedText>
          </View>
          <View style={{ alignItems: "center", width: 60 }}>
            <Icon
              name={"fan"}
              size={45}
              color="#b3afdb"
              style={{
                opacity: 0.7,
                textShadowColor: "rgba(179, 175, 219, 0.15)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 4,
              }}
            />
            <ThemedText
              style={{
                color: "#b3afdb",
                fontSize: 12,
                marginTop: 6,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Airflow
            </ThemedText>
          </View> */}

          {/* {[
            { name: "weather-sunny", label: "Light" },
            { name: "volume-high", label: "Noise" },
            { name: "run", label: "Movement" },
            { name: "fan", label: "Airflow" },
          ].map(({ name, label }) => (
            <View key={name} style={{ alignItems: "center", width: 60 }}>
              <Icon
                name={name}
                size={45}
                color="#b3afdb"
                style={{
                  opacity: 0.7,
                  textShadowColor: "rgba(179, 175, 219, 0.15)",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 4,
                }}
              />
              <ThemedText
                style={{
                  color: "#b3afdb",
                  fontSize: 12,
                  marginTop: 6,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {label}
              </ThemedText>
            </View>
          ))} */}
        </View>

        <TextButton
          title="Start Session"
          textStyle={{
            fontWeight: "700",
            fontSize: 20,
            color: "#121126",
            textShadowColor: "transparent",
          }}
          onPress={startSession}
          style={{
            paddingVertical: 16,
            paddingHorizontal: 60,
            borderRadius: 30,
            backgroundColor: "#8a7fe8",
            shadowColor: "#8a7fe8",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 7,
          }}
        />
      </View>
    </BackgroundView>
  );
};

export default IndexScreen;
