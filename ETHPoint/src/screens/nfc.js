import React, { Component } from 'react';
import { Text, View, Pressable, Dimensions, Image, TextInput, ScrollView, Linking } from 'react-native';
import reactAutobind from 'react-autobind';
// Utils
import ContextModule from '../utils/contextModule';
// Styles
import GlobalStyles from '../styles/styles';
import WalletConnect from "@walletconnect/client";
import QRCode from 'react-native-qrcode-svg';
import { abiERC20 } from "../contracts/erc20"
import Web3 from "web3";
import logoETH from "../assets/logoETH.png"
import checkMark from "../assets/checkMark.png"
import { logo } from "../assets/logo"
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import { FormItem, Picker } from 'react-native-form-component';
import NfcManager, { Ndef, NfcEvents, NfcTech } from 'react-native-nfc-manager';

const RPC = "https://polygon-rpc.com/"
const tokens = [
    {
        name: "MATIC",
        address: ""
    },
    {
        name: "USDC PoS",
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
    },
    {
        name: "USDT PoS",
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
    }
]


function epsilonRound(num) {
    const zeros = 4;
    return Math.round((num + Number.EPSILON) * Math.pow(10, zeros)) / Math.pow(10, zeros)
}


class NFC extends Component {
    constructor(props) {
        super(props);
        this.state = {
            qr: null,
            account: "",
            stage: 0,
            token: {
                label: "MATIC",
                value: ""
            },
            place: "",
            articles: "",
            amount: 0,
            signature: "",
            memory: 0
        };
        reactAutobind(this)
        this.web3 = new Web3(RPC)
        this.svg = null
        this.NfcManager = NfcManager
        this.interval = null
        this.axios = require("axios")
        this.flag = true
        this.mount = true
    }

    static contextType = ContextModule;

    async getDataURL() {
        return new Promise(async (resolve, reject) => {
            this.svg.toDataURL(async (data) => {
                this.setState({
                    printData: "data:image/png;base64," + data
                }, () => resolve("ok"))
            });
        })
    }

    NFCreadData(data) {
        let decoded = Ndef.text.decodePayload(data.ndefMessage[0].payload)
        console.log(decoded)
        if (decoded.length === 42) {
            var config = {
                method: 'get',
                url: 'https://a0ztybj3i2.execute-api.us-east-1.amazonaws.com/add-transaction',
                headers: {
                    'accounts': decoded,
                    'payload': `${this.state.amount},${this.state.token.label},${this.context.value.account},${this.context.value.place},${this.context.value.articles}`
                }
            };
            this.axios(config)
                .then((response) => {
                    console.log(response.data);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }

    componentDidMount() {
        this.NfcManager.start()
        this.NfcManager.setEventListener(NfcEvents.DiscoverTag, this.NFCreadData);
        this.NfcManager.registerTagEvent()
        this.interval = setInterval(() => {
            if (this.flag) {
                this.flag = false
                var requestOptions = {
                    method: 'GET',
                    redirect: 'follow'
                };
                fetch(`https://api.polygonscan.com/api?module=account&action=txlist&address=${this.context.value.account}&startblock=0&endblock=99999999&sort=desc&apikey=EY9AH8AUA89IRBBWKDEIXE1CVQFP3I5E64`, requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        console.log(JSON.parse(result).result.length)
                        if (this.state.memory !== 0 && this.state.memory < JSON.parse(result).result.length) {
                            this.mount && this.setState({
                                memory: JSON.parse(result).result.length,
                                stage: 2,
                                signature: JSON.parse(result).result[0].hash,
                                amount: epsilonRound(JSON.parse(result).result[0].value / 1000000000000000000)
                            }, () => {
                                clearInterval(this.interval)
                            })
                        }
                        else {
                            this.mount && this.setState({
                                memory: JSON.parse(result).result.length
                            }, () => {
                                this.flag = true
                            })
                        }
                    })
                    .catch(error => console.log('error', error));
            }
        }, 2000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        this.NfcManager.unregisterTagEvent();
        this.mount = false
    }

    render() {
        return (
            <>
                <View style={GlobalStyles.container}>
                    <View style={[GlobalStyles.header, { flexDirection: "row", justifyContent: "center", alignItems: "center" }]}>
                        <Image source={logoETH} style={{ height: 162 / 3.8, width: 484 / 3.8 }} />
                    </View>
                    {
                        this.state.stage === 0 &&
                        <ScrollView style={[GlobalStyles.main]}>
                            <View style={{ width: "90%", textAlign: "center", alignSelf: "center" }}>
                                <Text style={{ fontSize: 28, fontWeight: "bold", color: "black" }}>
                                    Amount
                                </Text>
                                <TextInput
                                    style={{ fontSize: 24, textAlign: "center", borderWidth: 1, borderColor: "black" }}
                                    keyboardType="number-pad"
                                    value={this.state.amount.toString()}
                                    onChangeText={(value) => this.setState({ amount: value })}
                                />
                            </View>
                            <View style={{ width: "90%", textAlign: "center", alignSelf: "center" }}>
                                <Picker
                                    isRequired
                                    buttonStyle={{ fontSize: 28, textAlign: "center", borderWidth: 1, borderColor: "black" }}
                                    itemLabelStyle={[{ fontSize: 24, textAlign: "center" }]}
                                    labelStyle={[{ fontSize: 28, textAlign: "center" }]}
                                    selectedValueStyle={[{ fontSize: 28, textAlign: "center" }]}
                                    items={tokens.map((item, index) => ({ label: item.name, value: item.address }))}
                                    label=" Token"
                                    selectedValue={this.state.token.value}
                                    onSelection={
                                        (item) => {
                                            this.setState({
                                                token: item
                                            });
                                        }
                                    }
                                />
                            </View>
                            <View style={{ width: "90%", textAlign: "center", alignSelf: "center" }}>
                                <FormItem
                                    style={[{ fontSize: 28, textAlign: "center", borderWidth: 1, borderColor: "black" }]}
                                    textInputStyle={[{ fontSize: 24, textAlign: "center" }]}
                                    labelStyle={[{ fontSize: 28, textAlign: "center" }]}
                                    label="Place"
                                    value={this.state.place}
                                    onChangeText={(value) => this.setState({ place: value })}
                                />
                            </View>
                            <View style={{ width: "90%", textAlign: "center", alignSelf: "center" }}>
                                <FormItem
                                    style={[{ fontSize: 28, textAlign: "center", borderWidth: 1, borderColor: "black" }]}
                                    textInputStyle={[{ fontSize: 24, textAlign: "center" }]}
                                    labelStyle={[{ fontSize: 28, textAlign: "center" }]}
                                    label="Articles"
                                    value={this.state.articles}
                                    onChangeText={(value) => this.setState({ articles: value })}
                                />
                            </View>
                            <View style={{ width: "90%", textAlign: "center", alignSelf: "center" }}>
                                <Pressable style={[GlobalStyles.button, { alignSelf: "center", marginBottom: 20 }]} onPress={() => this.setState({
                                    stage: 1
                                })}>
                                    <Text style={[GlobalStyles.buttonText, { fontSize: 28 }]}>
                                        Pay
                                    </Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    }
                    {
                        this.state.stage === 1 &&
                        <View style={[GlobalStyles.main, {}]}>
                            {
                                <View style={{ flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text style={[{ fontSize: 28, textAlign: "center", color: "black" }]}>
                                        Amount: {this.state.amount.toString()}{" "}{this.state.token.label}
                                    </Text>
                                    <Text style={[{ fontSize: 28, textAlign: "center", color: "black" }]}>
                                        Place: {this.state.place}
                                    </Text>
                                    <Text style={[{ fontSize: 28, textAlign: "center", color: "black" }]}>
                                        Articles: {this.state.articles}
                                    </Text>
                                    <Text style={[{ fontSize: 28, textAlign: "center", color: "black", marginTop:100 }]}>
                                        Waiting to confirm...
                                    </Text>
                                </View>
                            }
                        </View>
                    }
                    {
                        this.state.stage === 2 &&
                        <View style={[GlobalStyles.main, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
                            <Image source={checkMark} alt="check"
                                style={{ width: 200, height: 200 }}
                            />
                            <Text style={{
                                textShadowRadius: 1,
                                fontSize: 28, fontWeight: "bold", color: "#00e599", paddingTop: 10
                            }}>
                                Completed
                            </Text>
                            <Pressable onPress={() => Linking.openURL("https://polygonscan.com/tx/" + this.state.signature)}>
                                <Text style={{
                                    fontSize: 24, fontWeight: "bold", color: "#000", textAlign: "center"
                                }}>
                                    View on Explorer
                                </Text>
                            </Pressable>
                            <Pressable style={[GlobalStyles.buttonMed]} onPress={async () => {
                                await this.getDataURL()
                                const results = await RNHTMLtoPDF.convert({
                                    html: (`
                        <div style="text-align: center;">
                        <img src='${logo}' width="600px"></img>
                            <h1 style="font-size: 3rem;">--------- Original Reciept ---------</h1>
                            <h1 style="font-size: 3rem;">Date: ${new Date().toLocaleDateString()}</h1>
                            <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                            <h1 style="font-size: 3rem;">WalletConnect Transfer</h1>
                            <h1 style="font-size: 3rem;">Amount: ${this.state.amount.toString() + " "}${this.state.token.label}</h1>
                            <h1 style="font-size: 3rem;">Place: ${this.state.place}</h1>
                            <h1 style="font-size: 3rem;">Articles: ${this.state.articles}</h1>
                            <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                            <img src='${this.state.printData}'></img>
                        </div>
                        `),
                                    fileName: 'print',
                                    base64: true,
                                })
                                await RNPrint.print({ filePath: results.filePath })
                            }}>
                                <Text style={[GlobalStyles.buttonText]}>
                                    Print Receipt
                                </Text>
                            </Pressable>
                            <Pressable style={[GlobalStyles.buttonMed]} onPress={() => this.props.navigation.navigate('Payments')}>
                                <Text style={[GlobalStyles.buttonText]}>
                                    Done
                                </Text>
                            </Pressable>
                        </View>
                    }
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
                <View style={{ position: "absolute", bottom: -500 }}>
                    <QRCode
                        value={"https://polygonscan.com/tx/" + this.state.signature}
                        size={Dimensions.get("window").width * 0.7}
                        ecl="L"
                        getRef={(c) => (this.svg = c)}
                    />
                </View>
            </>
        );
    }
}

export default NFC;