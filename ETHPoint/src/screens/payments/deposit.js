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

function epsilonRound(num) {
    const zeros = 4;
    return Math.round((num + Number.EPSILON) * Math.pow(10, zeros)) / Math.pow(10, zeros)
}

class Deposit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            memory: 0,
            qr: null,
            signature: "",
            check: null,
            printData: "",
            amount: 0,
            signature: ""
        };
        reactAutobind(this)
        this.interval = null
        this.mount = true
        this.flag = true
        this.svg = null
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

    componentDidMount() {
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
                                check: true,
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
        this.mount = false
        clearInterval(this.interval)
    }

    render() {
        return (
            <>
                {
                    this.state.check ?
                        <View style={GlobalStyles.container}>
                            <View style={[GlobalStyles.header, { flexDirection: "row", justifyContent: "center", alignItems: "center" }]}>
                                <Image source={logoETH} style={{ height: 162 / 3.8, width: 484 / 3.8 }} />
                            </View>
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
                                    <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                    <img src='${logo}' width="700px"></img>
                                        <h1 style="font-size: 3rem;">--------- Original Reciept ---------</h1>
                                        <h1 style="font-size: 3rem;">Date: ${new Date().toLocaleDateString()}</h1>
                                        <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                        <h1 style="font-size: 3rem;">Direct Transfer</h1>
                                        <h1 style="font-size: 3rem;">Amount: ${this.state.amount.toString() + " "}MATIC</h1>
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
                                <Text style={{ textAlign: "center", color: "black", fontSize: 20, width: "80%" }}>
                                    Address: {"\n"}
                                    {
                                        this.context.value.account
                                    }
                                </Text>
                                <QRCode
                                    value={this.context.value.account}
                                    size={240}
                                    quietZone={10}
                                    ecl="H"
                                />
                                <Pressable style={[GlobalStyles.buttonMed]} onPress={() => this.props.navigation.navigate('Payments')}>
                                    <Text style={[GlobalStyles.buttonText]}>
                                        Done
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
                <View style={{ marginTop: Dimensions.get("window").height }}>
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

export default Deposit;