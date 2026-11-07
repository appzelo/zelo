import { View, Text, StyleSheet } from "react-native"
import { router } from "expo-router"
import { colors } from "../../../utils/constants/colors"
import AppHeader from "../../../components/AppHeader"
import Icon from "../../../components/Icon"

export default function ProRequests() {
    return (
        <View style={styles.container}>
            <AppHeader
                title="Pedidos"
                subtitle="Solicitações de atendimento"
                onSettings={() => router.push("/pro/settings")}
            />

            <View style={styles.centered}>
                <View style={styles.iconBox}>
                    <Icon name="people" size={30} color={colors.yellow1} />
                </View>

                <Text style={styles.title}>Solicitações recebidas</Text>
                <Text style={styles.hint}>
                    Aceite ou recuse os pedidos dos pacientes nesta tela.
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

    iconBox: {
        alignItems: "center",
        backgroundColor: colors.yellow2,
        borderRadius: 30,
        height: 60,
        justifyContent: "center",
        marginBottom: 14,
        width: 60,
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
