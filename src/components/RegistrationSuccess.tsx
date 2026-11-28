import { View, Text, StyleSheet } from "react-native"
import { router } from "expo-router"
import { colors } from "../utils/constants/colors"
import AppButton from "./AppButton"
import Icon from "./Icon"

type RegistrationSuccessProps = {
    message?: string,
}

/** Confirmação exibida ao final dos cadastros. */
export default function RegistrationSuccess({
    message = "Sua conta foi criada com sucesso. Entre com seu CPF e senha para acessar.",
}: RegistrationSuccessProps) {
    return (
        <View style={styles.container}>
            <View style={styles.icon}>
                <Icon name="checkmark-circle" size={44} color={colors.green1} />
            </View>

            <Text style={styles.title}>Cadastro concluído</Text>

            <Text style={styles.text}>{message}</Text>

            <View style={styles.footer}>
                <AppButton
                    text="Ir para o login"
                    onPress={() => router.dismissTo("/login")}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingBottom: 40,
        paddingHorizontal: "5%",
    },

    icon: {
        alignItems: "center",
        backgroundColor: colors.green3,
        borderRadius: 36,
        height: 72,
        justifyContent: "center",
        width: 72,
    },

    title: {
        color: colors.dark1,
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 18,
    },

    text: {
        color: colors.gray2,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
        maxWidth: 320,
        textAlign: "center",
    },

    footer: {
        marginTop: 28,
        width: "100%",
    },
})
