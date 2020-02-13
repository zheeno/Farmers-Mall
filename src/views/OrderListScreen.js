import React, { Component } from 'react';
import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';
import { LoaderOverlay, MiscModal, ErrorOverlay } from './components/MiscComponents';
import { ShowToast } from '../services/ApiCaller';
import {
    StyleProvider,
    Container,
    Text,
    View,
    Button,
    Icon,
    List,
    ListItem,
    Left,
    Thumbnail,
    Body,
    Right,
    Header,
    Badge
} from 'native-base';
import { ImageBackground, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { styles } from '../../native-base-theme/variables/Styles';
import Parse from 'parse/react-native';
const Globals = require('../services/Globals');

export default class OrderListScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fetching: true,
            refreshControl: false,
            ajaxCallState: "NET_ERR",
            ajaxCallError: Globals.ERRORS.CONNECTION,
            orders: []
        }
        this.getAllOrders = this.getAllOrders.bind(this);
    }

    componentDidMount() {
        this.getAllOrders(true);
    }

    async getAllOrders(showLoader) {
        var currentUser = Parse.User.current();
        if (currentUser != null) {
            try {
                this.setState({ fetching: showLoader, refreshControl: !showLoader })
                var Orders = Parse.Object.extend("Orders");
                var query = new Parse.Query(Orders);
                query.equalTo("buyer_id", currentUser.id);
                query.descending("createdAt");
                const object = await query.find();
                this.setState({
                    fetching: false,
                    refreshControl: false,
                    orders: object,
                    ajaxCallState: 200,
                    ajaxCallError: null
                });
            } catch (error) {
                this.setState({
                    fetching: false,
                    refreshControl: false,
                    orders: [],
                    ajaxCallState: "NET_ERR",
                    ajaxCallError: Globals.ERRORS.CONNECTION,
                });
            }
        }
    }

    render() {
        const { navigate } = this.props.navigation;

        return (
            <StyleProvider style={getTheme(material)}>
                <Container style={{ flex: 1 }}>
                    {this.state.fetching ? (
                        <LoaderOverlay text={"We're getting your orders..."} />
                    ) :
                        this.state.ajaxCallState == 200 ?
                            <React.Fragment>
                                {this.state.orders.length == 0 ?
                                    <View
                                        style={{
                                            flex: 1,
                                            alignItems: 'center',
                                            paddingTop: 100,
                                            paddingHorizontal: 10,
                                        }}>
                                        <Icon
                                            type={'FontAwesome'}
                                            name="info-circle"
                                            style={[styles.greyText, { fontSize: 100 }]}
                                        />
                                        <Text
                                            style={[
                                                styles.greyText,
                                                { textAlign: 'center', fontSize: 20 },
                                            ]}>You have not placed any orders</Text>
                                    </View> :
                                    <ScrollView
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={this.state.refreshControl}
                                                onRefresh={() => this.getAllOrders(false)}
                                            />
                                        }>
                                        <List>
                                            {this.state.orders.map(item => (
                                                <ListItem
                                                    key={item.id}
                                                    thumbnail
                                                    onPress={() =>
                                                        navigate('Order', {
                                                            headerTitle: item.get("farm_name"),
                                                            order_id: item.id,
                                                            cart_items_token: item.get("cart_items_token"),
                                                        })
                                                    }>
                                                    <Body>
                                                        <Text>{item.get("farm_name")}</Text>
                                                        <Text note numberOfLines={1}>
                                                            &#8358;{item.get("total_paid")}
                                                        </Text>
                                                        <Text note numberOfLines={1}>{item.get("order_status_desc")}</Text>
                                                        <Text note numberOfLines={1} style={styles.greenText}>{item.get("createdAt").toString().substring(0, 25)}</Text>
                                                    </Body>
                                                    <Right>
                                                        {item.get("order_fulfilled") && item.get("order_accepted") && item.get("order_received") ?
                                                            // order has been fulfilled 
                                                            <Icon name={"ios-checkmark-circle"} style={styles.greenText} />
                                                            :
                                                            < Icon name={"ios-clock"} style={{ color: styles.bgBrickRed.backgroundColor }} />
                                                        }
                                                    </Right>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </ScrollView>
                                }
                            </React.Fragment>
                            :
                            <ErrorOverlay
                                title={"Notification"}
                                errorMessage={this.state.ajaxCallError}
                                action={() => this.getAllOrders(true)} />
                    }
                </Container>
            </StyleProvider>
        );
    }
}
