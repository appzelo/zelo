import { useEffect, useState } from "react"
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from "react-native"
import { useLocalSearchParams } from "expo-router"
import { colors } from "../../../utils/constants/colors"
import {
    formatCurrency,
    formatDuration,
    formatLongDateKey,
} from "../../../utils/format"
import { Booking, getBooking } from "../../../services/bookings"
import { Patient, getPatientById } from "../../../services/patient"
import BackHeader from "../../../components/BackHeader"
import Icon from "../../../components/Icon"
import StatusChip from "../../../components/StatusChip"

/**
 * Ponto de entrada do atendimento a partir da agenda. O painel de token e
 * o fluxo de início/encerramento entram na etapa seguinte.
 */
export default function ProAppointment() {
    const { id } = useLocalSearchParams<{ id: string }>()

    const [booking, setBooking] = useState<Booking | null>(null)
    const [patient, setPatient] = useState<Patient | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        getBooking(id).then(async (found) => {
            const foundPatient = found
                ? await getPatientById(found.patientId)
                : null

            if (!active) {
                return
            }

            setBooking(found)
            setPatient(foundPatient)
            setLoading(false)
        })

        return () => {
            active = false
        }
    }, [id])

    return (
        <View style={styles.container}>
            <BackHeader text="Paciente e atendimento" />

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            ) : !booking || !patient ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyTitle}>Atendimento não encontrado</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        <View style={styles.topRow}>
                            <StatusChip status={booking.status} full />

                            <Text style={styles.price}>
                                {formatCurrency(booking.total)}
                            </Text>
                        </View>

                        <Text style={styles.date}>
                            {`${formatLongDateKey(booking.date)} • ${booking.time}`}
                        </Text>

                        <Text style={styles.name}>{patient.fullName}</Text>

                        <Text style={styles.meta}>
                            {`${patient.neighborhood} • ${formatDistance(booking.distanceKm)} • ${formatDuration(booking.durationMinutes)}`}
                        </Text>

                        <View style={styles.divider} />

                        <Text style={styles.label}>Necessidades</Text>
                        <Text style={styles.needs}>{booking.needs}</Text>
                    </View>

                    <View style={styles.note}>
                        <Icon name="clipboard" size={18} color={colors.blue1} />

                        <Text style={styles.noteText}>
                            O painel de token e o encerramento do atendimento
                            serão adicionados na próxima etapa.
                        </Text>
                    </View>
                </ScrollView>
            )}
        </View>
    )
}

function formatDistance(km: number) {
    return `${km.toFixed(1).replace(".", ",")} km`
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white1,
        flex: 1,
        paddingHorizontal: "5%",
        width: "100%",
    },

    centered: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingBottom: 40,
    },

    emptyTitle: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    scroll: {
        gap: 16,
        paddingBottom: 28,
    },

    card: {
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 6,
        padding: 14,
    },

    topRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },

    price: {
        color: colors.blue1,
        fontSize: 15,
        fontWeight: "bold",
    },

    date: {
        color: colors.gray2,
        fontSize: 12,
    },

    name: {
        color: colors.dark1,
        fontSize: 17,
        fontWeight: "bold",
        marginTop: 4,
    },

    meta: {
        color: colors.gray2,
        fontSize: 12,
    },

    divider: {
        backgroundColor: colors.gray3,
        height: 1,
        marginVertical: 6,
        width: "100%",
    },

    label: {
        color: colors.gray2,
        fontSize: 10.5,
        fontWeight: "bold",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },

    needs: {
        color: colors.dark1,
        fontSize: 12.5,
        lineHeight: 17,
    },

    note: {
        alignItems: "flex-start",
        backgroundColor: colors.blue2,
        borderRadius: 12,
        flexDirection: "row",
        gap: 9,
        padding: 12,
    },

    noteText: {
        color: colors.blue1,
        flex: 1,
        fontSize: 12,
        lineHeight: 17,
    },
})
