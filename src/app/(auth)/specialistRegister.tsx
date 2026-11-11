import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import BackHeader from "../../components/BackHeader"
import SectionText from "../../components/SectionText"
import { colors } from "../../utils/constants/colors"
import AppInput from "../../components/AppInput"
import AppButton from "../../components/AppButton"
import AppSlider from "../../components/AppSlider"
import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"

export default function specialistRegister() {
    const minValue = 2
    const [currentValue, setCurrentValue] = useState(minValue)

    type SpecialistRegisterForm = {
        fullName: string,
        password: string,
        cpf: string,
        professionalLicense: string,
        licenseState: string,
        primarySpecialty: string, 
        maxDistance: string,
        email: string,
        phone: string
    }

    const form = useForm<SpecialistRegisterForm>({
        defaultValues: {
            fullName: "",
            password: "",
            cpf: "",
            professionalLicense: "",
            licenseState: "",
            primarySpecialty: "",
            maxDistance: String(minValue),
            email: "",
            phone: ""
        }
    })

    const onSubmit = async (data: SpecialistRegisterForm) => {
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
        })
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
                    contentContainerStyle={styles.scrollContent} 
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
                            required
                        ></AppInput>
                        <AppInput 
                            name="password"
                            showLabel
                            label="Senha" 
                            placeholder="Digite sua senha" 
                            secureTextEntry={true}
                            required
                        ></AppInput>
                        <View style={styles.row}>
                            <AppInput 
                                name="professionalLicense"
                                showLabel
                                label="Registro (CRM/COREN)" 
                                required
                                containerStyle={{flex: 3}}
                            ></AppInput>
                            <AppInput 
                                name="licenseState"
                                showLabel
                                label="UF" 
                                required
                                containerStyle={{flex: 1}}
                                mask="uf"
                                autoCapitalize="characters"
                            ></AppInput>
                        </View>
                        <AppInput 
                            name="primarySpecialty"
                            showLabel
                            label="Especialidade Principal" 
                            required
                            containerStyle={{flex: 3}}
                        ></AppInput>
                        <AppSlider 
                            name="maxDistance"
                            title="Distância Máxima de Atendimento" 
                            minValue={minValue} 
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
        paddingBottom: 70,
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