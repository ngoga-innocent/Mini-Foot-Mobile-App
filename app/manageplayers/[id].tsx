import { db } from "@/app/config/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { ChevronLeft, Info } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.65;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

export default function PlayerProfile() {
  const { id } = useLocalSearchParams();
  const [player, setPlayer] = useState<any>(null);
  const rotation = useSharedValue(0);
  const inset = useSafeAreaInsets();
  const router = useRouter();
  // Flip toggle
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "players", id as string), (docSnap) => {
      setPlayer(docSnap.data());
    });

    // Initial flip animation
    rotation.value = withTiming(180, { duration: 1200 });

    return unsub;
  }, []);

  const flipCard = () => {
    rotation.value = withTiming(flipped ? 180 : 0, { duration: 800 });
    setFlipped(!flipped);
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value}deg` }],
    opacity: interpolate(rotation.value, [0, 90], [1, 0]),
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value + 180}deg` }],
    opacity: interpolate(rotation.value, [90, 180], [0, 1]),
  }));

  if (!player) return null;

  return (
    <View style={styles.container}>
      <View
        style={{
          paddingTop: inset.top,
          paddingBottom: inset.top,
          width: Dimensions.get("screen").width * 0.9,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.navigate("/(tabs)")
          }
        >
          <ChevronLeft
            size={Dimensions.get("screen").width * 0.1}
            color="#fff"
          />
        </TouchableOpacity>
        <Text style={styles.title}>Player Card</Text>
        <Info size={Dimensions.get("screen").width * 0.08} color="#fff" />
      </View>

      {/* Tap to flip */}
      <TouchableWithoutFeedback onPress={flipCard}>
        <View
          style={{ width: CARD_WIDTH, height: CARD_HEIGHT, marginBottom: 20 }}
        >
          {/* Front: Jersey Back */}
          <Animated.View
            style={[
              styles.card,
              styles.jerseyBack,
              frontStyle,
              styles.shadowGlow,
            ]}
          >
            <View style={styles.sleeveLeft} />
            <View style={styles.sleeveRight} />
            <Text style={styles.jerseyNumber}>{player.position}</Text>
          </Animated.View>

          {/* Back: Face */}
          <Animated.View
            style={[styles.card, styles.faceSide, backStyle, styles.shadowGlow]}
          >
            <Image
              source={{
                uri: player.photoUrl || "https://i.pravatar.cc/150?img=12",
              }}
              style={styles.face}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      {/* Player Name */}
      <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
        {player.name}
      </Text>

      {/* Stats */}
      <View style={styles.statsBox}>
        <Stat label="Goals" value={player.goals} />
        <Stat label="Assists" value={player.assists} />
        <Stat label="Matches" value={player.matchesPlayed} />
      </View>
    </View>
  );
}

const Stat = ({ label, value }: any) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    // paddingTop: 40,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    // marginBottom: 18,
    fontFamily: "SairaStencilOne-Regular",
  },
  header: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    // marginBottom: 20,
  },

  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
  },

  // Shadow & glow
  shadowGlow: {
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  },

  // Cartoon jersey back
  jerseyBack: {
    backgroundColor: "#22c55e",
  },
  sleeveLeft: {
    position: "absolute",
    left: -15,
    top: 20,
    width: 40,
    height: 50,
    backgroundColor: "#16a34a",
    borderRadius: 10,
  },
  sleeveRight: {
    position: "absolute",
    right: -15,
    top: 20,
    width: 40,
    height: 50,
    backgroundColor: "#16a34a",
    borderRadius: 10,
  },
  jerseyNumber: {
    fontSize: 70,
    color: "white",
    fontWeight: "bold",
  },

  // Face side
  faceSide: {
    backgroundColor: "#1e293b",
  },
  face: {
    width: "65%",
    height: "65%",
    borderRadius: 200,
  },

  name: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
    width: "85%",
    fontFamily: "SairaStencilOne-Regular",
  },

  statsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    marginTop: 25,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#38bdf8",
    fontSize: 22,
    fontFamily: "SairaStencilOne-Regular",
    fontWeight: "bold",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 12,
  },
});
