import React, { Component } from 'react';
import { Text, View, Pressable } from 'react-native';
import reactAutobind from 'react-autobind';
// Utils
import ContextModule from '../utils/contextModule';
// Styles
import GlobalStyles from '../styles/styles';
import Web3 from 'web3';
import { abiERC20 } from "../contracts/erc20"

/* Mainnet
const USDCaddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" 
const USDTaddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
const RPC = "https://polygon-rpc.com/"
const account = "0x1197E435e6Da95FeC52c012c9d9eD6097D8C0fce"
*/

const address1 = "0x7b1e93e1E72D75c18673A56281cd6E4017cb5629"
const address2 = "0xbfe7526Cf1C4D070Fd5386D663BEa6658Acd7135"
const privAddress2 = "0xe6cf00236e3a5e9a3783b2d5c0532f2829b721bcc2849fa88a836baa4287cfe3"
const USDCaddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"  // Link
const USDTaddress = "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1"  // DER
const RPC = "https://rpc-mumbai.maticvigil.com/"

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
        reactAutobind(this)
        this.web3 = new Web3(RPC)
    }

    static contextType = ContextModule;

    componentWillUnmount() {

    }

    async getBalanceToken(address, tokenAddress) {
        return new Promise(async (resolve, reject) => {
            const contract = new this.web3.eth.Contract(abiERC20, tokenAddress)
            let res = await contract.methods.balanceOf(address).call()
            let decimals = await contract.methods.decimals().call()
            resolve(res / (Math.pow(10, decimals)))
        })
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
                    this.web3.eth.getTransactionReceipt(hash, (err, rec) => {
                        if (rec) {
                            console.log(rec);
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
                    this.web3.eth.getTransactionReceipt(hash, (err, rec) => {
                        if (rec) {
                            console.log(rec);
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

    async componentDidMount() {
        console.log(address1)
        let maticBalance = this.web3.utils.fromWei(await this.web3.eth.getBalance(address1), 'ether')
        console.log(maticBalance)
        console.log(address2)
        maticBalance = this.web3.utils.fromWei(await this.web3.eth.getBalance(address2), 'ether')
        console.log(maticBalance)
        const USDCtokenBalance = await this.getBalanceToken(address1, USDCaddress)
        console.log(USDCtokenBalance)
        const USDTtokenBalance = await this.getBalanceToken(address1, USDTaddress)
        console.log(USDTtokenBalance)
    }

    render() {
        return (
            <>
                <View style={GlobalStyles.container}>
                    <View style={[GlobalStyles.header, {}]}>
                        <Text>
                            Header
                        </Text>
                    </View>
                    <View style={[GlobalStyles.main, {}]}>
                        <Text>
                            Main
                        </Text>
                        <Pressable onPress={() => this.transfer(0.001, privAddress2, address1)}>
                            <Text style={{ color: "white", fontSize: 20 }}>
                                Transfer
                            </Text>
                        </Pressable>
                        <Pressable onPress={() => this.transferToken(0.001, privAddress2, address1, USDCaddress)}>
                            <Text style={{ color: "white", fontSize: 20 }}>
                                Transfer Token
                            </Text>
                        </Pressable>
                    </View>
                    <View style={[GlobalStyles.footer, {}]}>
                        <Text>
                            Footer
                        </Text>
                    </View>
                </View>
            </>
        );
    }
}

export default Main;