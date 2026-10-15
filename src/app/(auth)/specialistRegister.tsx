import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import BackHeader from "../../components/BackHeader"
import SectionText from "../../components/SectionText"
import { colors } from "../../../constants/colors"
import AppInput from "../../components/AppInput"
import AppButton from "../../components/AppButton"
import AppSlider from "../../components/AppSlider"
import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"

export default function specialistRegister() {
    const minValue = 2
    const [currentValue, setCurrentValue] = useState(minValue)

    type GuardianRegisterForm = {
        fullName: string,
        // password: string,
        cpf: string,
        professionalLicense: string,
        licenseState: string,
        primarySpecialty: string, 
        maxDistance: number,
    }

    const form = useForm<GuardianRegisterForm>({
        defaultValues: {
            fullName: "",
            // password: "",
            cpf: "",
            professionalLicense: "",
            licenseState: "",
            primarySpecialty: "",
            maxDistance: minValue,
        }
    })

    const onSubmit = (data: GuardianRegisterForm) => {
        console.log(data)
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
                            required
                            containerStyle={{flex: 1}}
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