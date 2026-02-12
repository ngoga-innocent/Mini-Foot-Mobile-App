import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import "../global.css";
import { theme } from "./src/theme/theme";

export default function Layout() {
  // 1️⃣ Load custom fonts
  const [fontsLoaded] = useFonts({
    "FascinateInline-Regular": require("../assets/fonts/FascinateInline-Regular.ttf"),
    "SairaStencilOne-Regular": require("../assets/fonts/SairaStencilOne-Regular.ttf"),
    // "Oswald-Bold": require("../assets/fonts/Oswald-Bold.ttf"),
  });

  // 2️⃣ Wait for fonts to load
  if (!fontsLoaded) {
    return null; // or a loading spinner if you prefer
  }

  // 3️⃣ Render the app once fonts are ready
  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </PaperProvider>
  );
}
