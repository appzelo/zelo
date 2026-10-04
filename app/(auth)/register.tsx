import { useState } from "react"
import { View, StyleSheet } from "react-native"
import { router } from "expo-router"
import BackHeader from "../../src/components/BackHeader"
import SectionText from "../../src/components/SectionText"
import ProfileCard from "../../src/components/ProfileCard"
import AppButton from "../../src/components/AppButton"
import { colors } from "../../constants/colors"

export default function Register() {
    const [selectedCard, setSelectedCard] = useState("patient")

    function handleContinue() {
        if (selectedCard === "patient") {
            router.push("/patientRegister")
        }
        else if (selectedCard === "guardian") {
            router.push("/guardianRegister")
        }
        else if (selectedCard === "specialist") {
            router.push("/specialistRegister")
        }
    }

    return (
        <View style={styles.container}>
            <BackHeader text="Cadastro de Perfil"></BackHeader>
            <View style={styles.content}>
                <SectionText 
                    title="Como deseja utilizar a plataforma?" 
                    showDescription={true}
                    description="Escolha a opção que melhor descreve você para iniciarmos."
                ></SectionText>
                <View style={styles.cards}>
                    <ProfileCard 
                        title="Ser paciente" 
                        description="Desejo encontrar profissionais para cuidar da minha saúde em casa." 
                        selected={selectedCard === "patient"} 
                        onPress={() => setSelectedCard("patient")}
                    ></ProfileCard>
                    <ProfileCard 
                        title="Sou Familiar/Responsável" 
                        description="Quero contratar e acompanhar atendimentos para um familiar de minha responsabilidade." 
                        selected={selectedCard === "guardian"} 
                        onPress={() => setSelectedCard("guardian")}
                    ></ProfileCard>
                    <ProfileCard 
                        title="Sou Especialista da Saúde" 
                        description="Sou enfermeiro, fisio ou médico e quero oferecer meus serviços domiciliares." 
                        selected={selectedCard === "specialist"} 
                        onPress={() => setSelectedCard("specialist")}
                    ></ProfileCard>
                </View>
                <View style={styles.footer}>
                    <AppButton text="Continuar Cadastro" onPress={handleContinue}></AppButton>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignSelf: "center",
        backgroundColor: colors.white1,
        flex: 1,
        paddingHorizontal: "5%",
        width: "100%"
    },

    content: {
        flex: 1,
        gap: 12,
    },

    cards: {
        alignItems: "center",   
        flex: 1,
        gap: 12, 
    },

    footer: {
        paddingBottom: 70,
    },
})