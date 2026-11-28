import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import BackHeader from "../../components/BackHeader"
import SectionText from "../../components/SectionText"
import { colors } from "../../utils/constants/colors"
import AppInput from "../../components/AppInput"
import AppButton from "../../components/AppButton"
import AppSlider from "../../components/AppSlider"
import RegistrationSuccess from "../../components/RegistrationSuccess"
import { useState } from "react"
import {
    MIN_PASSWORD_LENGTH,
    isValidCEP,
    isValidCPF,
    isValidEmail,
    isValidPhone,
    isValidUF,
} from "../../utils/validation"
import { useForm, FormProvider } from "react-hook-form"

const MIN_DISTANCE_KM = 2

export default function SpecialistRegister() {
    const insets = useSafeAreaInsets()

    const [submitted, setSubmitted] = useState(false)

    type SpecialistRegisterForm = {
        fullName: string,
        pass: string,
        confirmPassword: string,
        cpf: string,
        email: string,
        phone: string
        professionalID: string,
        state: string,
        specialty: string, 
        maxDistance: number,
        address: {
            zipcode: string,
            street: string,
            streetNumber: string,
            neighborhood: string,
            city: string,
            state: string,
        }
    }

    const form = useForm<SpecialistRegisterForm>({
        mode: "onTouched",
        defaultValues: {
            fullName: "",
            pass: "",
            confirmPassword: "",
            cpf: "",
            email: "",
            phone: "",
            professionalID: "",
            state: "",
            specialty: "",
            maxDistance: MIN_DISTANCE_KM,
            address: {
                zipcode: "",
                street: "",
                streetNumber: "",
                neighborhood: "",
                city: "",
                state: "",
            }
        }
    })

    const onSubmit = async (data: SpecialistRegisterForm) => {
        console.log(data)
        await fetch(`${process.env.EXPO_PUBLIC_USER_API}/specialistUsers`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(async response => {
            console.log(await response.text());
            if (await response.status === 201) {
                setSubmitted(true);
            }
        })
    }

    if (submitted) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <BackHeader text="Cadastro de Especialista" />
                </View>

                <RegistrationSuccess message="Conta de especialista criada com sucesso. Entre com o CPF e a senha cadastrados." />
            </View>
        )
    }

    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <BackHeader text="Cadastro de Especialista"></BackHeader>
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
                        title="Dados Profissionais" 
                        showDescription={true}
                        description="Insira seus dados de registro para validação de segurança."
                    ></SectionText>
                    
                    <FormProvider {...form}>
                        <AppInput 
                            name="fullName"
                            showLabel
                            label="Nome Completo" 
                            placeholder="Seu nome completo"
                            autoCapitalize="words"
                            rules={{
                                required: "Informe o nome completo.",
                                minLength: {
                                    value: 3,
                                    message: "Informe o nome completo.",
                                },
                            }}
                            required
                        ></AppInput>
                        <AppInput 
                            name="cpf"
                            showLabel
                            label="CPF" 
                            placeholder="000.000.000-00" 
                            containerStyle={{flex: 1}}
                            keyboardType="number-pad"
                            mask="cpf"
                            rules={{
                                validate: (value) => isValidCPF(value)
                                    || "Informe um CPF válido.",
                            }}
                            required
                        ></AppInput>
                        <AppInput 
                            name="pass"
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
                                validate: (value, values) => value === values.pass
                                    || "As senhas não coincidem.",
                            }}
                            required
                        ></AppInput>

                        <SectionText 
                            title="Contato" 
                            titleStyle={{fontSize: 18}}
                        ></SectionText>
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

                        <View style={styles.row}>
                            <AppInput 
                                name="professionalID"
                                showLabel
                                label="Registro (CRM/COREN)" 
                                containerStyle={{flex: 3}}
                                autoCapitalize="characters"
                                rules={{
                                    required: "Informe o registro profissional.",
                                    minLength: {
                                        value: 3,
                                        message: "Informe o registro profissional.",
                                    },
                                }}
                                required
                            ></AppInput>
                            <AppInput 
                                name="state"
                                showLabel
                                label="UF" 
                                containerStyle={{flex: 1}}
                                mask="uf"
                                autoCapitalize="characters"
                                rules={{
                                    validate: (value) => isValidUF(value)
                                        || "UF inválida.",
                                }}
                                required
                            ></AppInput>
                        </View>
                        <AppInput 
                            name="specialty"
                            showLabel
                            label="Especialidade Principal" 
                            containerStyle={{flex: 3}}
                            autoCapitalize="words"
                            rules={{
                                required: "Informe a especialidade.",
                                minLength: {
                                    value: 3,
                                    message: "Informe a especialidade.",
                                },
                            }}
                            required
                        ></AppInput>
                        <SectionText 
                            title="Endereço Base" 
                            showDescription={true}
                            description="Usamos este endereço para calcular a distância até os pacientes."
                            titleStyle={{fontSize: 18}}
                        ></SectionText>
                        <AppInput
                            name="address.zipcode"
                            showLabel
                            label="CEP" 
                            placeholder="00000-000"
                            keyboardType="number-pad"
                            mask="cep"
                            rules={{
                                validate: (value) => isValidCEP(value)
                                    || "Informe um CEP válido.",
                            }}
                            required
                        ></AppInput>
                        <View style={styles.row}>
                            <AppInput
                                name="address.street"
                                showLabel
                                label="Rua/Avenida" 
                                containerStyle={{flex: 2}}
                                autoCapitalize="words"
                                rules={{ required: "Informe a rua/avenida." }}
                                required
                            ></AppInput>
                            <AppInput
                                name="address.streetNumber"
                                showLabel
                                label="Nº" 
                                containerStyle={{flex: 1}}
                                keyboardType="number-pad"
                                rules={{ required: "Informe o número." }}
                                required
                            ></AppInput>
                        </View>
                        <AppInput
                            name="address.neighborhood"
                            showLabel
                            label="Bairro" 
                            autoCapitalize="words"
                            rules={{ required: "Informe o bairro." }}
                            required
                        ></AppInput>
                        <View style={styles.row}>
                            <AppInput
                                name="address.city"
                                showLabel
                                label="Cidade" 
                                containerStyle={{flex: 3}}
                                autoCapitalize="words"
                                rules={{ required: "Informe a cidade." }}
                                required
                            ></AppInput>
                            <AppInput
                                name="address.state"
                                showLabel
                                label="UF" 
                                containerStyle={{flex: 1}}
                                mask="uf"
                                autoCapitalize="characters"
                                rules={{
                                    validate: (value) => isValidUF(value)
                                        || "UF inválida.",
                                }}
                                required
                            ></AppInput>
                        </View>

                        <AppSlider 
                            name="maxDistance"
                            title="Distância Máxima de Atendimento" 
                            minValue={MIN_DISTANCE_KM} 
                            maxValue={50} 
                            metricUnit="km"
                        ></AppSlider>
                    </FormProvider>
                    <AppButton text="Salvar e Continuar" onPress={form.handleSubmit(onSubmit)}></AppButton>
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
