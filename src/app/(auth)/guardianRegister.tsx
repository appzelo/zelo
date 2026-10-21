import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import BackHeader from "../../components/BackHeader"
import SectionText from "../../components/SectionText"
import { colors } from "../../utils/constants/colors"
import AppInput from "../../components/AppInput"
import AppButton from "../../components/AppButton"
import { useForm, FormProvider } from "react-hook-form"

export default function guardianRegister() {
    type GuardianRegisterForm = {
        fullName: string,
        password: string,
        cpf: string,
        birthDate: string,
        email: string,
        phone: string,
        relationship: string, 
    }

    const form = useForm<GuardianRegisterForm>({
        defaultValues: {
            fullName: "",
            password: "",
            cpf: "",
            birthDate: "",
            email: "",
            phone: "",
            relationship: "",
        }
    })

    const onSubmit = (data: GuardianRegisterForm) => {
        console.log(data)
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
                    contentContainerStyle={styles.scrollContent} 
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
                                required
                            ></AppInput> 
                            <AppInput
                                name="birthDate"
                                containerStyle={{flex: 1}}
                                showLabel
                                label="Nascimento"
                                placeholder="DD/MM/AAAA"
                                keyboardType="number-pad"
                                required
                            ></AppInput> 
                        </View>
                        <AppInput 
                            name="password"
                            showLabel
                            label="Senha" 
                            placeholder="Digite sua senha" 
                            secureTextEntry={true}
                            required
                        ></AppInput>
                        <AppInput
                            name="email"
                            showLabel
                            label="E-mail de Contato"
                            placeholder="email@exemplo.com" 
                            keyboardType="email-address"
                            required
                        ></AppInput>
                        <AppInput 
                            name="phone"
                            showLabel
                            label="Celular (WhatsApp)" 
                            placeholder="(XX) XXXXX-XXXX" 
                            keyboardType="phone-pad"
                            required
                        ></AppInput>                            
                        <AppInput 
                            name="relationship"
                            showLabel
                            label="Grau de Parentesco" 
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