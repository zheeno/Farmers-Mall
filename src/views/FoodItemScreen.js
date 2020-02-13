import React, { Component } from 'react';
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
  H1,
  H3,
  Body,
  Thumbnail,
  Badge,
  List,
  ListItem,
  Left,
  Right,
  Spinner,
  Header
} from 'native-base';
import { ImageBackground, Image, ScrollView, AsyncStorage, TouchableOpacity, StatusBar } from 'react-native';
import { styles } from '../../native-base-theme/variables/Styles';
import { MiscModal } from './components/MiscComponents';
import { GetData, ShowToast } from '../services/ApiCaller';
import { LoaderOverlay } from './components/MiscComponents';
import Parse from 'parse/react-native';
import { sha256 } from 'react-native-sha256';
// const Twilio = require('react-native-twilio');
import SafeAreaView from 'react-native-safe-area-view';



export default class FoodItemScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      refreshControl: false,
      ajaxCallState: 404,
      ajaxCallError: null,
      showModal: false,
      foodItem: {},
      category_id: null,
      category_name: null,
      category: null,
      farmer: null,
      relatedItems: [],
      cartItemInstance: null,
      cartQty: '1',
      cartItemId: null,
      addedToCart: false,
      canBeAdded: true,
      isAdding: false,
      isRemoving: false,
    };

    this.initializePage = this.initializePage.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.removeFromCart = this.removeFromCart.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.getMetaData = this.getMetaData.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.UNSAFE_componentWillReceiveProps = this.UNSAFE_componentWillReceiveProps.bind(
      this,
    );
  }

  componentDidMount() {
    let item_id = this.props.navigation.state.params.item_id || null;
    this.setState({ item_id: item_id });
    setTimeout(() => {
      this.initializePage(true);
    }, 100);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let item_id = nextProps.navigation.state.params.item_id || null;
    this.setState({ item_id: item_id, fetching: true });
    setTimeout(() => {
      this.initializePage(true);
    }, 100);
  }

  async getMetaData(foodItem, token) {
    // fetch selected food item's category info from cloud server
    const category = foodItem.get("parent");
    await category.fetch();
    // get food items from the same farm
    const FoodItems = Parse.Object.extend("FoodItems");
    const query = new Parse.Query(FoodItems);
    query.equalTo("farmer", foodItem.get("farmer"));
    query.notEqualTo("objectId", foodItem.id);
    query.descending("createdAt");
    query.limit(5);
    const relatedItems = await query.find();

    // get farmer's details
    const farmer = foodItem.get("farmer");
    await farmer.fetch();
    const full_name = farmer.get("full_name");

    // get number of sales made by the farm
    const Orders = Parse.Object.extend("Orders");
    const o_query = new Parse.Query(Orders);
    o_query.equalTo("farm_id", farmer.get('farm_id'));
    o_query.equalTo("order_fulfilled", true);
    const farmSales = await o_query.find();
    let buyerIDs = [];
    // get number of distinct customers who patronized the farm
    for (i = 0; i < farmSales.length; i++) {
      if (!buyerIDs.includes(farmSales[i].get("buyer_id"))) {
        buyerIDs.push(farmSales[i].get("buyer_id"))
      }
    }
    // get cart data (this helps to know if the selected item 
    // has been added to the user's cart)
    let canBeAddedToCart = true, addedToCart = false;
    let itemQty = 1;
    let cartItemId = null, _cartItemInstance = null;
    const CartItems = Parse.Object.extend("CartItems");
    const c_query = new Parse.Query(CartItems);
    c_query.equalTo("order_placed", false);
    c_query.equalTo("cart_token", token);
    const cartItem = await c_query.find();
    for (i = 0; i < cartItem.length; i++) {
      if (cartItem[i].get("item_id") == foodItem.id) {
        // update state parameters wrt cart data
        addedToCart = true;
        itemQty = cartItem[i].get("quantity");
        cartItemId = cartItem[i].id;
        _cartItemInstance = cartItem[i];
      } else {
        // logic to determine if food item is from the same farm as the other items on the cart
        if (cartItem[i].get("farmer_user_id") == farmer.id) {
          canBeAddedToCart = true;
        } else {
          canBeAddedToCart = false;
        }
      }
    }

    this.setState({
      foodItem: foodItem,
      farmer: farmer,
      category: category,
      relatedItems: relatedItems,
      farmSales: farmSales.length,
      customers: buyerIDs.length,
      fetching: false,
      refreshControl: false,
      ajaxCallState: 200,
      ajaxCallError: null,
      cartQty: '' + itemQty,
      addedToCart: addedToCart,
      cartItemId: cartItemId,
      canBeAdded: canBeAddedToCart,
      cartItemInstance: _cartItemInstance
    });
  }

  async initializePage(showLoader) {
    this.setState({ fetching: showLoader, refreshControl: !showLoader });
    let item_id = this.state.item_id;
    // fetch selected food item from cloud
    var FoodItems = Parse.Object.extend("FoodItems");
    var f_query = new Parse.Query(FoodItems);
    AsyncStorage.getItem('sessionToken')
      .then(token => {
        f_query.get(item_id)
          .then((foodItem) => {
            // The object was retrieved successfully.
            this.getMetaData(foodItem, token);
          }, (error) => {
            // The object was not retrieved successfully.
            // error is a Parse. Error with an error code and message.
            this.setState({
              fetching: false,
              refreshControl: false,
              ajaxCallState: 'NET_ERR',
              ajaxCallError: error.message,
            });
            ShowToast("Unable to connect to the server. Please check your internet connection", 'danger');
            this.props.navigation.goBack(null);
          });
      }).done();
  }


  async removeFromCart() {
    this.setState({ isAdding: false, isRemoving: true });
    AsyncStorage.getItem('sessionToken')
      .then(token => {
        this.removeItem(token);
      }).done();
  }

  async removeItem(token) {
    const query = new Parse.Query("CartItems");
    const object = await query.get(this.state.cartItemId);
    try {
      if (!object.get("order_placed")) {
        object.destroy();
        ShowToast(
          this.state.foodItem.get("item_name") + ' has been removed from your cart',
          'success',
        );
        this.getMetaData(this.state.foodItem, token);
      } else {
        ShowToast("Can not remove item from cart. Please reload the content", 'danger');
      }
    } catch (e) {
      ShowToast(e, 'danger');
    }
    this.setState({ isAdding: false, isRemoving: false, showModal: false });
  }


  async addToCart(addItem) {
    const farmer = this.state.foodItem.get("farmer");
    await farmer.fetch();

    AsyncStorage.getItem('sessionToken')
      .then(sessionToken => {
        var CartItems = Parse.Object.extend("CartItems");
        // check if item has been added to cart
        if (this.state.addedToCart) {
          // update cart item
          this.setState({ isAdding: addItem, isRemoving: !addItem });
          const query = new Parse.Query("CartItems");
          query.get(this.state.cartItemId).then(cartItem => {
            // check if item has been placed in a previous cart and paid for
            // then the user navigates back to the same view without updating the view
            if (!cartItem.get("order_placed")) {
              cartItem.set("quantity", Number(this.state.cartQty));
              cartItem.set("price", this.state.foodItem.get("price"));
              cartItem.set("tax", this.state.foodItem.get("tax"));
              cartItem.set("discount", 0);
              cartItem.set("total", (
                this.state.foodItem.get("price") *
                Number(this.state.cartQty) +
                this.state.foodItem.get("price") *
                Number(this.state.cartQty) *
                this.state.foodItem.get("tax"))
              );
              cartItem.set("order_placed", false);
              cartItem.save().then(objUpdate => {
                this.getMetaData(this.state.foodItem, sessionToken);
              });
            } else {
              this.setState({ isAdding: false, isRemoving: false, showModal: false });
              ShowToast("Can not update item. Please reload the content", 'danger');
            }
          });
        } else {
          if (!this.state.canBeAdded) {
            this.setState({
              isAdding: false,
              isRemoving: false,
              showModal: false,
            });
            ShowToast(
              'Items from different farms can not be added to the same cart',
              'danger',
            );
          } else {
            // create a new cart item
            this.setState({ isAdding: addItem, isRemoving: !addItem });
            var cartItem = new CartItems();
            cartItem.set("cart_token", sessionToken);
            cartItem.set("item_name", this.state.foodItem.get("item_name"));
            cartItem.set("quantity", Number(this.state.cartQty));
            cartItem.set("price", this.state.foodItem.get("price"));
            cartItem.set("tax", this.state.foodItem.get("tax"));
            cartItem.set("discount", 0);
            cartItem.set("total", (
              this.state.foodItem.get("price") *
              Number(this.state.cartQty) +
              this.state.foodItem.get("price") *
              Number(this.state.cartQty) *
              this.state.foodItem.get("tax"))
            );
            cartItem.set("buyer_id", this.state.foodItem.get("farmer")); // logged in user id
            cartItem.set("buyer_user_id", farmer.id); // logged in user id
            cartItem.set("farmer_id", this.state.foodItem.get("farmer"));
            cartItem.set("farmer_user_id", farmer.id);
            cartItem.set("food_item_id", this.state.foodItem);
            cartItem.set("item_id", this.state.foodItem.id);
            cartItem.set("order_placed", false);
            cartItem.save();
            this.setState({
              isAdding: false,
              isRemoving: false,
              showModal: false,
            });
            this.getMetaData(this.state.foodItem, sessionToken);
            ShowToast(
              this.state.foodItem.get("item_name") + ' has been added to cart',
              'success',
            );
          }
        }
      }).done();
  }

  render() {
    const { navigate } = this.props.navigation;

    return (
      <StyleProvider style={getTheme(material)}>
        <SafeAreaView style={[styles.container]}>
          <StatusBar barStyle="light-content" backgroundColor="#33bbff" />
          {this.state.fetching ? (
            <LoaderOverlay text={"We're preparing your food item..."} />
          ) : (
              this.state.ajaxCallState == 200 ?
                <Container style={{ flex: 1 }}>
                  <ScrollView>
                    {/* food item image */}
                    <ImageBackground
                      source={require('../assets/img/white_onion_leaf.jpg')}
                      style={[styles.bgLeafGreen, { height: 300 }]}>
                      <View style={[styles.maskDarkLight, { height: '100%' }]}>
                        <Header transparent style={{ height: 50 }}>
                          <Left>
                            <TouchableOpacity style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
                              onPress={() => this.props.navigation.goBack(null)}
                            >
                              <Icon name={"ios-arrow-back"} style={styles.whiteText} />
                            </TouchableOpacity>
                          </Left>
                          <Body />
                        </Header>
                      </View>
                    </ImageBackground>
                    <View
                      style={{
                        backgroundColor: '#FFF',
                      }}>
                      {/* food item info */}
                      <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 3, paddingTop: 20, paddingLeft: 10 }}>
                          <H1 style={{ fontWeight: 'bold' }}>
                            {this.state.foodItem.get("item_name")}
                          </H1>
                          <Text note>{this.state.foodItem.get("item_description")}</Text>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            padding: 10,
                          }}>
                          <Button
                            rounded
                            style={styles.largeRoundBtn}
                            onPress={() => this.setState({ showModal: true })}>
                            <Icon name="add-shopping-cart" type={'MaterialIcons'} />
                          </Button>
                        </View>
                      </View>
                      {/* badges */}
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          padding: 10,
                        }}>
                        {this.state.category != null ?
                          <TouchableOpacity onPress={() => navigate("Category", {
                            category_id: this.state.category.id
                          })}>
                            <Badge style={[styles.bgLeafGreenSlight, { margin: 2 }]}>
                              <Text style={{ fontSize: 10 }}>
                                {this.state.category.get("category_name")}
                              </Text>
                            </Badge>
                          </TouchableOpacity>
                          : null}
                        {this.state.addedToCart ? (
                          <Badge style={[styles.bgBrickRed, { margin: 2 }]}>
                            <Text style={{ fontSize: 10 }}>Added to Cart</Text>
                          </Badge>
                        ) : null}
                      </View>
                      {/* farmer info */}
                      {this.state.farmer != null ?
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingTop: 20,
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
                            <Text style={{ fontWeight: 'bold', fontSize: 15 }}>
                              {this.state.farmer.get("full_name")}
                            </Text>
                            <Text note>{Number(this.state.farmSales)} Sale{this.state.farmSales > 1 ? 's' : null}&nbsp;&middot;&nbsp;{Number(this.state.customers)} Customer{this.state.customers > 1 ? 's' : null}</Text>
                          </View>
                        </View>
                        : null
                      }
                      {/* food item price & unit measurement */}
                      <View style={{ flexDirection: 'row', paddingVertical: 20 }}>
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <H1 style={{ fontSize: 20 }}>
                            &#8358;{this.state.foodItem.get("price")}
                          </H1>
                          <Text note>Price</Text>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderLeftWidth: 1,
                            borderLeftColor: '#CCC',
                          }}>
                          <H1 style={{ fontSize: 20 }}>
                            {this.state.foodItem.get("tax") * 100}%
                    </H1>
                          <Text note>Tax</Text>
                        </View>
                      </View>
                      {/* Reviews */}
                      <View
                        style={
                          this.state.relatedItems.length == 0
                            ? { marginBottom: 80 }
                            : null
                        }>
                        <H3 style={{ marginLeft: 10, fontSize: 20 }}>
                          Reviews / Ratings
                  </H3>
                        <View
                          style={{
                            flexDirection: 'row',
                            paddingLeft: 10,
                            paddingBottom: 20,
                          }}>
                          <View style={{ flex: 1, paddingTop: 5 }}>
                            {/* 1 star */}
                            <View style={{ flexDirection: 'row' }}>
                              <View
                                style={{
                                  flex: 1,
                                  padding: 0,
                                  flexDirection: 'row',
                                }}>
                                <Icon
                                  name={'ios-star'}
                                  style={{ fontSize: 13, color: '#f57f17' }}
                                />
                              </View>
                              <View
                                style={{
                                  flex: 1,
                                  padding: 0,
                                  alignItems: 'flex-end',
                                }}>
                                <Text numberOfLines={1} style={{ fontSize: 13 }}>
                                  23
                          </Text>
                              </View>
                            </View>
                            {/* 2 stars */}
                            <View style={{ flexDirection: 'row' }}>
                              <View
                                style={{
                                  flex: 1,
                                  padding: 0,
                                  flexDirection: 'row',
                                }}>
                                <Icon
                                  name={'ios-star'}
                                  style={{ fontSize: 13, color: '#f57f17' }}
                                />
                                <Icon
                                  name={'ios-star'}
                                  style={{ fontSize: 13, color: '#f57f17' }}
                                />
                              </View>
                              <View
                                style={{
                                  flex: 1,
                                  padding: 0,
                                  alignItems: 'flex-end',
                                }}>
                                <Text numberOfLines={1} style={{ fontSize: 13 }}>
                                  5
                          </Text>
                              </View>
                            </View>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <H1>3.2</H1>
                            <Text note>Rating</Text>
                          </View>
                        </View>
                      </View>
                      {/* Related items */}
                      {this.state.relatedItems.length > 0 ? (
                        <View style={{ marginBottom: 80 }}>
                          <H3 style={{ marginLeft: 10, fontSize: 20 }}>
                            Other Items from this farm
                    </H3>
                          <List>
                            {this.state.relatedItems.map(item => (
                              <ListItem
                                key={item.id}
                                thumbnail
                                onPress={() =>
                                  navigate('FoodItem', {
                                    item_id: item.id,
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
                                    {item.get("item_description")}
                                  </Text>
                                </Body>
                              </ListItem>
                            ))}
                          </List>
                        </View>
                      ) : null}
                      {/* Related items ends here */}
                    </View>
                  </ScrollView>
                  {/* modal */}
                  <MiscModal
                    hasHeader={false}
                    title={null}
                    visible={this.state.showModal}
                    transparent={true}
                    togModal={() =>
                      this.setState({ showModal: !this.state.showModal })
                    }>
                    <View style={[{ flex: 1 }, styles.maskDarkSlight]}>
                      <View
                        style={{
                          flex: 1,
                          marginHorizontal: 10,
                          marginTop: 40,
                          borderRadius: 20,
                          bottom: -30,
                          backgroundColor: '#FFF',
                          paddingHorizontal: 10,
                          paddingVertical: 10,
                        }}>
                        <View
                          style={{
                            paddingBottom: 3,
                            flexDirection: 'row',
                            borderBottomWidth: 0.5,
                            borderBottmColor: '#eeeeee',
                          }}>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Button
                              small
                              transparent
                              onPress={() => this.setState({ showModal: false })}>
                              <Icon name={'ios-close'} style={{ color: '#777' }} />
                            </Button>
                          </View>
                          <View style={{ flex: 4, justifyContent: 'center' }}>
                            <Text>Add to cart</Text>
                          </View>
                        </View>
                        <ScrollView style={{ padding: 10 }}>
                          {/* item description */}
                          <View>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                              {this.state.foodItem.get("item_name")}
                            </Text>
                            <Text note numberOfLines={3}>
                              {this.state.foodItem.get("item_description")}
                            </Text>
                          </View>
                          {/* quantity */}
                          <View style={{ alignItems: 'center', paddingTop: 20 }}>
                            <Button
                              small
                              style={styles.bgLeafGreen}
                              onPress={() => {
                                this.setState({
                                  cartQty: '' + (Number(this.state.cartQty) + 1),
                                });
                              }}>
                              <Text>+</Text>
                            </Button>
                            <Input
                              defaultValue={this.state.cartQty}
                              style={{ alignItems: 'center', fontSize: 30, height: 60 }}
                            />
                            <Button
                              small
                              style={styles.bgLeafGreen}
                              onPress={() => {
                                this.setState({
                                  cartQty: '' + (Number(this.state.cartQty) - 1),
                                });
                              }}>
                              <Text>-</Text>
                            </Button>
                            <Text note>Quantity</Text>
                          </View>
                          {/* summary */}
                          <View style={{ paddingTop: 20 }}>
                            <H1>Summary</H1>
                            <View style={{ alignItems: 'flex-end' }}>
                              <H3>
                                &#8358;
                          {this.state.foodItem.get("price") *
                                  Number(this.state.cartQty)}
                              </H3>
                              <Text note style={{ marginTop: -5 }}>
                                Amount
                        </Text>
                              <H3 style={{ marginTop: 10 }}>
                                &#8358;
                          {this.state.foodItem.get("price") *
                                  Number(this.state.cartQty) *
                                  this.state.foodItem.get("tax")}
                              </H3>
                              <Text note style={{ marginTop: -5 }}>
                                ({this.state.foodItem.get("tax") * 100}%) Tax
                        </Text>
                              <H3 style={{ marginTop: 10 }}>
                                &#8358;
                          {this.state.foodItem.get("price") *
                                  Number(this.state.cartQty) +
                                  this.state.foodItem.get("price") *
                                  Number(this.state.cartQty) *
                                  this.state.foodItem.get("tax")}
                              </H3>
                              <Text note style={{ marginTop: -5 }}>
                                Total
                        </Text>
                            </View>
                          </View>
                          {/* action buttons */}
                          <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
                            {/* add to cart button */}
                            <View style={{ flex: 1, paddingHorizontal: 5 }}>
                              <Button
                                block
                                iconRight
                                rounded
                                style={[styles.bgLeafGreen, { minWidth: 40 }]}
                                disabled={
                                  (this.state.isAdding || this.state.isRemoving) || (Number(this.state.cartQty) == 0)
                                }
                                onPress={() => {
                                  this.addToCart(true);
                                }}>
                                <Text
                                  style={[
                                    { textTransform: 'capitalize' },
                                    styles.whiteText,
                                  ]}>
                                  {this.state.addedToCart
                                    ? 'Update'
                                    : 'Add Item'}
                                </Text>
                                {this.state.isAdding ? (
                                  <Spinner
                                    color={styles.whiteText.color}
                                    size={'small'}
                                  />
                                ) : (
                                    <Icon
                                      name="add-shopping-cart"
                                      type={'MaterialIcons'}
                                      style={styles.whiteText}
                                    />
                                  )}
                              </Button>
                            </View>
                            {/* remove from cart button */}
                            {this.state.addedToCart ? (
                              <View style={{ flex: 1, paddingHorizontal: 5 }}>
                                <Button
                                  block
                                  iconRight
                                  rounded
                                  style={[styles.bgGrey, { minWidth: 40 }]}
                                  disabled={
                                    this.state.isAdding || this.state.isRemoving
                                  }
                                  onPress={this.removeFromCart}>
                                  <Text
                                    style={[
                                      { textTransform: 'capitalize' },
                                      styles.greenText,
                                    ]}>
                                    Remove
                            </Text>
                                  {this.state.isRemoving ? (
                                    <Spinner
                                      color={styles.greenText.color}
                                      size={'small'}
                                    />
                                  ) : (
                                      <Icon
                                        name="remove-shopping-cart"
                                        type={'MaterialIcons'}
                                        style={styles.greenText}
                                      />
                                    )}
                                </Button>
                              </View>
                            ) : null}
                          </View>
                        </ScrollView>
                      </View>
                    </View>
                  </MiscModal>
                </Container>
                :
                <View>
                  <Text>Connection Error</Text>
                </View>
            )}
        </SafeAreaView>
      </StyleProvider>
    );
  }
}
