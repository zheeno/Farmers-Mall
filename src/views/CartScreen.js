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
  List,
  ListItem,
  Left,
  Right,
  Thumbnail,
  Body,
  H3,
  Badge,
} from 'native-base';
import {
  ImageBackground,
  Image,
  ScrollView,
  AsyncStorage,
  RefreshControl,
} from 'react-native';
import {styles} from '../../native-base-theme/variables/Styles';
import {GetData, ShowToast} from '../services/ApiCaller';
import {LoaderOverlay} from './components/MiscComponents';

export default class CartScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      refreshControl: false,
      ajaxCallState: 200,
      ajaxCallError: null,
      cartFingerPrint: null,
      cartItems: [],
      cartTotal: '0.00',
    };

    this.initializePage = this.initializePage.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.startTimer = this.startTimer.bind(this);
  }

  componentDidMount() {
    this.initializePage(true);
    this.startTimer();
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

  async initializePage(showLoader) {
    this.setState({fetching: showLoader, refreshControl: !showLoader});
    AsyncStorage.getItem('userId')
      .then(userId => {
        AsyncStorage.getItem('cartToken')
          .then(token => {
            GetData('/getCartItems?user_id=' + userId + '&token=' + token)
              .then(result => {
                let response = result;
                this.setState({
                  fetching: false,
                  refreshControl: false,
                  ajaxCallState: 200,
                  ajaxCallError: null,
                  cartItems: response.cartItems,
                  cartTotal: response.cartTotal,
                  cartFingerPrint: response.fingerPrint,
                });
                AsyncStorage.setItem('fingerPrint', '' + response.fingerPrint);
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

  render() {
    const {navigate} = this.props.navigation;

    return (
      <StyleProvider style={getTheme(material)}>
        <Container style={{flex: 1}}>
          {this.state.fetching ? (
            <LoaderOverlay text={"We're getting your items..."} />
          ) : // {/* Cart items */}
          this.state.cartItems.length == 0 ? (
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
                  paddingHorizontal: 10,
                }}>
                <Icon
                  type={'FontAwesome'}
                  name="shopping-cart"
                  style={[styles.greyText, {fontSize: 100}]}
                />
                <Text
                  style={[
                    styles.greyText,
                    {textAlign: 'center', fontSize: 20},
                  ]}>
                  There are no items in your cart
                </Text>
              </View>
            </ScrollView>
          ) : (
            <React.Fragment>
              <View style={{flex: 3}}>
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
                        key={item.cartContent.id}
                        thumbnail
                        onPress={() =>
                          navigate('FoodItem', {
                            item_id: item.itemData.id,
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
                          <Text>{item.itemData.item_name}</Text>
                          <Text note numberOfLines={1}>
                            &#8358;{item.cartContent.total}
                          </Text>
                        </Body>
                        <Right>
                          <Badge style={styles.bgBrickRed}>
                            <Text>{item.cartContent.qty}</Text>
                          </Badge>
                        </Right>
                      </ListItem>
                    ))}
                  </List>
                </ScrollView>
              </View>
              <View
                style={{
                  flex: 1,
                  borderTopWidth: 1,
                  borderTopColor: '#eee',
                }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    paddingHorizontal: 20,
                    paddingTop: 10,
                  }}>
                  <View style={{flex: 1}}>
                    <H3>Total</H3>
                  </View>
                  <View style={{flex: 3, alignItems: 'flex-end'}}>
                    <H3>&#8358;{this.state.cartTotal}</H3>
                  </View>
                </View>
                <View style={{flex: 1, paddingHorizontal: 40}}>
                  <Button block rounded style={[styles.bgLeafGreen]} iconRight>
                    <Text
                      style={[styles.whiteText, {textTransform: 'capitalize'}]}>
                      Checkout
                    </Text>
                    <Icon type={'MaterialCommunityIcons'} name={'wallet'} />
                  </Button>
                </View>
              </View>
            </React.Fragment>
          )}
        </Container>
      </StyleProvider>
    );
  }
}
