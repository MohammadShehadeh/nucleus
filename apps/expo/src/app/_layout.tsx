import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

import { queryClient } from "~/utils/api";

import "../styles.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#ff6900",
          },
          contentStyle: {
            backgroundColor: colorScheme === "dark" ? "#09090B" : "#FFFFFF",
          },
        }}
      />
      <StatusBar />
    </QueryClientProvider>
  );
}
