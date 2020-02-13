import React, { useState, useRef, useEffect } from 'react';
import LottieView from 'lottie-react-native';
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  Easing
} from 'react-native';
import {
  Text,
  View,
  Item,
  Form,
  Icon,
  Button,
  Input,
  Left,
  Right,
  Body,
  Container,
  Spinner,
  Row,
  List,
  Card,
  CardItem,
  H2,
  Header,
  Badge,
  H1,
  H3,
  Radio,
  Footer,
  Label,
  ListItem
} from 'native-base';
import { styles } from '../../../native-base-theme/variables/Styles';

export const CusListItem = props => {
  return (
    <ListItem icon onPress={props.action} disabled={props.disabled}>
      {props.hasIcon ?
        <Left>
          <Button style={{ backgroundColor: props.iconBgColor }}>
            <Icon active name={props.iconName} />
          </Button>
        </Left>
        : null}
      <Body>
        <Text>{props.text}</Text>
      </Body>

      <Right>
        <Icon active name="ios-arrow-forward" />
      </Right>
    </ListItem>
  );
}

export const LoaderOverlay = props => {
  return (
    <View
      style={[
        {
          zIndex: 20,
          width: '100%',
          height: '100%',
          position: 'absolute',
          alignContent: 'center',
          aliginSelf: 'center',
          paddingTop: 100,
          backgroundColor: 'rgba(200,200,200,0.85)',
        },
      ]}>
      <View
        style={{
          backgroundColor: 'transparent',
          width: '80%',
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View>
          <View style={{ alignItems: 'center', paddingHorizontal: 30 }}>
            <LottieView
              style={{ width: 200, }}
              source={require('../../assets/lottiefiles/4251-plant-office-desk.json')}
              autoPlay
              loop
            />
            <Text style={[styles.greenText, { marginLeft: 5, fontSize: 20, textAlign: 'center' }]}>
              {props.text}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export const MiscModal = props => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={props.visible}
      onRequestClose={props.togModal}
      transparent={props.transparent}
      style={props.style}>
      {props.hasHeader ? (
        <View transparent style={{ paddingVertical: 10, flexDirection: 'row' }}>
          <View style={{ justifyContent: 'center' }}>
            <Button onPress={props.togModal} icon transparent>
              <Icon style={{ color: '#333' }} name="md-arrow-back" />
            </Button>
          </View>
          <View style={{ justifyContent: 'center', paddingHorizontal: 10 }}>
            <H3 style={{ color: '#333' }}>{props.title}</H3>
          </View>
        </View>
      ) : null}
      <View style={{ flex: 1 }}>{props.children}</View>
    </Modal>
  );
};

export const ErrorOverlay = props => {
  return (
    <View
      style={[
        {
          flex: 1,
          zIndex: 20,
          width: '100%',
          height: '100%',
          position: 'absolute',
          alignContent: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,1)',
        },
      ]}>
      <View
        style={{
          backgroundColor: 'transparent',
          paddingHorizontal: 30,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1
        }}>
        <View style={{ flex: 1, paddingTop: 40 }}>
          <LottieView
            style={{ width: 200 }}
            source={require('../../assets/lottiefiles/7481-banana-boy.json')}
            autoPlay
            loop
          />
        </View>
        <View style={{ flex: 2, paddingVertical: 100 }}>
          <H3 style={[styles.greenText, { alignSelf: "center", fontWeight: "bold" }]}>{props.title}</H3>
          <Text style={[styles.greenText, { fontSize: 16, alignSelf: "center", textAlign: "center" }]}>{props.errorMessage}</Text>
          {props.action != null ?
            <View>{}
              <Button
                onPress={props.action}
                iconLeft rounded
                style={[styles.bgGrey, { alignSelf: "center", marginVertical: 20 }]}>
                <Icon name={"ios-refresh"} style={styles.greenText} />
                <Text style={styles.greenText}>Refresh</Text>
              </Button></View>
            : null}
        </View>
      </View>
    </View>
  );
}
