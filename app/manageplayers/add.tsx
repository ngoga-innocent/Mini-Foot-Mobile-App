import { addPlayer } from "@/app/src/services/playerService";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ChevronLeft, Info } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { uploadImageToCloudinary } from "../src/services/uploadService";
// import { uploadPlayerImage } from "../src/services/uploadService";
export default function AddPlayerScreen() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const inset = useSafeAreaInsets();
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !number) {
      Alert.alert("Missing Info", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      let imageUrl = "";

      if (image) {
        // Assign to outer variable, do NOT use const here
        imageUrl = await uploadImageToCloudinary(image);
      }

      await addPlayer({
        name,
        position: number,
        photoUrl: imageUrl, // now contains the Cloudinary URL
        goals: 0,
        assists: 0,
        matchesPlayed: 0,
        createdAt: new Date(),
        nickname: "",
      });

      Alert.alert("Success", "Player added ⚽");
      setLoading(false);
      router.back();
    } catch (error) {
      console.log("error in saving images", error);
      Alert.alert("Error", "Failed to save player");
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingVertical: inset.top }]}>
      <View
        style={{
          backgroundColor: "#111827",
          zIndex: 20,
        }}
      >
        <Spinner
          visible={loading}
          textContent="Adding a player ..."
          textStyle={{
            color: "white",
            fontFamily: "FascinateInline-Regular",
            fontSize: 16,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: Dimensions.get("screen").width * 0.9,
          paddingBottom: inset.top,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.navigate("/(tabs)/players")
          }
        >
          <ChevronLeft
            color="#fff"
            size={Dimensions.get("screen").width * 0.09}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Add Player</Text>
        <TouchableOpacity>
          <Info color="#fff" size={Dimensions.get("screen").width * 0.09} />
        </TouchableOpacity>
      </View>
      <View style={{ zIndex: 50 }}>
        <Spinner textContent="Adding a player ..." />
      </View>

      {/* Profile Image */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Image
          source={{
            uri: image || "https://i.pravatar.cc/150?img=8",
          }}
          style={styles.image}
        />
        <Text style={styles.changeText}>Change Photo</Text>
      </TouchableOpacity>

      {/* Name Input */}
      <TextInput
        placeholder="Player Name"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      {/* Jersey Number */}
      <TextInput
        placeholder="Player Number"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={number}
        keyboardType="numeric"
        onChangeText={setNumber}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Player</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    // marginBottom: 20,
  },
  imagePicker: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  changeText: {
    color: "#38bdf8",
  },
  input: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 10,
    color: "white",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
