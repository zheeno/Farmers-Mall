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
} from 'native-base';
import {ImageBackground, Image, ScrollView, AsyncStorage} from 'react-native';
import {styles} from '../../native-base-theme/variables/Styles';
import {MiscModal} from './components/MiscComponents';
import {GetData, ShowToast} from '../services/ApiCaller';
import {LoaderOverlay} from './components/MiscComponents';

export default class FoodItemScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      refreshControl: false,
      ajaxCallState: 200,
      ajaxCallError: null,
      showModal: false,
      foodItem: {},
      category: {},
      relatedItems: [],
      cartQty: '0',
      addedToCart: false,
      isAdding: false,
      isRemoving: false,
    };

    this.initializePage = this.initializePage.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.UNSAFE_componentWillReceiveProps = this.UNSAFE_componentWillReceiveProps.bind(
      this,
    );
  }

  componentDidMount() {
    let item_id = this.props.navigation.state.params.item_id || null;
    this.setState({item_id: item_id});
    setTimeout(() => {
      this.initializePage(true);
    }, 100);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let item_id = nextProps.navigation.state.params.item_id || null;
    this.setState({item_id: item_id, fetching: true});
    setTimeout(() => {
      this.initializePage(true);
    }, 100);
  }

  async initializePage(showLoader) {
    this.setState({fetching: showLoader, refreshControl: !showLoader});
    let item_id = this.state.item_id;
    AsyncStorage.getItem('userId')
      .then(userId => {
        AsyncStorage.getItem('cartToken')
          .then(token => {
            GetData(
              '/foodItem/' + item_id + '?user_id=' + userId + '&token=' + token,
            )
              .then(result => {
                let response = result;
                this.setState({
                  fetching: false,
                  refreshControl: false,
                  ajaxCallState: 200,
                  ajaxCallError: null,
                  foodItem: response.foodItem,
                  category: response.category,
                  relatedItems: response.relatedItems,
                  cartQty: '' + response.cartInfo.itemQty,
                  addedToCart: response.cartInfo.addedToCart,
                });
              })
              .catch(error => {
                this.setState({
                  fetching: false,
                  refreshControl: false,
                  ajaxCallState: 'NET_ERR',
                  ajaxCallError: error.message,
                });
                ShowToast(error.message, 'danger');
              });
          })
          .done();
      })
      .done();
  }

  async addToCart(addItem) {
    this.setState({
      isAdding: addItem,
      isRemoving: !addItem,
    });
    AsyncStorage.getItem('userId')
      .then(userId => {
        AsyncStorage.getItem('cartToken')
          .then(token => {
            url =
              '/removeFromCart?item_id=' +
              this.state.item_id +
              '&user_id=' +
              userId +
              '&token=' +
              token;
            if (addItem == true) {
              url =
                '/addToCart?item_id=' +
                this.state.item_id +
                '&user_id=' +
                userId +
                '&qty=' +
                this.state.cartQty +
                '&token=' +
                token;
            }
            GetData(url)
              .then(result => {
                let response = result;
                this.setState({
                  fetching: false,
                  refreshControl: false,
                  ajaxCallState: 200,
                  ajaxCallError: null,
                  showModal: false,
                  isAdding: false,
                  isRemoving: false,
                  cartQty: '' + response.item.cartInfo.itemQty,
                  addedToCart: response.item.cartInfo.addedToCart,
                });
                // set cartToken value in asyncStorage
                AsyncStorage.setItem('cartToken', response.token);
                AsyncStorage.setItem('fingerPrint', ""+response.fingerPrint)
                if (addItem == true) {
                  if (response.item.cartInfo.addedToCart) {
                    ShowToast(
                      this.state.foodItem.item_name + ' has been added to cart',
                      'success',
                    );
                  } else {
                    ShowToast(
                      'Error encountered while adding to cart',
                      'danger',
                    );
                  }
                }
              })
              .catch(error => {
                this.setState({
                  fetching: false,
                  refreshControl: false,
                  ajaxCallState: 'NET_ERR',
                  ajaxCallError: error.message,
                  showModal: false,
                  isAdding: false,
                  isRemoving: false,
                });
                ShowToast(error.message, 'danger');
              });
          })
          .done();
      })
      .done();
  }

  render() {
    const {navigate} = this.props.navigation;

    return (
      <StyleProvider style={getTheme(material)}>
        {this.state.fetching ? (
          <LoaderOverlay text={"We're preparing your food item..."} />
          ) : (
          <Container style={{flex: 1}}>
            <ScrollView>
              {/* food item image */}
              <ImageBackground
                source={require('../assets/img/white_onion_leaf.jpg')}
                style={[styles.bgLeafGreen, {height: 300}]}>
                <View style={[styles.maskSlight, {height: '100%'}]}></View>
              </ImageBackground>
              <View
                style={{
                  backgroundColor: '#FFF',
                }}>
                {/* food item info */}
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 3, paddingTop: 20, paddingLeft: 10}}>
                    <H1 style={{fontWeight: 'bold'}}>
                      {this.state.foodItem.item_name}
                    </H1>
                    <Text note>{this.state.foodItem.description}</Text>
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
                      onPress={() => this.setState({showModal: true})}>
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
                  <Badge style={[styles.bgLeafGreenSlight, {margin: 2}]}>
                    <Text style={{fontSize: 10}}>
                      {this.state.category.category_name}
                    </Text>
                  </Badge>
                  {this.state.addedToCart ? (
                    <Badge style={[styles.bgBrickRed, {margin: 2}]}>
                      <Text style={{fontSize: 10}}>Added to Cart</Text>
                    </Badge>
                  ) : null}
                </View>
                {/* farmer info */}
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingTop: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View style={{flex: 1}}>
                    <Thumbnail
                      small
                      circular
                      source={{
                        uri:
                          'data:image/jpeg;base64,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',
                      }}
                    />
                  </View>
                  <View style={{flex: 6}}>
                    <Text style={{fontWeight: 'bold', fontSize: 15}}>
                      Ekhoragbon Endurance
                    </Text>
                    <Text note>
                      255k Sales&nbsp;&middot;&nbsp;100 Followers
                    </Text>
                  </View>
                </View>
                {/* food item price & unit measurement */}
                <View style={{flexDirection: 'row', paddingVertical: 20}}>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <H1 style={{fontSize: 20}}>
                      &#8358;{this.state.foodItem.price}
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
                    <H1 style={{fontSize: 20}}>
                      {this.state.foodItem.tax * 100}%
                    </H1>
                    <Text note>Tax</Text>
                  </View>
                </View>
                {/* Reviews */}
                <View
                  style={
                    this.state.relatedItems.length == 0
                      ? {marginBottom: 80}
                      : null
                  }>
                  <H3 style={{marginLeft: 10, fontSize: 20}}>
                    Reviews / Ratings
                  </H3>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingLeft: 10,
                      paddingBottom: 20,
                    }}>
                    <View style={{flex: 1, paddingTop: 5}}>
                      {/* 1 star */}
                      <View style={{flexDirection: 'row'}}>
                        <View
                          style={{
                            flex: 1,
                            padding: 0,
                            flexDirection: 'row',
                          }}>
                          <Icon
                            name={'ios-star'}
                            style={{fontSize: 13, color: '#f57f17'}}
                          />
                        </View>
                        <View
                          style={{
                            flex: 1,
                            padding: 0,
                            alignItems: 'flex-end',
                          }}>
                          <Text numberOfLines={1} style={{fontSize: 13}}>
                            23
                          </Text>
                        </View>
                      </View>
                      {/* 2 stars */}
                      <View style={{flexDirection: 'row'}}>
                        <View
                          style={{
                            flex: 1,
                            padding: 0,
                            flexDirection: 'row',
                          }}>
                          <Icon
                            name={'ios-star'}
                            style={{fontSize: 13, color: '#f57f17'}}
                          />
                          <Icon
                            name={'ios-star'}
                            style={{fontSize: 13, color: '#f57f17'}}
                          />
                        </View>
                        <View
                          style={{
                            flex: 1,
                            padding: 0,
                            alignItems: 'flex-end',
                          }}>
                          <Text numberOfLines={1} style={{fontSize: 13}}>
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
                  <View style={{marginBottom: 80}}>
                    <H3 style={{marginLeft: 10, fontSize: 20}}>
                      Related Items
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
                              style={{borderRadius: 10}}
                              source={require('../assets/img/white_onion_leaf.jpg')}
                            />
                          </Left>
                          <Body>
                            <Text>{item.item_name}</Text>
                            <Text note numberOfLines={1}>
                              {item.description}
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
                this.setState({showModal: !this.state.showModal})
              }>
              <View style={[{flex: 1}, styles.maskDarkSlight]}>
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
                    <View style={{flex: 1, alignItems: 'center'}}>
                      <Button
                        small
                        transparent
                        onPress={() => this.setState({showModal: false})}>
                        <Icon name={'ios-close'} style={{color: '#777'}} />
                      </Button>
                    </View>
                    <View style={{flex: 4, justifyContent: 'center'}}>
                      <Text>Add to cart</Text>
                    </View>
                  </View>
                  <ScrollView style={{padding: 10}}>
                    {/* item description */}
                    <View>
                      <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                        {this.state.foodItem.item_name}
                      </Text>
                      <Text note numberOfLines={3}>
                        {this.state.foodItem.description}
                      </Text>
                    </View>
                    {/* quantity */}
                    <View style={{alignItems: 'center', paddingTop: 20}}>
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
                        style={{alignItems: 'center', fontSize: 30, height: 60}}
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
                    <View style={{paddingTop: 20}}>
                      <H1>Summary</H1>
                      <View style={{alignItems: 'flex-end'}}>
                        <H3>
                          &#8358;
                          {this.state.foodItem.price *
                            Number(this.state.cartQty)}
                        </H3>
                        <Text note style={{marginTop: -5}}>
                          Amount
                        </Text>
                        <H3 style={{marginTop: 10}}>
                          &#8358;
                          {this.state.foodItem.price *
                            Number(this.state.cartQty) *
                            this.state.foodItem.tax}
                        </H3>
                        <Text note style={{marginTop: -5}}>
                          ({this.state.foodItem.tax * 100}%) Tax
                        </Text>
                        <H3 style={{marginTop: 10}}>
                          &#8358;
                          {this.state.foodItem.price *
                            Number(this.state.cartQty) +
                            this.state.foodItem.price *
                              Number(this.state.cartQty) *
                              this.state.foodItem.tax}
                        </H3>
                        <Text note style={{marginTop: -5}}>
                          Total
                        </Text>
                      </View>
                    </View>
                    {/* action buttons */}
                    <View style={{flexDirection: 'row', paddingVertical: 10}}>
                      {/* add to cart button */}
                      <View style={{flex: 1, paddingHorizontal: 5}}>
                        <Button
                          block
                          iconRight
                          rounded
                          style={[styles.bgLeafGreen, {minWidth: 40}]}
                          disabled={
                            (this.state.isAdding || this.state.isRemoving) || (Number(this.state.cartQty) == 0)
                          }
                          onPress={() => {
                            this.addToCart(true);
                          }}>
                          <Text
                            style={[
                              {textTransform: 'capitalize'},
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
                        <View style={{flex: 1, paddingHorizontal: 5}}>
                          <Button
                            block
                            iconRight
                            rounded
                            style={[styles.bgGrey, {minWidth: 40}]}
                            disabled={
                              this.state.isAdding || this.state.isRemoving
                            }
                            onPress={() => {
                              this.addToCart(false);
                            }}>
                            <Text
                              style={[
                                {textTransform: 'capitalize'},
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
        )}
      </StyleProvider>
    );
  }
}
