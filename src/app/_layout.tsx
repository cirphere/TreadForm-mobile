import { Stack } from 'expo-router';
import { AppProvider } from '@/context/AppContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="analyzing" options={{ gestureEnabled: false }} />
        <Stack.Screen name="result" />
        <Stack.Screen name="add-member" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </AppProvider>
  );
}
