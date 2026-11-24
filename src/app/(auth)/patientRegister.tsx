import { useState } from "react"
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import BackHeader from "../../components/BackHeader"
import SectionText from "../../components/SectionText"
import { colors } from "../../utils/constants/colors"
import AppInput from "../../components/AppInput"
import AppButton from "../../components/AppButton"
import RegistrationSuccess from "../../components/RegistrationSuccess"
import {
    MIN_PASSWORD_LENGTH,
    isValidCEP,
    isValidCPF,
    isValidDate,
    isValidEmail,
    isValidPhone,
    isValidUF,
} from "../../utils/validation"
import { useForm, FormProvider } from "react-hook-form"

export default function patientRegister() {
    type PatientRegisterForm = {
        fullName: string,
        pass: string,
        confirmPassword: string,
        cpf: string,
        birthDate: string,
        email: string,
        phone: string,
        address: {
            zipcode: string,
            street: string,
            streetNumber: string,
            neighborhood: string,
            city: string,
            state: string,
        }
    }

    const form = useForm<PatientRegisterForm>({
        mode: "onTouched",
        defaultValues: {
            fullName: "",
            pass: "",
            confirmPassword: "",
            cpf: "",
            birthDate: "",
            email: "",
            phone: "",
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

    const insets = useSafeAreaInsets()

    const [submitted, setSubmitted] = useState(false)


    const onSubmit = async (data: PatientRegisterForm) => {
        console.log(data);
        
        // ===== Formatting fields to fit to DB specifications =====
        const interDate = data.birthDate.replaceAll("/", "-");
        const reverseDate = interDate.split("-").reverse().join("-");
        data.birthDate = reverseDate;

        await fetch(`${process.env.EXPO_PUBLIC_USER_API}/commonUsers`, {
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
                    <BackHeader text="Dados do Paciente" />
                </View>

                <RegistrationSuccess message="Conta de paciente criada com sucesso. Entre com o CPF e a senha cadastrados." />
            </View>
        )
    }

    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <BackHeader text="Dados do Paciente"></BackHeader>
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
                        title="Cadastro do Paciente" 
                        showDescription={true}
                        description="Adicione as informações do paciente que receberá os atendimentos."
                        titleStyle={{fontSize: 22}}
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
                        <View style={styles.row}>
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
                                name="birthDate"
                                showLabel
                                label="Nascimento" 
                                placeholder="DD/MM/AAAA" 
                                containerStyle={{flex: 1}}
                                keyboardType="number-pad"
                                mask="date"
                                rules={{
                                    validate: (value) => isValidDate(value)
                                        || "Informe uma data válida.",
                                }}
                                required
                            ></AppInput>
                        </View>
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
                        {/* <AppInput showLabel label="Necessidade Especial/Deficiência"></AppInput> */}
                        <AppInput 
                            name="email"
                            showLabel
                            label="E-mail de Contato" 
                            placeholder="email@exemplo.com" 
                            containerStyle={{flex: 1}}
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
                            label="Celular" 
                            placeholder="(XX) XXXXX-XXXX" 
                            containerStyle={{flex: 1}}
                            keyboardType="phone-pad"
                            mask="phone"
                            rules={{
                                validate: (value) => isValidPhone(value)
                                    || "Informe um celular válido.",
                            }}
                            required
                        ></AppInput>

                        {/* Seção de dados do endereço */}
                        <SectionText 
                            title="Endereço Residencial" 
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
