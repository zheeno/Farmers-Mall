/**
 * Sample React Native App
 * https://github.com/facebook/react-native *  * @format * @flow */

import React, { Component } from 'react';
import { createStackNavigator } from 'react-navigation';
import { createBottomTabNavigator, BottomTabBar } from 'react-navigation-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Root, Button, Icon, View, Text, Thumbnail } from 'native-base';
import { styles } from './native-base-theme/variables/Styles';
import SplashScreen from './src/views/SplashScreen';
import LoginScreen from './src/views/LoginScreen';
import HomeScreen from './src/views/HomeScreen';
import FoodItemScreen from './src/views/FoodItemScreen';
import CategoryScreen from './src/views/CategoryScreen';
import CartScreen from './src/views/CartScreen';
import SearchScreen from './src/views/SearchScreen';
import FarmsScreen from './src/views/FarmsScreen';
import UserProfileScreen from './src/views/UserProfileScreen';
import OrderListScreen from './src/views/OrderListScreen';
import OrderScreen from './src/views/OrderScreen';
import CheckoutScreen from './src/views/CheckoutScreen';
import TestScreen from './src/views/TestScreen';
import TransactionHistoryScreen from './src/views/TransactionHistoryScreen';
import SafeAreaView from 'react-native-safe-area-view';

import { AsyncStorage, Platform, TouchableOpacity, StatusBar } from 'react-native';
// import Parse from 'parse/react-native';
const Globals = require('./src/services/Globals');

// Parse.setAsyncStorage(AsyncStorage);
// Parse.initialize(Globals.APPLICATION_KEY, Globals.JAVASCRIPT_KEY);
// Parse.serverURL = Globals.SERVER_URL;

// IntroStack
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

// HomeStack
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
  Farms: {
    screen: FarmsScreen,
    navigationOptions: () => {
      return {
        header: null,
      };
    },
  },
  Checkout: {
    screen: CheckoutScreen,
    navigationOptions: () => {
      return {
        headerTitle: "Checkout",
        headerStyle: {
          backgroundColor: styles.bgLeafGreen.backgroundColor,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      };
    },
  },
},
  {
    initialRouteName: 'Home',
    navigationOptions: {
      headerTintColor: '#010103',
      headerStyle: {
        backgroundColor: styles.bgLeafGreen.backgroundColor,
      },
      headerTintColor: '#fff',
      boxShadow: 'none',
    },
  });

// CartStack
const CartStack = createStackNavigator({
  Cart: {
    screen: CartScreen,
    navigationOptions: ({ navigation }) => {
      return {
        headerLeft:
          <Button
            style={[styles.bgLeafGreen]}
            small
            onPress={navigation.getParam('goHome')}>
            <Icon name={"ios-arrow-back"} />
          </Button>,
        title: "Cart",
        headerRight:
          <Button
            style={[styles.bgLeafGreen]}
            small
            icon
            onPress={navigation.getParam('checkout')}>
            <Icon name={"ios-checkmark-circle-outline"} />
          </Button>,
        headerStyle: {
          backgroundColor: styles.bgLeafGreen.backgroundColor,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      };
    },
  },
});

// SearchStack
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

// ProfileStack
const ProfileStack = createStackNavigator({
  UserProfile: {
    screen: UserProfileScreen,
    navigationOptions: ({ navigation }) => {
      return {
        headerLeft: null,
        headerTitle:
          <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", paddingVertical: 10 }}>
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={[styles.bgLeafGreen, { alignItems: "center", justifyContent: "center", height: "100%" }]}
                  small
                  onPress={navigation.getParam('goHome')}>
                  <Icon name={"ios-arrow-back"} style={[styles.whiteText, { fontSize: 20 }]} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Thumbnail
                  circular
                  small
                  source={navigation.getParam('headerAvatar', '')}
                />
              </View>
            </View>
            <View style={{ flex: 3, alignItems: "flex-start", justifyContent: "center" }}>
              <Text numberOfLines={1} style={[styles.whiteText, { fontSize: 16 }]}>{navigation.getParam('headerTitle', 'Profile')}</Text>
              <Text numberOfLines={1} note>{navigation.getParam('headerSubTitle', '')}</Text>
            </View>
          </View>,
        headerRight: null,
        headerStyle: {
          backgroundColor: styles.bgLeafGreen.backgroundColor,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      };
    },
  },
  OrderList: {
    screen: OrderListScreen,
    navigationOptions: () => {
      return {
        headerTitle: "Orders",
        headerStyle: {
          backgroundColor: styles.bgLeafGreen.backgroundColor,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      };
    },
  },
  Order: {
    screen: OrderScreen,
    navigationOptions: ({ navigation }) => {
      return {
        title: navigation.getParam('headerTitle', 'Order'),
        headerStyle: {
          backgroundColor: styles.bgLeafGreen.backgroundColor,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      };
    },
  },
  Transactions: {
    screen: TransactionHistoryScreen,
    navigationOptions: () => {
      return {
        headerTitle: "Transactions",
        headerStyle: {
          backgroundColor: styles.bgLeafGreen.backgroundColor,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
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
        tabBarIcon: ({ tintColor }) => (
          <Ionicons name={'ios-paper'} size={25} color={tintColor} />
        ),
        // tabBarVisible: true,
      },
    },
    Search: {
      screen: SearchStack,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <Ionicons name={'ios-search'} size={25} color={tintColor} />
        ),
      },
    },
    Profile: {
      screen: ProfileStack,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <Ionicons name={'ios-person'} size={25} color={tintColor} />
        ),
        tabBarVisible: false,
      },
    },
    Cart: {
      screen: CartStack,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <Ionicons name={'ios-cart'} size={25} color={tintColor} />
        ),
        // tabBarVisible: false,
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
      style: Platform.OS === "ios" ? null : {
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
        paddingBottom: 0,
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
  _loadResourcesAsync = async () => {
    return Promise.all([

    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

  render() {
    return (
      <Root>
        <SafeAreaView style={[styles.container]}>
          <StatusBar barStyle="dark-content" backgroundColor="#111" />
          <AllStacks />
        </SafeAreaView>
      </Root>
    );
  }
}
