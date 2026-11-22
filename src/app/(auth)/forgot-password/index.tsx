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
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { FormProvider, useForm } from "react-hook-form"
import { colors } from "../../../utils/constants/colors"
import { digitsOnly } from "../../../utils/mask"
import AppButton from "../../../components/AppButton"
import AppInput from "../../../components/AppInput"
import BackHeader from "../../../components/BackHeader"
import Icon from "../../../components/Icon"
import SectionText from "../../../components/SectionText"
import StepIndicator from "../../../components/StepIndicator"

type RecoveryForm = {
    cpf: string,
}

export default function ForgotPassword() {
    const insets = useSafeAreaInsets()

    const form = useForm<RecoveryForm>({
        defaultValues: {
            cpf: "",
        },
    })

    const cpf = form.watch("cpf")
    const canSend = digitsOnly(cpf).length === 11

    function onSubmit(data: RecoveryForm) {
        // A verificação do código será feita pelo backend.
        router.push({
            pathname: "/forgot-password/verify",
            params: { cpf: digitsOnly(data.cpf) },
        })
    }

    return (
        <View style={styles.container}>
            <BackHeader text="Recuperar senha" />

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
                    <StepIndicator current={1} />

                    <SectionText
                        title="Esqueceu sua senha?"
                        showDescription
                        description="Informe seu CPF para receber um código de verificação por e-mail."
                        titleStyle={styles.pageTitle}
                    />

                    <FormProvider {...form}>
                        <AppInput
                            name="cpf"
                            showLabel
                            label="CPF"
                            placeholder="000.000.000-00"
                            keyboardType="number-pad"
                            mask="cpf"
                            required
                        />
                    </FormProvider>

                    <View style={styles.infoBox}>
                        <Icon name="mail" size={18} color={colors.blue1} />

                        <Text style={styles.infoText}>
                            Enviaremos um código de 4 dígitos para o e-mail
                            cadastrado neste CPF.
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <AppButton
                            text="Enviar código"
                            onPress={form.handleSubmit(onSubmit)}
                            disabled={!canSend}
                        />

                        <Pressable
                            onPress={() => router.back()}
                            accessibilityRole="button"
                        >
                            <Text style={styles.link}>Voltar para o login</Text>
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

    infoBox: {
        alignItems: "flex-start",
        backgroundColor: colors.blue2,
        borderRadius: 12,
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 13,
    },

    infoText: {
        color: colors.blue1,
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
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
