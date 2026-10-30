import { View, Text, StyleSheet } from "react-native"
import { router } from "expo-router"
import { colors } from "../../utils/constants/colors"
import LocationHeader from "../../components/LocationHeader"
import ActionCard from "../../components/ActionCard"
import { DEMO_BOOKING_ID } from "../../services/bookings"

export default function Home() {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <LocationHeader
                    patientName="Maria das Dores"
                    address="Av. Paulista, 1578"
                />

                <Text style={styles.welcome}>{`Bem-vinda,${"\n"}Maria`}</Text>

                <Text style={styles.question}>Qual sua necessidade hoje?</Text>

                <View style={styles.actions}>
                    <ActionCard
                        title="Buscar especialista"
                        icon="search"
                        onPress={() => router.navigate("/search")}
                    />
                    <ActionCard
                        title="Verificar Agendamentos"
                        icon="calendar"
                        onPress={() => router.navigate(`/appointment/${DEMO_BOOKING_ID}`)}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white1,
        flex: 1,
        paddingTop: 60,
        width: "100%",
    },

    content: {
        flex: 1,
        paddingHorizontal: 34,
    },

    welcome: {
        color: colors.dark1,
        fontSize: 48,
        fontWeight: "800",
        letterSpacing: -1.4,
        lineHeight: 51,
        marginTop: 24,
    },

    question: {
        color: colors.gray2,
        fontSize: 25,
        fontWeight: "500",
        marginTop: 18,
    },

    actions: {
        gap: 20,
        marginTop: 22,
    },
})
