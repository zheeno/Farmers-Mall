import React, { Component } from 'react';
import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';
import {
    StyleProvider, Container, Text, View, Button, Icon, Thumbnail, Spinner, Left,
    Right,
    Body,
    List,
    ListItem
} from 'native-base';
import { ImageBackground, ScrollView, RefreshControl, Platform } from 'react-native';
import { styles } from '../../native-base-theme/variables/Styles';
import Parse from 'parse/react-native';
import { CusListItem } from './components/MiscComponents';
import { ShowToast } from '../services/ApiCaller';
import { MiscModal } from './components/MiscComponents';
import RNPaystack from 'react-native-paystack';


const Globals = require('../services/Globals');
var ImagePicker = require('react-native-image-picker');

var options = {
    title: 'Select Avatar',
    customButtons: [
        { name: 'fb', title: 'Choose Photo from Facebook' },
    ],
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};

var username = "Profile";
var email = "";
var avatar = null
Parse.User.currentAsync().then(user => {
    var _currentUser = user;//Parse.User.current();
    if (_currentUser != null) {
        username = _currentUser.getUsername();
        email = _currentUser.getEmail();
        avatar = { uri: _currentUser.get("avatar_url") };
    }
}).catch(error => {
    ShowToast(error.message, 'danger');
});


export default class UserProfileScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: null,
            username: null,
            email: null,
            fetching: true,
            isSigningOut: false,
            refreshControl: false,
            walletBalance: 0,
            ledgerBalance: 0,
            accessCode: "wabdgt54sgg"
        }
        this.getWalletBalance = this.getWalletBalance.bind(this);
        this.signOut = this.signOut.bind(this);
        this._goHome = this._goHome.bind(this);
        this.chooseImage = this.chooseImage.bind(this);
        this.uploadProfilePic = this.uploadProfilePic.bind(this);
        this.props.navigation.setParams({ headerTitle: username, headerSubTitle: email, headerAvatar: avatar, goHome: this._goHome });
    }


    componentDidMount() {
        var currentUser = Parse.User.current();
        if (currentUser) {
            // do stuff with the user
            this.setState({
                userId: currentUser.id,
                username: currentUser.getUsername(),
                email: currentUser.getEmail()
            });
            // get user's wallet balance
            this.getWalletBalance(currentUser.id, true);
        }
    }


    _goHome() {
        this.props.navigation.navigate("Home");
    }

    async signOut() {
        try {
            this.setState({ isSigningOut: true });
            await Parse.User.logOut();
            this.props.navigation.navigate("Login")
        } catch (error) {
            this.setState({ isSigningOut: false });
            ShowToast(Globals.ERRORS.INTERNET_CON, 'danger');
        }
    }

    async getWalletBalance(userId, showLoader) {
        try {
            this.setState({ fetching: showLoader, refreshControl: !showLoader })
            var Transactions = Parse.Object.extend("Transactions");
            var query = new Parse.Query(Transactions);
            query.equalTo("user_id", userId);
            const object = await query.find();
            console.log("object", object)
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
            this.setState({
                walletBalance: balance,
                ledgerBalance: balance,
                fetching: false,
                refreshControl: false
            });
        } catch (error) {
            ShowToast(Globals.ERRORS.INTERNET_CON, "danger")
        }
    }

    /**
     * The first arg is the options object for customization (it can also be null or omitted for default options),
     * The second arg is the callback which sends object: response (more info below in README)
     */
    chooseImage() {
        if (Platform.OS == "android") {
            ImagePicker.showImagePicker(options, (response) => {
                console.log('Response = ', response);

                if (response.didCancel) {
                    console.log('User cancelled image picker');
                }
                else if (response.error) {
                    console.log('ImagePicker Error: ', response.error);
                }
                else if (response.customButton) {
                    console.log('User tapped custom button: ', response.customButton);
                }
                else {
                    let source = { uri: response.uri };

                    // You can also display the image using data:
                    // let source = { uri: 'data:image/jpeg;base64,' + response.data };

                    this.setState({
                        avatarSource: source
                    });
                }
            });
        } else {
            // not supportted yet
        }
    }
    async uploadProfilePic() {
        try {
            var base64 = 'data:image/jpeg;base64,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';
            // var base64 = 'data:image/jpeg;base64,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';

            var parseFile = new Parse.File(this.state.userId, { base64: base64 });
            parseFile.save().then(function () {
                Parse.User.currentAsync().then(user => {
                    // The file has been saved to Parse.
                    var User = Parse.Object.extend("User");
                    const query = new Parse.Query(User);
                    query.get(user.id).then(user => {
                        user.set("avatar_filename", parseFile._name);
                        user.set("avatar_url", parseFile._url);
                        user.save();
                    });
                    alert("File has been uploaded");
                    console.log("Parse File", parseFile)
                });
            }, function (error) {
                // The file either could not be read, or could not be saved to Parse.
                alert("Error encountered uploading file");
            });
        } catch (error) {
            ShowToast(Globals.ERRORS.INTERNET_CON, "danger")
        }
    }

    render() {
        const { navigate } = this.props.navigation;

        return (
            <StyleProvider style={getTheme(material)}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshControl}
                            onRefresh={() => this.getWalletBalance(this.state.userId, false)}
                        />
                    }>
                    <Container>
                        <View style={{ flex: 1 }}>
                            <View style={[styles.bgWhite, {
                                padding: 20,
                                paddingVertical: 30,
                                alignItems: "center",
                                justifyContent: "center"
                            }]}>
                                {this.state.fetching ?
                                    <Spinner color={styles.greyText.color} size={50} />
                                    :
                                    <React.Fragment>
                                        <Text style={{ fontSize: 25 }}>&#8358;{this.state.walletBalance}</Text>
                                        <Text note>Wallet Balance</Text>
                                        <Text style={{ fontSize: 18, marginTop: 10 }}>&#8358;{this.state.ledgerBalance}</Text>
                                        <Text note>Ledger Balance</Text>
                                    </React.Fragment>
                                }
                            </View>
                            <View style={{ flexDirection: "row", }}>
                                <View style={{ flex: 1, padding: 5 }}>
                                    <Button block iconRight light onPress={() => navigate("FundWallet")}>
                                        <Text>Fund Wallet</Text>
                                        <Icon name={"ios-wallet"} />
                                    </Button>
                                </View>
                                <View style={{ flex: 1, padding: 5 }}>
                                    <Button block iconRight style={[styles.bgLeafGreen]}>
                                        <Text>Withdraw</Text>
                                        <Icon name={"ios-cash"} />
                                    </Button>
                                </View>
                            </View>
                            <View>
                                <CusListItem
                                    disabled={false}
                                    action={() => navigate("OrderList")}
                                    hasIcon={true}
                                    iconName={"ios-list"}
                                    iconBgColor={styles.bgLeafGreen.backgroundColor}
                                    text={"Orders"} />
                                <CusListItem
                                    disabled={false}
                                    action={() => navigate("Transactions")}
                                    hasIcon={true}
                                    iconName={"ios-clock"}
                                    iconBgColor={styles.bgLeafGreen.backgroundColor}
                                    text={"Transaction History"} />
                                <CusListItem
                                    disabled={false}
                                    action={() => this.chooseImage()}
                                    hasIcon={true}
                                    iconName={"ios-person"}
                                    iconBgColor={styles.bgLeafGreen.backgroundColor}
                                    text={"Account Settings"} />

                                <ListItem icon onPress={this.signOut} disabled={this.state.isSigningOut}>
                                    <Left>
                                        <Button style={[styles.bgLeafGreen]}>
                                            <Icon active name={"ios-exit"} />
                                        </Button>
                                    </Left>
                                    <Body>
                                        <Text>{"Sign Out"}</Text>
                                    </Body>
                                    <Right>
                                        {this.state.isSigningOut ?
                                            <Spinner size={20} color={styles.greenText.color} />
                                            :
                                            <Icon active name="ios-arrow-forward" />
                                        }
                                    </Right>
                                </ListItem>
                            </View>
                        </View>
                    </Container>
                </ScrollView>
            </StyleProvider>
        );
    }
}
