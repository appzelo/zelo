import { useEffect, useRef, useState } from "react"
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../utils/constants/colors"
import { formatShortDateKey } from "../../utils/format"
import { Booking, getBooking, subscribeBooking } from "../../services/bookings"
import { Specialist, getSpecialist } from "../../services/specialists"
import { Patient, getPatient } from "../../services/patient"
import AppButton from "../../components/AppButton"
import Icon from "../../components/Icon"

type StepState = "done" | "current" | "pending" | "rejected"

export default function BookingSent() {
    const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
    const insets = useSafeAreaInsets()
    const redirected = useRef(false)

    const [booking, setBooking] = useState<Booking | null>(null)
    const [specialist, setSpecialist] = useState<Specialist | null>(null)
    const [patient, setPatient] = useState<Patient | null>(null)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        let active = true

        getBooking(bookingId).then(async (found) => {
            if (!active) {
                return
            }

            if (!found) {
                setLoaded(true)
                return
            }

            const [foundSpecialist, currentPatient] = await Promise.all([
                getSpecialist(found.specialistId),
                getPatient(),
            ])

            if (!active) {
                return
            }

            setBooking(found)
            setSpecialist(foundSpecialist)
            setPatient(currentPatient)
            setLoaded(true)
        })

        return () => {
            active = false
        }
    }, [bookingId])

    // Assim que o profissional aceita, a tela vira a Consulta Confirmada.
    useEffect(() => {
        if (!bookingId) {
            return
        }

        return subscribeBooking(bookingId, (updated) => {
            setBooking(updated)

            if (updated.status === "accepted" && !redirected.current) {
                redirected.current = true
                router.replace(`/appointment/${updated.id}`)
            }
        })
    }, [bookingId])

    const rejected = booking?.status === "rejected"

    const steps: { title: string, description: string, state: StepState }[] = [
        {
            title: "Envio da Solicitação",
            description: "Seu pedido foi registrado no sistema Zelo.",
            state: "done",
        },
        {
            title: "Confirmação do Profissional",
            description: rejected
                ? `${specialist?.name ?? "O profissional"} não pôde atender este horário.`
                : specialist
                    ? `${specialist.name} está revisando a rota e os detalhes médicos.`
                    : "O profissional está revisando a rota e os detalhes médicos.",
            state: rejected ? "rejected" : "current",
        },
        {
            title: "Atendimento Domiciliar",
            description: "Acompanhe o trajeto em tempo real no app.",
            state: "pending",
        },
    ]

    return (
        <View style={styles.container}>
            {!loaded && (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            )}

            {loaded && (!booking || !specialist || !patient) && (
                <View style={styles.centered}>
                    <Text style={styles.empty}>Não foi possível carregar a solicitação.</Text>
                </View>
            )}

            {booking && specialist && patient && (
                <>
                    <ScrollView
                        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 44 }]}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.clockCircle, rejected && styles.circleRejected]}>
                            <Icon
                                name={rejected ? "alert" : "clock"}
                                size={38}
                                color={rejected ? colors.red1 : colors.green1}
                                strokeWidth={2}
                            />
                        </View>

                        <View style={styles.intro}>
                            <Text style={[styles.title, rejected && styles.titleRejected]}>
                                {rejected ? "Solicitação Recusada" : "Solicitação Enviada!"}
                            </Text>
                            <Text style={styles.subtitle}>
                                {rejected
                                    ? "Este horário não foi confirmado. Você pode buscar outro profissional."
                                    : `Aguardando confirmação do ${specialist.name}. Você será notificado em instantes.`}
                            </Text>
                        </View>

                        <View style={styles.summaryCard}>
                            <SummaryRow label="Profissional:" value={specialist.name} />
                            <SummaryRow label="Paciente:" value={patient.name} />
                            <SummaryRow
                                label="Data / Hora:"
                                value={`${formatShortDateKey(booking.date)} às ${booking.time}`}
                            />
                        </View>

                        <View style={styles.stepsSection}>
                            <Text style={styles.sectionTitle}>Etapas da Solicitação</Text>

                            <View style={styles.steps}>
                                {steps.map((step) => (
                                    <View key={step.title} style={styles.step}>
                                        <StepIcon state={step.state} />

                                        <View style={styles.stepText}>
                                            <Text style={styles.stepTitle}>{step.title}</Text>
                                            <Text style={styles.stepDescription}>{step.description}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
                        <AppButton
                            text="Voltar para o Início"
                            onPress={() => router.dismissTo("/home")}
                        />
                    </View>
                </>
            )}
        </View>
    )
}

type SummaryRowProps = {
    label: string,
    value: string,
}

function SummaryRow({ label, value }: SummaryRowProps) {
    return (
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
        </View>
    )
}

function StepIcon({ state }: { state: StepState }) {
    if (state === "done") {
        return (
            <View style={[styles.stepIcon, styles.stepIconDone]}>
                <Text style={styles.check}>✓</Text>
            </View>
        )
    }

    if (state === "current") {
        return (
            <View style={[styles.stepIcon, styles.stepIconCurrent]}>
                <View style={styles.currentDot}></View>
            </View>
        )
    }

    if (state === "rejected") {
        return (
            <View style={[styles.stepIcon, styles.stepIconRejected]}>
                <Text style={styles.check}>✕</Text>
            </View>
        )
    }

    return <View style={[styles.stepIcon, styles.stepIconPending]}></View>
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white1,
        flex: 1,
        width: "100%",
    },

    scroll: {
        alignItems: "center",
        gap: 22,
        paddingBottom: 24,
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
        textAlign: "center",
    },

    clockCircle: {
        alignItems: "center",
        borderColor: colors.green1,
        borderRadius: 42,
        borderWidth: 2,
        height: 84,
        justifyContent: "center",
        width: 84,
    },

    circleRejected: {
        borderColor: colors.red1,
    },

    intro: {
        gap: 8,
    },

    title: {
        color: colors.blue1,
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
    },

    titleRejected: {
        color: colors.red1,
    },

    subtitle: {
        color: colors.gray2,
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
    },    summaryCard: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 10,
        padding: 14,
        width: "100%",
    },

    summaryRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        justifyContent: "space-between",
    },

    summaryLabel: {
        color: colors.gray2,
        fontSize: 13,
    },

    summaryValue: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "bold",
        flexShrink: 1,
        textAlign: "right",
    },

    stepsSection: {
        gap: 14,
        width: "100%",
    },

    sectionTitle: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    steps: {
        gap: 16,
    },

    step: {
        flexDirection: "row",
        gap: 12,
    },

    stepText: {
        flex: 1,
        gap: 3,
    },

    stepTitle: {
        color: colors.dark1,
        fontSize: 14,
        fontWeight: "bold",
    },

    stepDescription: {
        color: colors.gray2,
        fontSize: 12.5,
        lineHeight: 17,
    },

    stepIcon: {
        alignItems: "center",
        borderRadius: 11,
        height: 22,
        justifyContent: "center",
        marginTop: 1,
        width: 22,
    },

    stepIconDone: {
        backgroundColor: colors.green1,
    },

    stepIconCurrent: {
        backgroundColor: colors.yellow1,
    },

    stepIconRejected: {
        backgroundColor: colors.red1,
    },

    stepIconPending: {
        borderColor: colors.gray1,
        borderWidth: 2,
    },

    check: {
        color: colors.white2,
        fontSize: 12,
        fontWeight: "bold",
    },

    currentDot: {
        backgroundColor: colors.white2,
        borderRadius: 4,
        height: 8,
        width: 8,
    },

    footer: {
        backgroundColor: colors.white1,
        paddingHorizontal: 28,
        paddingTop: 12,
    },
})
