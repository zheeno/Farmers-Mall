import React, { Component } from 'react';
import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';
import { LoaderOverlay, MiscModal, ErrorOverlay } from './components/MiscComponents';
import { ShowToast } from '../services/ApiCaller';
import {
    StyleProvider,
    Container,
    Text,
    Content,
    Form,
    Item,
    Input,
    Label,
    Card,
    CardItem,
    Body,
    View,
    Button,
    H3,
    Thumbnail,
    Badge,
} from 'native-base';
import { ImageBackground, ScrollView, RefreshControl, TouchableOpacity, AsyncStorage } from 'react-native';
import { styles } from '../../native-base-theme/variables/Styles';
import Parse from 'parse/react-native';
import NumberFormat from 'react-number-format';
import RNPaystack from 'react-native-paystack';
import LottieView from 'lottie-react-native';

const Globals = require('../services/Globals');

export default class CheckoutScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fetching: true,
            paymentProcessed: false,
            paymentSuccess: false,
            paymentResponseMsg: null,
            cardNumber: '507850785078507812',
            expiryMonth: '10',
            expiryYear: '23',
            expiryDate: '1023',
            cvc: '081',
            amount: '',
            amountInKobo: 150000,
            ajaxCallState: "NET_ERR",
            ajaxCallError: Globals.ERRORS.CONNECTION,
        }
        this.saveTransaction = this.saveTransaction.bind(this);
        this.initializePage = this.initializePage.bind(this);
        this.payWithATM = this.payWithATM.bind(this);
        this.saveTransaction = this.saveTransaction.bind(this);
    }

    componentDidMount() {
        var currentUser = Parse.User.current();
        if (currentUser) {
            // do stuff with the user
            this.setState({
                userId: currentUser.id,
                email: currentUser.getEmail()
            });
            this.initializePage(true);
        }
    }


    async initializePage(showLoader) {
        this.setState({
            fetching: showLoader,
            refreshControl: !showLoader,
            paymentProcessed: false,
            paymentSuccess: false,
            paymentResponseMsg: null,
        });
        AsyncStorage.getItem('sessionToken')
            .then(sessionToken => {
                this.getCartItems(sessionToken);
            }).done();
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
                farm: farm,
                sessionToken: sessionToken,
                paymentProcessed: false,
                paymentSuccess: false,
                paymentResponseMsg: null
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

    payWithATM = async () => {
        if (this.state.cardNumber.length >= 16 && this.state.expiryDate.length == 4 && this.state.cvc.length >= 3 && this.state.cartTotal > 0) {
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
                        this.saveTransaction();
                    })
                    .catch(error => {
                        console.log(error); // error is a javascript Error object
                        console.log(error.message);
                        console.log(error.code);
                        this.setState({ reference_code: null, fetching: false, paymentProcessed: true, paymentSuccess: false, paymentResponseMsg: error.message });
                        // ShowToast(error.message, 'danger');
                    })
            } else {
                // invalid amount
                ShowToast("Invalid amount entered", 'danger');
            }
        } else {
            // complete form
            ShowToast("Kindly complete all fields", 'danger');
        }
    }

    async saveTransaction() {
        try {
            var currentUser = Parse.User.current();
            if (currentUser) {
                var CartItems = Parse.Object.extend("CartItems");
                var c_query = new Parse.Query(CartItems);
                c_query.equalTo("order_placed", false)
                c_query.equalTo("cart_token", this.state.sessionToken)
                c_query.descending("createdAt");
                const cartItems = await c_query.find();
                const newToken = Math.random().toString(36).slice(2) + currentUser.id;
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
                order.set("transaction_id", this.state.reference_code);
                order.save();
                // order placement sucessful
                this.setState({
                    paymentProcessed: true,
                    paymentSuccess: true,
                    cartItems: [],
                    cartTotal: 0,
                    paymentResponseMsg: `You have successfully placed an order. The farm has been notified of your purchase and would attend to it shortly. Kindly note that the funds deducted from your account have been moved to an escrow account and would be paid to the farm when you confirm the delivery.\nWe are not to be held liable for any misconduct on the part of the farmer.`
                });
            }
        } catch (error) {
            ShowToast(error.message, "danger");
            // recall the function after 3 seconds
            // this is to ensure that the cart us updated as expeted
            timer = setTimer(() => {
                this.saveTransaction();
            }, 3000);
        }

    }

    render() {
        const { navigate } = this.props.navigation;

        return (
            <StyleProvider style={getTheme(material)}>
                <Container style={{ flex: 1 }}>
                    {this.state.fetching ? (
                        <LoaderOverlay text={"Calculating\nPlease wait..."} />
                    ) :
                        this.state.ajaxCallState == 200 ?
                            !this.state.paymentProcessed ?
                                <ScrollView style={{ flex: 1 }}>
                                    {/* <Form> */}
                                    <View style={[styles.bgWhite, { flex: 1 }]}>
                                        <View style={{ flex: 2 }}>
                                            <Card style={styles.card}>
                                                <CardItem style={[styles.cardItem, { backgroundColor: "#4d2b95" }]}>
                                                    <View style={{ flex: 1, padding: 10, width: "100%", }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Label style={[styles.fs_14, styles.greyText]}>Card No.</Label>
                                                            <Input
                                                                style={{ color: "#FFF", textAlign: "center", fontSize: 25 }}
                                                                textContentType={"creditCardNumber"}
                                                                maxLength={18}
                                                                keyboardType={"number-pad"}
                                                                defaultValue={this.state.cardNumber}
                                                                onChangeText={text => {
                                                                    this.setState({ cardNumber: text });
                                                                }}
                                                            />
                                                        </View>

                                                        <View style={{ flex: 1, flexDirection: "row", marginTop: 20 }}>
                                                            <View style={{ flex: 1, }}>
                                                                <Label style={[styles.fs_14, styles.greyText]}>Expiry (MMYY)</Label>
                                                                <Input
                                                                    style={{ color: "#FFF", textAlign: "left" }}
                                                                    maxLength={4}
                                                                    keyboardType={"number-pad"}
                                                                    defaultValue={this.state.expiryDate}
                                                                    onChangeText={text => {
                                                                        this.setState({ expiryDate: text });
                                                                    }}
                                                                />
                                                            </View>
                                                            <View style={{ flex: 1 }} >
                                                                <Label style={[styles.fs_14, styles.greyText]}>CVV/CVC</Label>
                                                                <Input
                                                                    style={{ color: "#FFF", textAlign: "center" }}
                                                                    maxLength={4}
                                                                    keyboardType={"number-pad"}
                                                                    defaultValue={this.state.cvc}
                                                                    secureTextEntry={true}
                                                                    onChangeText={text => {
                                                                        this.setState({ cvc: text });
                                                                    }}
                                                                />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </CardItem>
                                            </Card>
                                        </View>
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
                                        <Button onPress={this.payWithATM} style={[{ marginHorizontal: 30, marginVertical: 50, borderRadius: 50 }]}><Text>Complete Payment</Text></Button>
                                    </View>
                                </ScrollView>
                                :
                                this.state.paymentSuccess ?
                                    // transaction successful
                                    <View style={{ flex: 1, alignItems: "center", paddingTop: 80 }}>
                                        <LottieView
                                            style={{ width: 200, }}
                                            source={require('../assets/lottiefiles/10447-payment-success.json')}
                                            autoPlay
                                        />
                                        <Text style={[styles.greyText, { marginHorizontal: 30, fontSize: 14 }]}>{this.state.paymentResponseMsg}</Text>
                                        <Button style={[styles.bgLeafGreen, { marginHorizontal: 40, borderRadius: 50, marginTop: 30 }]} onPress={() => this.initializePage(true)}>
                                            <Text style={styles.whiteText}>Done</Text>
                                        </Button>
                                    </View>
                                    :
                                    // transaction error
                                    <View style={{ flex: 1, alignItems: "center", paddingTop: 80 }}>
                                        <LottieView
                                            style={{ width: 200, }}
                                            source={require('../assets/lottiefiles/10448-payment-failed-error.json')}
                                            autoPlay
                                        />
                                        <Text style={{ marginHorizontal: 30, fontSize: 20 }}>{this.state.paymentResponseMsg}</Text>
                                        <Button style={[styles.bgGrey, { marginHorizontal: 40, borderRadius: 50, marginTop: 30 }]} onPress={() => this.initializePage(true)}>
                                            <Text style={styles.greenText}>Try Again</Text>
                                        </Button>
                                    </View>
                            :
                            <ErrorOverlay
                                title={"Notification"}
                                errorMessage={this.state.ajaxCallError}
                                action={() => this.initializePage(true)}
                            />
                    }
                </Container>
            </StyleProvider >
        );
    }
}
