import { useCallback, useEffect, useState } from "react"
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from "react-native"
import { useFocusEffect, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../utils/constants/colors"
import {
    formatCurrency,
    formatDurationLong,
    formatWeekdayDateKey,
} from "../../utils/format"
import {
    Booking,
    getBooking,
    subscribeBooking,
} from "../../services/bookings"
import { Specialist, getSpecialist } from "../../services/specialists"
import { Patient, getPatient } from "../../services/patient"
import {
    Consultation,
    getConsultation,
    getPatientToken,
} from "../../services/consultation"
import { BOOKING_STATUS } from "../../utils/constants/bookingStatus"
import Avatar from "../../components/Avatar"
import BackHeader from "../../components/BackHeader"
import Icon, { IconName } from "../../components/Icon"

/**
 * Consulta do paciente: resumo do atendimento, token do dia e aviso de
 * pagamento direto. O token é a única ação desta tela.
 */
export default function AppointmentDetail() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const insets = useSafeAreaInsets()

    const [booking, setBooking] = useState<Booking | null>(null)
    const [specialist, setSpecialist] = useState<Specialist | null>(null)
    const [patient, setPatient] = useState<Patient | null>(null)
    const [consultation, setConsultation] = useState<Consultation | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loaded, setLoaded] = useState(false)

    const load = useCallback(() => {
        let active = true

        getBooking(id).then(async (found) => {
            if (!active) {
                return
            }

            if (!found) {
                setLoaded(true)
                return
            }

            const [foundSpecialist, currentPatient, foundConsultation, foundToken] =
                await Promise.all([
                    getSpecialist(found.specialistId),
                    getPatient(),
                    getConsultation(found.id),
                    getPatientToken(found.id),
                ])

            if (!active) {
                return
            }

            setBooking(found)
            setSpecialist(foundSpecialist)
            setPatient(currentPatient)
            setConsultation(foundConsultation)
            setToken(foundToken)
            setLoaded(true)
        })

        return () => {
            active = false
        }
    }, [id])

    // Relê ao voltar para a tela e quando o profissional muda o status.
    useFocusEffect(load)
    useEffect(() => subscribeBooking(id, load), [id, load])

    return (
        <View style={styles.container}>
            <BackHeader text="Consulta" />

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
                        { paddingBottom: Math.max(insets.bottom, 12) + 20 },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        <View style={styles.topRow}>
                            <StatusBadge status={booking.status} />

                            <Text style={styles.total}>
                                {formatCurrency(booking.total)}
                            </Text>
                        </View>

                        <View style={styles.specialistRow}>
                            <Avatar size={48} />

                            <View style={styles.specialistInfo}>
                                <Text style={styles.specialistName}>
                                    {specialist.name}
                                </Text>
                                <Text style={styles.specialistSpecialty}>
                                    {specialist.specialty}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <InfoRow
                            icon="calendar"
                            label="Data e horário"
                            value={`${formatDateTime(booking)} – ${addMinutes(booking.time, booking.durationMinutes)}`}
                        />

                        <InfoRow
                            icon="clock"
                            label="Duração"
                            value={formatDurationLong(booking.durationMinutes)}
                        />

                        <InfoRow
                            icon="map-pin"
                            label="Endereço"
                            value={patient.address}
                        />
                    </View>

                    {booking.status === "completed" ? (
                        <CompletedCard consultation={consultation} />
                    ) : (
                        <TokenCard
                            booking={booking}
                            token={token}
                        />
                    )}

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.sectionLabel}>Pagamento</Text>

                            <View style={styles.paymentTotal}>
                                <Text style={styles.paymentTotalLabel}>
                                    Valor combinado
                                </Text>
                                <Text style={styles.paymentTotalValue}>
                                    {formatCurrency(booking.total)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.paymentNote}>
                            <Icon name="cash" size={18} color={colors.blue1} />

                            <Text style={styles.paymentText}>
                                {paymentMessage(booking.status)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>Motivo do atendimento</Text>
                        <Text style={styles.needs}>{booking.needs}</Text>
                    </View>
                </ScrollView>
            )}
        </View>
    )
}

function TokenCard({ booking, token }: { booking: Booking, token: string | null }) {
    const inProgress = booking.status === "in_progress"

    return (
        <View style={styles.tokenCard}>
            <View style={styles.tokenHeader}>
                <View style={styles.tokenIcon}>
                    <Icon name="lock" size={17} color={colors.green1} />
                </View>

                <Text style={styles.tokenTitle}>Seu token de atendimento</Text>
            </View>

            {token ? (
                <>
                    <Text style={styles.tokenValue}>{token}</Text>

                    <Text style={styles.tokenHint}>
                        {inProgress
                            ? "Atendimento em andamento. Você pode mostrar este código novamente se precisar."
                            : "Mostre este código ao especialista para iniciar a consulta."}
                    </Text>
                </>
            ) : (
                <View style={styles.tokenLocked}>
                    <Icon name="lock" size={15} color={colors.gray2} />

                    <Text style={styles.tokenLockedText}>
                        {lockedTokenMessage(booking)}
                    </Text>
                </View>
            )}
        </View>
    )
}

function CompletedCard({ consultation }: { consultation: Consultation | null }) {
    const endedAt = formatTime(consultation?.endedAt)

    return (
        <View style={styles.completedCard}>
            <Icon name="checkmark-circle" size={24} color={colors.green1} />

            <View style={styles.completedText}>
                <Text style={styles.completedTitle}>Consulta concluída</Text>
                <Text style={styles.completedHint}>
                    {endedAt
                        ? `Atendimento encerrado às ${endedAt}.`
                        : "Atendimento finalizado."}
                </Text>
            </View>
        </View>
    )
}

function StatusBadge({ status }: { status: Booking["status"] }) {
    const meta = BOOKING_STATUS[status]

    return (
        <View style={[styles.statusBadge, { backgroundColor: meta.background }]}>
            <Text style={[styles.statusText, { color: meta.color }]}>
                {statusLabel(status)}
            </Text>
        </View>
    )
}

type InfoRowProps = {
    icon: IconName,
    label: string,
    value: string,
}

function InfoRow({ icon, label, value }: InfoRowProps) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
                <Icon name={icon} size={15} color={colors.blue1} />
            </View>

            <View style={styles.infoText}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    )
}

function statusLabel(status: Booking["status"]) {
    if (status === "pending") {
        return "Aguardando confirmação"
    }

    return BOOKING_STATUS[status].requestLabel
}

function paymentMessage(status: Booking["status"]) {
    if (status === "in_progress") {
        return "O atendimento foi iniciado. Combine o pagamento diretamente com o especialista."
    }

    if (status === "completed") {
        return "Pagamento combinado diretamente com o especialista."
    }

    if (status === "accepted") {
        return "O pagamento será liberado após o especialista iniciar o atendimento."
    }

    return "Aguardando a confirmação do especialista."
}

function lockedTokenMessage(booking: Booking) {
    if (booking.status === "pending") {
        return "Aguardando a confirmação do especialista. O token aparece aqui no dia da consulta."
    }

    return `O token aparece aqui no dia da consulta: ${formatWeekdayDateKey(booking.date)}.`
}

/** "Sexta, 13/11 • 10:30" */
function formatDateTime(booking: Booking) {
    const day = formatWeekdayDateKey(booking.date)

    return `${day.charAt(0).toUpperCase()}${day.slice(1)} • ${booking.time}`
}

/** "2026-11-08T13:42:00.000Z" -> "13:42" */
function formatTime(iso: string | null | undefined) {
    if (!iso) {
        return null
    }

    const date = new Date(iso)

    if (Number.isNaN(date.getTime())) {
        return null
    }

    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

function addMinutes(time: string, minutes: number) {
    const [hour, minute] = time.split(":").map(Number)
    const total = hour * 60 + minute + minutes

    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
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

    empty: {
        color: colors.gray2,
        fontSize: 14,
    },

    scroll: {
        gap: 14,
    },

    card: {
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 10,
        padding: 14,
    },

    topRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },

    statusBadge: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    statusText: {
        fontSize: 10.5,
        fontWeight: "bold",
    },

    total: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    specialistRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 11,
    },

    specialistInfo: {
        flex: 1,
        gap: 2,
    },

    specialistName: {
        color: colors.dark1,
        fontSize: 17,
        fontWeight: "bold",
    },

    specialistSpecialty: {
        color: colors.gray2,
        fontSize: 12.5,
    },

    divider: {
        backgroundColor: colors.gray3,
        height: 1,
        width: "100%",
    },

    infoRow: {
        alignItems: "flex-start",
        flexDirection: "row",
        gap: 10,
    },

    infoIcon: {
        alignItems: "center",
        backgroundColor: colors.blue2,
        borderRadius: 9,
        height: 30,
        justifyContent: "center",
        width: 30,
    },

    infoText: {
        flex: 1,
        gap: 1,
        paddingTop: 1,
    },

    infoLabel: {
        color: colors.gray2,
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 0.4,
        textTransform: "uppercase",
    },

    infoValue: {
        color: colors.dark1,
        fontSize: 12.5,
        lineHeight: 17,
    },

    tokenCard: {
        backgroundColor: colors.green3,
        borderColor: colors.green1,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 10,
        padding: 14,
    },

    tokenHeader: {
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },

    tokenIcon: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderRadius: 16,
        height: 32,
        justifyContent: "center",
        width: 32,
    },

    tokenTitle: {
        color: colors.green1,
        fontSize: 14,
        fontWeight: "bold",
    },

    tokenValue: {
        backgroundColor: colors.white2,
        borderRadius: 12,
        color: colors.dark1,
        fontSize: 34,
        fontWeight: "bold",
        letterSpacing: 12,
        paddingBottom: 10,
        paddingLeft: 12,
        paddingTop: 8,
        textAlign: "center",
    },

    tokenHint: {
        color: colors.green1,
        fontSize: 12,
        lineHeight: 17,
    },

    tokenLocked: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderRadius: 10,
        flexDirection: "row",
        gap: 8,
        padding: 11,
    },

    tokenLockedText: {
        color: colors.gray2,
        flex: 1,
        fontSize: 12,
        lineHeight: 17,
    },

    completedCard: {
        alignItems: "center",
        backgroundColor: colors.green3,
        borderColor: colors.green1,
        borderRadius: 14,
        borderWidth: 1.5,
        flexDirection: "row",
        gap: 11,
        padding: 14,
    },

    completedText: {
        flex: 1,
        gap: 2,
    },

    completedTitle: {
        color: colors.green1,
        fontSize: 14,
        fontWeight: "bold",
    },

    completedHint: {
        color: colors.gray2,
        fontSize: 12,
        lineHeight: 17,
    },

    cardHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },

    sectionLabel: {
        color: colors.gray2,
        fontSize: 10.5,
        fontWeight: "bold",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },

    paymentTotal: {
        alignItems: "flex-end",
        gap: 1,
    },

    paymentTotalLabel: {
        color: colors.gray2,
        fontSize: 10,
    },

    paymentTotalValue: {
        color: colors.blue1,
        fontSize: 16,
        fontWeight: "bold",
    },

    paymentNote: {
        alignItems: "flex-start",
        backgroundColor: colors.blue2,
        borderRadius: 10,
        flexDirection: "row",
        gap: 9,
        padding: 11,
    },

    paymentText: {
        color: colors.blue1,
        flex: 1,
        fontSize: 12,
        lineHeight: 17,
    },

    needs: {
        color: colors.dark1,
        fontSize: 12.5,
        lineHeight: 18,
    },
})
