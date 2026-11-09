import { View, Text, StyleSheet } from "react-native"
import { colors } from "../../utils/constants/colors"
import BackHeader from "../../components/BackHeader"

export default function ProSettings() {
    return (
        <View style={styles.container}>
            <BackHeader text="Configurações" />

            <View style={styles.centered}>
                <Text style={styles.title}>Configurações do especialista</Text>
                <Text style={styles.hint}>
                    Perfil, privacidade e suporte serão reunidos aqui.
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white1,
        flex: 1,
        paddingHorizontal: "5%",
        width: "100%",
    },

    centered: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingBottom: 60,
    },

    title: {
        color: colors.dark1,
        fontSize: 16,
        fontWeight: "bold",
    },

    hint: {
        color: colors.gray2,
        fontSize: 13,
        lineHeight: 18,
        marginTop: 6,
        textAlign: "center",
    },
})
