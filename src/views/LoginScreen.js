import React, {Component} from 'react';
import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';
import {StackActions, NavigationActions} from 'react-navigation';
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
import {ImageBackground, Image, ScrollView, AsyncStorage} from 'react-native';
import {styles} from '../../native-base-theme/variables/Styles';
import {MiscModal} from './components/MiscComponents';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  componentDidMount() {
    StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'Login'})],
    });
    this.signIn();
  }

  signIn() {
    AsyncStorage.setItem('userId', '1');
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
                <Text style={{color: '#FFF', fontSize: 40}}>Sign In</Text>
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
                      style={{marginVertical: 30, textTransform: 'capitalize'}}
                      onPress={() => {
                        navigate('Home');
                      }}>
                      <Text style={{textTransform: 'capitalize'}}>Sign In</Text>
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
                  marginHorizontal: 10,
                  padding: 20,
                  top: 20,
                  alignItems: 'center',
                }}>
                <Text note>Don&apos;t have an account?</Text>
                <Button
                  iconRight
                  block
                  rounded
                  style={[
                    {marginVertical: 10},
                    styles.bgLeafGreen,
                    styles.whiteText,
                  ]}
                  onPress={() => {
                    this.setState({showModal: true});
                  }}>
                  <Text style={{textTransform: 'capitalize'}}>Sign Up</Text>
                  <Icon type={'fontAwesome'} name="ios-arrow-forward" />
                </Button>
              </View>
            </View>
          </ImageBackground>
          {/* modal */}
          <MiscModal
            hasHeader={false}
            title={null}
            visible={this.state.showModal}
            transparent={true}
            togModal={() => this.setState({showModal: !this.state.showModal})}>
            <View style={[{flex: 1}, styles.maskDarkSlight]}>
              <View
                style={{
                  flex: 1,
                  marginHorizontal: 10,
                  marginTop: 10,
                  borderRadius: 20,
                  bottom: -30,
                  backgroundColor: '#FFF',
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                }}>
                <ScrollView>
                  <View style={{flex: 1, paddingTop: 20, paddingLeft: 20}}>
                    <Text style={[styles.greenText, {fontSize: 25}]}>
                      Sign Up
                    </Text>
                    <Text note>
                      Join the smart network of people buying healthy food items
                    </Text>
                  </View>
                  <View style={{flex: 2, paddingHorizontal: 20}}>
                    <Form style={{width: '100%'}}>
                      <Item
                        floatingLabel
                        style={[
                          {
                            padding: 5,
                          },
                        ]}>
                        <Label style={[styles.greenText]}>Username</Label>
                        <Input
                          style={[
                            styles.greenText,
                            {paddingLeft: 10, paddingRight: 30},
                          ]}
                          defaultValue={this.state.regUsername}
                          onChangeText={text => {
                            this.setState({regUsername: text});
                          }}
                        />
                      </Item>
                      <Item
                        floatingLabel
                        style={[
                          {
                            padding: 5,
                          },
                        ]}>
                        <Label style={[styles.greenText]}>Fullname</Label>
                        <Input
                          style={[
                            styles.greenText,
                            {paddingLeft: 10, paddingRight: 30},
                          ]}
                          defaultValue={this.state.regFullname}
                          onChangeText={text => {
                            this.setState({regFullname: text});
                          }}
                        />
                      </Item>
                      <Item
                        floatingLabel
                        style={[
                          {
                            padding: 5,
                          },
                        ]}>
                        <Label style={[styles.greenText]}>E-mail</Label>
                        <Input
                          style={[
                            styles.greenText,
                            {paddingLeft: 10, paddingRight: 30},
                          ]}
                          defaultValue={this.state.regEmail}
                          onChangeText={text => {
                            this.setState({regEmail: text});
                          }}
                        />
                      </Item>
                      <Item
                        floatingLabel
                        style={[
                          {
                            padding: 5,
                          },
                        ]}>
                        <Label style={[styles.greenText]}>Phone No.</Label>
                        <Input
                          style={[
                            styles.greenText,
                            {paddingLeft: 10, paddingRight: 30},
                          ]}
                          defaultValue={this.state.regPhone}
                          onChangeText={text => {
                            this.setState({regPhone: text});
                          }}
                        />
                      </Item>
                      <Item
                        floatingLabel
                        style={[
                          {
                            padding: 5,
                          },
                        ]}>
                        <Label style={[styles.greenText]}>Password</Label>
                        <Input
                          style={[
                            styles.greenText,
                            {paddingLeft: 10, paddingRight: 30},
                          ]}
                          secureTextEntry={true}
                          defaultValue={this.state.regPassword}
                          onChangeText={text => {
                            this.setState({regPassword: text});
                          }}
                        />
                      </Item>
                      <Button
                        iconRight
                        block
                        rounded
                        style={[
                          {marginVertical: 10},
                          styles.bgLeafGreen,
                          styles.whiteText,
                        ]}
                        onPress={() => {
                          this.setState({showModal: true});
                        }}>
                        <Text style={{textTransform: 'capitalize'}}>
                          Sign Up
                        </Text>
                        <Icon type={'fontAwesome'} name="ios-arrow-forward" />
                      </Button>
                    </Form>
                  </View>
                </ScrollView>
              </View>
            </View>
          </MiscModal>
        </Container>
      </StyleProvider>
    );
  }
}
