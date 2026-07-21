/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
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
  console.log('OTA Test - SDK 29 / Target 35');
  console.log("Updates.isEnabled:", Updates.isEnabled);
  console.log("Updates.updateUrl:", Updates.updateUrl);
  console.log("Updates.manifest:", Updates.manifest);

  useEffect(() => {
    async function testOTA() {
      try {
        console.log("===== OTA CHECK =====");

        console.log("Updates.isEnabled:", Updates.isEnabled);
        console.log("Updates.updateUrl:", Updates.updateUrl);
        console.log("Updates.channel:", Updates.channel);
        console.log("Updates.runtimeVersion:", Updates.runtimeVersion);
        console.log("Updates.updateId:", Updates.updateId);
        console.log("Updates.isEmbeddedLaunch:", Updates.isEmbeddedLaunch);

        const update = await Updates.checkForUpdateAsync();

        console.log("Is update available:", update.isAvailable);

        if (update.isAvailable) {
          console.log("Downloading update...");

          const fetchedUpdate = await Updates.fetchUpdateAsync();
          console.log(
            "Fetched update:",
            JSON.stringify(fetchedUpdate, null, 2)
          );

          console.log("Downloaded successfully");

          console.log("Reloading...");
          await Updates.reloadAsync();
        } else {
          console.log("No update available");
        }
      } catch (e) {
        console.log("===== OTA ERROR =====");
        console.log("OTA ERROR JSON:", JSON.stringify(e, null, 2));
        console.log("OTA ERROR:", e);
        console.log("OTA ERROR MESSAGE:", e?.message);
        console.log("OTA ERROR CODE:", e?.code);
        console.log("OTA ERROR CAUSE:", e?.cause);

        // Read native Expo Updates logs
        try {
          const logs = await Updates.readLogEntriesAsync();

          console.log("===== EXPO UPDATES NATIVE LOGS =====");
          console.log(JSON.stringify(logs, null, 2));
        } catch (logError) {
          console.log(
            "Failed to read Expo Updates logs:",
            JSON.stringify(logError, null, 2)
          );
        }
      }
    }

    testOTA();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView>
      <ScrollView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Text>
       OTA build working properly JS based expo OTA with core dep - SDK 29 / Target 35
        </Text>
      <Text>Adobe libs, coachmark - rn-fetch-blob, Other libraries, Async storage and Axios2.0, Redux with eas build, Navigation Working fine OTA Test 4 with core dep - SDK 29 / Target 35</Text>
      <Text>
        {"\n"}
      </Text>
      <Text>react-native-gesture-handler@2.29.1 {"\n"} react-native-screens@4.20.0 {"\n"} @react-navigation/native@^7.3.11 {"\n"} @react-navigation/native-stack@7.6.2 {"\n"} @react-navigation/stack@7.6.3 {"\n"} @reduxjs/toolkit@2.10.1 {"\n"} redux@5.0.1 {"\n"} react-redux@9.2.0 {"\n"} redux-thunk@3.1.0 {"\n"} @react-native-async-storage/async-storage@2.2.0 {"\n"} axios@1.13.2</Text>
      <Text>
        {"\n"}
      </Text>
      <Text>@rnpm install \ommunity/checkbox@0.5.20 \
        @react-native-community/checkbox@0.5.20 \.2 \
        @react-native-masked-view/masked-view@0.3.2 \
        react-native-animatable@1.4.0 \field@8.0.1 \
        react-native-confirmation-code-field@8.0.1 \
        react-native-countdown-circle-timer@3.2.1 \
        react-native-element-dropdown@2.12.4 \
        react-native-elements@3.4.3 \croll-view@0.9.5 \
        react-native-keyboard-aware-scroll-view@0.9.5 \
        react-native-modal@14.0.0-rc.1 \2 \
        react-native-modal-dropdown@1.0.2 \1.1 \
        react-native-multi-toggle-switch@1.1.1 \
        react-native-paper@5.14.5 \group@3.1.0 \
        react-native-radio-buttons-group@3.1.0 \
        react-native-svg@15.15.1 \0 \
        react-native-tab-view@4.2.0 \3.0 \
        react-native-vector-icons@10.3.0 \.6.0 \
        react-native-walkthrough-tooltip@1.6.0 \
        toggle-switch-react-native@3.3.0 \</Text>
      <Text>
        {"\n"}
      </Text>
      <Text>comma-number@2.1.0 \
        d3-shape@3.2.0 \
        deprecated-react-native-prop-types@5.0.0 \
        moment@2.30.1
      </Text>
      <Text>
        {"\n"}
      </Text>
      <Text>
        react-native-coachmark@0.3.0 \
        react-native-extra-dimensions-android@1.2.5 \
        react-native-html-to-pdf@1.3.0 \
        react-native-in-app-review@4.4.2 \
        react-native-neat-date-picker@1.6.1 \
        react-native-pager-view@6.9.1 \
        react-native-share@12.2.1 \
        react-native-webview@13.16.0 \
        rn-fetch-blob@0.12.0
      </Text>
      <Text>
        {"\n"}
      </Text>
      <Text>
        @adobe/react-native-aepcore@7.0.0 \
        @adobe/react-native-aeptarget@7.0.0 \
        @adobe/react-native-aepuserprofile@7.0.0
      </Text>
      <AppContent />
      </ScrollView>
      </SafeAreaView>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
