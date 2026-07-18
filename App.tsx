/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';


function App() {
  const isDarkMode = useColorScheme() === 'dark';
  console.log('System Fonts:', Constants.systemFonts);
  console.log('===== Expo Updates =====');
  console.log('Update ID:', Updates.updateId);
  console.log('Channel:', Updates.channel);
  console.log('Runtime Version:', Updates.runtimeVersion);
  console.log('Is Embedded Launch:', Updates.isEmbeddedLaunch);
  console.log('Is Emergency Launch:', Updates.isEmergencyLaunch);
  console.log('Third OTA update');
  console.log("Updates.isEnabled:", Updates.isEnabled);
  console.log("Updates.updateUrl:", Updates.updateUrl);
  console.log("Updates.manifest:", Updates.manifest);

  useEffect(() => {
    async function testOTA() {
      try {
        console.log("===== OTA CHECK =====");

        const update = await Updates.checkForUpdateAsync();

        console.log("Is update available:", update.isAvailable);

        if (update.isAvailable) {
          console.log("Downloading update...");
          await Updates.fetchUpdateAsync();
          console.log("Downloaded successfully");

          console.log("Reloading...");
          await Updates.reloadAsync();
        } else {
          console.log("No update available");
        }
      } catch (e: any) {
        console.log("OTA ERROR JSON:", JSON.stringify(e, null, 2));
        console.log("OTA ERROR:", e);
        console.log("OTA ERROR MESSAGE:", e?.message);
        console.log("OTA ERROR CODE:", e?.code);
        console.log("OTA ERROR CAUSE:", e?.cause);
      }
    }

    testOTA();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
      <Text >Hiii OTA Version 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
