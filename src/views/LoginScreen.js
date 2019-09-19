import React, {Component} from 'react';
import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';
import {
  StyleProvider,
  Container,
  Text,
  View,
  Button,
  Icon,
  Form,
  Item,
  Label,
  Input,
  Card,
  CardItem,
} from 'native-base';
import {ImageBackground, Image, ScrollView} from 'react-native';
import {styles} from '../../native-base-theme/variables/Styles';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {navigate} = this.props.navigation;

    return (
      <StyleProvider style={getTheme(material)}>
        <Container style={{flex: 1}}>
          <ImageBackground
            source={require('../assets/img/farmer_hands.png')}
            style={{width: '100%', height: '100%'}}>
            <View style={[styles.bgLeafGreenSlight, {flex: 1, height: '100%'}]}>
              <View style={{flex: 1, padding: 30}}>
                <Text style={{color: '#FFF', fontSize: 40}}>Login</Text>
              </View>

              <View style={{flex: 3, flexDirection: 'row'}}>
                <View style={{flex: 2, paddingHorizontal: 20}}>
                  <Form style={{width: '100%'}}>
                    <Item
                      floatingLabel
                      style={[
                        {
                          padding: 5,
                        },
                      ]}>
                      <Label style={[styles.whiteText]}>Username</Label>
                      <Input
                        style={[
                          styles.whiteText,
                          {paddingLeft: 10, paddingRight: 30},
                        ]}
                        // onChangeText={text => {
                        //   this.setState({ username: text });
                        // }}
                      />
                    </Item>
                    <Item
                      floatingLabel
                      style={[
                        {
                          padding: 5,
                        },
                      ]}>
                      <Label style={[styles.whiteText]}>Password</Label>
                      <Input
                        secureTextEntry={true}
                        style={[styles.whiteText]}
                        // onChangeText={text => {
                        //   this.setState({ username: text });
                        // }}
                      />
                    </Item>
                    <Button
                      iconRight
                      block
                      rounded
                      light
                      style={{marginVertical: 30}}
                      onPress={() => {
                        navigate('Login');
                      }}>
                      <Text>Continue</Text>
                      <Icon type={'fontAwesome'} name="ios-arrow-forward" />
                    </Button>
                  </Form>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: '#FFF',
                  borderRadius: 20,
                  marginTop: 20,
                  marginHorizontal: 5,
                  top: 20,
                }}></View>
            </View>
          </ImageBackground>
        </Container>
      </StyleProvider>
    );
  }
}
