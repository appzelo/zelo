import { useCallback, useEffect, useState } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../utils/constants/colors"
import { formatCurrency, formatDateKey, formatTimestamp } from "../../utils/format"
import { Specialist, getSpecialist } from "../../services/specialists"
import { Patient, getPatient } from "../../services/patient"
import { calculateTotals, createBooking, isBookingConflict, BookingConflict } from "../../services/bookings"
import { Consent, acceptConsent, getConsent } from "../../services/consent"
import BackHeader from "../../components/BackHeader"
import AppButton from "../../components/AppButton"
import Icon, { IconName } from "../../components/Icon"

const NEEDS = "Auxílio para locomoção (andador). Sequelas leves de AVC, foco em fisioterapia motora."

const CONFLICT: Record<BookingConflict, { title: string, hint: string }> = {
    "slot-taken": {
        title: "Este horário acabou de ser ocupado",
        hint: "Escolha outro horário para concluir o agendamento.",
    },
    "patient-day": {
        title: "Você já tem um atendimento neste dia",
        hint: "Limite de 1 atendimento por paciente ao dia.",
    },
}

export default function BookingReview() {
    const { specialistId, date, time } = useLocalSearchParams<{
        specialistId: string,
        date: string,
        time: string,
    }>()
    const insets = useSafeAreaInsets()

    const [specialist, setSpecialist] = useState<Specialist | null>(null)
    const [patient, setPatient] = useState<Patient | null>(null)
    const [consent, setConsent] = useState<Consent | null>(null)
    const [accepted, setAccepted] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [sending, setSending] = useState(false)
    const [conflict, setConflict] = useState<BookingConflict | null>(null)

    useEffect(() => {
        let active = true

        Promise.all([getSpecialist(specialistId), getPatient()]).then(([found, currentPatient]) => {
            if (!active) {
                return
            }

            setSpecialist(found)
            setPatient(currentPatient)
            setLoaded(true)
        })

        return () => {
            active = false
        }
    }, [specialistId])

    // Relê o aceite ao voltar da tela do termo.
    const loadConsent = useCallback(() => {
        if (!patient) {
            return
        }

        let active = true

        getConsent(patient.id).then((found) => {
            if (active) {
                setConsent(found)
            }
        })

        return () => {
            active = false
        }
    }, [patient])

    useEffect(() => loadConsent(), [loadConsent])

    useFocusEffect(loadConsent)

    const canSend = Boolean(consent) || accepted

    async function handleSubmit() {
        if (!specialist || !patient || sending || !canSend) {
            return
        }

        setSending(true)

        try {
            const booking = await createBooking({
                specialistId: specialist.id,
                patientId: patient.id,
                date,
                time,
                needs: NEEDS,
            })

            // O aceite só é registrado quando a solicitação é enviada.
            await acceptConsent(patient.id)

            router.replace({
                pathname: "/booking/sent",
                params: {
                    bookingId: booking.id,
                },
            })
        } catch (error) {
            setSending(false)

            if (isBookingConflict(error)) {
                setConflict(error.code)
            }
        }
    }

    const totals = specialist ? calculateTotals(specialist) : null

    function openTerm() {
        if (!patient) {
            return
        }

        router.push({
            pathname: "/terms/[patientId]",
            params: {
                patientId: patient.id,
            },
        })
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackHeader text="Revisão do Agendamento" />
            </View>

            {!loaded && (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            )}

            {loaded && (!specialist || !patient) && (
                <View style={styles.centered}>
                    <Text style={styles.empty}>Não foi possível carregar o agendamento.</Text>
                </View>
            )}

            {specialist && patient && totals && (
                <>
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Detalhes da Consulta</Text>

                            <View style={styles.detailsCard}>
                                <DetailRow
                                    icon="person"
                                    label="Paciente Selecionado"
                                    value={`Dona ${patient.name}`}
                                />
                                <DetailRow
                                    icon="map-pin"
                                    label="Endereço de Atendimento"
                                    value={patient.address}
                                    divider
                                />
                                <DetailRow
                                    icon="calendar"
                                    label="Data & Horário"
                                    value={formatDateKey(date, time)}
                                    divider
                                    tinted
                                />
                            </View>
                        </View>

                        <View style={styles.priceCard}>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Valor do Atendimento</Text>
                                <Text style={styles.priceValue}>{formatCurrency(totals.price)}</Text>
                            </View>

                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>
                                    {`Taxa de Deslocamento (${specialist.distanceKm} km)`}
                                </Text>
                                <Text style={styles.priceValue}>{formatCurrency(totals.travelFee)}</Text>
                            </View>

                            <View style={styles.priceDivider}></View>

                            <View style={styles.priceRow}>
                                <Text style={styles.totalLabel}>Valor Total</Text>
                                <Text style={styles.totalValue}>{formatCurrency(totals.total)}</Text>
                            </View>
                        </View>

                        <View style={styles.consentCard}>
                            {consent ? (
                                <View style={styles.consentSigned}>
                                    <View style={[styles.consentCheck, styles.consentCheckOn]}>
                                        <Text style={styles.consentCheckMark}>✓</Text>
                                    </View>

                                    <View style={styles.consentSignedText}>
                                        <Text style={styles.consentTitle}>Termo aceito</Text>
                                        <Text style={styles.consentMeta}>
                                            {formatTimestamp(consent.acceptedAt, false)}
                                        </Text>
                                    </View>

                                    <Pressable onPress={openTerm} hitSlop={8}>
                                        <Text style={styles.consentLink}>Ver</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <>
                                    <Pressable
                                        style={styles.consentRow}
                                        onPress={() => setAccepted((value) => !value)}
                                    >
                                        <View
                                            style={[
                                                styles.consentCheck,
                                                accepted && styles.consentCheckOn,
                                            ]}
                                        >
                                            {accepted && (
                                                <Text style={styles.consentCheckMark}>✓</Text>
                                            )}
                                        </View>

                                        <Text style={styles.consentText}>
                                            Li e aceito o Termo de Consentimento.
                                        </Text>
                                    </Pressable>

                                    <Pressable onPress={openTerm} hitSlop={8}>
                                        <Text style={styles.consentLinkIndented}>
                                            Ler termo completo
                                        </Text>
                                    </Pressable>
                                </>
                            )}
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
                        {conflict && (
                            <View style={styles.conflictBanner}>
                                <Icon name="alert" size={16} color={colors.red1} />

                                <View style={styles.conflictText}>
                                    <Text style={styles.conflictTitle}>
                                        {CONFLICT[conflict].title}
                                    </Text>
                                    <Text style={styles.conflictHint}>
                                        {CONFLICT[conflict].hint}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {conflict ? (
                            <AppButton
                                text={conflict === "patient-day"
                                    ? "Ver minha Agenda"
                                    : "Escolher outro horário"}
                                variant="secondary"
                                onPress={() => {
                                    if (conflict === "patient-day") {
                                        router.navigate("/schedule")
                                        return
                                    }

                                    router.back()
                                }}
                            />
                        ) : (
                            <AppButton
                                text={sending ? "Enviando..." : "Enviar Solicitação"}
                                onPress={handleSubmit}
                                disabled={!canSend || sending}
                            />
                        )}
                    </View>
                </>
            )}
        </View>
    )
}

type DetailRowProps = {
    icon: IconName,
    label: string,
    value: string,
    divider?: boolean,
    tinted?: boolean,
}

function DetailRow({
    icon,
    label,
    value,
    divider = false,
    tinted = false,
}: DetailRowProps) {
    return (
        <View style={[
            styles.row,
            divider && styles.rowDivider,
            tinted && styles.rowTinted,
        ]}>
            <View style={styles.rowIcon}>
                <Icon name={icon} size={17} color={colors.green1} />
            </View>

            <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue}>{value}</Text>
            </View>
        </View>
    )
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
        gap: 18,
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

    section: {
        gap: 12,
    },

    sectionTitle: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    detailsCard: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 12,
        borderWidth: 1.5,
        overflow: "hidden",
    },

    row: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },

    rowDivider: {
        borderTopColor: colors.gray3,
        borderTopWidth: 1,
    },

    rowTinted: {
        backgroundColor: colors.white1,
    },

    rowIcon: {
        alignItems: "center",
        backgroundColor: colors.green2,
        borderRadius: 17,
        height: 34,
        justifyContent: "center",
        width: 34,
    },

    rowText: {
        flex: 1,
        gap: 3,
    },

    rowLabel: {
        color: colors.gray2,
        fontSize: 11.5,
    },

    rowValue: {
        color: colors.dark1,
        fontSize: 14,
        fontWeight: "bold",
    },

    priceCard: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 10,
        padding: 14,
    },

    priceRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        justifyContent: "space-between",
    },

    priceLabel: {
        color: colors.gray2,
        fontSize: 13,
    },

    priceValue: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "bold",
    },

    priceDivider: {
        backgroundColor: colors.gray3,
        height: 1,
        width: "100%",
    },

    totalLabel: {
        color: colors.dark1,
        fontSize: 14,
        fontWeight: "bold",
    },

    totalValue: {
        color: colors.green1,
        fontSize: 16,
        fontWeight: "bold",
    },

    consentCard: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 10,
        padding: 12,
    },

    consentRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
    },

    consentSigned: {
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
    },

    consentCheck: {
        alignItems: "center",
        borderColor: colors.gray1,
        borderRadius: 6,
        borderWidth: 2,
        height: 22,
        justifyContent: "center",
        width: 22,
    },

    consentCheckOn: {
        backgroundColor: colors.green1,
        borderColor: colors.green1,
    },

    consentCheckMark: {
        color: colors.white2,
        fontSize: 12,
        fontWeight: "bold",
    },

    consentText: {
        color: colors.dark1,
        flex: 1,
        fontSize: 12.5,
        lineHeight: 17,
    },

    consentSignedText: {
        flex: 1,
        gap: 2,
    },

    consentTitle: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "bold",
    },

    consentMeta: {
        color: colors.gray2,
        fontSize: 11.5,
        lineHeight: 15,
    },

    consentLink: {
        color: colors.green1,
        fontSize: 12.5,
        fontWeight: "bold",
    },

    consentLinkIndented: {
        color: colors.green1,
        fontSize: 12.5,
        fontWeight: "bold",
        paddingLeft: 32,
    },

    footer: {
        backgroundColor: colors.white1,
        gap: 10,
        paddingHorizontal: 28,
        paddingTop: 12,
    },

    conflictBanner: {
        alignItems: "flex-start",
        backgroundColor: colors.red2,
        borderColor: colors.red1,
        borderRadius: 10,
        borderWidth: 1.5,
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },

    conflictText: {
        flex: 1,
        gap: 2,
    },

    conflictTitle: {
        color: colors.dark1,
        fontSize: 12,
        fontWeight: "bold",
    },

    conflictHint: {
        color: colors.gray2,
        fontSize: 11.5,
        lineHeight: 16,
    },
})
