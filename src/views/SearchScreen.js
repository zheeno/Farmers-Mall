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
  Header,
  Spinner,
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

export default class SearchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      refreshControl: false,
      ajaxCallState: 200,
      ajaxCallError: null,
      keyword: '',
      searchResult: [],
      hasSearched: false,
    };

    this.initializePage = this.initializePage.bind(this);
  }

  async initializePage(showLoader) {
    if (this.state.keyword.trim().length == 0) {
      ShowToast('Please input a food item name', 'danger');
    } else {
      this.setState({fetching: showLoader, refreshControl: !showLoader});
      GetData('/searchItems?q=' + escape(this.state.keyword))
        .then(result => {
          let response = result;
          this.setState({
            fetching: false,
            refreshControl: false,
            ajaxCallState: 200,
            ajaxCallError: null,
            searchResult: response.foodItems,
            hasSearched: true,
          });
        })
        .catch(error => {
          this.setState({
            fetching: false,
            refreshControl: false,
            ajaxCallState: 'NET_ERR',
            ajaxCallError: error.message,
            hasSearched: true,
          });
          ShowToast(error.message, 'danger');
        });
    }
  }

  render() {
    const {navigate} = this.props.navigation;

    return (
      <StyleProvider style={getTheme(material)}>
        <Container style={{flex: 1}}>
          <Header style={[{backgroundColor: '#fff', justifyContent: 'center'}]}>
            <Body style={{flex: 4}}>
              <Form
                style={{
                  width: '100%',
                  height: '80%',
                  backgroundColor: '#d7d7d7',
                  borderRadius: 50,
                }}>
                <Input
                  defaultValue={this.state.keyword}
                  autoFocus={!this.state.hasSearched}
                  placeholder="Search food items"
                  style={[styles.greenText, {paddingLeft: 12}]}
                  onChangeText={text => {
                    this.setState({keyword: text});
                  }}
                />
              </Form>
            </Body>
            <Right style={{flex: 1, alignItems: 'center'}}>
              <Button
                icon
                transparent
                disabled={this.state.fetching || this.state.refreshControl}
                onPress={() => this.initializePage(true)}>
                {this.state.fetching ? (
                  <Spinner color={styles.greenText.color} size={'small'} />
                ) : (
                  <Icon
                    type={'Ionicons'}
                    name={'ios-search'}
                    style={styles.greenText}
                  />
                )}
              </Button>
            </Right>
          </Header>
          {this.state.fetching ? (
            <LoaderOverlay text={"We're searching for the item..."} />
          ) : this.state.searchResult.length == 0 ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 10,
              }}>
              <Icon
                type={'Ionicons'}
                name="ios-search"
                style={[styles.greyText, {fontSize: 100}]}
              />
              <Text
                style={[styles.greyText, {textAlign: 'center', fontSize: 20}]}>
                {this.state.hasSearched
                  ? "Sorry, we couldn't find what you were looking for"
                  : 'Search for quality food items'}
              </Text>
            </View>
          ) : (
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshControl}
                  onRefresh={() => this.initializePage(false)}
                />
              }>
              <React.Fragment>
                <Text style={{margin: 20, fontSize: 20}}>
                  Search Results ({this.state.searchResult.length})
                </Text>
                <List style={{marginBottom: 80}}>
                  {this.state.searchResult.map(item => (
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
              </React.Fragment>
            </ScrollView>
          )}
        </Container>
      </StyleProvider>
    );
  }
}
