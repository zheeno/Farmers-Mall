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
    H1,
    Form,
    Input,
    Header,
    Left,
    Body,
    Right,
} from 'native-base';
import {
    ImageBackground,
    ScrollView,
    FlatList,
    TouchableOpacity,
    AsyncStorage,
} from 'react-native';
import { styles } from '../../native-base-theme/variables/Styles';
import { GetData, ShowToast } from '../services/ApiCaller';
import { LoaderOverlay } from './components/MiscComponents';
import Parse from "parse/react-native";

export default class FarmsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fetching: true,
            refreshControl: false,
            ajaxCallState: 200,
            ajaxCallError: null,
            farms: [],
            keyword: '',
        };

        this.initializePage = this.initializePage.bind(this);
    }

    componentDidMount() {
        this.initializePage(true);
    }


    async initializePage(showLoader) {
        this.setState({ fetching: showLoader, refreshControl: !showLoader });
        var Farms = Parse.Object.extend("Categories");
        var f_query = new Parse.Query(Farms);
        f_query.limit(10);
        f_query.descending("createdAt");
        const farms = await f_query.find();
        this.setState({
            fetching: false,
            refreshControl: false,
            ajaxCallState: 200,
            ajaxCallError: null,
            farms: farms,
        });
    }

    render() {
        const { navigate } = this.props.navigation;

        return (
            <StyleProvider style={getTheme(material)}>
                {this.state.fetching ? (
                    <LoaderOverlay text={"We're looking up farms..."} />
                ) : (
                        <Container style={{ flex: 1, backgroundColor: '#FFF' }}>
                            <View style={{ flex: 2 }}>
                                <ImageBackground
                                    source={require('../assets/img/close_up_green_leaf.jpg')}
                                    style={{ width: '100%', flex: 1 }}
                                    imageStyle={{
                                        resizeMode: "cover",
                                        alignSelf: "center"
                                    }}>
                                    <Header transparent style={[styles.maskDark]}>
                                        <Left style={{ flex: 1 }}>
                                            <TouchableOpacity style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
                                                onPress={() => this.props.navigation.goBack(null)}
                                            >
                                                <Icon name={"ios-arrow-back"} style={styles.whiteText} />
                                            </TouchableOpacity>
                                        </Left>
                                        <Body style={{ flex: 4, flexDirection: "row" }}>
                                            <Icon style={styles.whiteText} name={"ios-leaf"} />
                                            <Text style={[styles.whiteText, { fontSize: 20, margin: 5 }]} numberOfLines={1}>
                                                Farms</Text>
                                        </Body>
                                        <Right style={{ flex: 1 }} />
                                    </Header>
                                    <View
                                        style={[
                                            styles.maskDarkSlight,
                                            { flex: 1, }
                                        ]}>
                                        <View
                                            style={{
                                                flex: 1,
                                                marginLeft: 30,
                                                justifyContent: 'flex-start'
                                            }}>
                                            {/* <H1 style={styles.whiteText} numberOfLines={1}>
                                                <Icon name={"ios-leaf"} style={styles.whiteText} />
                                                &nbsp;Farms
                                            </H1> */}
                                            <Text style={styles.whiteText}>Get direct access to the farmers {"\n"}and their produce</Text>
                                        </View>
                                    </View>
                                </ImageBackground>
                                {/* search bar */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        backgroundColor: '#efefef',
                                        width: '90%',
                                        alignSelf: 'center',
                                        borderRadius: 30,
                                        marginTop: -25,
                                        paddingVertical: 5,
                                    }}>
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            paddingHorizontal: 5,
                                        }}>
                                        <Button
                                            small
                                            transparent
                                            badge
                                            iconRight
                                            style={{ height: 40 }}
                                            onPress={() => navigate('Search')}>
                                            <Text
                                                style={[styles.greenText, { textTransform: 'capitalize' }]}>
                                                Search <Icon name={"ios-leaf"} style={[styles.greenText, { fontSize: 15 }]} /> Farms</Text>
                                            <Icon name={'ios-search'} style={styles.greenText} />
                                        </Button>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flex: 3, marginTop: 10, backgroundColor: "#FFF" }}>
                                {this.state.farms.length == 0 ? (
                                    <View
                                        style={{
                                            flex: 1,
                                            alignItems: 'center',
                                            paddingTop: 50,
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
                                            We currently do not have any farms available
                  </Text>
                                    </View>
                                ) : (
                                        <View style={{ paddingBottom: 50 }}>
                                            <FlatList
                                                data={this.state.farms}
                                                numColumns={1}
                                                renderItem={({ item, index }) => (
                                                    <TouchableOpacity
                                                        key={item.id}
                                                        onPress={() =>
                                                            navigate('Category', {
                                                                category_id: item.id,
                                                            })
                                                        }
                                                        style={[
                                                            { margin: 2, flex: 1, borderRadius: 10, borderBottomWidth: 0.2 },
                                                        ]}>
                                                        <View
                                                            style={{
                                                                width: '100%',
                                                                overflow: 'hidden',
                                                                flexDirection: "row"
                                                            }}>
                                                            <View
                                                                style={[
                                                                    {
                                                                        flex: 3,
                                                                        height: '100%',
                                                                        paddingHorizontal: 5,
                                                                        paddingVertical: 10,
                                                                    },
                                                                ]}>
                                                                <Text
                                                                    numberOfLines={1}
                                                                    style={[styles.greenText, { fontSize: 18, fontWeight: "500" }]}>
                                                                    {item.get("category_name")}
                                                                </Text>
                                                                <Text numberOfLines={4} note style={{ fontSize: 16 }}>{item.get("category_description")}</Text>
                                                            </View>
                                                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                                                <Icon name={"ios-arrow-dropright"} style={{ color: "#ccc" }} />
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        </View>
                                    )}
                            </View>
                        </Container>
                    )}
            </StyleProvider>
        );
    }
}
