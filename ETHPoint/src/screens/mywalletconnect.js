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

class MyWalletConnect extends Component {
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
            signature: ""
        };
        reactAutobind(this)
        this.web3 = new Web3(RPC)
        this.svg = null
        this.connector = new WalletConnect({
            bridge: "https://bridge.walletconnect.org",
            clientMeta: {
                description: "ETHPoint",
                url: "https://ethglobal.com",
                icons: ["https://general-bucket-android.s3.amazonaws.com/logo.svg"], // Pending to REPO
                name: "ETHPoint",
            }
        })
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

    async transfer(amount, from, to) {
        let transaction = {
            from,
            to,
            data: "0x",
            value: this.web3.utils.toHex(this.web3.utils.toWei((amount).toString(), "ether")),
        }
        console.log(transaction)
        this.connector.sendTransaction(transaction)
            .then((result) => {
                this.setState({
                    signature: result,
                    stage: 2
                })
            })
            .catch((error) => {
                console.error(error);
            });
    }

    async transferToken(amount, from, to, tokenAddress) {
        console.log("transfer Token")
        const contract = new this.web3.eth.Contract(abiERC20, tokenAddress, { from })
        let decimals = await contract.methods.decimals().call()
        let transaction = {
            to: tokenAddress,
            from,
            data: contract.methods.transfer(to, this.web3.utils.toHex(amount * Math.pow(10, decimals))).encodeABI()
        }
        console.log(transaction)
        this.connector.sendTransaction(transaction)
            .then((result) => {
                this.setState({
                    signature: result,
                    stage: 2
                })
            })
            .catch((error) => {
                console.error(error);
            });
    }

    componentDidMount() {
        if (!this.connector.connected) {
            this.connector.createSession().then(() => {
                this.setState({
                    qr: this.connector.uri
                })
            })
        }
        this.connector.on("connect", async (error, payload) => {
            if (error) {
                throw error;
            }
            // Get provided accounts and chainId
            const { accounts, chainId } = payload.params[0];
            console.log({ accounts, chainId })
            this.setState({
                account: accounts[0]
            }, () => {
                if (this.state.token.label === "MATIC") {
                    this.transfer(this.state.amount, this.state.account, this.context.value.account)
                }
                else {
                    this.transferToken(this.state.amount, this.state.account, this.context.value.account, this.state.token.value)
                }
            })
        });

        this.connector.on("session_update", (error, payload) => {
            if (error) {
                throw error;
            }
            // Get updated accounts and chainId
            const { accounts, chainId } = payload.params[0];
            console.log({ accounts, chainId })
        });

        this.connector.on("session_request", (error, payload) => {
            if (error) {
                throw error;
            }
            console.log(payload)
        });

        this.connector.on("call_request", (error, payload) => {
            if (error) {
                throw error;
            }
            // Get updated accounts and chainId
            console.log(payload)
        });

        this.connector.on("wc_sessionRequest", (error, payload) => {
            if (error) {
                throw error;
            }
            // Get updated accounts and chainId
            console.log(payload)
        });

        this.connector.on("wc_sessionUpdate", (error, payload) => {
            if (error) {
                throw error;
            }
            // Get updated accounts and chainId
            console.log(payload)
        });

        this.connector.on("disconnect", (error, payload) => {
            if (error) {
                throw error;
            }
            console.log("goodbye")
        })
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
                                this.state.qr &&
                                <View style={{ flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }}>
                                    <QRCode
                                        value={this.state.qr}
                                        size={Dimensions.get("window").height / 2}
                                        quietZone={10}
                                        ecl="H"
                                    />
                                    <Text style={[{ fontSize: 28, textAlign: "center", color: "black" }]}>
                                        Amount: {this.state.amount.toString()}{" "}{this.state.token.label}
                                    </Text>
                                    <Text style={[{ fontSize: 28, textAlign: "center", color: "black" }]}>
                                        Place: {this.state.place}
                                    </Text>
                                    <Text style={[{ fontSize: 28, textAlign: "center", color: "black" }]}>
                                        Articles: {this.state.articles}
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

export default MyWalletConnect;