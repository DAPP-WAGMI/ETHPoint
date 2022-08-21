import React, { Component } from 'react';
import { Text, View, Pressable, Image } from 'react-native';
import reactAutobind from 'react-autobind';
// Utils
import ContextModule from '../utils/contextModule';
// Styles
import GlobalStyles from '../styles/styles';
import Web3 from 'web3';
import logoETH from "../assets/logoETH.png"

const RPC = "https://polygon-rpc.com/"

class Payments extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
        reactAutobind(this)
        this.web3 = new Web3(RPC)
    }

    static contextType = ContextModule;

    render() {
        return (
            <>
                <View style={GlobalStyles.container}>
                    <View style={[GlobalStyles.header, { flexDirection: "row", justifyContent: "center", alignItems: "center" }]}>
                        <Image source={logoETH} style={{ height: 162 / 3.8, width: 484 / 3.8 }} />
                    </View>
                    <View style={[GlobalStyles.main, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
                        <Pressable style={[GlobalStyles.button]} onPress={() => this.props.navigation.navigate('Wallet')}>
                            <Text style={[GlobalStyles.buttonText]}>
                                Wallet Connect
                            </Text>
                        </Pressable>
                        <Pressable style={[GlobalStyles.button]} onPress={() => this.props.navigation.navigate('NFC')}>
                            <Text style={[GlobalStyles.buttonText]}>
                                NFC Pay
                            </Text>
                        </Pressable>
                        <Pressable style={[GlobalStyles.button]} onPress={() => this.props.navigation.navigate('Deposit')}>
                            <Text style={[GlobalStyles.buttonText]}>
                                Direct Transfer
                            </Text>
                        </Pressable>
                    </View>
                    <View style={[GlobalStyles.footer, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
                        <Pressable style={[GlobalStyles.buttonFooter]} onPress={() => this.props.navigation.navigate('Payments')}>
                            <Text style={[GlobalStyles.buttonText]}>
                                Payments
                            </Text>
                        </Pressable>
                        <Pressable style={[GlobalStyles.buttonFooter]} onPress={() => this.props.navigation.navigate('Account')}>
                            <Text style={[GlobalStyles.buttonText]}>
                                Account
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </>
        );
    }
}

export default Payments;