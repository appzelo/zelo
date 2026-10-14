import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import BackHeader from "../../components/BackHeader"
import SectionText from "../../components/SectionText"
import { colors } from "../../../constants/colors"
import AppInput from "../../components/AppInput"
import AppButton from "../../components/AppButton"
import { useForm, FormProvider } from "react-hook-form"

export default function patientRegister() {
    type PatientRegisterForm = {
        fullName: string,
        // password: string,
        cpf: string,
        birthDate: string,
        email: string,
        phone: string,
        zipCode: string,
        street: string,
        streetNumber: string,
        city: string,
        state: string,
    }

    const form = useForm<PatientRegisterForm>({
        defaultValues: {
            fullName: "",
            // password: "",
            cpf: "",
            birthDate: "",
            email: "",
            phone: "",
            zipCode: "",
            street: "",
            streetNumber: "",
            city: "",
            state: "",
        }
    })

    const onSubmit = (data: PatientRegisterForm) => {
        console.log(data)
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
                    contentContainerStyle={styles.scrollContent} 
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
                            required
                        ></AppInput>
                        <View style={styles.row}>
                            <AppInput 
                                name="cpf"
                                showLabel
                                label="CPF" 
                                placeholder="000.000.000-00" 
                                required
                                containerStyle={{flex: 1}}
                            ></AppInput>
                            <AppInput 
                                name="birthDate"
                                showLabel
                                label="Nascimento" 
                                placeholder="DD/MM/AAAA" 
                                required
                                containerStyle={{flex: 1}}
                            ></AppInput>
                        </View>
                        {/* <AppInput showLabel label="Necessidade Especial/Deficiência"></AppInput> */}
                        <View style={styles.row}>
                            <AppInput 
                                name="email"
                                showLabel
                                label="E-mail de Contato" 
                                placeholder="email@exemplo.com" 
                                required
                                containerStyle={{flex: 1}}
                            ></AppInput>
                            <AppInput 
                                name="phone"
                                showLabel
                                label="Celular" 
                                placeholder="(XX) XXXXX-XXXX" 
                                required
                                containerStyle={{flex: 1}}
                            ></AppInput>
                        </View>

                        {/* Seção de dados do endereço */}
                        <SectionText 
                            title="Endereço Residencial" 
                            titleStyle={{fontSize: 18}}
                        ></SectionText>
                        <AppInput
                            name="zipCode"
                            showLabel
                            label="CEP" 
                            placeholder="00000-000"
                            required
                        ></AppInput>
                        <View style={styles.row}>
                            <AppInput
                                name="street"
                                showLabel
                                label="Rua/Avenida" 
                                required
                                containerStyle={{flex: 2}}
                            ></AppInput>
                            <AppInput
                                name="streetNumber"
                                showLabel
                                label="Nº" 
                                required
                                containerStyle={{flex: 1}}
                            ></AppInput>
                        </View>
                        <AppInput
                            name="neighborhood"
                            showLabel
                            label="Bairro" 
                            required
                        ></AppInput>
                        <View style={styles.row}>
                            <AppInput
                                name="city"
                                showLabel
                                label="Cidade" 
                                required
                                containerStyle={{flex: 3}}
                            ></AppInput>
                            <AppInput
                                name="state"
                                showLabel
                                label="UF" 
                                required
                                containerStyle={{flex: 1}}
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