/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import RNPaystack from 'react-native-paystack';

RNPaystack.init({ 
    publicKey: 'pk_test_29aa1a585ea248a967392832f3581b5a49378266',
    accessCode: 'wabdgt54sgg',
});
AppRegistry.registerComponent(appName, () => App);
