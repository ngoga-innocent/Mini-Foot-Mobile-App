import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // 1️⃣ Play whistle sound
    const playWhistle = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/animations/whistle.wav"), // your downloaded whistle
      );
      await sound.playAsync();
    };

    // 2️⃣ Speak "Mini Foot" immediately (or after whistle if you prefer)
    const speakMiniFoot = () => {
      Speech.speak("Mini Foot", {
        pitch: 1,
        rate: 0.9,
      });
    };

    // Start both
    playWhistle();
    setTimeout(() => {
      speakMiniFoot();
    }, 500);

    // 3️⃣ Navigate to tabs after 4 seconds
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/animations/soccer.json")}
        autoPlay
        loop={false}
        style={styles.lottie}
      />
      <Text
        style={{
          color: "white",
          fontSize: 30,
          fontWeight: "bold",
          fontFamily: "SairaStencilOne-Regular",
        }}
      >
        Mini Foot
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: width * 0.8,
    height: height * 0.5,
  },
});
