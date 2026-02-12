import { db } from "@/app/config/firebase";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function AddMatch() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);

  const [goalEvents, setGoalEvents] = useState<any[]>([]);
  const [scorer, setScorer] = useState<string | null>(null);
  const [assist, setAssist] = useState<string | null>(null);
  const inset = useSafeAreaInsets();
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "players"), (snap) =>
      setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    return unsub;
  }, []);

  const togglePlayer = (id: string, team: "A" | "B") => {
    if (team === "A") {
      setTeamA((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
      );
      setTeamB((prev) => prev.filter((p) => p !== id));
    } else {
      setTeamB((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
      );
      setTeamA((prev) => prev.filter((p) => p !== id));
    }
  };

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || "";

  // 🔥 Count goals per player (LIVE)
  const goalCount = (id: string) =>
    goalEvents.filter((e) => e.scorerId === id).length;

  const assistCount = (id: string) =>
    goalEvents.filter((e) => e.assistId === id).length;

  const addGoal = () => {
    if (!scorer) return;

    const team = teamA.includes(scorer) ? "A" : "B";

    setGoalEvents((prev) => [
      ...prev,
      { team, scorerId: scorer, assistId: assist || null },
    ]);

    // reset only assist so user can add another goal fast
    setAssist(null);
  };

  const saveMatch = async () => {
    setLoading(true);
    await addDoc(collection(db, "matches"), {
      teamAPlayers: teamA,
      teamBPlayers: teamB,
      events: goalEvents,

      // 🔥 IMPORTANT FIELDS
      date: serverTimestamp(), // for ordering
      dateString: dayjs().format("YYYY-MM-DD"), // for filtering

      createdAt: serverTimestamp(),
    });

    const participants = [...teamA, ...teamB];

    for (const id of participants) {
      await updateDoc(doc(db, "players", id), {
        matchesPlayed: increment(1),
      });
    }

    for (const e of goalEvents) {
      await updateDoc(doc(db, "players", e.scorerId), {
        goals: increment(1),
      });
      if (e.assistId) {
        await updateDoc(doc(db, "players", e.assistId), {
          assists: increment(1),
        });
      }
    }

    setLoading(false);
    router.navigate("/matches");
  };

  const PlayerCard = ({ id, selectable = true, selected, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!selectable}
      style={[styles.card, selected && styles.selected]}
    >
      <Text style={styles.name}>{getPlayerName(id)}</Text>

      {step >= 2 && (
        <View style={styles.badges}>
          {goalCount(id) > 0 && (
            <Text style={styles.goalBadge}>⚽ {goalCount(id)}</Text>
          )}
          {assistCount(id) > 0 && (
            <Text style={styles.assistBadge}>🎯 {assistCount(id)}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{ zIndex: 10 }}>
        <Spinner
          visible={loading}
          textContent="Saving Match..."
          textStyle={{ color: "#fff" }}
        />
      </View>
      <View
        style={{
          paddingTop: inset.top,
          flexDirection: "row",
          gap: 12,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.header}>New Match</Text>
      </View>
      <ScrollView>
        {/* STEP 1 — TEAMS */}
        {step === 1 && (
          <>
            <Text style={styles.title}>Team A</Text>
            <View style={styles.grid}>
              {players.map((p) => (
                <PlayerCard
                  key={p.id}
                  id={p.id}
                  selected={teamA.includes(p.id)}
                  onPress={() => togglePlayer(p.id, "A")}
                />
              ))}
            </View>

            <Text style={styles.title}>Team B</Text>
            <View style={styles.grid}>
              {players.map((p) => (
                <PlayerCard
                  key={p.id + "b"}
                  id={p.id}
                  selected={teamB.includes(p.id)}
                  onPress={() => togglePlayer(p.id, "B")}
                />
              ))}
            </View>
          </>
        )}

        {/* STEP 2 — SCORER */}
        {step === 2 && (
          <>
            <Text style={styles.title}>Who Scored?</Text>
            <View style={styles.grid}>
              {[...teamA, ...teamB].map((id) => (
                <PlayerCard
                  key={id}
                  id={id}
                  selected={scorer === id}
                  onPress={() => setScorer(id)}
                />
              ))}
            </View>
          </>
        )}

        {/* STEP 3 — ASSIST + ADD */}
        {step === 3 && (
          <>
            <Text style={styles.title}>Assist Provider (Optional)</Text>
            <View style={styles.grid}>
              {[...teamA, ...teamB].map((id) => (
                <PlayerCard
                  key={id}
                  id={id}
                  selectable={id !== scorer}
                  selected={assist === id}
                  onPress={() => setAssist(id)}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.goalBtn} onPress={addGoal}>
              <Text style={styles.goalBtnText}>+ Add Goal</Text>
            </TouchableOpacity>

            {goalEvents.map((e, i) => (
              <Text key={i} style={styles.event}>
                {e.team} ⚽ {getPlayerName(e.scorerId)}{" "}
                {e.assistId && `🎯 ${getPlayerName(e.assistId)}`}
              </Text>
            ))}
          </>
        )}

        {/* STEP 4 — SUMMARY */}
        {step === 4 && (
          <>
            <Text style={styles.title}>Match Summary</Text>
            {goalEvents.map((e, i) => (
              <Text key={i} style={styles.event}>
                {e.team} ⚽ {getPlayerName(e.scorerId)}{" "}
                {e.assistId && `🎯 ${getPlayerName(e.assistId)}`}
              </Text>
            ))}
          </>
        )}
      </ScrollView>

      {/* NAV */}
      <View style={styles.nav}>
        {step > 1 && (
          <TouchableOpacity onPress={() => setStep(step - 1)}>
            <Text style={styles.navBtn}>Back</Text>
          </TouchableOpacity>
        )}
        {step < 4 ? (
          <TouchableOpacity onPress={() => setStep(step + 1)}>
            <Text style={styles.navBtn}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={saveMatch}>
            <Text style={styles.saveBtn}>Save Match</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
  header: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  title: { color: "white", fontSize: 18, marginVertical: 10 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  selected: { borderColor: "#22c55e", borderWidth: 2 },

  name: { color: "white", fontWeight: "bold" },

  badges: { flexDirection: "row", marginTop: 6 },
  goalBadge: { color: "#22c55e", marginRight: 10, fontWeight: "bold" },
  assistBadge: { color: "#38bdf8", fontWeight: "bold" },

  goalBtn: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 12,
  },
  goalBtnText: { color: "white", fontWeight: "bold" },

  event: { color: "white", marginVertical: 4 },

  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  navBtn: { color: "#38bdf8", fontSize: 18 },
  saveBtn: { color: "#22c55e", fontSize: 20, fontWeight: "bold" },
});
