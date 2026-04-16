import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useMemo } from 'react';

import Accueil from './src/screens/Accueil';
import Activities from './src/screens/Activities';
import Dashboard from './src/screens/Dashboard';
import ForgotPassword from './src/screens/ForgotPassword';
import Goals from './src/screens/Goals';
import Heatmap from './src/screens/Heatmap';
import Notifications from './src/screens/Notifications';
import Profile from './src/screens/Profile';
import Progress from './src/screens/Progress';
import Settings from './src/screens/Settings';
import SignIn from './src/screens/SignIn';
import SignUp from './src/screens/SignUp';
import { AuthProvider } from './src/context/AuthContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { themeMode } = useSettings();

  const navTheme = useMemo(() => {
    if (themeMode === 'dark') {
      return {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: '#0B1220',
          card: '#111827',
          text: '#F9FAFB',
          border: '#1F2937',
          primary: '#A78BFA',
        },
      };
    }

    return {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: '#F3F4F6',
        card: '#FFFFFF',
        text: '#111827',
        border: '#E5E7EB',
        primary: '#7A30FF',
      },
    };
  }, [themeMode]);

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Accueil" component={Accueil} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Activities" component={Activities} />
        <Stack.Screen name="Goals" component={Goals} />
        <Stack.Screen name="Progress" component={Progress} />
        <Stack.Screen name="Heatmap" component={Heatmap} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="Settings" component={Settings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SettingsProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SettingsProvider>
  );
}
