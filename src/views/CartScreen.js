import React, { Component } from 'react';
import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';
import NumberFormat from 'react-number-format';
import LottieView from 'lottie-react-native';

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
  List,
  ListItem,
  Left,
  Right,
  Thumbnail,
  Body,
  H3,
  Badge,
  Header,
  Modal,
  H1,
  Spinner
} from 'native-base';
import {
  ImageBackground,
  Image,
  ScrollView,
  AsyncStorage,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { styles } from '../../native-base-theme/variables/Styles';
import { GetData, ShowToast } from '../services/ApiCaller';
import { LoaderOverlay, MiscModal, ErrorOverlay } from './components/MiscComponents';
import Parse from "parse/react-native";
import RNPaystack from 'react-native-paystack';

const Globals = require("../services/Globals");

export default class CartScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      refreshControl: false,
      ajaxCallState: 200,
      ajaxCallError: null,
      cartFingerPrint: null,
      sessionToken: null,
      cartItems: [],
      cartTotal: '0.00',
      showModal: false,
      isPaying: false,
      purchaseRequestComplete: false,
      purchaseSuccess: false,
      responseMessage: null,
    };

    this.initializePage = this.initializePage.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.getCartItems = this.getCartItems.bind(this);
    this.initPayment = this.initPayment.bind(this);
    this.makePayment = this.makePayment.bind(this);
    this.updateCartItemsPurcahseState = this.updateCartItemsPurcahseState.bind(this);
    this.payWithATM = this.payWithATM.bind(this);
  }

  componentDidMount() {
    this.initializePage(true);
    this._checkout = this._checkout.bind(this);
    this._goHome = this._goHome.bind(this);
    this.props.navigation.setParams({ checkout: this._checkout, goHome: this._goHome });
    // this.startTimer();
  }

  _goHome() {
    this.props.navigation.navigate("Home");
  }

  _checkout() {
    if (this.state.cartItems.length > 0) {
      this.setState({ showModal: true });
    } else {
      ShowToast("Your cart is empty", "danger");
    }
  }

  startTimer() {
    timer = setInterval(() => {
      AsyncStorage.getItem('fingerPrint')
        .then(fingerPrint => {
          if (fingerPrint != this.state.cartFingerPrint) {
            this.initializePage(false);
          }
        })
        .done();
    }, 5000);
  }

  async initPayment() {
    this.setState({ showModal: false });
    var currentUser = Parse.User.current();
    if (currentUser) {
      this.payWithATM();
    }
  }


  payWithATM = async () => {
    // if (this.state.cardNumber.length >= 16 && this.state.expiryDate.length == 4 && this.state.cvc.length >= 3 && this.state.cartTotal.length > 0) {
    let amountInKobo = parseFloat(this.state.cartTotal) * 100;
    let expiryMonth = this.state.expiryDate.substr(0, 2);
    let expiryYear = this.state.expiryDate.substr(2, 4);
    let currentUser = Parse.User.current();
    if (amountInKobo > 0) {
      // this.setState({ fetching: true });
      RNPaystack.chargeCard({
        cardNumber: this.state.cardNumber,
        expiryMonth: this.state.expiryMonth,
        expiryYear: this.state.expiryYear,
        cvc: this.state.cvc,
        amountInKobo: amountInKobo,
        email: currentUser.get("email"),
      })
        .then(response => {
          console.log(response); // do stuff with the token
          this.setState({ reference_code: response.reference, fetching: false });
          // this.saveTransaction();
        })
        .catch(error => {
          console.log(error); // error is a javascript Error object
          console.log(error.message);
          console.log(error.code);
          this.setState({ reference_code: null, fetching: false });
          ShowToast(error.message, 'danger');
        })
    } else {
      // invalid amount
      ShowToast("Invalid amount entered", 'danger');
    }
    // } else {
    //   // complete form
    //   ShowToast("Kindly complete all fields", 'danger');
    // }
  }


  async makePayment(user) {
    try {
      var Transactions = Parse.Object.extend("Transactions");
      var query = new Parse.Query(Transactions);
      query.equalTo("user_id", user.id);
      const object = await query.find();
      var debit = 0, credit = 0, balance = 0;
      // loop through object to get balance
      for (i = 0; i < object.length; i++) {
        if (object[i].get("is_credit")) {
          // credit transaction
          credit += object[i].get("amount");
        } else {
          // debit transaction
          debit += object[i].get("amount");
        }
      }
      balance = credit - debit;

      // check if account balance >= sub total
      if (balance >= this.state.cartTotal) {
        const newToken = Math.random().toString(36).slice(2) + user.id;
        // debit user, send funds to escrow account, notify the farmer about the order
        var debit = new Transactions();
        debit.set("user_pointer", user);
        debit.set("cart_token", newToken);
        debit.set("user_id", user.id);
        debit.set("amount", this.state.cartTotal);
        debit.set("is_credit", false);
        debit.set("is_in_escrow", true);
        debit.set("desc", "Payment made to " + this.state.farm.get("farm_name") + " for your purchase order");
        debit.save().then((results) => {
          // update the cart table on the server
          this.updateCartItemsPurcahseState(debit, newToken);
        }, (error) => {
          if (error.code === Parse.Error.OBJECT_NOT_FOUND) {
            // connection error
            this.setState({
              purchaseRequestComplete: true,
              purchaseSuccess: false,
              responseMessage: `We have some issues processing your request.\nKindly check your internet connection and try again.`
            });
          }
        });
      } else {
        // else, notify the buyer of insufficient funds
        this.setState({
          purchaseRequestComplete: true,
          purchaseSuccess: false,
          responseMessage: `You currently do not have sufficient funds in your wallet to complete this order.\nKindly fund your wallet and try again.`
        });
      }
      this.setState({ isPaying: false });
    } catch (error) {
      this.setState({ isPaying: false });
      ShowToast(Globals.ERRORS.INTERNET_CON, "danger");
    }
  }

  async updateCartItemsPurcahseState(transaction, newToken) {
    try {
      var currentUser = Parse.User.current();
      if (currentUser) {
        var CartItems = Parse.Object.extend("CartItems");
        var c_query = new Parse.Query(CartItems);
        c_query.equalTo("order_placed", false)
        c_query.equalTo("cart_token", this.state.sessionToken)
        c_query.descending("createdAt");
        const cartItems = await c_query.find();
        let total = 0;
        // loop through cart items
        for (i = 0; i < cartItems.length; i++) {
          total += cartItems[i].get("total");
          // update individual items on the cart
          let item = cartItems[i];
          item.set("order_placed", true);
          item.set("cart_token", newToken);
          item.save();
        }
        // create a new record in orders table on the server
        var Orders = Parse.Object.extend("Orders");
        var order = new Orders();
        order.set("cart_items_token", newToken);
        order.set("buyer_id", currentUser.id);
        order.set("farm_id", this.state.farm.id);
        order.set("farm_pointer", this.state.farm);
        order.set("farm_name", this.state.farm.get("category_name"));
        order.set("farmer_id", this.state.farmer.id);
        order.set("farmer_name", this.state.farmer.get("full_name"));
        order.set("farmer_pointer", this.state.farmer);
        order.set("order_accepted", false);
        order.set("order_declined", false);
        order.set("order_fulfilled", false);
        order.set("order_received", false);
        order.set("order_rejected", false);
        order.set("order_status_desc", "Order Acceptance Pending");
        order.set("num_of_items", cartItems.length);
        order.set("total_paid", total);
        order.set("transaction_pointer", transaction);
        order.set("transaction_id", transaction.id);
        order.save();
        // order placement sucessful
        this.setState({
          purchaseRequestComplete: true,
          purchaseSuccess: true,
          cartItems: [],
          cartTotal: 0,
          responseMessage: `You have successfully placed an order. The farm has been notified of your purchase and would attend to it shortly. Kindly note that the funds deducted from your account have been moved to an escrow account and would be paid to the farm when you confirm the delivery.\nWe are not to be held liable for any misconduct on the part of the farmer.`
        });
      }
    } catch{
      ShowToast(Globals.ERRORS.INTERNET_CON, "danger");
      // recall the function after 3 seconds
      // this is to ensure that the cart us updated as expeted
      timer = setTimer(() => {
        updateCartItemsPurcahseState(transaction, newToken)
      }, 3000);
    }
  }

  async getCartItems(sessionToken) {
    try {
      var CartItems = Parse.Object.extend("CartItems");
      var c_query = new Parse.Query(CartItems);
      c_query.equalTo("order_placed", false)
      c_query.equalTo("cart_token", sessionToken)
      c_query.descending("createdAt");
      const cartItems = await c_query.find();
      let farmer, farm = null;

      // calculate total
      let total = 0;
      for (i = 0; i < cartItems.length; i++) {
        total += cartItems[i].get("total");
      }

      // get farmer's data
      if (cartItems.length > 0) {
        farmer = cartItems[cartItems.length - 1].get("farmer_id");
        await farmer.fetch();

        // get farm data
        farm = farmer.get("farm_pointer_id");
        await farm.fetch();
      }

      this.setState({
        fetching: false,
        refreshControl: false,
        ajaxCallState: 200,
        ajaxCallError: null,
        cartItems: cartItems,
        cartTotal: total,
        farmer: farmer,
        purchaseSuccess: false,
        farm: farm,
        sessionToken: sessionToken,
        purchaseRequestComplete: false,
        purchaseSuccess: false,
        responseMessage: null
      });
    } catch (error) {
      this.setState({
        fetching: false,
        refreshControl: false,
        ajaxCallState: "NET_ERR",
        ajaxCallError: Globals.ERRORS.CONNECTION,
      });
    }
  }

  async initializePage(showLoader) {
    this.setState({ fetching: showLoader, refreshControl: !showLoader });
    AsyncStorage.getItem('sessionToken')
      .then(sessionToken => {
        this.getCartItems(sessionToken);
      }).done();
  }


  render() {
    const { navigate } = this.props.navigation;

    return (
      <StyleProvider style={getTheme(material)}>
        <Container style={{ flex: 1 }}>
          {this.state.fetching ? (
            <LoaderOverlay text={"We're getting your items..."} />
          ) :
            this.state.ajaxCallState == 200 ?
              // {/* Cart items */}
              <React.Fragment>
                {this.state.cartItems.length == 0 ? (
                  <ScrollView
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.refreshControl}
                        onRefresh={() => this.initializePage(false)}
                      />
                    }>
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingTop: 100,
                        paddingHorizontal: 30,
                      }}>
                      <LottieView
                        style={{ width: 200 }}
                        source={require('../assets/lottiefiles/330-empty-status.json')}
                        autoPlay
                        loop
                      />
                      <Text
                        style={[
                          styles.greyText,
                          { textAlign: 'center', fontSize: 25 },
                        ]}>
                        Nothing here to see
                </Text>
                    </View>
                  </ScrollView>
                ) : (
                    <React.Fragment>
                      <View style={{ flex: 3 }}>
                        <ScrollView
                          refreshControl={
                            <RefreshControl
                              refreshing={this.state.refreshControl}
                              onRefresh={() => this.initializePage(false)}
                            />
                          }>
                          <List>
                            {this.state.cartItems.map(item => (
                              <ListItem
                                key={item.id}
                                thumbnail
                                onPress={() =>
                                  navigate('FoodItem', {
                                    item_id: item.get("item_id"),
                                  })
                                }>
                                <Left>
                                  <Thumbnail
                                    square
                                    style={{ borderRadius: 10 }}
                                    source={require('../assets/img/white_onion_leaf.jpg')}
                                  />
                                </Left>
                                <Body>
                                  <Text>{item.get("item_name")}</Text>
                                  <Text note numberOfLines={1}>
                                    &#8358;{item.get("total")}
                                  </Text>
                                </Body>
                                <Right>
                                  <Badge style={styles.bgBrickRed}>
                                    <Text>{item.get("quantity")}</Text>
                                  </Badge>
                                </Right>
                              </ListItem>
                            ))}
                          </List>
                        </ScrollView>
                      </View>
                      <View
                        style={{
                          flex: 2,
                          borderTopWidth: 1,
                          borderTopColor: '#eee',
                          backgroundColor: "#fafafa",
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            paddingHorizontal: 20,
                            paddingTop: 20,
                          }}>
                          <View style={{ flex: 1 }}>
                            <H3>Total</H3>
                          </View>
                          <View style={{ flex: 3, alignItems: 'flex-end' }}>
                            <H3>&#8358;{this.state.cartTotal}</H3>
                            {/* <NumberFormat value={2456981} displayType={'text'} thousandSeparator={true} prefix={'₦'} renderText={value => <Text>{value}</Text>} />*/}
                          </View>
                        </View>
                        {this.state.farmer && this.state.farm != null ?
                          /* farmer's name */
                          <View
                            style={{
                              paddingHorizontal: 20,
                              marginTop: 20,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <View style={{ flex: 1 }}>
                              <Thumbnail
                                small
                                circular
                                source={{
                                  uri: 'https://picsum.photos/200',
                                }}
                              />
                            </View>
                            <View style={{ flex: 6 }}>
                              <Text style={[styles.greenText, { fontWeight: 'bold', fontSize: 15 }]}>
                                {this.state.farmer.get("full_name")}
                              </Text>
                              <Text style={styles.greenText} note>{this.state.farm.get("category_name")}</Text>
                            </View>
                          </View>
                          : null}
                      </View>
                    </React.Fragment>
                  )}

                {/* confirmation modal */}
                <MiscModal
                  hasHeader={false}
                  title={null}
                  visible={this.state.showModal}
                  transparent={true}
                  togModal={() =>
                    this.setState({ showModal: !this.state.showModal })
                  }>
                  <View style={[{ flex: 1, justifyContent: "center" }, styles.maskDarkSlight]}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ showModal: false })} />
                    <View style={[this.state.purchaseSuccess ? { flex: 2 } : { flex: 1 }, { backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 20, padding: 20, alignItems: "center" }]}>
                      <View style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa", height: 60, width: 60, borderRadius: 100, marginTop: -50 }}>
                        <Icon name={"ios-leaf"} style={styles.greenText} />
                      </View>

                      <H3 style={[styles.greenText, { alignSelf: "center", marginTop: 10 }]}>Checkout</H3>
                      {!this.state.purchaseRequestComplete ?
                        <React.Fragment>
                          <View style={{ flex: 1, padding: 2, justifyContent: "center" }}>
                            <Text style={[styles.greenText, { alignSelf: "center", textAlign: "center" }]}>You will be charged the sum of</Text>
                            <Text style={[styles.greenText, { alignSelf: "center", textAlign: "center", fontSize: 20, }]}>&#8358;{this.state.cartTotal}</Text>
                            <Text style={[styles.greenText, { alignSelf: "center", textAlign: "center" }]}>Do you wish to proceed?</Text>
                          </View>
                          <View style={{ flex: 1, flexDirection: "row", marginVertical: 10 }}>
                            <View style={{ flex: 1, justifyContent: "flex-end", paddingHorizontal: 5 }}>
                              <Button disabled={this.state.isPaying} light rounded onPress={() => this.setState({ showModal: false })}>
                                <Text>Cancel</Text>
                                <Icon name={"ios-close-circle-outline"} />
                              </Button>
                            </View>
                            <View style={{ flex: 1, justifyContent: "flex-end", paddingHorizontal: 5 }}>
                              <Button disabled={this.state.isPaying}
                                rounded
                                style={styles.bgLeafGreen}
                                onPress={() => {
                                  this.setState({ showModal: false });
                                  navigate("Checkout");
                                }}>
                                <Text style={[styles.whiteText]} >Proceed</Text>
                                {this.state.isPaying ?
                                  <Spinner
                                    color={styles.whiteText.color}
                                    size={'small'}
                                    style={{ marginRight: 15 }}
                                  />
                                  :
                                  <Icon name={"ios-checkmark-circle-outline"} />
                                }
                              </Button>
                            </View>
                          </View>
                        </React.Fragment>
                        :
                        <React.Fragment>
                          <View style={{ flex: 2, padding: 2, justifyContent: "center" }}>
                            <Text style={[styles.greenText, { alignSelf: "center", textAlign: "center" }]}>{this.state.responseMessage}</Text>
                          </View>
                          <View style={{ flex: 1, justifyContent: "flex-end", paddingHorizontal: 5 }}>
                            <Button disabled={this.state.isPaying} light rounded onPress={() => this.setState({ showModal: false })}>
                              <Text>Close</Text>
                              <Icon name={"ios-close-circle-outline"} />
                            </Button>
                          </View>
                        </React.Fragment>
                      }
                    </View>
                  </View>
                </MiscModal>

              </React.Fragment>
              :
              <ErrorOverlay
                title={"Notification"}
                errorMessage={this.state.ajaxCallError}
                action={() => this.initializePage(true)} />
          }
        </Container>
      </StyleProvider>
    );
  }
}
