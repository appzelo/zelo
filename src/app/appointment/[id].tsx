import { useEffect, useState } from "react"
import { View, Text, ScrollView, ActivityIndicator, Linking, StyleSheet } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../utils/constants/colors"
import {
    calculateAge,
    formatBirthDate,
    formatShortDateKey,
    isTodayKey,
} from "../../utils/format"
import { Booking, getBooking } from "../../services/bookings"
import { Specialist, getSpecialist } from "../../services/specialists"
import { Patient, getPatient } from "../../services/patient"
import { Tracking, getTracking } from "../../services/tracking"
import BackHeader from "../../components/BackHeader"
import AppButton from "../../components/AppButton"
import Icon from "../../components/Icon"
import MapPreview from "../../components/MapPreview"

export default function AppointmentDetail() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const insets = useSafeAreaInsets()

    const [booking, setBooking] = useState<Booking | null>(null)
    const [specialist, setSpecialist] = useState<Specialist | null>(null)
    const [patient, setPatient] = useState<Patient | null>(null)
    const [tracking, setTracking] = useState<Tracking | null>(null)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        let active = true

        getBooking(id).then(async (found) => {
            if (!active) {
                return
            }

            if (!found) {
                setLoaded(true)
                return
            }

            const [foundSpecialist, currentPatient, currentTracking] = await Promise.all([
                getSpecialist(found.specialistId),
                getPatient(),
                getTracking(found.id),
            ])

            if (!active) {
                return
            }

            setBooking(found)
            setSpecialist(foundSpecialist)
            setPatient(currentPatient)
            setTracking(currentTracking)
            setLoaded(true)
        })

        return () => {
            active = false
        }
    }, [id])

    const age = patient ? calculateAge(patient.birthDate) : null

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackHeader text="Consulta Confirmada" />
            </View>

            {!loaded && (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            )}

            {loaded && (!booking || !patient || !specialist) && (
                <View style={styles.centered}>
                    <Text style={styles.empty}>Consulta não encontrada.</Text>
                </View>
            )}

            {booking && patient && specialist && (
                <ScrollView
                    contentContainerStyle={[
                        styles.scroll,
                        { paddingBottom: Math.max(insets.bottom, 12) + 8 },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.patientCard}>
                        <Text style={styles.eyebrow}>
                            {isTodayKey(booking.date)
                                ? "Compromisso Hoje"
                                : `Compromisso em ${formatShortDateKey(booking.date)}`}
                        </Text>

                        <Text style={styles.patientName}>{patient.fullName}</Text>

                        <Text style={styles.patientBirth}>
                            {`Nascimento: ${formatBirthDate(patient.birthDate)}${age !== null ? ` (${age} anos)` : ""}`}
                        </Text>
                    </View>

                    <View style={styles.ruleBox}>
                        <Icon name="alert" size={15} color={colors.red1} />

                        <Text style={styles.ruleText}>
                            <Text style={styles.ruleLabel}>Regra: </Text>
                            Limite de 1 atendimento por paciente ao dia.
                        </Text>
                    </View>

                    <MapPreview active={tracking?.status === "on_the_way"} />

                    {tracking && (
                        <View style={styles.etaCard}>
                            <View style={styles.etaTop}>
                                <View>
                                    <Text style={styles.etaLabel}>Tempo Estimado</Text>
                                    <Text style={styles.etaValue}>{`${tracking.etaMinutes} min`}</Text>
                                </View>

                                <View style={styles.trafficChip}>
                                    <Text style={styles.trafficText}>
                                        {`Trânsito ${tracking.traffic}`}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider}></View>

                            <View style={styles.destination}>
                                <Icon name="map-pin" size={16} color={colors.green1} />

                                <View style={styles.destinationText}>
                                    <Text style={styles.etaLabel}>Endereço de Destino:</Text>
                                    <Text style={styles.destinationValue}>{patient.address}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    <AppButton
                        text="Abrir no Google Maps"
                        icon="navigation"
                        onPress={() => openMaps(patient.address)}
                    />
                </ScrollView>
            )}
        </View>
    )
}

function openMaps(address: string) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`

    Linking.openURL(url).catch(() => {})
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white1,
        flex: 1,
        width: "100%",
    },

    header: {
        paddingHorizontal: 28,
    },

    scroll: {
        gap: 14,
        paddingHorizontal: 28,
    },

    centered: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 28,
    },

    empty: {
        color: colors.gray2,
        fontSize: 14,
    },

    patientCard: {
        backgroundColor: colors.green3,
        borderColor: colors.green1,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 3,
        padding: 14,
    },

    eyebrow: {
        color: colors.green1,
        fontSize: 10.5,
        fontWeight: "bold",
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },

    patientName: {
        color: colors.dark1,
        fontSize: 16,
        fontWeight: "bold",
    },

    patientBirth: {
        color: colors.gray2,
        fontSize: 12,
    },

    ruleBox: {
        alignItems: "center",
        backgroundColor: colors.red2,
        borderColor: colors.red1,
        borderRadius: 10,
        borderWidth: 1.5,
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },

    ruleText: {
        color: colors.dark1,
        flex: 1,
        fontSize: 11.5,
        lineHeight: 16,
    },

    ruleLabel: {
        color: colors.red1,
        fontWeight: "bold",
    },

    etaCard: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 12,
        borderWidth: 1.5,
        padding: 14,
    },

    etaTop: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },

    etaLabel: {
        color: colors.gray2,
        fontSize: 11,
    },

    etaValue: {
        color: colors.dark1,
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 2,
    },

    trafficChip: {
        backgroundColor: colors.green2,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },

    trafficText: {
        color: colors.green1,
        fontSize: 11,
        fontWeight: "bold",
    },

    divider: {
        backgroundColor: colors.gray3,
        height: 1,
        marginVertical: 12,
        width: "100%",
    },

    destination: {
        alignItems: "flex-start",
        flexDirection: "row",
        gap: 10,
    },

    destinationText: {
        flex: 1,
        gap: 2,
    },

    destinationValue: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "bold",
        lineHeight: 18,
    },
})
