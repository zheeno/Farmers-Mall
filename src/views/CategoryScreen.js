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
  Thumbnail,
  Header,
  Left,
  Right,
  Body
} from 'native-base';
import {
  ImageBackground,
  ScrollView,
  FlatList,
  TouchableOpacity,
  AsyncStorage,
  Platform,
} from 'react-native';
import { styles } from '../../native-base-theme/variables/Styles';
import { GetData, ShowToast } from '../services/ApiCaller';
import { LoaderOverlay } from './components/MiscComponents';
import Parse from "parse/react-native";

export default class CategoryScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      refreshControl: false,
      ajaxCallState: 200,
      ajaxCallError: null,
      category: {},
      farmer: {},
      foodItems: [],
      keyword: '',
    };

    this.initializePage = this.initializePage.bind(this);
    this.getMetaData = this.getMetaData.bind(this);
  }

  componentDidMount() {
    this.initializePage(true);
  }

  async getMetaData(category) {
    // get related food items
    const FoodItems = Parse.Object.extend("FoodItems");
    const query = new Parse.Query(FoodItems);
    query.equalTo("category_id", category.id);
    const relatedItems = await query.find();


    // get farmer's details
    const farmer = category.get("farmer");
    await farmer.fetch();

    this.setState({
      fetching: false,
      refreshControl: false,
      ajaxCallState: 200,
      ajaxCallError: null,
      category: category,
      foodItems: relatedItems,
      farmer: farmer
    });
  }

  async initializePage(showLoader) {
    this.setState({ fetching: showLoader, refreshControl: !showLoader });
    let category_id = this.props.navigation.state.params.category_id || null;

    var Categories = Parse.Object.extend("Categories");
    var c_query = new Parse.Query(Categories);
    c_query.get(category_id)
      .then((category) => {
        // The object was retrieved successfully.
        this.getMetaData(category);
      }, (error) => {
        // The object was not retrieved successfully.
        // error is a Parse.Error with an error code and message.
        ShowToast("Unable to connect to the server. Please check your internet connection", 'danger');
        this.props.navigation.goBack(null)
      });
  }

  render() {
    const { navigate } = this.props.navigation;

    return (
      <StyleProvider style={getTheme(material)}>
        {this.state.fetching ? (
          <LoaderOverlay text={"We're getting the items ready..."} />
        ) : (
            <Container style={{ flex: 1, backgroundColor: '#eee' }}>
              <View style={{ flex: 2 }}>
                <ImageBackground
                  source={require('../assets/img/veges_mix.jpg')}
                  style={{ width: '100%', flex: 1, }}>
                  <Header transparent style={[styles.maskDark,]}>
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
                        Farms
                      </Text>
                    </Body>
                    <Right style={{ flex: 1 }} />
                  </Header>
                  <View
                    style={[
                      styles.maskDark,
                      { flex: 1, justifyContent: 'flex-start', paddingTop: 10 },
                    ]}>
                    <View
                      style={{
                        flex: 1,
                        marginLeft: 30,
                        borderLeftWidth: 4,
                        borderLeftColor: '#FFF',
                        paddingLeft: 10,
                        marginBottom: 60
                      }}>
                      <H1 style={styles.whiteText} numberOfLines={1}>
                        {this.state.category.get("category_name")}
                      </H1>
                      <Text style={styles.whiteText} numberOfLines={2}>
                        {this.state.category.get("category_description")}
                      </Text>
                      {/* farmer's info */}
                      <View
                        style={{
                          paddingRight: 10,
                          paddingTop: 10,
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
                          <Text style={[styles.whiteText, { fontWeight: 'bold', fontSize: 15 }]}>
                            {this.state.farmer.get("full_name")}
                          </Text>
                          <Text style={styles.whiteText} note>255k Sales&nbsp;&middot;&nbsp;100 Followers</Text>
                        </View>
                      </View>

                    </View>
                  </View>
                </ImageBackground>
                {/* search bar */}
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'rgb(255, 255, 255)',
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
                        Search food items
                    </Text>
                      <Icon name={'ios-search'} style={styles.greenText} />
                    </Button>
                  </View>
                </View>
              </View>
              <View style={{ flex: 2, marginTop: 10 }}>
                {this.state.foodItems.length == 0 ? (
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
                      No food items were found in this category
                  </Text>
                  </View>
                ) : (
                    // <ScrollView>
                    <FlatList
                      data={this.state.foodItems}
                      numColumns={2}
                      renderItem={({ item, index }) => (
                        <View style={[
                          { margin: 2, flex: 1, borderRadius: 10 },
                        ]}>
                          <TouchableOpacity
                            key={item.id}
                            onPress={() =>
                              navigate('FoodItem', {
                                item_id: item.id,
                              })
                            }
                          >
                            <ImageBackground
                              source={require('../assets/img/white_onion_leaf.jpg')}
                              style={[{
                                width: '100%',
                                height: 100,
                                overflow: 'hidden',
                              }, Platform.OS == "ios" ? { borderRadius: 10 } : null]}>
                              <View
                                style={[
                                  {
                                    fex: 1,
                                    justifyContent: 'flex-end',
                                    height: '100%',
                                    paddingHorizontal: 5,
                                    paddingBottom: 10,
                                  },
                                  styles.maskDarkSlight,
                                ]}>
                                <Text
                                  numberOfLines={2}
                                  style={[styles.whiteText, { fontSize: 13 }]}>
                                  {item.get("item_name")}
                                </Text>
                              </View>
                            </ImageBackground>
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                    // </ScrollView>
                  )}
              </View>
            </Container>
          )}
      </StyleProvider>
    );
  }
}
