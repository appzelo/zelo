import { useCallback, useEffect, useState } from "react"
import {
    View,
    Text,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from "react-native"
import { useFocusEffect, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../../utils/constants/colors"
import {
    formatCurrency,
    formatDuration,
    formatWeekdayDateKey,
    isTodayKey,
} from "../../../utils/format"
import {
    Booking,
    getBooking,
    subscribeBooking,
} from "../../../services/bookings"
import {
    Consultation,
    endConsultation,
    getConsultation,
    startConsultation,
} from "../../../services/consultation"
import { Patient, getPatientById } from "../../../services/patient"
import AppButton from "../../../components/AppButton"
import BackHeader from "../../../components/BackHeader"
import ConfirmModal from "../../../components/ConfirmModal"
import Icon, { IconName } from "../../../components/Icon"
import StatusChip from "../../../components/StatusChip"

type Feedback = {
    tone: "success" | "error",
    text: string,
}

/**
 * Atendimento do profissional: resumo do paciente, token de início e
 * encerramento. O painel de ação fica fixo; só o conteúdo rola.
 */
export default function ProAppointment() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const insets = useSafeAreaInsets()

    const [booking, setBooking] = useState<Booking | null>(null)
    const [patient, setPatient] = useState<Patient | null>(null)
    const [consultation, setConsultation] = useState<Consultation | null>(null)
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState("")
    const [tokenError, setTokenError] = useState<string | null>(null)
    const [starting, setStarting] = useState(false)
    const [ending, setEnding] = useState(false)
    const [endVisible, setEndVisible] = useState(false)
    const [feedback, setFeedback] = useState<Feedback | null>(null)

    const load = useCallback(async () => {
        const found = await getBooking(id)
        const foundPatient = found ? await getPatientById(found.patientId) : null
        const foundConsultation = found ? await getConsultation(found.id) : null

        setBooking(found)
        setPatient(foundPatient)
        setConsultation(foundConsultation)
        setLoading(false)
    }, [id])

    useFocusEffect(
        useCallback(() => {
            load()
        }, [load]),
    )

    useEffect(
        () => subscribeBooking(id, (updated) => setBooking(updated)),
        [id],
    )

    function handleTokenChange(value: string) {
        setToken(value.replace(/\D/g, "").slice(0, 4))

        if (tokenError) {
            setTokenError(null)
        }
    }

    async function handleStart() {
        if (!booking) {
            return
        }

        if (token.length !== 4) {
            setTokenError("Digite os 4 dígitos do token do paciente.")
            return
        }

        setStarting(true)
        setTokenError(null)
        setFeedback(null)

        try {
            const result = await startConsultation(booking.id, token)

            if (!result.ok) {
                setTokenError(startErrorMessage(result.reason))
                return
            }

            Keyboard.dismiss()
            setConsultation(result.consultation)
            setBooking(await getBooking(booking.id))
            setToken("")
            setFeedback({
                tone: "success",
                text: "Atendimento iniciado. O paciente já pode realizar o pagamento diretamente a você.",
            })
        } finally {
            setStarting(false)
        }
    }

    async function handleEnd() {
        if (!booking) {
            return
        }

        setEnding(true)
        setFeedback(null)

        try {
            const result = await endConsultation(booking.id)

            if (!result.ok) {
                setEndVisible(false)
                setFeedback({
                    tone: "error",
                    text: "Não foi possível encerrar o atendimento. Tente novamente.",
                })
                return
            }

            setConsultation(result.consultation)
            setBooking(await getBooking(booking.id))
            setEndVisible(false)
            setFeedback({
                tone: "success",
                text: "Atendimento encerrado. O histórico já está disponível na sua agenda.",
            })
        } finally {
            setEnding(false)
        }
    }

    const status = booking?.status
    const today = booking ? isTodayKey(booking.date) : false

    return (
        <View style={styles.container}>
            <BackHeader text="Atendimento" />

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            ) : !booking || !patient ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyTitle}>Atendimento não encontrado</Text>
                </View>
            ) : (
                <>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.flex}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scroll}
                            keyboardShouldPersistTaps="handled"
                            onScrollBeginDrag={Keyboard.dismiss}
                            showsVerticalScrollIndicator={false}
                        >
                            {feedback && <FeedbackBanner feedback={feedback} />}

                            <View style={styles.card}>
                                <View style={styles.topRow}>
                                    <StatusChip status={booking.status} full />

                                    <Text style={styles.price}>
                                        {formatCurrency(booking.total)}
                                    </Text>
                                </View>

                                <View style={styles.patientRow}>
                                    <View style={styles.avatar}>
                                        <Icon name="user" size={22} color={colors.blue1} />
                                    </View>

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

                            {booking.status !== "rejected" && booking.status !== "pending" && (
                                <View style={styles.note}>
                                    <Icon name="cash" size={18} color={colors.blue1} />

                                    <View style={styles.noteBody}>
                                        <Text style={styles.noteTitle}>
                                            Pagamento direto
                                        </Text>

                                        <Text style={styles.noteText}>
                                            {paymentNotice(booking.status)}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {consultation?.startedAt && (
                                <View style={styles.card}>
                                    <Text style={styles.sectionLabel}>Andamento</Text>

                                    <TimelineRow
                                        label="Iniciado"
                                        value={formatTime(consultation.startedAt)}
                                    />

                                    <TimelineRow
                                        label="Encerrado"
                                        value={
                                            consultation.endedAt
                                                ? formatTime(consultation.endedAt)
                                                : "Em andamento"
                                        }
                                        pending={!consultation.endedAt}
                                    />
                                </View>
                            )}
                        </ScrollView>

                        <View
                            style={[
                                styles.footer,
                                { paddingBottom: insets.bottom + 12 },
                            ]}
                        >
                            {status === "accepted" && today && (
                                <>
                                    <View style={styles.footerTitleRow}>
                                        <Icon name="lock" size={17} color={colors.blue1} />
                                        <Text style={styles.footerTitle}>
                                            Iniciar atendimento
                                        </Text>
                                    </View>

                                    <Text style={styles.footerHint}>
                                        Peça ao paciente os 4 dígitos do token para
                                        confirmar a chegada.
                                    </Text>

                                    <TextInput
                                        style={[
                                            styles.tokenInput,
                                            tokenError ? styles.tokenInputError : null,
                                        ]}
                                        value={token}
                                        onChangeText={handleTokenChange}
                                        placeholder="0000"
                                        placeholderTextColor={colors.gray1}
                                        keyboardType="number-pad"
                                        inputMode="numeric"
                                        maxLength={4}
                                        textAlign="center"
                                        selectionColor={colors.blue1}
                                        accessibilityLabel="Token de 4 dígitos do paciente"
                                    />

                                    {booking.id === "booking-demo" && (
                                        <Text style={styles.demoHint}>
                                            Token de demonstração: 4821
                                        </Text>
                                    )}

                                    {tokenError && (
                                        <Text style={styles.tokenError}>{tokenError}</Text>
                                    )}

                                    <AppButton
                                        text={starting ? "Iniciando..." : "Iniciar atendimento"}
                                        icon="play"
                                        onPress={handleStart}
                                        disabled={starting}
                                    />
                                </>
                            )}

                            {status === "accepted" && !today && (
                                <StatusPanel
                                    icon="lock"
                                    title="Token disponível no dia"
                                    text={`O atendimento está marcado para ${formatWeekdayDateKey(booking.date)}. O token aparece aqui no dia da consulta.`}
                                />
                            )}

                            {status === "pending" && (
                                <StatusPanel
                                    icon="clock"
                                    title="Aguardando confirmação"
                                    text="Aceite a solicitação na tela de Pedidos para liberar o atendimento."
                                />
                            )}

                            {status === "in_progress" && (
                                <>
                                    <StatusPanel
                                        icon="play"
                                        title="Atendimento em andamento"
                                        text={`Iniciado às ${formatTime(consultation?.startedAt)}.`}
                                    />

                                    <AppButton
                                        text="Encerrar atendimento"
                                        variant="danger"
                                        icon="stop"
                                        onPress={() => setEndVisible(true)}
                                        disabled={ending}
                                    />
                                </>
                            )}

                            {status === "completed" && (
                                <StatusPanel
                                    icon="checkmark-circle"
                                    title="Atendimento concluído"
                                    text={
                                        consultation?.endedAt
                                            ? `Encerrado às ${formatTime(consultation.endedAt)}.`
                                            : "Atendimento finalizado."
                                    }
                                />
                            )}
                        </View>
                    </KeyboardAvoidingView>

                    <ConfirmModal
                        visible={endVisible}
                        title="Encerrar atendimento?"
                        message={`O atendimento de ${patient.fullName} será encerrado e ficará registrado no histórico.`}
                        confirmText="Encerrar"
                        cancelText="Continuar atendimento"
                        destructive
                        loading={ending}
                        onConfirm={handleEnd}
                        onCancel={() => setEndVisible(false)}
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

type StatusPanelProps = {
    icon: IconName,
    title: string,
    text: string,
}

function StatusPanel({ icon, title, text }: StatusPanelProps) {
    return (
        <View style={styles.statusPanel}>
            <View style={styles.statusIcon}>
                <Icon name={icon} size={18} color={colors.blue1} />
            </View>

            <View style={styles.statusText}>
                <Text style={styles.statusTitle}>{title}</Text>
                <Text style={styles.statusBody}>{text}</Text>
            </View>
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

type TimelineRowProps = {
    label: string,
    value: string | null,
    pending?: boolean,
}

function TimelineRow({ label, value, pending = false }: TimelineRowProps) {
    return (
        <View style={styles.timelineRow}>
            <View style={[
                styles.timelineDot,
                pending ? styles.timelineDotIdle : null,
            ]} />

            <Text style={styles.timelineLabel}>{label}</Text>
            <Text style={styles.timelineValue}>{value ?? "—"}</Text>
        </View>
    )
}

function paymentNotice(status: Booking["status"]) {
    if (status === "in_progress") {
        return "O atendimento foi iniciado. O paciente já pode realizar o pagamento diretamente a você."
    }

    if (status === "completed") {
        return "Atendimento encerrado. O pagamento é feito diretamente entre você e o paciente."
    }

    return "O paciente poderá realizar o pagamento diretamente a você após o início do atendimento."
}

function startErrorMessage(reason: string) {
    if (reason === "not-today") {
        return "O atendimento só pode ser iniciado no dia marcado."
    }

    if (reason === "not-accepted") {
        return "Este atendimento ainda não está confirmado."
    }

    if (reason === "invalid-token") {
        return "Token inválido. Peça os 4 dígitos ao paciente e tente novamente."
    }

    return "Não foi possível iniciar o atendimento. Tente novamente."
}

/** "Sexta, 07/11 • 10:30" */
function formatDateTime(booking: Booking) {
    const day = formatWeekdayDateKey(booking.date)

    return `${day.charAt(0).toUpperCase()}${day.slice(1)} • ${booking.time}`
}

/** "2026-11-07T13:42:00.000Z" -> "13:42" */
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

    flex: {
        flex: 1,
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

    avatar: {
        alignItems: "center",
        backgroundColor: colors.blue2,
        borderRadius: 24,
        height: 48,
        justifyContent: "center",
        width: 48,
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

    noteBody: {
        flex: 1,
        gap: 2,
    },

    noteTitle: {
        color: colors.blue1,
        fontSize: 12,
        fontWeight: "bold",
    },

    noteText: {
        color: colors.blue1,
        fontSize: 12,
        lineHeight: 17,
    },

    timelineRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 9,
    },

    timelineDot: {
        backgroundColor: colors.green1,
        borderRadius: 4,
        height: 8,
        width: 8,
    },

    timelineDotIdle: {
        backgroundColor: colors.gray1,
    },

    timelineLabel: {
        color: colors.gray2,
        flex: 1,
        fontSize: 12.5,
    },

    timelineValue: {
        color: colors.dark1,
        fontSize: 12.5,
        fontWeight: "600",
    },

    footer: {
        borderTopColor: colors.gray3,
        borderTopWidth: 1,
        gap: 9,
        paddingTop: 12,
    },

    footerTitleRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 7,
    },

    footerTitle: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    footerHint: {
        color: colors.gray2,
        fontSize: 12,
        lineHeight: 17,
    },

    tokenInput: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 12,
        borderWidth: 1.5,
        color: colors.dark1,
        fontSize: 24,
        fontWeight: "bold",
        height: 54,
        letterSpacing: 12,
    },

    tokenInputError: {
        borderColor: colors.red1,
    },

    demoHint: {
        color: colors.blue1,
        fontSize: 11,
    },

    tokenError: {
        color: colors.red1,
        fontSize: 12,
        lineHeight: 16,
    },

    statusPanel: {
        alignItems: "center",
        flexDirection: "row",
        gap: 11,
        paddingBottom: 2,
    },

    statusIcon: {
        alignItems: "center",
        backgroundColor: colors.blue2,
        borderRadius: 20,
        height: 40,
        justifyContent: "center",
        width: 40,
    },

    statusText: {
        flex: 1,
        gap: 2,
    },

    statusTitle: {
        color: colors.dark1,
        fontSize: 14,
        fontWeight: "bold",
    },

    statusBody: {
        color: colors.gray2,
        fontSize: 11.5,
        lineHeight: 16,
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
