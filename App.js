/**
 * Sample React Native App
 * https://github.com/facebook/react-native *  * @format * @flow */

import React, {Component} from 'react';
import {createStackNavigator} from 'react-navigation';
import {createBottomTabNavigator, BottomTabBar} from 'react-navigation-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Root, Button, Icon, View, Text} from 'native-base';
import {styles} from './native-base-theme/variables/Styles';
import SplashScreen from './src/views/SplashScreen';
import LoginScreen from './src/views/LoginScreen';
import HomeScreen from './src/views/HomeScreen';
import FoodItemScreen from './src/views/FoodItemScreen';
import CategoryScreen from './src/views/CategoryScreen';
import CartScreen from './src/views/CartScreen';
import SearchScreen from './src/views/SearchScreen';

const IntroStack = createStackNavigator(
  {
    Splash: {
      screen: SplashScreen,
      navigationOptions: () => {
        return {
          header: null,
        };
      },
    },
    Login: {
      screen: LoginScreen,
      navigationOptions: () => {
        return {
          header: null,
        };
      },
    },
  },
  {
    initialRouteName: 'Splash',
    navigationOptions: {
      headerTintColor: '#010103',
      headerStyle: {
        backgroundColor: styles.bgLeafGreen.backgroundColor,
      },
      headerTintColor: '#fff',
      boxShadow: 'none',
    },
  },
);

const HomeStack = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: () => {
      return {
        header: null,
      };
    },
  },
  FoodItem: {
    screen: FoodItemScreen,
    navigationOptions: () => {
      return {
        header: null,
      };
    },
  },
  Category: {
    screen: CategoryScreen,
    navigationOptions: () => {
      return {
        header: null,
      };
    },
  },
});

const CartStack = createStackNavigator({
  Cart: {
    screen: CartScreen,
    navigationOptions: {
      title: 'Cart',
      headerStyle: {
        backgroundColor: styles.bgLeafGreen.backgroundColor,
      },
      headerTintColor: '#fff',
      boxShadow: 'none',
    },
  },
});

const SearchStack = createStackNavigator({
  SearchResult: {
    screen: SearchScreen,
    navigationOptions: () => {
      return {
        header: null,
      };
    },
  },
});

const TabBarComponent = props => <BottomTabBar {...props} />;

const TabNavs = createBottomTabNavigator(
  {
    Home: {
      screen: HomeStack,
      navigationOptions: {
        tabBarIcon: ({tintColor}) => (
          <Ionicons name={'ios-paper'} size={25} color={tintColor} />
        ),
      },
    },
    Search: {
      screen: SearchStack,
      navigationOptions: {
        tabBarIcon: ({tintColor}) => (
          <Ionicons name={'ios-search'} size={25} color={tintColor} />
        ),
      },
    },
    Cart: {
      screen: CartStack,
      navigationOptions: {
        tabBarIcon: ({tintColor}) => (
          <Ionicons name={'ios-cart'} size={25} color={tintColor} />
        ),
        tabBarVisible: false,
      },
    },
  },
  {
    tabBarOptions: {
      activeTintColor: styles.greenText.color,
      inactiveTintColor: '#9e9e9e',
      indicatorStyle: {
        backgroundColor: 'yellow',
      },
      style: {
        backgroundColor: '#fff',
        position: 'absolute',
        left: 50,
        right: 50,
        bottom: 20,
        borderRadius: 100,
        borderTopWidth: 0,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
      },
      showLabel: false,
    },
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
  },
);

const AllStacks = createStackNavigator({
  // this holds all the stacks
  Intro: {
    screen: IntroStack,
    navigationOptions: () => {
      return {
        header: null,
      };
    },
  },
  MainApp: {
    screen: TabNavs,
    navigationOptions: () => {
      return {
        header: null,
      };
    },
  },
});

export default class App extends Component {
  render() {
    return (
      <Root>
        <AllStacks />
      </Root>
    );
  }
}
