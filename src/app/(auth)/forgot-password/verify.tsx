import { useEffect, useState } from "react"
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../../utils/constants/colors"
import { applyMask, digitsOnly } from "../../../utils/mask"
import AppButton from "../../../components/AppButton"
import BackHeader from "../../../components/BackHeader"
import Icon from "../../../components/Icon"
import SectionText from "../../../components/SectionText"
import StepIndicator from "../../../components/StepIndicator"

const CODE_LENGTH = 4
const RESEND_SECONDS = 30

export default function VerifyCode() {
    const insets = useSafeAreaInsets()
    const { cpf } = useLocalSearchParams<{ cpf?: string }>()

    const [code, setCode] = useState("")
    const [seconds, setSeconds] = useState(RESEND_SECONDS)

    const cpfParam = typeof cpf === "string" ? cpf : null
    const formattedCpf = cpfParam ? applyMask(cpfParam, "cpf") : null
    const canVerify = code.length === CODE_LENGTH

    useEffect(() => {
        if (seconds <= 0) {
            return
        }

        const timer = setTimeout(() => setSeconds((value) => value - 1), 1000)

        return () => clearTimeout(timer)
    }, [seconds])

    function handleResend() {
        // O reenvio será solicitado ao backend.
        setCode("")
        setSeconds(RESEND_SECONDS)
    }

    function handleVerify() {
        // A validação do código será feita pelo backend.
        if (cpfParam) {
            router.push({
                pathname: "/forgot-password/reset",
                params: { cpf: cpfParam },
            })
            return
        }

        router.push("/forgot-password/reset")
    }

    return (
        <View style={styles.container}>
            <BackHeader text="Verificar código" />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + 24 },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    onScrollBeginDrag={Keyboard.dismiss}
                    showsVerticalScrollIndicator={false}
                >
                    <StepIndicator current={2} />

                    <SectionText
                        title="Digite o código"
                        showDescription
                        description={
                            formattedCpf
                                ? `Enviamos um código de 4 dígitos para o e-mail cadastrado no CPF ${formattedCpf}.`
                                : "Enviamos um código de 4 dígitos para o e-mail cadastrado."
                        }
                        titleStyle={styles.pageTitle}
                    />

                    <TextInput
                        style={styles.codeInput}
                        value={code}
                        onChangeText={(text) => setCode(digitsOnly(text).slice(0, CODE_LENGTH))}
                        placeholder="0000"
                        placeholderTextColor={colors.gray1}
                        keyboardType="number-pad"
                        inputMode="numeric"
                        maxLength={CODE_LENGTH}
                        textAlign="center"
                        selectionColor={colors.blue1}
                        autoComplete="one-time-code"
                        textContentType="oneTimeCode"
                        accessibilityLabel="Código de verificação de 4 dígitos"
                    />

                    <View style={styles.resendRow}>
                        {seconds > 0 ? (
                            <Text style={styles.resendHint}>
                                Reenviar código em 0:{String(seconds).padStart(2, "0")}
                            </Text>
                        ) : (
                            <Pressable
                                onPress={handleResend}
                                accessibilityRole="button"
                            >
                                <Text style={styles.resendLink}>Reenviar código</Text>
                            </Pressable>
                        )}
                    </View>

                    <View style={styles.emailHint}>
                        <Icon name="mail" size={16} color={colors.gray2} />

                        <Text style={styles.emailHintText}>
                            Não encontrou o e-mail? Verifique a caixa de spam.
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <AppButton
                            text="Verificar código"
                            onPress={handleVerify}
                            disabled={!canVerify}
                        />

                        <Pressable
                            onPress={() => router.back()}
                            accessibilityRole="button"
                        >
                            <Text style={styles.link}>Usar outro CPF</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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

    flex: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        gap: 20,
        paddingTop: 4,
    },

    pageTitle: {
        fontSize: 24,
    },

    codeInput: {
        alignSelf: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 16,
        borderWidth: 2,
        color: colors.dark1,
        fontSize: 30,
        fontWeight: "bold",
        height: 64,
        letterSpacing: 12,
        marginTop: 4,
        paddingLeft: 12,
        width: 220,
    },

    resendRow: {
        alignItems: "center",
        minHeight: 22,
    },

    resendHint: {
        color: colors.gray2,
        fontSize: 13,
    },

    resendLink: {
        color: colors.blue1,
        fontSize: 14,
        fontWeight: "bold",
        textDecorationLine: "underline",
    },

    emailHint: {
        alignItems: "center",
        flexDirection: "row",
        gap: 6,
        justifyContent: "center",
    },

    emailHintText: {
        color: colors.gray2,
        fontSize: 12.5,
    },

    footer: {
        gap: 16,
        marginTop: "auto",
        paddingTop: 8,
    },

    link: {
        color: colors.blue1,
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        textDecorationLine: "underline",
    },
})
