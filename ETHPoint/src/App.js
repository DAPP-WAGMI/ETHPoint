// In App.js in a new project

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
// Utils
import { ContextProvider } from "./utils/contextModule";
// Screens
import Payments from "./screens/payments"
import Deposit from './screens/payments/deposit';
import Account from './screens/account';
import MyWalletConnect from "./screens/mywalletconnect"
import NFC from "./screens/nfc"

const Stack = createNativeStackNavigator();

class App extends React.Component {
  render() {
    return (
      <ContextProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <Stack.Navigator
            initialRouteName="Payments"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Payments" component={Payments} />
            <Stack.Screen name="Deposit" component={Deposit} />
            <Stack.Screen name="Account" component={Account} />
            <Stack.Screen name="Wallet" component={MyWalletConnect} />
            <Stack.Screen name="NFC" component={NFC} />
          </Stack.Navigator>
        </NavigationContainer>
      </ContextProvider>
    );
  }
}

export default App;