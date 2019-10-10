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
  H1,
  Form,
  Input,
} from 'native-base';
import {
  ImageBackground,
  ScrollView,
  FlatList,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';
import {styles} from '../../native-base-theme/variables/Styles';
import {GetData, ShowToast} from '../services/ApiCaller';
import {LoaderOverlay} from './components/MiscComponents';

export default class CategoryScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      refreshControl: false,
      ajaxCallState: 200,
      ajaxCallError: null,
      category: {},
      foodItems: [],
      keyword: '',
    };

    this.initializePage = this.initializePage.bind(this);
  }

  componentDidMount() {
    this.initializePage(true);
  }

  async initializePage(showLoader) {
    this.setState({fetching: showLoader, refreshControl: !showLoader});
    let category_id = this.props.navigation.state.params.category_id || null;
    AsyncStorage.getItem('userId')
      .then(userId => {
        GetData('/categories/' + category_id + '?user_id=' + userId)
          .then(result => {
            let response = result;
            this.setState({
              fetching: false,
              refreshControl: false,
              ajaxCallState: 200,
              ajaxCallError: null,
              category: response.category,
              foodItems: response.foodItems,
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
  }

  render() {
    const {navigate} = this.props.navigation;

    return (
      <StyleProvider style={getTheme(material)}>
        {this.state.fetching ? (
          <LoaderOverlay text={"We're getting the items ready..."} />
        ) : (
          <Container style={{flex: 1, backgroundColor: '#eee'}}>
            <View style={{flex: 1}}>
              <ImageBackground
                source={require('../assets/img/veges_mix.jpg')}
                style={{width: '100%', flex: 1}}>
                <View
                  style={[
                    styles.maskDarkSlight,
                    {flex: 1, justifyContent: 'center'},
                  ]}>
                  <View
                    style={{
                      marginLeft: 30,
                      borderLeftWidth: 4,
                      borderLeftColor: '#FFF',
                      paddingLeft: 10,
                      paddingVertical: 20,
                    }}>
                    <H1 style={styles.whiteText} numberOfLines={1}>
                      {this.state.category.category_name}
                    </H1>
                    <Text style={styles.whiteText} numberOfLines={2}>
                      {this.state.category.description}
                    </Text>
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
                    style={{height: 40}}
                    onPress={() => navigate('Search')}>
                    <Text
                      style={[styles.greenText, {textTransform: 'capitalize'}]}>
                      Search food items
                    </Text>
                    <Icon name={'ios-search'} style={styles.greenText} />
                  </Button>
                </View>
              </View>
            </View>
            <View style={{flex: 2, marginTop: 10}}>
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
                    style={[styles.greyText, {fontSize: 100}]}
                  />
                  <Text
                    style={[
                      styles.greyText,
                      {textAlign: 'center', fontSize: 20},
                    ]}>
                    No food items were found in this category
                  </Text>
                </View>
              ) : (
                <ScrollView>
                  <FlatList
                    data={this.state.foodItems}
                    numColumns={3}
                    renderItem={({item, index}) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() =>
                          navigate('FoodItem', {
                            item_id: item.id,
                          })
                        }
                        style={[
                          styles.bgLeafGreen,
                          {margin: 2, flex: 1, borderRadius: 10},
                        ]}>
                        <ImageBackground
                          source={require('../assets/img/white_onion_leaf.jpg')}
                          style={{
                            width: '100%',
                            height: 100,
                            borderRadius: 10,
                            overflow: 'hidden',
                          }}>
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
                              style={[styles.whiteText, {fontSize: 13}]}>
                              {item.item_name}
                            </Text>
                          </View>
                        </ImageBackground>
                      </TouchableOpacity>
                    )}
                  />
                </ScrollView>
              )}
            </View>
          </Container>
        )}
      </StyleProvider>
    );
  }
}
