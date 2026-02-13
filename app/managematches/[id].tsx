import { db } from "@/app/config/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MatchDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const inset = useSafeAreaInsets();

  const [match, setMatch] = useState<any>(null);
  const [playersMap, setPlayersMap] = useState<any>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load players
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "players"), (snap) => {
      const map: any = {};
      snap.docs.forEach((d) => (map[d.id] = d.data().name));
      setPlayersMap(map);
    });
    return unsub;
  }, []);

  // Load match
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "matches", id as string), (snap) => {
      setMatch({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [id]);

  // Animate
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!match) return null;

  const scoreA = match.events?.filter((e: any) => e.team === "A").length || 0;
  const scoreB = match.events?.filter((e: any) => e.team === "B").length || 0;

  const teamAPlayers = match.teamAPlayers || [];
  const teamBPlayers = match.teamBPlayers || [];
  const events = match.events || [];

  return (
    <View style={styles.container}>
      {/* 🔝 TOP BAR */}
      <View style={[styles.topBar, { paddingTop: inset.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Match Details</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 🏆 SCOREBOARD */}
        <View style={styles.scoreHeader}>
          <View style={styles.scoreRow}>
            <Text style={styles.teamName}>Team A</Text>
            <Text style={styles.scoreDivider}>-</Text>
            <Text style={styles.teamName}>Team B</Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.score}>{scoreA}</Text>
            <Text style={styles.scoreDivider}>-</Text>
            <Text style={styles.score}>{scoreB}</Text>
          </View>
        </View>

        {/* 👥 LINEUPS */}
        <View style={styles.lineupContainer}>
          <Text style={styles.lineupTitle}>Lineups</Text>

          <View style={styles.lineupRow}>
            <View style={styles.teamColumn}>
              <Text style={styles.teamHeader}>Team A</Text>
              {teamAPlayers.map((id: string) => (
                <TouchableOpacity
                  key={id}
                  style={styles.playerPill}
                  onPress={() => router.push(`/manageplayers/${id}`)}
                >
                  <Ionicons name="person" size={14} color="#22c55e" />
                  <Text style={styles.playerText}>{playersMap[id]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.teamColumn}>
              <Text style={styles.teamHeader}>Team B</Text>
              {teamBPlayers.map((id: string) => (
                <TouchableOpacity
                  key={id}
                  style={styles.playerPill}
                  onPress={() => router.push(`/manageplayers/${id}`)}
                >
                  <Ionicons name="person" size={14} color="#3b82f6" />
                  <Text style={styles.playerText}>{playersMap[id]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ⚽ GOALS TIMELINE */}
        <View style={styles.section}>
          {events.map((event: any, index: number) => {
            const isTeamA = event.team === "A";

            return (
              <Animated.View
                key={index}
                style={[
                  styles.eventRow,
                  {
                    justifyContent: isTeamA ? "flex-start" : "flex-end",
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.goalCard}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/manageplayers/${event.scorerId}`)
                    }
                  >
                    <Text style={styles.goalText}>
                      ⚽ {playersMap[event.scorerId]}
                    </Text>
                  </TouchableOpacity>

                  {event.assistId && (
                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/manageplayers/${event.assistId}`)
                      }
                    >
                      <Text style={styles.assistText}>
                        🎯 {playersMap[event.assistId]}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#111827",
  },

  topTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  scoreHeader: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },

  teamName: { color: "#94a3b8", fontSize: 15 },

  scoreRow: { flexDirection: "row", alignItems: "center" },

  score: {
    fontSize: 54,
    color: "#22c55e",
    fontWeight: "bold",
  },

  scoreDivider: {
    fontSize: 36,
    color: "white",
    marginHorizontal: 12,
  },

  lineupContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },

  lineupTitle: { color: "#94a3b8", fontSize: 13, marginBottom: 10 },

  lineupRow: { flexDirection: "row", justifyContent: "space-between" },

  teamColumn: { width: "48%" },

  teamHeader: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 8,
  },

  playerPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 6,
  },

  playerText: { color: "white", marginLeft: 6, fontSize: 12 },

  section: { padding: 20 },

  eventRow: { marginBottom: 18, flexDirection: "row" },

  goalCard: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    maxWidth: "75%",
  },

  goalText: { color: "white", fontWeight: "bold", fontSize: 14 },

  assistText: {
    color: "#38bdf8",
    fontSize: 12,
    marginTop: 4,
  },
});
