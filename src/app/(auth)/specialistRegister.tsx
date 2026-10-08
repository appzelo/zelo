import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import BackHeader from "../../components/BackHeader"
import SectionText from "../../components/SectionText"
import { colors } from "../../../constants/colors"
import AppInput from "../../components/AppInput"
import AppButton from "../../components/AppButton"
import AppSlider from "../../components/AppSlider"
import { useState } from "react"

export default function specialistRegister() {
    const minValue = 2
    const [currentValue, setCurrentValue] = useState(minValue)

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
                    
                    <AppInput 
                        showLabel
                        label="Nome Completo" 
                        placeholder="Seu nome completo"
                        required
                    ></AppInput>
                    <AppInput 
                        showLabel
                        label="CPF" 
                        placeholder="000.000.000-00" 
                        required
                        containerStyle={{flex: 1}}
                    ></AppInput>
                    <View style={styles.row}>
                        <AppInput 
                            showLabel
                            label="Registro (CRM/COREN)" 
                            required
                            containerStyle={{flex: 3}}
                        ></AppInput>
                        <AppInput 
                            showLabel
                            label="UF" 
                            required
                            containerStyle={{flex: 1}}
                        ></AppInput>
                    </View>
                    <AppInput 
                        showLabel
                        label="Especialidade Principal" 
                        required
                        containerStyle={{flex: 3}}
                    ></AppInput>
                    <AppSlider 
                        title="Distância Máxima de Atendimento" 
                        minValue={minValue} 
                        maxValue={50} 
                        metricUnit="km"
                        currentValue={currentValue}
                        onValueChange={setCurrentValue}
                    ></AppSlider>
                    <AppButton text="Salvar e Continuar"></AppButton>
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