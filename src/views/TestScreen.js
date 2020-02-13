import React, { Component } from 'react';
import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';
import { styles } from '../../native-base-theme/variables/Styles';
import {
    StyleProvider,
    Container,
    View,
    Button,
    Text,
} from "native-base";


export default class TestScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            screenValue: ""
        };
        // initialize the method in the constructor so as to make it
        //  have access to the context and state
        this.setScreenValue = this.setScreenValue.bind(this);
    }

    setScreenValue = (value) => {
        // modify the value of the state value, screenValue
        this.setState({ screenValue: this.state.screenValue + value })
    }

    render() {
        const { navigate } = this.props.navigation;

        return (
            <StyleProvider style={getTheme(material)}>
                <Container style={[styles.bgLeafGreen, { flex: 1, flexDirection: "column" }]}>
                    {/* screen */}
                    <View style={[styles.bgWhite, { flex: 1, justifyContent: "flex-end", alignItems: "flex-end", padding: 20 }]} >
                        <Text style={{ fontSize: 40 }}>{this.state.screenValue}</Text>
                    </View>
                    {/* keys */}
                    <View style={[styles.bgLeafGreen, { flex: 1 }]} >
                        {/* first */}
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <View style={{ flex: 1, padding: 5 }}>
                                <Button style={[styles.myButt]} onPress={() => this.setScreenValue(9)} ><Text style={{ fontSize: 30 }}>9</Text></Button>
                            </View>
                            <View style={{ flex: 1, padding: 5 }}>
                                <Button style={[styles.myButt]} onPress={() => this.setScreenValue(8)}><Text style={{ fontSize: 30 }}>8</Text></Button>
                            </View>
                            <View style={{ flex: 1, padding: 5 }}>
                                <Button style={[styles.myButt]} onPress={() => this.setScreenValue(7)}><Text style={{ fontSize: 30 }}>7</Text></Button>
                            </View>
                        </View>
                        {/* second */}
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <View style={{ flex: 1, padding: 5 }}>
                                <Button style={[styles.myButt]} onPress={() => this.setScreenValue(6)} ><Text style={{ fontSize: 30 }}>6</Text></Button>
                            </View>
                            <View style={{ flex: 1, padding: 5 }}>
                                <Button style={[styles.myButt]} onPress={() => this.setScreenValue(5)}><Text style={{ fontSize: 30 }}>5</Text></Button>
                            </View>
                            <View style={{ flex: 1, padding: 5 }}>
                                <Button style={[styles.myButt]} onPress={() => this.setScreenValue(4)}><Text style={{ fontSize: 30 }}>4</Text></Button>
                            </View>
                        </View>
                        {/*  */}
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <View style={{ flex: 1, padding: 5 }}>
                                <Button style={[styles.myButt]} onPress={() => this.setScreenValue(3)}><Text style={{ fontSize: 30 }}>3</Text></Button>
                            </View>
                            <View style={{ flex: 1, padding: 5 }}>
                                <Button style={[styles.myButt]} onPress={() => this.setScreenValue(2)}><Text style={{ fontSize: 30 }}>2</Text></Button>
                            </View>
                            <View style={{ flex: 1, padding: 5 }}>
                                <Button style={[styles.myButt]} onPress={() => this.setScreenValue(1)}><Text style={{ fontSize: 30 }}>1</Text></Button>
                            </View>
                        </View>
                        {/*  */}
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <View style={{ flex: 1, padding: 5 }}>
                                <Button style={[styles.myButt]} ><Text style={{ fontSize: 30 }}>-</Text></Button>
                            </View>
                            <View style={{ flex: 1, padding: 5 }}>
                                <Button style={[styles.myButt]} onPress={() => this.setScreenValue(0)}><Text style={{ fontSize: 30 }}>0</Text></Button>
                            </View>
                            <View style={{ flex: 1, padding: 5 }}>
                                <Button style={[styles.myButt]} ><Text style={{ fontSize: 30 }}>+</Text></Button>
                            </View>
                        </View>
                    </View>
                </Container>
            </StyleProvider>
        );
    }
}
