import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import BackHeader from "../../src/components/BackHeader"
import SectionText from "../../src/components/SectionText"
import { colors } from "../../constants/colors"
import AppInput from "../../src/components/AppInput"
import AppButton from "../../src/components/AppButton"

export default function guardianRegister() {
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
                    <AppInput
                        showLabel
                        label="Nome do Responsável"
                        placeholder="Nome completo do responsável"
                        required
                    ></AppInput>
                    <View style={styles.row}>
                        <AppInput
                            containerStyle={{flex: 1}}
                            showLabel
                            label="CPF"
                            placeholder="000.000.000-00"
                            required
                        ></AppInput> 
                        <AppInput
                            containerStyle={{flex: 1}}
                            showLabel
                            label="Nascimento"
                            placeholder="DD/MM/AAAA"
                            required
                        ></AppInput> 
                    </View>
                    <AppInput
                        showLabel
                        label="E-mail de Contato"
                        placeholder="email@exemplo.com" 
                        required
                    ></AppInput>
                    <AppInput 
                        showLabel
                        label="Celular (WhatsApp)" 
                        placeholder="(XX) XXXXX-XXXX" 
                        required
                    ></AppInput>                            
                    <AppInput 
                        showLabel
                        label="Grau de Parentesco" 
                        required
                    ></AppInput>                            

                    <View>
                        <AppButton
                            text="Finalizar Cadastro" 
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