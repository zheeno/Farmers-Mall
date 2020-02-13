import React, { Component } from 'react';
import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';
import { StackActions, NavigationActions } from 'react-navigation';
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
  Spinner
} from 'native-base';
import { ImageBackground, Image, ScrollView } from 'react-native';
import { styles } from '../../native-base-theme/variables/Styles';
import { MiscModal } from './components/MiscComponents';
import { ShowToast } from '../services/ApiCaller';
import Parse from 'parse/react-native';
const Globals = require("../services/Globals");

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: false,
      showModal: false,
      username: "Zheeno",
      email: "",
      password: "123456",
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.onSignUp = this.onSignUp.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
    this.updateCartTokens = this.updateCartTokens.bind(this);
  }

  componentDidMount() {
    StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Login' })],
    });
  }


  onSignIn = async () => {
    const { navigate } = this.props.navigation;
    let username = (this.state.username).trim(),
      password = (this.state.password).trim();

    // navigate('Home');
    if (username === "" || password === "") {
      ShowToast('Fill the fields correctly.', 'danger');
    } else {
      this.setState({ isFetching: true });
      try {
        await Parse.User.logIn(username.toString(), password.toString());
        Parse.User.enableUnsafeCurrentUser();
        Parse.User.currentAsync().then(user => {
          let sessionToken = user.getSessionToken();
          // check if user has any pending items in cart
          // update those cart tokens with the latest token value
          this.updateCartTokens(sessionToken, user.id);
          navigate('Home');
        }).catch(error => {
          ShowToast(error.message, 'danger');
        });
        this.setState({ isFetching: false });
      } catch (error) {
        this.setState({ isFetching: false });
        ShowToast(error.message, 'danger');
        // ShowToast(Globals.ERRORS.INTERNET_CON, 'danger');
      }
    }
  }

  async updateCartTokens(sessionToken, userId) {
    try {
      const CartItems = Parse.Object.extend("CartItems");
      const query = new Parse.Query(CartItems);
      query.equalTo("buyer_user_id", userId);
      query.equalTo("order_placed", false);
      query.notEqualTo("cart_token", sessionToken);
      const results = await query.find();
      // Do something with the returned Parse.Object values
      for (let i = 0; i < results.length; i++) {
        var cartItemId = results[i];
        // update entry with new token
        const c_query = new Parse.Query("CartItems");
        c_query.get(cartItemId.id).then(cartItem => {
          cartItem.set("cart_token", sessionToken);
          cartItem.save().then(objUpdate => {
            console.log("updated", objUpdate);
          });
        });
      }
    } catch (error) {
      ShowToast(Globals.ERRORS.INTERNET_CON, "danger")
    }
  }

  onSignUp = async () => {
    const { navigate } = this.props.navigation;
    let username = this.state.regUsername;//this.state.username;
    let email = this.state.regEmail;//this.state.email;
    let password = this.state.regPassword;//this.state.password;

    if (username.trim() === "" || username === undefined || email.trim() === "" || email === undefined || password.trim() === "" || password === undefined) {
      this.setState(() => ({ nameError: `Fill the fields correctly.` }));
    } else {
      this.setState({ isFetching: true });
      try {
        Parse.User.logOut();
        let user = new Parse.User();
        user.set("username", username);
        user.set("email", email);
        user.set("password", password);
        user.set("full_name", this.state.regFullname);
        user.set("phone_no", this.state.regPhone);
        user.set("account_code", "001");
        user.set("account_type", "Buyer");
        const result = await user.signUp();
        this.setState({ isFetching: false, showModal: false, username: username, password: password });

        ShowToast('Account Created!', 'success');
        // sign user in
        Parse.User.logOut();
        this.onSignIn();
      } catch (error) {
        this.setState({ isFetching: false, showModal: false });
        ShowToast(error.message, 'danger');
      }
    }
  }

  render() {
    const { navigate } = this.props.navigation;

    return (
      <StyleProvider style={getTheme(material)}>
        <Container style={{ flex: 1 }}>
          <ImageBackground
            source={require('../assets/img/farmer_hands.png')}
            style={{ width: '100%', height: '100%' }}>
            <View style={[styles.bgLeafGreenSlight, { flex: 1, height: '100%' }]}>
              <View style={{ flex: 1, padding: 30 }}>
                <Text style={{ color: '#FFF', fontSize: 40 }}>Sign In</Text>
              </View>

              <View style={{ flex: 3, flexDirection: 'row' }}>
                <View style={{ flex: 2, paddingHorizontal: 20 }}>
                  <Form style={{ width: '100%' }}>
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
                          { paddingLeft: 10, paddingRight: 30 },
                        ]}
                        defaultValue={this.state.username}
                        onChangeText={text => {
                          this.setState({ username: text });
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
                      <Label style={[styles.whiteText]}>Password</Label>
                      <Input
                        secureTextEntry={true}
                        style={[styles.whiteText]}
                        defaultValue={this.state.password}
                        onChangeText={text => {
                          this.setState({ password: text });
                        }}
                      />
                    </Item>
                    <Button
                      iconRight
                      block
                      rounded
                      light
                      disabled={this.state.isFetching}
                      style={{ marginVertical: 30, textTransform: 'capitalize' }}
                      onPress={this.onSignIn}
                    >
                      <Text style={{ textTransform: 'capitalize' }}>Sign In</Text>
                      {this.state.isFetching ?
                        <Spinner size={20} color={"green"} />
                        :
                        <Icon type={'fontAwesome'} name="ios-arrow-forward" />
                      }
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
                  disabled={this.state.isFetching}
                  style={[
                    { marginVertical: 10 },
                    styles.bgLeafGreen,
                    styles.whiteText,
                  ]}
                  onPress={() => {
                    if (!this.state.isFetching) {
                      this.setState({ showModal: true });
                    }
                  }}>
                  <Text style={{ textTransform: 'capitalize' }}>Sign Up</Text>
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
            togModal={() => this.setState({ showModal: !this.state.showModal })}>
            <View style={[{ flex: 1 }, styles.maskDarkSlight]}>
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
                  <View style={{ flex: 1, paddingTop: 20, paddingLeft: 20 }}>
                    <Text style={[styles.greenText, { fontSize: 25 }]}>
                      Sign Up
                    </Text>
                    <Text note>
                      Join the smart network of people buying healthy food items
                    </Text>
                  </View>
                  <View style={{ flex: 2, paddingHorizontal: 20 }}>
                    <Form style={{ width: '100%' }}>
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
                            { paddingLeft: 10, paddingRight: 30 },
                          ]}
                          defaultValue={this.state.regUsername}
                          onChangeText={text => {
                            this.setState({ regUsername: text });
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
                            { paddingLeft: 10, paddingRight: 30 },
                          ]}
                          defaultValue={this.state.regFullname}
                          onChangeText={text => {
                            this.setState({ regFullname: text });
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
                            { paddingLeft: 10, paddingRight: 30 },
                          ]}
                          defaultValue={this.state.regEmail}
                          onChangeText={text => {
                            this.setState({ regEmail: text });
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
                            { paddingLeft: 10, paddingRight: 30 },
                          ]}
                          defaultValue={this.state.regPhone}
                          onChangeText={text => {
                            this.setState({ regPhone: text });
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
                            { paddingLeft: 10, paddingRight: 30 },
                          ]}
                          secureTextEntry={true}
                          defaultValue={this.state.regPassword}
                          onChangeText={text => {
                            this.setState({ regPassword: text });
                          }}
                        />
                      </Item>
                      <Button
                        iconRight
                        block
                        rounded
                        disabled={this.state.isFetching}
                        style={[
                          { marginVertical: 10 },
                          styles.bgLeafGreen,
                          styles.whiteText,
                        ]}
                        onPress={this.onSignUp}>
                        <Text style={{ textTransform: 'capitalize' }}>
                          Sign Up
                        </Text>
                        {this.state.isFetching ? <Spinner size={20} color={"white"} /> :
                          <Icon type={'fontAwesome'} name="ios-arrow-forward" />
                        }
                      </Button>
                      <Button
                        iconRight
                        block
                        rounded
                        light
                        disabled={this.state.isFetching}
                        style={[
                          { marginVertical: 10 },
                          styles.greenText,
                        ]}
                        onPress={() => {
                          this.setState({ showModal: false });
                        }}>
                        <Text style={{ textTransform: 'capitalize' }}>
                          Sign In
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
