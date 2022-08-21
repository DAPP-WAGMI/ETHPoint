// In App.js in a new project

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
// Utils
import { ContextProvider } from "./utils/contextModule";
// Screens
import Payments from "./screens/payments"
import NFC from './screens/payments/nfc';
import Account from './screens/account';

const Stack = createNativeStackNavigator();

class App extends React.Component {
  render() {
    return (
      <ContextProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <Stack.Navigator
            initialRouteName="NFC"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Payments" component={Payments} />
            <Stack.Screen name="NFC" component={NFC} />
            <Stack.Screen name="Account" component={Account} />
          </Stack.Navigator>
        </NavigationContainer>
      </ContextProvider>
    );
  }
}

export default App;