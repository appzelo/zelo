import { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { FormProvider, useForm } from "react-hook-form"
import { colors } from "../../../utils/constants/colors"
import {
    SpecialistProfileInput,
    getSpecialist,
    updateSpecialist,
} from "../../../services/specialists"
import AppButton from "../../../components/AppButton"
import AppInput from "../../../components/AppInput"
import BackHeader from "../../../components/BackHeader"
import SectionText from "../../../components/SectionText"

/** Profissional logado no modo demonstração (Dr. Marcos). */
const SPECIALIST_ID = "1"

const EMPTY_FORM: SpecialistProfileInput = {
    name: "",
    specialty: "",
    license: "",
    email: "",
    phone: "",
}

export default function ProEditProfile() {
    const insets = useSafeAreaInsets()

    const [loaded, setLoaded] = useState(false)
    const [saved, setSaved] = useState(false)

    const form = useForm<SpecialistProfileInput>({
        defaultValues: EMPTY_FORM,
    })

    useEffect(() => {
        let active = true

        getSpecialist(SPECIALIST_ID).then((found) => {
            if (!active || !found) {
                return
            }

            form.reset({
                name: found.name,
                specialty: found.specialty,
                license: found.license,
                email: found.email,
                phone: found.phone,
            })

            setLoaded(true)
        })

        return () => {
            active = false
        }
    }, [form])

    // Qualquer edição esconde o aviso de sucesso.
    useEffect(() => {
        const subscription = form.watch(() => setSaved(false))

        return () => subscription.unsubscribe()
    }, [form])

    async function onSubmit(data: SpecialistProfileInput) {
        await updateSpecialist(SPECIALIST_ID, data)

        setSaved(true)
        Keyboard.dismiss()
    }

    return (
        <View style={styles.container}>
            <BackHeader text="Editar perfil" />

            {!loaded && (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            )}

            {loaded && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.flex}
                >
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: insets.bottom + 32 },
                        ]}
                        keyboardShouldPersistTaps="handled"
                        onScrollBeginDrag={Keyboard.dismiss}
                        showsVerticalScrollIndicator={false}
                    >
                        <SectionText
                            title="Dados profissionais"
                            showDescription
                            description="Atualize suas informações de perfil e contato."
                            titleStyle={styles.pageTitle}
                        />

                        <FormProvider {...form}>
                            <View style={styles.section}>
                                <AppInput
                                    name="name"
                                    showLabel
                                    label="Nome completo"
                                    placeholder="Seu nome completo"
                                    autoCapitalize="words"
                                    required
                                />

                                <AppInput
                                    name="specialty"
                                    showLabel
                                    label="Especialidade"
                                    placeholder="Ex.: Fisioterapeuta Geriátrico"
                                    autoCapitalize="words"
                                    required
                                />

                                <AppInput
                                    name="license"
                                    showLabel
                                    label="Registro profissional"
                                    placeholder="Ex.: CRM 123456-SP"
                                    autoCapitalize="characters"
                                    required
                                />
                            </View>

                            <SectionText
                                title="Contato"
                                titleStyle={styles.sectionTitle}
                            />

                            <View style={styles.section}>
                                <AppInput
                                    name="email"
                                    showLabel
                                    label="E-mail"
                                    placeholder="email@exemplo.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    required
                                />

                                <AppInput
                                    name="phone"
                                    showLabel
                                    label="Celular"
                                    placeholder="(XX) XXXXX-XXXX"
                                    keyboardType="phone-pad"
                                    mask="phone"
                                    required
                                />
                            </View>

                            {saved && (
                                <View style={styles.savedBanner}>
                                    <View style={styles.savedDot} />
                                    <Text style={styles.savedText}>
                                        Dados atualizados com sucesso.
                                    </Text>
                                </View>
                            )}

                            <AppButton
                                text="Salvar alterações"
                                onPress={form.handleSubmit(onSubmit)}
                            />
                        </FormProvider>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
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

    centered: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingBottom: 40,
    },

    scrollContent: {
        gap: 20,
        paddingTop: 8,
    },

    pageTitle: {
        fontSize: 22,
    },

    sectionTitle: {
        fontSize: 18,
    },

    section: {
        gap: 14,
    },

    savedBanner: {
        alignItems: "center",
        backgroundColor: colors.green3,
        borderColor: colors.green2,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 11,
    },

    savedDot: {
        backgroundColor: colors.green1,
        borderRadius: 4,
        height: 8,
        width: 8,
    },

    savedText: {
        color: colors.green1,
        flex: 1,
        fontSize: 13,
        fontWeight: "bold",
    },
})
