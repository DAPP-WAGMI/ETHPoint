import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';

function epsilonRound(num) {
    const zeros = 4;
    return Math.round((num + Number.EPSILON) * Math.pow(10, zeros)) / Math.pow(10, zeros)
}

class Ctransactions extends Component {
    render() {
        return (
            <View style={{ height: "80%" }}>
                <ScrollView>
                    {this.props.transactions.map((item, index) => (
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                        }} key={index}>
                            <View style={{ marginRight: 20 }}>
                                <Text style={{ fontSize: 20, textAlign: "center", color: "black" }}>
                                    Date: {"\n"}
                                    {new Date(item.timeStamp * 1000).toLocaleDateString()}
                                </Text>
                            </View>
                            <View>
                                <Text style={{ fontSize: 20, textAlign: "center", color: "black" }}>
                                    Amount: {"\n"}{
                                        epsilonRound(item.amount / 1000000000000000000) > 0 ?
                                            <Text style={{
                                                color: '#009900'
                                            }}>
                                                {
                                                    epsilonRound(item.amount / 1000000000000000000)
                                                }
                                            </Text> :
                                            <Text style={{
                                                color: '#ff0000'
                                            }}>
                                                {
                                                    epsilonRound(item.value / 1000000000000000000)
                                                }
                                            </Text>
                                    }
                                    {"  "}
                                </Text>
                            </View>
                            <View style={{ marginLeft: 20 }}>
                                <Text style={{ fontSize: 20, textAlign: "center", color: "black" }}>
                                    GasFee: {"\n"}{
                                        epsilonRound(item.gas / 1000000000000000000) > 0 ?
                                            epsilonRound(item.gas / 1000000000000000000)
                                            :
                                            ">0.001"
                                    }
                                    {"  "}
                                </Text>
                            </View>
                        </View>
                    ))
                    }
                </ScrollView>
            </View>
        );
    }
}

export default Ctransactions;