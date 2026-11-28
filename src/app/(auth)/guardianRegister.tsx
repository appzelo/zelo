import { useState } from "react"
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import BackHeader from "../../components/BackHeader"
import SectionText from "../../components/SectionText"
import { colors } from "../../utils/constants/colors"
import AppInput from "../../components/AppInput"
import AppButton from "../../components/AppButton"
import RegistrationSuccess from "../../components/RegistrationSuccess"
import {
    MIN_PASSWORD_LENGTH,
    isAtLeastYears,
    isValidCPF,
    isValidDate,
    isValidEmail,
    isValidPhone,
} from "../../utils/validation"
import { useForm, FormProvider } from "react-hook-form"

type GuardianRegisterForm = {
    fullName: string,
    password: string,
    confirmPassword: string,
    cpf: string,
    birthDate: string,
    email: string,
    phone: string,
    relationship: string,
}

export default function GuardianRegister() {
    const insets = useSafeAreaInsets()

    const [submitted, setSubmitted] = useState(false)

    const form = useForm<GuardianRegisterForm>({
        mode: "onTouched",
        defaultValues: {
            fullName: "",
            password: "",
            confirmPassword: "",
            cpf: "",
            birthDate: "",
            email: "",
            phone: "",
            relationship: "",
        }
    })

    function onSubmit() {
        // O cadastro será enviado ao backend. Por enquanto, simulamos o sucesso.
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <BackHeader text="Dados do Responsável" />
                </View>

                <RegistrationSuccess message="Conta de responsável criada com sucesso. Entre com o CPF e a senha cadastrados." />
            </View>
        )
    }

    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <BackHeader text="Dados do Responsável"></BackHeader>
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{flex: 1}}
            >
                <ScrollView 
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + 24 },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    <SectionText 
                        title="Responsável Legal" 
                        showDescription={true}
                        description="Cadastre a pessoa de referência maior de 18 anos que responderá pelo paciente."
                        titleStyle={{fontSize: 22}}
                    ></SectionText>

                    <FormProvider {...form}>
                        <AppInput
                            name="fullName"
                            showLabel
                            label="Nome do Responsável"
                            placeholder="Nome completo do responsável"
                            autoCapitalize="words"
                            rules={{
                                required: "Informe o nome do responsável.",
                                minLength: {
                                    value: 3,
                                    message: "Informe o nome do responsável.",
                                },
                            }}
                            required
                        ></AppInput>
                        <View style={styles.row}>
                            <AppInput
                                name="cpf"
                                containerStyle={{flex: 1}}
                                showLabel
                                label="CPF"
                                placeholder="000.000.000-00"
                                keyboardType="number-pad"
                                mask="cpf"
                                rules={{
                                    validate: (value) => isValidCPF(value)
                                        || "Informe um CPF válido.",
                                }}
                                required
                            ></AppInput> 
                            <AppInput
                                name="birthDate"
                                containerStyle={{flex: 1}}
                                showLabel
                                label="Nascimento"
                                placeholder="DD/MM/AAAA"
                                keyboardType="number-pad"
                                mask="date"
                                rules={{
                                    validate: (value) => {
                                        if (!isValidDate(value)) {
                                            return "Informe uma data válida."
                                        }

                                        return isAtLeastYears(value, 18)
                                            || "O responsável deve ter 18 anos ou mais."
                                    },
                                }}
                                required
                            ></AppInput> 
                        </View>
                        <AppInput 
                            name="password"
                            showLabel
                            label="Senha" 
                            placeholder="Digite sua senha" 
                            secureTextEntry={true}
                            rules={{
                                required: "Informe uma senha.",
                                minLength: {
                                    value: MIN_PASSWORD_LENGTH,
                                    message: `Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
                                },
                            }}
                            required
                        ></AppInput>
                        <AppInput 
                            name="confirmPassword"
                            showLabel
                            label="Confirmar Senha" 
                            placeholder="Repita a senha" 
                            secureTextEntry={true}
                            rules={{
                                validate: (value, values) => value === values.password
                                    || "As senhas não coincidem.",
                            }}
                            required
                        ></AppInput>
                        <AppInput
                            name="email"
                            showLabel
                            label="E-mail de Contato"
                            placeholder="email@exemplo.com" 
                            keyboardType="email-address"
                            autoCapitalize="none"
                            rules={{
                                validate: (value) => isValidEmail(value)
                                    || "Informe um e-mail válido.",
                            }}
                            required
                        ></AppInput>
                        <AppInput 
                            name="phone"
                            showLabel
                            label="Celular (WhatsApp)" 
                            placeholder="(XX) XXXXX-XXXX" 
                            keyboardType="phone-pad"
                            mask="phone"
                            rules={{
                                validate: (value) => isValidPhone(value)
                                    || "Informe um celular válido.",
                            }}
                            required
                        ></AppInput>                            
                        <AppInput 
                            name="relationship"
                            showLabel
                            label="Grau de Parentesco" 
                            autoCapitalize="words"
                            rules={{
                                required: "Informe o grau de parentesco.",
                                minLength: {
                                    value: 3,
                                    message: "Informe o grau de parentesco.",
                                },
                            }}
                            required
                        ></AppInput>                            
                    </FormProvider>
                    <View>
                        <AppButton
                            text="Finalizar Cadastro" 
                            onPress={form.handleSubmit(onSubmit)}
                        ></AppButton>
                    </View>
                    
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignSelf: "center",
        backgroundColor: colors.white1,
        flex: 1,
        width: "100%"
    },

    header: {
        paddingHorizontal: "5%",
    },

    scrollContent: {
        gap: 20,
        paddingHorizontal: "5%",
    },

    row: {
        flexDirection: "row",
        gap: 12,
    },
})
