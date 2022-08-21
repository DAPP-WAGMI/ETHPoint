import { Dimensions, StyleSheet } from 'react-native';

const navbarHeight = Dimensions.get('screen').height - Dimensions.get('window').height;

let headerHeight = 60;
let footerHeight = 60;

const GlobalStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    header: {
        width: Dimensions.get("window").width,
        height: headerHeight,
        backgroundColor: "#97c5f7",
        borderBottomColor:"#fd8aff",
        borderBottomWidth:2
    },
    main: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height - (headerHeight + footerHeight + navbarHeight / 2),
        backgroundColor: "white",
    },
    footer: {
        width: Dimensions.get("window").width,
        height: footerHeight,
        backgroundColor:"white"
    },
    button:{
        borderRadius:100,
        backgroundColor:"#fd8aff",
        borderColor:"#7f4580",
        borderWidth:2,
        padding:20,
        width:"80%"
    },
    buttonMed:{
        borderRadius:100,
        backgroundColor:"#fd8aff",
        borderColor:"#7f4580",
        borderWidth:2,
        padding:10,
        width:"80%"
    },
    buttonFooter:{
        backgroundColor:"#97c5f7",
        width:"50%",
        height:"100%",
        borderWidth:0.5,
        borderTopRightRadius:20,
        borderTopLeftRadius:20
    },
    buttonText:{
        color:"black",
        fontSize:32,
        textAlign:"center"
    }
});

export default GlobalStyles;