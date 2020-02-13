import React, { Component } from 'react';
import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';
import { StyleProvider, Container, Text, View, Button, Icon, Thumbnail, Spinner, List, ListItem, Left, Body, Right } from 'native-base';
import { ImageBackground, ScrollView, RefreshControl } from 'react-native';
import { styles } from '../../native-base-theme/variables/Styles';
import Parse from 'parse/react-native';
import { CusListItem, LoaderOverlay, ErrorOverlay } from './components/MiscComponents';
const Globals = require("../services/Globals");

export default class TransactionHistoryScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fetching: true,
            transactions: [],
            refreshControl: false,
        }
        this.getTransactions = this.getTransactions.bind(this);
    }

    componentDidMount() {
        this.getTransactions(true);
    }

    async getTransactions(showLoader) {
        try {
            var currentUser = Parse.User.current();
            if (currentUser) {
                this.setState({ fetching: showLoader, refreshControl: !showLoader })
                var Transactions = Parse.Object.extend("Transactions");
                var query = new Parse.Query(Transactions);
                query.equalTo("user_id", currentUser.id);
                query.descending("createdAt")
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
                let totalFundsProc = credit + debit;
                let creditPercentage = (credit / totalFundsProc) * 100;
                let debitPercentage = (debit / totalFundsProc) * 100;
                this.setState({
                    transactions: object,
                    creditPercentage: creditPercentage,
                    debitPercentage: debitPercentage,
                    debit: debit,
                    credit: credit,
                    balance: balance,
                    fetching: false,
                    refreshControl: false,
                    ajaxCallState: 200,
                    ajaxCallError: null,
                });
            }
        } catch (error) {
            this.setState({
                fetching: false,
                refreshControl: false,
                ajaxCallState: "NET_ERR",
                ajaxCallError: Globals.ERRORS.CONNECTION,
            });
        }
    }

    render() {
        const { navigate } = this.props.navigation;

        return (
            <StyleProvider style={getTheme(material)}>
                {this.state.fetching ? (
                    <View style={{ flex: 1 }}>
                        <LoaderOverlay text={"We're fetching your recent transactions..."} />
                    </View>
                ) :
                    this.state.ajaxCallState == 200 ?
                        <View style={{ flex: 1 }}>
                            <View style={{ flex: 4 }}>
                                <ScrollView style={{ backgroundColor: "#FFF" }}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.state.refreshControl}
                                            onRefresh={() => this.getTransactions(false)}
                                        />
                                    }>
                                    {this.state.transactions.length == 0 ?
                                        <View
                                            style={{
                                                flex: 1,
                                                alignItems: 'center',
                                                justifyContent: "center",
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
                                                ]}>
                                                You have no recent transactions</Text>
                                        </View>
                                        :
                                        <View
                                            style={{ backgroundColor: "#FFF" }}>
                                            {/* // loop through transactions */}
                                            <List>
                                                {this.state.transactions.map(item => (
                                                    <ListItem
                                                        key={item.id}>
                                                        <Body>
                                                            <Text>{item.get("is_credit") ? `Credit` : `Debit`}</Text>
                                                            <Text note numberOfLines={3}>{item.get("desc")}</Text>
                                                            <Text note numberOfLines={1}>
                                                                {item.get("createdAt").toString().substring(0, 25)}
                                                            </Text>
                                                        </Body>
                                                        <Right>
                                                            <Text style={item.get("is_credit") ? { color: "green" } : { color: "#b80514" }}>&#8358;{item.get("amount")}</Text>
                                                        </Right>
                                                    </ListItem>
                                                )
                                                )}
                                            </List>
                                        </View>
                                    }
                                </ScrollView>
                            </View>
                            <View style={[{ flex: 1, paddingHorizontal: 20, paddingTop: 10, backgroundColor: "#f2f2f2" }]} >
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: "row" }}>
                                        <View style={{ flex: 1, justifyContent: "center" }}>
                                            <Text note>Credit</Text>
                                        </View>
                                        <View style={{ flex: 3, justifyContent: "center" }}>
                                            <View style={{ height: 5, width: this.state.creditPercentage + "%", backgroundColor: "green" }} ></View>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: "row" }}>
                                        <View style={{ flex: 1, justifyContent: "center" }}>
                                            <Text note>Debit</Text>
                                        </View>
                                        <View style={{ flex: 3, justifyContent: "center" }}>
                                            <View style={{ height: 5, width: this.state.debitPercentage + "%", backgroundColor: "#b80514" }} ></View>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ flex: 2, flexDirection: "row" }}>
                                    <View style={{ flex: 1, justifyContent: "center", }}>
                                        <Text style={{ fontSize: 20 }}>Balance</Text>
                                    </View>
                                    <View style={{ flex: 2, justifyContent: "center", alignItems: "flex-end" }}>
                                        <Text style={{ fontSize: 20 }}>&#8358;{this.state.balance}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        :
                        <View style={{ flex: 1 }}>
                            <ErrorOverlay
                                title={"Notification"}
                                errorMessage={this.state.ajaxCallError}
                                action={() => this.getTransactions(true)} />
                        </View>
                }
            </StyleProvider>
        );
    }
}
