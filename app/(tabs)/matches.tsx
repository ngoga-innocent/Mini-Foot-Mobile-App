import { db } from "@/app/config/firebase";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MatchesScreen() {
  const router = useRouter();
  const inset = useSafeAreaInsets();

  const [matchesByDate, setMatchesByDate] = useState<Record<string, any[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 FETCH MATCHES
  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("date", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const grouped: Record<string, any[]> = {};

      snap.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as any;
        const date = data.dateString;

        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(data);
      });

      setMatchesByDate(grouped);

      const dates = Object.keys(grouped);
      if (!selectedDate && dates.length) setSelectedDate(dates[0]);

      setLoading(false);
      setRefreshing(false);
    });

    return unsub;
  }, []);

  const matchDates = useMemo(() => Object.keys(matchesByDate), [matchesByDate]);

  const matches = selectedDate ? matchesByDate[selectedDate] || [] : [];

  const onRefresh = () => {
    setRefreshing(true);
    // Firestore listener auto updates, just show spinner briefly
    setTimeout(() => setRefreshing(false), 800);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ color: "#94a3b8", marginTop: 10 }}>
          Loading matches...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔝 TOP BAR */}
      <View style={[styles.topBar, { paddingTop: inset.top }]}>
        <Text style={styles.title}>Mini Foot</Text>

        <View style={styles.icons}>
          <TouchableOpacity
            onPress={() => router.push("/managematches/create")}
          >
            <Ionicons name="add-circle" size={26} color="#22c55e" />
          </TouchableOpacity>

          <Ionicons
            name="search"
            size={22}
            color="white"
            style={{ marginLeft: 16 }}
          />
          <Ionicons
            name="notifications-outline"
            size={22}
            color="white"
            style={{ marginLeft: 16 }}
          />
        </View>
      </View>

      {/* 📅 DATE BAR (NO DUPLICATES) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.dateBar, { height: "auto", flexGrow: 0 }]}
        contentContainerStyle={{ alignItems: "flex-start", paddingRight: 16 }}
      >
        {matchDates.map((date) => {
          const isSelected = date === selectedDate;

          return (
            <TouchableOpacity
              key={date}
              style={[styles.dateItem, isSelected && styles.dateItemActive]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayText, isSelected && styles.activeText]}>
                {dayjs(date).format("ddd")}
              </Text>
              <Text style={[styles.dateText, isSelected && styles.activeText]}>
                {dayjs(date).format("DD MMM")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ⚽ MATCH LIST */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        {matches.length === 0 ? (
          <Text style={styles.noMatches}>No matches on this date</Text>
        ) : (
          matches.map((item) => {
            const scoreA =
              item.events?.filter((e: any) => e.team === "A").length || 0;
            const scoreB =
              item.events?.filter((e: any) => e.team === "B").length || 0;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.matchCard}
                onPress={() => router.push(`/managematches/${item.id}`)}
              >
                <Text style={styles.league}>
                  {item.league || "Friendly Match"}
                </Text>

                <View style={styles.matchRow}>
                  <Text style={styles.team}>{item.teamAName || "Team A"}</Text>
                  <Text style={styles.score}>
                    {scoreA} - {scoreB}
                  </Text>
                  <Text style={styles.team}>{item.teamBName || "Team B"}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },

  loaderContainer: {
    flex: 1,
    backgroundColor: "#0b1220",
    justifyContent: "center",
    alignItems: "center",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#111827",
  },
  title: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
    // marginBottom: 18,
    fontFamily: "FascinateInline-Regular",
  },
  logo: { color: "white", fontSize: 22, fontWeight: "bold" },
  icons: { flexDirection: "row", alignItems: "center" },

  dateBar: {
    paddingVertical: 8,
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    height: 5,
  },

  dateItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: "#111827",
  },

  dateItemActive: { backgroundColor: "#22c55e" },

  dayText: { color: "#94a3b8", fontSize: 11 },
  dateText: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },
  activeText: { color: "#000" },

  matchCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  league: {
    color: "#94a3b8",
    fontFamily: "SairaStencilOne-Regular",
    fontSize: 12,
    marginBottom: 8,
  },

  matchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  team: {
    color: "white",
    fontSize: 16,
    width: "35%",
    fontFamily: "SairaStencilOne-Regular",
    fontWeight: "bold",
  },

  score: {
    color: "#22c55e",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "SairaStencilOne-Regular",
  },

  noMatches: {
    textAlign: "center",
    color: "#94a3b8",
    marginTop: 40,
  },
});
