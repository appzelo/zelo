import { View, Text, StyleSheet, Pressable, Image, TouchableWithoutFeedback, Keyboard } from "react-native"
import { router } from "expo-router"
import { colors } from "../../constants/colors"
import AppButton from "../../src/components/AppButton"
import AppInput from "../../src/components/AppInput"

export default function Index() {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        {/* <Text style={styles.title}>ZELO</Text> */}
                        <Image style={styles.zeloImage} source={require("../../assets/zelo.png")}></Image>
                        <Text style={styles.subtitle}>Conforto e cuidado para você.</Text>
                    </View>

                    <View style={styles.form}>
                        <AppInput 
                            showLabel
                            label="CPF ou E-mail"
                            placeholder="Ex.: 123.456.789-00"     
                        ></AppInput>
                        <View style={styles.passwordGroup}>
                            <AppInput 
                                showLabel
                                label="Senha" 
                                placeholder="Digite sua senha" 
                                secureTextEntry={true}
                            ></AppInput>

                            <Pressable style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
                            </Pressable>
                        </View>

                    </View>

                </View>

                <View style={styles.footer}>
                    <View style={styles.buttonGroup}>
                        <AppButton text="Entrar"></AppButton>
                        <View style={styles.divider}></View>
                        <Text style={styles.signupLabel}>Novo por aqui?</Text>
                        <AppButton text="Criar conta" onPress={() => router.push("/register")} variant="secondary"></AppButton>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        alignSelf: "center",
        backgroundColor: colors.white1,
        flex: 1,
        paddingTop: 100,
        paddingHorizontal: "5%",
        width: "100%",
    },
    
    content: {
        flex: 1,
        gap: 25,
    },

    header: {
        alignItems: "center",
        gap: 12,
        paddingBottom: 20,
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
    },

    zeloImage: {
        borderRadius: 8,
        height: 80,
        width: 80,
    },

    subtitle: {
        color: colors.gray2,
        fontSize: 16,
        fontStyle: "italic",
        fontWeight: "semibold"
    },
    
    form: {
        alignItems: "center",
        gap: 15,
        width: "100%",
    },

    label: {
        alignSelf: "flex-start",
        fontSize: 16,
        fontWeight: "bold",
    },

    input: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 12,
        borderWidth: 2,
        height: 50,
        paddingLeft: 10,
        width: "100%",
    },

    passwordGroup: {
        width: "100%",
    },

    forgotPassword: {
        marginTop: 20,
    },

    forgotPasswordText: {
        color: colors.blue1,
        fontSize: 16,
        fontWeight: "bold",
        textDecorationLine: "underline",
    },

    footer: {
        alignItems: "center",
        paddingBottom: 70,
        width: "100%",
    },
    
    buttonGroup: {
        gap: 10,
        width: "100%",
    },

    divider: {
        backgroundColor: colors.gray1,
        height: 1,
        margin: 3,
        width: "100%",
    },

    signupLabel: {
        color: colors.gray2,
        fontSize: 16,
        textAlign: "center", 
    },
})