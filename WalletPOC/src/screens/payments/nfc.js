import React, { Component } from 'react';
import { Text, View, Pressable, Dimensions, Image, Linking } from 'react-native';
import reactAutobind from 'react-autobind';
// Utils
import ContextModule from '../../utils/contextModule';
// Styles
import GlobalStyles from '../../styles/styles';
// Non Basic Components
import QRCode from 'react-native-qrcode-svg';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import { logo } from "../../assets/logo"
import logoETH from "../../assets/logoETH.png"
import checkMark from "../../assets/checkMark.png"
import nfcpay from "../../assets/nfc-pay.png"
import HCESession, { NFCContentType, NFCTagType4 } from 'react-native-hce';
import Web3 from 'web3';

const RPC = "https://polygon-rpc.com/"

function epsilonRound(num) {
    const zeros = 4;
    return Math.round((num + Number.EPSILON) * Math.pow(10, zeros)) / Math.pow(10, zeros)
}

const USDCaddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
const USDTaddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"

class NFC extends Component {
    constructor(props) {
        super(props);
        this.state = {
            memory: 0,
            qr: null,
            signature: "",
            check: null,
            printData: "",
            amount: 0,
            signature: "",
            amount: 0,
            from: "",
            to: "",
            token: ""
        };
        reactAutobind(this)
        this.axios = require('axios');
        this.CancelToken = require('axios').CancelToken;
        this.source = this.CancelToken.source();
        this.interval = null
        this.mount = true
        this.flag = true
        this.svg = null
        this.tag = ""
        this.simulation = ""
        this.web3 = new Web3(RPC)
    }

    static contextType = ContextModule;

    async requestAxios() {
        return new Promise((resolve, reject) => {
            var config = {
                method: 'get',
                url: 'https://a0ztybj3i2.execute-api.us-east-1.amazonaws.com/get-transaction',
                headers: {
                    'accounts': this.web3.eth.accounts.privateKeyToAccount(this.context.value.priv).address
                },
                cancelToken: this.source.token
            };
            this.axios(config)
                .then((response) => {
                    if (response.data.length > 0) {
                        resolve(response.data)
                    }
                    else {
                        resolve(false)
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        })
    }

    async delAxios() {
        return new Promise((resolve, reject) => {
            var config = {
                method: 'get',
                url: 'https://a0ztybj3i2.execute-api.us-east-1.amazonaws.com/del-transaction',
                headers: {
                    'accounts': this.web3.eth.accounts.privateKeyToAccount(this.context.value.priv).address
                },
                cancelToken: this.source.token
            };
            this.axios(config)
                .then((response) => {
                    resolve(true)
                })
                .catch(function (error) {
                    reject(true)
                });
        })
    }

    async componentDidMount() {
        const tag = new NFCTagType4(NFCContentType.Text, this.web3.eth.accounts.privateKeyToAccount(this.context.value.priv).address);
        this.simulation = await (new HCESession(tag)).start();
        this.interval = setInterval(async () => {
            if (this.flag) {
                this.flag = false
                let res = await this.requestAxios()
                if (res !== false) {
                    await this.delAxios()
                    await this.simulation.terminate();
                    this.setState({
                        amount: res[0].payload.split(",")[0],
                        token: res[0].payload.split(",")[1],
                        to: res[0].payload.split(",")[2]
                    })
                }
                else {
                    this.flag = true
                }

            }
        }, 2000);
    }

    async transfer(amount, privKey, address) {
        console.log("transfer Matic")
        let transaction = {
            'to': address,
            'from': this.web3.eth.accounts.privateKeyToAccount(privKey).address,
            'value': this.web3.utils.toWei(amount.toString(), "ether"),
        }
        const gas = await this.web3.eth.estimateGas(transaction)
        transaction = { ...transaction, gas }
        const signedTx = await this.web3.eth.accounts.signTransaction(transaction, privKey);
        this.web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, hash) => {
            if (!error) {
                console.log(hash)
                let interval = null
                interval = setInterval(() => {
                    this.web3.eth.getTransactionReceipt(hash, async (err, rec) => {
                        if (rec) {
                            this.setState({
                                memory: 0,
                                qr: null,
                                signature: "",
                                check: null,
                                printData: "",
                                amount: 0,
                                signature: "",
                                amount: 0,
                                from: "",
                                to: "",
                                token: ""
                            })
                            const tag = new NFCTagType4(NFCContentType.Text, this.web3.eth.accounts.privateKeyToAccount(this.context.value.priv).address);
                            this.simulation = await (new HCESession(tag)).start();
                            clearInterval(interval);
                        }
                        else {
                            console.log(".")
                        }
                    });
                }, 1000);
            } else {
                console.log("❗Something went wrong while submitting your transaction:", error)
            }
        })
    }

    async transferToken(amount, privKey, address, tokenAddress) {
        console.log("transfer Token")
        const contract = new this.web3.eth.Contract(abiERC20, tokenAddress, {
            'from': this.web3.eth.accounts.privateKeyToAccount(privKey).address,
        })
        let decimals = await contract.methods.decimals().call()
        let transaction = {
            'to': tokenAddress,
            'data': contract.methods.transfer(address, this.web3.utils.toHex(amount * Math.pow(10, decimals))).encodeABI()
        }
        const gas = await contract.methods.transfer(address, this.web3.utils.toHex(amount * Math.pow(10, decimals))).estimateGas({ 'from': this.web3.eth.accounts.privateKeyToAccount(privAddress2).address })

        transaction = { ...transaction, gas }
        console.log(transaction)

        const signedTx = await this.web3.eth.accounts.signTransaction(transaction, privKey);
        this.web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, hash) => {
            if (!error) {
                console.log(hash)
                let interval = null
                interval = setInterval(() => {
                    this.web3.eth.getTransactionReceipt(hash, async (err, rec) => {
                        if (rec) {
                            this.setState({
                                memory: 0,
                                qr: null,
                                signature: "",
                                check: null,
                                printData: "",
                                amount: 0,
                                signature: "",
                                amount: 0,
                                from: "",
                                to: "",
                                token: ""
                            })
                            const tag = new NFCTagType4(NFCContentType.Text, this.web3.eth.accounts.privateKeyToAccount(this.context.value.priv).address);
                            this.simulation = await(new HCESession(tag)).start();
                            clearInterval(interval);
                        }
                        else {
                            console.log(".")
                        }
                    });
                }, 1000);
            } else {
                console.log("❗Something went wrong while submitting your transaction:", error)
            }
        })
    }

    async componentWillUnmount() {
        this.mount = false
        clearInterval(this.interval)
        await this.simulation.terminate();
    }

    render() {
        return (
            <>
                {
                    this.state.to === "" ?
                        <View style={GlobalStyles.container}>
                            <View style={[GlobalStyles.header, { flexDirection: "row", justifyContent: "center", alignItems: "center" }]}>
                                <Image source={logoETH} style={{ height: 162 / 3.8, width: 484 / 3.8 }} />
                            </View>
                            <View style={[GlobalStyles.main, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
                                <Image source={nfcpay} style={{ height: 350, width: 350 }} />
                                <Text style={[GlobalStyles.buttonText]}>
                                    Get closer to {"\n"} the NFC reader
                                </Text>
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
                        :
                        <View style={GlobalStyles.container}>
                            <View style={[GlobalStyles.header, { flexDirection: "row", justifyContent: "center", alignItems: "center" }]}>
                                <Image source={logoETH} style={{ height: 162 / 3.8, width: 484 / 3.8 }} />
                            </View>
                            <View style={[GlobalStyles.main, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
                                <Text style={{ fontSize: 30, color: "black", textAlign: "center", width: "80%" }}>
                                    To: {"\n"}{this.state.to}
                                </Text>
                                <Text style={{ fontSize: 30, color: "black", textAlign: "center", width: "80%" }}>
                                    Amount: {"\n"}{this.state.amount}{" "}{this.state.token}
                                </Text>
                                <Pressable style={[GlobalStyles.button]} onPress={async () => {
                                    if (this.state.token === "MATIC")
                                        this.transfer(parseFloat(this.state.amount), this.context.value.priv, this.state.to)
                                    else if (this.state.token === "USDT")
                                        this.transferToken(parseFloat(this.state.amount), this.context.value.priv, this.state.to, USDTaddress)
                                    else if (this.state.token === "USDC")
                                        this.transferToken(parseFloat(this.state.amount), this.context.value.priv, this.state.to, USDCaddress)
                                }}>
                                    <Text style={[GlobalStyles.buttonText]}>
                                        Pay Now
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
                }
            </>
        );
    }
}

export default NFC;