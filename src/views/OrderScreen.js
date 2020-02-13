import React, { Component } from 'react';
import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';
import NumberFormat from 'react-number-format';
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
    Linking,
    Platform
} from 'react-native';
import { styles } from '../../native-base-theme/variables/Styles';
import { GetData, ShowToast } from '../services/ApiCaller';
import { LoaderOverlay, MiscModal, ErrorOverlay } from './components/MiscComponents';
import Parse from "parse/react-native";
const Globals = require('../services/Globals');

export default class OrderScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fetching: true,
            refreshControl: false,
            ajaxCallState: 200,
            ajaxCallError: null,
            cart_items_token: null,
            order_id: null,
            order: null,
            cartItems: [],
            cartTotal: '0.00',
            showModal: false,
        };

        this.initializePage = this.initializePage.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.getCartItems = this.getCartItems.bind(this);
        this.getOrder = this.getOrder.bind(this);
        this.callFarm = this.callFarm.bind(this);
        this.receiveOrDeclineOrder = this.receiveOrDeclineOrder.bind(this);
    }

    componentDidMount() {
        let order_id = this.props.navigation.state.params.order_id || null;
        let cart_items_token = this.props.navigation.state.params.cart_items_token || null;
        this.setState({ cart_items_token: cart_items_token, order_id: order_id });
        setTimeout(() => {
            this.initializePage(true);
        }, 100);
    }

    callFarm(phoneNo) {
        let phoneNumber = '';

        if (Platform.OS === 'android') {
            phoneNumber = 'tel:${' + phoneNo + '}';
        } else {
            phoneNumber = 'telprompt:${' + phoneNo + '}';
        }

        Linking.openURL(phoneNumber);
    }

    receiveOrDeclineOrder(receive) {
        try {
            this.setState({ refreshControl: true });
            var Orders = Parse.Object.extend("Orders");
            var order = new Parse.Query(Orders);
            order.get(this.state.order.id)
                .then((order) => {
                    // The object was retrieved successfully.
                    if (receive) {
                        // buyer accepted the order
                        order.set("order_received", true);
                        order.set("order_rejected", false);
                        order.set("order_status_desc", "Order was received by the customer");
                        order.save();
                        ShowToast("You have received the order", "success");
                    } else {
                        // buyer declined the order
                        order.set("order_received", false);
                        order.set("order_rejected", true);
                        order.set("order_status_desc", "Order was rejected by the customer");
                        order.save();
                        ShowToast("You have rejected the order", "success");
                    }
                    this.initializePage(false);
                }, (error) => {
                    // The object was not retrieved successfully.
                    // error is a Parse. Error with an error code and message.
                    this.setState({
                        fetching: false,
                        refreshControl: false,
                        ajaxCallState: 'NET_ERR',
                        ajaxCallError: error.message,
                    });
                    ShowToast(error.message, "danger");
                });
        } catch (error) {
            ShowToast(Globals.ERRORS.INTERNET_CON, "danger");
        }
    }

    async getCartItems(sessionToken) {
        var CartItems = Parse.Object.extend("CartItems");
        var c_query = new Parse.Query(CartItems);
        c_query.equalTo("order_placed", true)
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
            purchaseRequestComplete: false,
            purchaseSuccess: false,
            responseMessage: null
        });

    }

    async getOrder(item_id) {
        var Orders = Parse.Object.extend("Orders");
        var order = new Parse.Query(Orders);
        order.get(item_id)
            .then((order) => {
                // The object was retrieved successfully.
                this.setState({ order: order });
                this.getCartItems(this.state.cart_items_token);
            }, (error) => {
                // The object was not retrieved successfully.
                // error is a Parse. Error with an error code and message.
                this.setState({
                    fetching: false,
                    refreshControl: false,
                    ajaxCallState: 'NET_ERR',
                    ajaxCallError: Globals.ERRORS.CONNECTION,
                });
            });
    }

    async initializePage(showLoader) {
        this.setState({ fetching: showLoader, refreshControl: !showLoader });
        this.getOrder(this.state.order_id);
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
                                                paddingHorizontal: 10,
                                            }}>
                                            <Icon
                                                type={'FontAwesome'}
                                                name="shopping-cart"
                                                style={[styles.greyText, { fontSize: 100 }]}
                                            />
                                            <Text
                                                style={[
                                                    styles.greyText,
                                                    { textAlign: 'center', fontSize: 20 },
                                                ]}>
                                                There are no items related to this order
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
                                                <ScrollView>
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            paddingHorizontal: 20,
                                                            paddingTop: 20,
                                                        }}>
                                                        <View style={{ flex: 1 }}>
                                                            <H3>Total</H3>
                                                            <Text note>Order ID</Text>
                                                        </View>
                                                        <View style={{ flex: 3, alignItems: 'flex-end' }}>
                                                            <H3>&#8358;{this.state.cartTotal}</H3>
                                                            <Text note>{this.state.order.id}</Text>
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
                                                    <View style={{ padding: 20, paddingTop: 5 }} >
                                                        <Text>Order Progress</Text>
                                                        <Text note numberOfLines={1}>{`-Order was placed on ` + this.state.order.get("createdAt").toString().substring(0, 25)}</Text>
                                                        {/* check if order was accepted or rejected */}
                                                        {this.state.order.get("order_accepted") ?
                                                            <Text note numberOfLines={1}>-Your order has been accepted by {this.state.farm.get("category_name")}</Text>
                                                            : this.state.order.get("order_declined") ?
                                                                <Text note numberOfLines={1}>-Your order was rejected</Text>
                                                                : null
                                                        }
                                                        {/* check if order has been delivered and received */}
                                                        {this.state.order.get("order_fulfilled") ?
                                                            <Text note numberOfLines={1}>-Your order has been fulfilled by {this.state.farm.get("category_name")}</Text>
                                                            : null}
                                                        {this.state.order.get("order_received") ?
                                                            <Text note numberOfLines={1}>-You have received the order</Text>
                                                            :
                                                            this.state.order.get("order_rejected") ?
                                                                <Text note numberOfLines={1}>-You rejected the order</Text>
                                                                : null
                                                        }
                                                        {/* display button to confirm delivery */}
                                                        {this.state.order.get("order_fulfilled") && !this.state.order.get("order_received") &&
                                                            !this.state.order.get("order_rejected") ?
                                                            <View style={{ flexDirection: "row", marginTop: 5 }}>
                                                                <View style={{ flex: 1, padding: 5 }}>
                                                                    <Button block rounded light iconRight onPress={() => this.receiveOrDeclineOrder(false)}>
                                                                        <Text>Decline</Text>
                                                                        <Icon name={"ios-close-circle-outline"} />
                                                                    </Button>
                                                                </View>
                                                                <View style={{ flex: 1, padding: 5 }}>
                                                                    <Button block rounded style={[styles.bgLeafGreen]} iconRight onPress={() => this.receiveOrDeclineOrder(true)}>
                                                                        <Text>Received</Text>
                                                                        <Icon name={"ios-checkmark-circle-outline"} />
                                                                    </Button>
                                                                </View>
                                                            </View>
                                                            :
                                                            <Button onPress={() => this.callFarm(this.state.farmer.get("phone_no"))} block rounded style={[styles.bgLeafGreen, { marginTop: 5 }]} iconRight>
                                                                <Text style={styles.whiteText}>Call Farm</Text>
                                                                <Icon name={"ios-call"} />
                                                            </Button>
                                                        }
                                                    </View>
                                                </ScrollView>
                                            </View>
                                        </React.Fragment>
                                    )}

                                {/* modal */}
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
                                                                onPress={this.initPayment}>
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
