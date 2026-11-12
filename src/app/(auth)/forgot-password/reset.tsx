import { useEffect, useState } from "react"
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { FormProvider, useForm } from "react-hook-form"
import { colors } from "../../../utils/constants/colors"
import AppButton from "../../../components/AppButton"
import AppInput from "../../../components/AppInput"
import BackHeader from "../../../components/BackHeader"
import Icon from "../../../components/Icon"
import SectionText from "../../../components/SectionText"
import StepIndicator from "../../../components/StepIndicator"

type ResetForm = {
    password: string,
    confirmPassword: string,
}

const MIN_PASSWORD_LENGTH = 8

export default function ResetPassword() {
    const insets = useSafeAreaInsets()
    const { cpf } = useLocalSearchParams<{ cpf?: string }>()

    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState(false)

    const form = useForm<ResetForm>({
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    // Qualquer edição esconde o erro anterior.
    useEffect(() => {
        const subscription = form.watch(() => setError(null))

        return () => subscription.unsubscribe()
    }, [form])

    function onSubmit(data: ResetForm) {
        if (data.password.length < MIN_PASSWORD_LENGTH) {
            setError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`)
            return
        }

        if (data.password !== data.confirmPassword) {
            setError("As senhas não coincidem.")
            return
        }

        // A troca da senha será enviada ao backend junto com o código validado.
        Keyboard.dismiss()
        setDone(true)
    }

    if (done) {
        return (
            <View style={styles.container}>
                <BackHeader text="Nova senha" />

                <View style={styles.success}>
                    <View style={styles.successIcon}>
                        <Icon
                            name="checkmark-circle"
                            size={44}
                            color={colors.green1}
                        />
                    </View>

                    <Text style={styles.successTitle}>Senha alterada</Text>

                    <Text style={styles.successText}>
                        Sua senha foi atualizada. Entre novamente com a nova senha.
                    </Text>

                    <View style={styles.successFooter}>
                        <AppButton
                            text="Ir para o login"
                            onPress={() => router.replace("/login")}
                        />
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <BackHeader text="Nova senha" />

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
                    <StepIndicator current={3} />

                    <SectionText
                        title="Crie uma nova senha"
                        showDescription
                        description={`Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres para proteger sua conta.`}
                        titleStyle={styles.pageTitle}
                    />

                    <FormProvider {...form}>
                        <AppInput
                            name="password"
                            showLabel
                            label="Nova senha"
                            placeholder="Digite a nova senha"
                            secureTextEntry
                            required
                        />

                        <AppInput
                            name="confirmPassword"
                            showLabel
                            label="Confirmar nova senha"
                            placeholder="Repita a nova senha"
                            secureTextEntry
                            required
                        />
                    </FormProvider>

                    {error && (
                        <View style={styles.errorBox}>
                            <Icon name="alert" size={18} color={colors.red1} />

                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <View style={styles.footer}>
                        <AppButton
                            text="Salvar nova senha"
                            onPress={form.handleSubmit(onSubmit)}
                        />

                        <Pressable
                            onPress={() => router.back()}
                            accessibilityRole="button"
                        >
                            <Text style={styles.link}>Voltar</Text>
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

    errorBox: {
        alignItems: "center",
        backgroundColor: colors.red2,
        borderColor: colors.red1,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 11,
    },

    errorText: {
        color: colors.red1,
        flex: 1,
        fontSize: 13,
        fontWeight: "bold",
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

    success: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingBottom: 40,
    },

    successIcon: {
        alignItems: "center",
        backgroundColor: colors.green3,
        borderRadius: 36,
        height: 72,
        justifyContent: "center",
        width: 72,
    },

    successTitle: {
        color: colors.dark1,
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 18,
    },

    successText: {
        color: colors.gray2,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
        maxWidth: 300,
        textAlign: "center",
    },

    successFooter: {
        marginTop: 28,
        width: "100%",
    },
})
