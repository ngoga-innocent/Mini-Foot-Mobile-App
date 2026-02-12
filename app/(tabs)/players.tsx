import {
  deletePlayer,
  subscribeToPlayers,
} from "@/app/src/services/playerService";
import { useRouter } from "expo-router";
import { Plus, Search, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SwipeListView } from "react-native-swipe-list-view";

interface Player {
  id: string;
  name: string;
  nickname: string;
  position: string;
  goals: number;
  matchesPlayed: number;
  photoUrl?: string;
}

export default function PlayersScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchWidth = useRef(new Animated.Value(0)).current;

  const router = useRouter();
  const inset = useSafeAreaInsets();

  useEffect(() => {
    const unsub = subscribeToPlayers(setPlayers);
    return unsub;
  }, []);

  const toggleSearch = () => {
    if (searchOpen) {
      Animated.timing(searchWidth, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start(() => setSearchOpen(false));
    } else {
      setSearchOpen(true);
      Animated.timing(searchWidth, {
        toValue: 220,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  };

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={[styles.container, { paddingTop: inset.top + 10 }]}>
      {/* 🔝 HEADER */}
      <View style={styles.headerBar}>
        {!searchOpen && <Text style={styles.title}>Team Players</Text>}

        {searchOpen && (
          <Animated.View style={[styles.searchBox, { width: searchWidth }]}>
            <TextInput
              placeholder="Search player..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              autoFocus
            />
          </Animated.View>
        )}

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleSearch} style={styles.iconBtn}>
            {searchOpen ? (
              <X color="white" size={22} />
            ) : (
              <Search color="white" size={22} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/manageplayers/add")}
            style={[styles.iconBtn, styles.addBtn]}
          >
            <Plus color="white" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 📋 PLAYER LIST */}
      <SwipeListView
        ListEmptyComponent={() => {
          return (
            <View>
              <Text style={styles.noPlayersText}>
                No players found. Tap the + button to add your first player!
              </Text>
            </View>
          );
        }}
        data={filteredPlayers}
        keyExtractor={(item: Player) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.playerCard}
            onPress={() => router.push(`/manageplayers/${item.id}`)}
          >
            <Image
              source={{
                uri: item.photoUrl || "https://i.pravatar.cc/150?img=3",
              }}
              style={styles.playerAvatar}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.playerName}>{item.name}</Text>
              <Text style={styles.playerPosition}>{item.position}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{item.goals}</Text>
                  <Text style={styles.statLabel}>Goals</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{item.matchesPlayed}</Text>
                  <Text style={styles.statLabel}>Matches</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        renderHiddenItem={({ item }) => (
          <View style={styles.rowBack}>
            <TouchableOpacity
              style={styles.editBtn}
              // onPress={() => router.push(`/manageplayers/edit/${item.id}`)}
            >
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deletePlayer(item.id)}
            >
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-150}
        showsVerticalScrollIndicator={false}
      />

      {/* ➕ FLOATING BUTTON */}
      {/* <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/manageplayers/add")}
      >
        <Plus color="white" size={28} />
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    // marginBottom: 18,
    fontFamily: "SairaStencilOne-Regular",
  },
  noPlayersText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 50,
  },

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#1e293b",
    borderRadius: 14,
    elevation: 6,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },

  headerActions: {
    flexDirection: "row",
  },

  iconBtn: {
    marginLeft: 10,
    padding: 8,
  },

  addBtn: {
    backgroundColor: "#22c55e",
    borderRadius: 10,
  },

  searchBox: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    justifyContent: "center",
  },

  searchInput: {
    color: "white",
  },

  playerCard: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    alignItems: "center",
    elevation: 8,
  },

  playerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#22c55e",
  },

  playerName: {
    color: "white",
    fontSize: 18,
    fontFamily: "SairaStencilOne-Regular",
    fontWeight: "bold",
  },

  playerPosition: {
    color: "#94a3b8",
    marginBottom: 6,
  },

  statsRow: {
    flexDirection: "row",
  },

  statBox: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
  },

  statValue: {
    color: "#22c55e",
    fontWeight: "bold",
    fontFamily: "SairaStencilOne-Regular",
  },

  statLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontFamily: "SairaStencilOne-Regular",
  },

  rowBack: {
    alignItems: "center",
    backgroundColor: "#1e293b",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 15,
    marginBottom: 14,
    borderRadius: 16,
  },

  editBtn: {
    backgroundColor: "#3b82f6",
    width: 70,
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginRight: 10,
  },

  deleteBtn: {
    backgroundColor: "#ef4444",
    width: 70,
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },

  actionText: {
    color: "white",
    fontWeight: "bold",
  },

  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#22c55e",
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
});
