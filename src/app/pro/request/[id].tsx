import { useEffect, useState } from "react"
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../../utils/constants/colors"
import {
    formatCurrency,
    formatDuration,
    formatWeekdayDateKey,
} from "../../../utils/format"
import {
    Booking,
    acceptBooking,
    getBooking,
    isBookingConflict,
    rejectBooking,
} from "../../../services/bookings"
import { Patient, getPatientById } from "../../../services/patient"
import { BOOKING_STATUS } from "../../../utils/constants/bookingStatus"
import Avatar from "../../../components/Avatar"
import AppButton from "../../../components/AppButton"
import BackHeader from "../../../components/BackHeader"
import ConfirmModal from "../../../components/ConfirmModal"
import Icon, { IconName } from "../../../components/Icon"
import StatusChip from "../../../components/StatusChip"

type Action = "accept" | "reject" | null

type Feedback = {
    tone: "success" | "error",
    text: string,
}

/**
 * Detalhe da solicitação: resumo do pedido e as ações de aceitar ou recusar.
 * O aceite revalida os conflitos no serviço antes de confirmar o horário.
 */
export default function ProRequest() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const insets = useSafeAreaInsets()

    const [booking, setBooking] = useState<Booking | null>(null)
    const [patient, setPatient] = useState<Patient | null>(null)
    const [loading, setLoading] = useState(true)
    const [action, setAction] = useState<Action>(null)
    const [rejectVisible, setRejectVisible] = useState(false)
    const [feedback, setFeedback] = useState<Feedback | null>(null)

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

    async function handleAccept() {
        if (!booking) {
            return
        }

        setAction("accept")
        setFeedback(null)

        try {
            const updated = await acceptBooking(booking.id)

            setBooking(updated)
            setFeedback({
                tone: "success",
                text: "Solicitação aceita! O atendimento já está confirmado na sua agenda.",
            })
        } catch (error) {
            setFeedback({
                tone: "error",
                text: isBookingConflict(error)
                    ? conflictMessage(error.code)
                    : "Não foi possível aceitar a solicitação. Tente novamente.",
            })
        } finally {
            setAction(null)
        }
    }

    async function handleReject() {
        if (!booking) {
            return
        }

        setAction("reject")
        setFeedback(null)

        try {
            const updated = await rejectBooking(booking.id)

            setBooking(updated)
            setRejectVisible(false)
            setFeedback({
                tone: "success",
                text: "Solicitação recusada. O horário voltou a ficar disponível na sua agenda.",
            })
        } catch {
            setRejectVisible(false)
            setFeedback({
                tone: "error",
                text: "Não foi possível recusar a solicitação. Tente novamente.",
            })
        } finally {
            setAction(null)
        }
    }

    const pending = booking?.status === "pending"
    const openable = booking?.status === "accepted" || booking?.status === "in_progress"
    const hasFooter = pending || openable || feedback !== null

    return (
        <View style={styles.container}>
            <BackHeader text="Solicitação" />

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            ) : !booking || !patient ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyTitle}>Solicitação não encontrada</Text>
                </View>
            ) : (
                <>
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.card}>
                            <View style={styles.topRow}>
                                <StatusChip
                                    status={booking.status}
                                    label={BOOKING_STATUS[booking.status].requestLabel}
                                />

                                <Text style={styles.price}>
                                    {formatCurrency(booking.price)}
                                </Text>
                            </View>

                            <View style={styles.patientRow}>
                                <Avatar size={48} />

                                <View style={styles.patientInfo}>
                                    <Text style={styles.name}>{patient.fullName}</Text>
                                    <Text style={styles.meta}>{patient.neighborhood}</Text>
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
                                value={formatDuration(booking.durationMinutes)}
                            />

                            <InfoRow
                                icon="navigation"
                                label="Distância"
                                value={formatDistance(booking.distanceKm)}
                            />

                            <InfoRow
                                icon="map-pin"
                                label="Endereço"
                                value={patient.address}
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionLabel}>Necessidades</Text>
                            <Text style={styles.needs}>{booking.needs}</Text>
                        </View>

                        <View style={styles.note}>
                            <Icon name="clipboard" size={18} color={colors.blue1} />

                            <Text style={styles.noteText}>
                                {requestNote(booking.status)}
                            </Text>
                        </View>
                    </ScrollView>

                    {hasFooter && (
                        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
                            {feedback && <FeedbackBanner feedback={feedback} />}

                            {pending && (
                                <>
                                    <AppButton
                                        text={action === "accept" ? "Aceitando..." : "Aceitar solicitação"}
                                        icon="checkmark-circle"
                                        onPress={handleAccept}
                                        disabled={action !== null}
                                    />

                                    <AppButton
                                        text="Recusar solicitação"
                                        variant="danger"
                                        onPress={() => setRejectVisible(true)}
                                        disabled={action !== null}
                                    />
                                </>
                            )}

                            {openable && (
                                <AppButton
                                    text="Abrir atendimento"
                                    icon="arrow-right"
                                    onPress={() => router.push(`/pro/appointment/${booking.id}`)}
                                />
                            )}
                        </View>
                    )}

                    <ConfirmModal
                        visible={rejectVisible}
                        title="Recusar solicitação?"
                        message={`A solicitação de ${patient.fullName} para ${formatDateTime(booking)} será recusada e o horário voltará a ficar disponível na sua agenda.`}
                        confirmText="Recusar"
                        cancelText="Manter solicitação"
                        destructive
                        loading={action === "reject"}
                        onConfirm={handleReject}
                        onCancel={() => setRejectVisible(false)}
                    />
                </>
            )}
        </View>
    )
}

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
    const success = feedback.tone === "success"

    return (
        <View style={[
            styles.feedback,
            success ? styles.feedbackSuccess : styles.feedbackError,
        ]}>
            <Icon
                name={success ? "checkmark-circle" : "alert"}
                size={17}
                color={success ? colors.green1 : colors.red1}
            />

            <Text style={[
                styles.feedbackText,
                { color: success ? colors.green1 : colors.red1 },
            ]}>
                {feedback.text}
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

function conflictMessage(code: "patient-day" | "slot-taken") {
    return code === "patient-day"
        ? "Este paciente já tem um atendimento neste dia. A solicitação continua pendente."
        : "Este horário já foi ocupado por outro atendimento. A solicitação continua pendente."
}

function requestNote(status: Booking["status"]) {
    if (status === "pending") {
        return "Aceitar confirma o atendimento na sua agenda. Recusar libera o horário para outros pedidos."
    }

    if (status === "rejected") {
        return "Solicitação recusada. O horário voltou a ficar disponível na sua agenda."
    }

    if (status === "completed") {
        return "Atendimento concluído. O histórico fica registrado na sua agenda."
    }

    if (status === "in_progress") {
        return "Atendimento em andamento. Encerre quando a consulta terminar."
    }

    return "Atendimento confirmado. No dia marcado, peça o token de 4 dígitos ao paciente para iniciar."
}

/** "Sexta, 07/11 • 10:30" */
function formatDateTime(booking: Booking) {
    const day = formatWeekdayDateKey(booking.date)

    return `${day.charAt(0).toUpperCase()}${day.slice(1)} • ${booking.time}`
}

function addMinutes(time: string, minutes: number) {
    const [hour, minute] = time.split(":").map(Number)
    const total = hour * 60 + minute + minutes

    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
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
        gap: 14,
        paddingBottom: 20,
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

    price: {
        color: colors.green1,
        fontSize: 15,
        fontWeight: "bold",
    },

    patientRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 11,
    },

    patientInfo: {
        flex: 1,
        gap: 2,
    },

    name: {
        color: colors.dark1,
        fontSize: 17,
        fontWeight: "bold",
    },

    meta: {
        color: colors.gray2,
        fontSize: 12,
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

    sectionLabel: {
        color: colors.gray2,
        fontSize: 10.5,
        fontWeight: "bold",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },

    needs: {
        color: colors.dark1,
        fontSize: 12.5,
        lineHeight: 18,
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

    footer: {
        borderTopColor: colors.gray3,
        borderTopWidth: 1,
        gap: 10,
        paddingTop: 12,
    },

    feedback: {
        alignItems: "flex-start",
        borderRadius: 10,
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 11,
        paddingVertical: 9,
    },

    feedbackSuccess: {
        backgroundColor: colors.green3,
    },

    feedbackError: {
        backgroundColor: colors.red2,
    },

    feedbackText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 17,
    },
})
