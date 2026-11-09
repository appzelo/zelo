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
import { colors } from "../../utils/constants/colors"
import {
    formatAddress,
    formatShortName,
    getPatient,
    updatePatient,
} from "../../services/patient"
import AppButton from "../../components/AppButton"
import AppInput from "../../components/AppInput"
import BackHeader from "../../components/BackHeader"
import SectionText from "../../components/SectionText"

type ProfileForm = {
    fullName: string,
    email: string,
    phone: string,
    zipCode: string,
    street: string,
    streetNumber: string,
    neighborhood: string,
    city: string,
    state: string,
}

const EMPTY_FORM: ProfileForm = {
    fullName: "",
    email: "",
    phone: "",
    zipCode: "",
    street: "",
    streetNumber: "",
    neighborhood: "",
    city: "",
    state: "",
}

export default function EditProfile() {
    const insets = useSafeAreaInsets()

    const [loaded, setLoaded] = useState(false)
    const [saved, setSaved] = useState(false)

    const form = useForm<ProfileForm>({
        defaultValues: EMPTY_FORM,
    })

    useEffect(() => {
        let active = true

        getPatient().then((found) => {
            if (!active) {
                return
            }

            form.reset({
                fullName: found.fullName,
                email: found.email,
                phone: found.phone,
                zipCode: found.zipCode,
                street: found.street,
                streetNumber: found.streetNumber,
                neighborhood: found.neighborhood,
                city: found.city,
                state: found.state,
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

    async function onSubmit(data: ProfileForm) {
        const current = await getPatient()

        await updatePatient({
            fullName: data.fullName,
            // Só recalcula o nome curto quando o nome completo muda.
            name: data.fullName === current.fullName
                ? current.name
                : formatShortName(data.fullName),
            email: data.email,
            phone: data.phone,
            zipCode: data.zipCode,
            street: data.street,
            streetNumber: data.streetNumber,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            address: formatAddress(data),
        })

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
                            title="Dados pessoais"
                            showDescription
                            description="Atualize suas informações de contato e endereço."
                            titleStyle={styles.pageTitle}
                        />

                        <FormProvider {...form}>
                            <View style={styles.section}>
                                <AppInput
                                    name="fullName"
                                    showLabel
                                    label="Nome completo"
                                    placeholder="Seu nome completo"
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

                            <SectionText
                                title="Endereço residencial"
                                titleStyle={styles.sectionTitle}
                            />

                            <View style={styles.section}>
                                <AppInput
                                    name="zipCode"
                                    showLabel
                                    label="CEP"
                                    placeholder="00000-000"
                                    keyboardType="number-pad"
                                    mask="cep"
                                    required
                                />

                                <View style={styles.row}>
                                    <AppInput
                                        name="street"
                                        showLabel
                                        label="Rua/Avenida"
                                        containerStyle={styles.streetInput}
                                        required
                                    />

                                    <AppInput
                                        name="streetNumber"
                                        showLabel
                                        label="Nº"
                                        containerStyle={styles.numberInput}
                                        keyboardType="number-pad"
                                        required
                                    />
                                </View>

                                <AppInput
                                    name="neighborhood"
                                    showLabel
                                    label="Bairro"
                                    required
                                />

                                <View style={styles.row}>
                                    <AppInput
                                        name="city"
                                        showLabel
                                        label="Cidade"
                                        containerStyle={styles.cityInput}
                                        required
                                    />

                                    <AppInput
                                        name="state"
                                        showLabel
                                        label="UF"
                                        containerStyle={styles.stateInput}
                                        mask="uf"
                                        autoCapitalize="characters"
                                        required
                                    />
                                </View>
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

    row: {
        flexDirection: "row",
        gap: 12,
    },

    streetInput: {
        flex: 2,
    },

    numberInput: {
        flex: 1,
    },

    cityInput: {
        flex: 3,
    },

    stateInput: {
        flex: 1,
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
