import { Stack } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "LMS" }} />
      <View className="h-full w-full p-4">
        <Text className="text-foreground pb-2 text-center text-5xl font-bold">
          Welcome to <Text className="text-primary">LMS</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
