import 'react-native-gesture-handler'
import React, { useState } from 'react'
import { Easing } from 'react-native'

import { NavigationContainer } from '@react-navigation/native'
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack'

import WeatherScreen from './screens/WeatherScreen'
import SavedScreen from './screens/SavedScreen'

const Stack = createStackNavigator()

const timingConfig = {
  animation: 'timing',
  config: {
    duration: 100,
    easing: Easing.linear,
  },
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{
            headerShown: false,
            //   headerLeft: () => null,
          }}
          name="weather"
          component={WeatherScreen}
        />
        <Stack.Screen
          options={{
            headerShown: false,
            headerLeft: () => null,
            animationEnabled: true,
            gestureDirection: 'horizontal',
            gestureEnabled: true,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            // transitionSpec: {
            //   open: timingConfig,
            //   close: timingConfig,
            // }
          }}
          name="saved"
          component={SavedScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
