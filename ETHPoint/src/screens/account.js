import React, { Component } from 'react';
import { Text, View, Pressable, Image } from 'react-native';
import reactAutobind from 'react-autobind';
// Utils
import ContextModule from '../utils/contextModule';
// Styles
import GlobalStyles from '../styles/styles';
import Web3 from 'web3';
import { abiERC20 } from "../contracts/erc20"
import matic from "../assets/matic-token-icon.png"
import usdc from "../assets/usdc-token.png"
import usdt from "../assets/usdt-token.png"
import Ctransactions from './accounts/transactions';
import logoETH from "../assets/logoETH.png"

const RPC = "https://polygon-rpc.com/"
const USDCaddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
const USDTaddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"

function espilonRound(num) {
    return Math.round((parseFloat(num) + Number.EPSILON) * 10000) / 10000;
}

class Account extends Component {
    constructor(props) {
        super(props);
        this.state = {
            maticBalance: 0,
            USDCBalance: 0,
            USDTBalance: 0,
            transactions: []
        };
        reactAutobind(this)
        this.web3 = new Web3(RPC)
    }

    static contextType = ContextModule;

    async getBalanceToken(address, tokenAddress) {
        return new Promise(async (resolve, reject) => {
            const contract = new this.web3.eth.Contract(abiERC20, tokenAddress)
            let res = await contract.methods.balanceOf(address).call()
            let decimals = await contract.methods.decimals().call()
            resolve(res / (Math.pow(10, decimals)))
        })
    }

    async componentDidMount() {
        const maticBalance = this.web3.utils.fromWei(await this.web3.eth.getBalance(this.context.value.account), 'ether')
        const USDCBalance = await this.getBalanceToken(this.context.value.account, USDCaddress)
        const USDTBalance = await this.getBalanceToken(this.context.value.account, USDTaddress)
        this.setState({
            maticBalance,
            USDCBalance,
            USDTBalance
        })
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        fetch(`https://api.polygonscan.com/api?module=account&action=txlist&address=${this.context.value.account}&startblock=0&endblock=99999999&sort=desc&apikey=EY9AH8AUA89IRBBWKDEIXE1CVQFP3I5E64`, requestOptions)
            .then(response => response.text())
            .then(result => this.setState({
                transactions: JSON.parse(result).result
            }))
            .catch(error => console.log('error', error));
    }

    render() {
        return (
            <>
                <View style={GlobalStyles.container}>
                    <View style={[GlobalStyles.header, { flexDirection: "row", justifyContent: "center", alignItems: "center" }]}>
                        <Image source={logoETH} style={{ height: 162 / 3.8, width: 484 / 3.8 }} />
                    </View>
                    <View style={[GlobalStyles.main, { flexDirection: "column", alignItems: "center", paddingTop: 20 }]}>

                        <View style={{ borderBottomWidth: 0.5, borderColor: "black", width: "80%", paddingBottom: 20 }}>
                            <Text style={{ textAlign: "center", color: "black", fontSize: 20, }}>
                                Address: {"\n"}
                                {
                                    this.context.value.account
                                }
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", marginTop: 20 }}>
                            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ fontSize: 30 }}>
                                    {
                                        " "
                                    }
                                    {
                                        espilonRound(this.state.maticBalance)
                                    }
                                    {
                                        " "
                                    }
                                </Text>
                                <Image source={matic} style={{ width: 30, height: 30 }} />
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ fontSize: 30 }}>
                                    {
                                        " "
                                    }
                                    {
                                        espilonRound(this.state.USDCBalance)
                                    }
                                    {
                                        " "
                                    }
                                </Text>
                                <Image source={usdc} style={{ width: 30, height: 30 }} />
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ fontSize: 30 }}>
                                    {
                                        " "
                                    }
                                    {
                                        espilonRound(this.state.USDTBalance)
                                    }
                                    {
                                        " "
                                    }
                                </Text>
                                <Image source={usdt} style={{ width: 30, height: 30 }} />
                            </View>
                        </View>
                        <View style={{ marginTop: 20, borderTopWidth: 0.5, borderColor: "black" }}>
                            <Text style={{ textAlign: "center", fontSize: 20, paddingVertical: 10 }}>
                                Transactions
                            </Text>
                            <Ctransactions transactions={this.state.transactions} />
                        </View>
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

export default Account;