import { useEffect, useState } from "react"
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../utils/constants/colors"
import { formatCurrency, formatDateKey } from "../../utils/format"
import { Specialist, getSpecialist } from "../../services/specialists"
import { Patient, getPatient } from "../../services/patient"
import { calculateTotals, createBooking } from "../../services/bookings"
import BackHeader from "../../components/BackHeader"
import AppButton from "../../components/AppButton"
import Icon, { IconName } from "../../components/Icon"

const NEEDS = "Auxílio para locomoção (andador). Sequelas leves de AVC, foco em fisioterapia motora."

export default function BookingReview() {
    const { specialistId, date, time } = useLocalSearchParams<{
        specialistId: string,
        date: string,
        time: string,
    }>()
    const insets = useSafeAreaInsets()

    const [specialist, setSpecialist] = useState<Specialist | null>(null)
    const [patient, setPatient] = useState<Patient | null>(null)
    const [loaded, setLoaded] = useState(false)
    const [sending, setSending] = useState(false)

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

    async function handleSubmit() {
        if (!specialist || !patient || sending) {
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

            router.replace({
                pathname: "/booking/sent",
                params: {
                    specialistId: booking.specialistId,
                    date: booking.date,
                    time: booking.time,
                },
            })
        } catch {
            setSending(false)
        }
    }

    const totals = specialist ? calculateTotals(specialist) : null

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
                    </ScrollView>

                    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
                        <AppButton
                            text={sending ? "Enviando..." : "Enviar Solicitação"}
                            onPress={handleSubmit}
                        />
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

    footer: {
        backgroundColor: colors.white1,
        paddingHorizontal: 28,
        paddingTop: 12,
    },
})
