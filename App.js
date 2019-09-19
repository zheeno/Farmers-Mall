/**
 * Sample React Native App
 * https://github.com/facebook/react-native *  * @format * @flow */

import React, { Component } from 'react';
import { createStackNavigator } from "react-navigation";
import { Root, Button, Icon } from "native-base";
import SplashScreen from './src/views/SplashScreen';
import LoginScreen from './src/views/LoginScreen';

const MainNavigator = createStackNavigator({
        Splash: { screen: SplashScreen },
        Login: {
                screen: LoginScreen,
                navigationOptions: () => {
                        return {
                                header: null
                        };
                }
        }
},
        {
                initialRouteName: "Splash",
                navigationOptions: () => {
                        return {
                                headerStyle: {
                                        height: 0
                                }
                        };
                }
        });

export default class App extends Component {
        render() {
                return (<Root>
                        <MainNavigator />
                </Root >
                );
        }
}