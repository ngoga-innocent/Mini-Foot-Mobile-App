import { db } from "@/app/config/firebase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Card, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const inset = useSafeAreaInsets();
  const [stats, setStats] = useState({
    matches: 0,
    goals: 0,
    topScorer: { id: null, name: "-", goals: 0 },
    topAssist: { id: null, name: "-", assists: 0 },
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Matches count
        const matchesSnap = await getDocs(collection(db, "matches"));

        // Players sorted by goals
        const topScorerQ = query(
          collection(db, "players"),
          orderBy("goals", "desc"),
          limit(1),
        );
        const topAssistQ = query(
          collection(db, "players"),
          orderBy("assists", "desc"),
          limit(1),
        );

        const [scorerSnap, assistSnap] = await Promise.all([
          getDocs(topScorerQ),
          getDocs(topAssistQ),
        ]);

        const scorer = scorerSnap.docs[0]?.data();
        const assist = assistSnap.docs[0]?.data();
        console.log("Top Scorer:", scorer);
        // Total goals from all players
        const playersSnap = await getDocs(collection(db, "players"));
        let totalGoals = 0;
        playersSnap.forEach((p) => {
          totalGoals += p.data().goals || 0;
        });

        setStats({
          matches: matchesSnap.size,
          goals: totalGoals,
          topScorer: {
            id: scorer?.id || null,
            name: scorer?.name || "N/A",
            goals: scorer?.goals || 0,
          },
          topAssist: {
            id: assist?.id || null,
            name: assist?.name || "N/A",
            assists: assist?.assists || 0,
          },
        });

        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loader, styles.container]}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: inset.top, marginBottom: 20 }}>
        <Text style={styles.title}>⚽ MINIFOOT</Text>
      </View>

      {/* SUMMARY CARDS */}
      <View style={styles.row}>
        <StatCard icon="football" label="Matches" value={stats.matches} />
        <StatCard icon="trophy" label="Goals" value={stats.goals} />
      </View>

      {/* TOP PLAYERS */}
      <Card
        // onPress={() => router.navigate(`/players/${stats?.topScorer?.id}`)}
        style={styles.highlightCard}
      >
        <Text style={styles.cardTitle}>Top Scorer</Text>
        <View style={styles.playerRow}>
          <Ionicons name="person" size={22} color="#22c55e" />
          <Text style={styles.playerName}>{stats.topScorer.name}</Text>
          <Text style={styles.playerStat}>{stats.topScorer.goals} Goals</Text>
        </View>
      </Card>

      <Card style={styles.highlightCard}>
        <Text style={styles.cardTitle}>Top Assist Provider</Text>
        <View style={styles.playerRow}>
          <Ionicons name="person" size={22} color="#38bdf8" />
          <Text style={styles.playerName}>{stats.topAssist.name}</Text>
          <Text style={styles.playerStat}>
            {stats.topAssist.assists} Assists
          </Text>
        </View>
      </Card>

      {/* QUICK ACTIONS */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <DashboardButton
        icon="add-circle"
        label="Create Match"
        color="#22c55e"
        onPress={() => router.push("/managematches/create")}
      />

      <DashboardButton
        icon="people"
        label="Players"
        color="#3b82f6"
        onPress={() => router.push("/players")}
      />

      <DashboardButton
        icon="stats-chart"
        label="Statistics"
        color="#f59e0b"
        onPress={() => router.push("/matches")}
      />
    </ScrollView>
  );
}

/* REUSABLE STAT CARD */
const StatCard = ({ icon, label, value }: any) => (
  <Card style={styles.statCard}>
    <Ionicons name={icon} size={26} color="#22c55e" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Card>
);

/* DASHBOARD BUTTON */
const DashboardButton = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity
    style={[styles.actionBtn, { borderColor: color }]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={22} color={color} />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220", padding: 18 },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 18,
    fontFamily: "FascinateInline-Regular",
  },

  row: { flexDirection: "row", justifyContent: "space-between" },

  statCard: {
    width: "48%",
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#111827",
    alignItems: "center",
  },

  statValue: { color: "white", fontSize: 23, fontWeight: "bold", marginTop: 6 },
  statLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontFamily: "SairaStencilOne-Regular",
  },

  highlightCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#111827",
  },

  cardTitle: {
    color: "#94a3b8",
    marginBottom: 8,
    fontFamily: "SairaStencilOne-Regular",
  },

  playerRow: { flexDirection: "row", alignItems: "center" },

  playerName: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    flex: 1,
    fontFamily: "SairaStencilOne-Regular",
  },

  playerStat: {
    color: "#22c55e",
    // fontWeight: "bold",
    fontFamily: "FascinateInline-Regular",
  },

  sectionTitle: {
    color: "white",
    fontSize: 16,
    marginTop: 24,
    marginBottom: 10,
    fontFamily: "SairaStencilOne-Regular",
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 12,
  },

  actionText: {
    color: "white",
    marginLeft: 12,
    fontWeight: "bold",
    fontFamily: "SairaStencilOne-Regular",
  },
});
