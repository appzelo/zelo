import { useEffect, useMemo, useState } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../utils/constants/colors"
import { formatCurrency, nextDays } from "../../utils/format"
import { Specialist, getAvailability, getSpecialist } from "../../services/specialists"
import BackHeader from "../../components/BackHeader"
import AppButton from "../../components/AppButton"
import Avatar from "../../components/Avatar"

export default function SpecialistProfile() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const insets = useSafeAreaInsets()
    const days = useMemo(() => nextDays(5), [])

    const [specialist, setSpecialist] = useState<Specialist | null>(null)
    const [slots, setSlots] = useState<string[]>([])
    const [loaded, setLoaded] = useState(false)
    const [selectedDay, setSelectedDay] = useState(days[0].key)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    useEffect(() => {
        let active = true

        Promise.all([getSpecialist(id), getAvailability(id)]).then(([found, availableSlots]) => {
            if (!active) {
                return
            }

            setSpecialist(found)
            setSlots(availableSlots)
            setSelectedTime(availableSlots[0] ?? null)
            setLoaded(true)
        })

        return () => {
            active = false
        }
    }, [id])

    function handleNext() {
        if (!specialist || !selectedTime) {
            return
        }

        router.push({
            pathname: "/booking/review",
            params: {
                specialistId: specialist.id,
                date: selectedDay,
                time: selectedTime,
            },
        })
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackHeader text="Perfil do Profissional" />
            </View>

            {!loaded && (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            )}

            {loaded && !specialist && (
                <View style={styles.centered}>
                    <Text style={styles.empty}>Especialista não encontrado.</Text>
                </View>
            )}

            {specialist && (
                <>
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.profileCard}>
                            <Avatar size={60} />

                            <View style={styles.profileInfo}>
                                <Text style={styles.name}>{specialist.name}</Text>
                                <Text style={styles.specialty}>{specialist.specialty}</Text>

                                <View style={styles.licenseRow}>
                                    <Text style={styles.license} numberOfLines={1}>
                                        {specialist.license}
                                    </Text>
                                    <Text style={styles.star}>★</Text>
                                    <Text style={styles.rating}>{specialist.rating.toFixed(1)}</Text>
                                    <Text style={styles.reviews} numberOfLines={1}>
                                        {`(${specialist.reviews} avaliações)`}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.tiles}>
                            <InfoTile label="Distância" value={`${specialist.distanceKm} km`} />
                            <InfoTile
                                label="Valor Hora"
                                value={formatCurrency(specialist.pricePerHour)}
                                highlight
                            />
                            <InfoTile label="Atuação" value={`Até ${specialist.maxDistanceKm}km`} />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Pagamentos Aceitos</Text>

                            <View style={styles.chipRow}>
                                {specialist.paymentMethods.map((method) => (
                                    <View key={method} style={styles.chip}>
                                        <Text style={styles.chipText}>{method}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {`Selecione o Dia (${(days.find((day) => day.key === selectedDay) ?? days[0]).month})`}
                            </Text>

                            <View style={styles.dayRow}>
                                {days.map((day) => {
                                    const active = day.key === selectedDay

                                    return (
                                        <Pressable
                                            key={day.key}
                                            style={[styles.dayCard, active && styles.dayCardActive]}
                                            onPress={() => setSelectedDay(day.key)}
                                        >
                                            <Text style={[styles.dayWeekday, active && styles.dayTextActive]}>
                                                {day.weekday}
                                            </Text>
                                            <Text style={[styles.dayNumber, active && styles.dayTextActive]}>
                                                {day.day}
                                            </Text>
                                        </Pressable>
                                    )
                                })}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Horários Disponíveis</Text>

                            <View style={styles.slotRow}>
                                {slots.map((slot) => {
                                    const active = slot === selectedTime

                                    return (
                                        <Pressable
                                            key={slot}
                                            style={[styles.slot, active && styles.slotActive]}
                                            onPress={() => setSelectedTime(slot)}
                                        >
                                            <Text style={[styles.slotText, active && styles.slotTextActive]}>
                                                {slot}
                                            </Text>
                                        </Pressable>
                                    )
                                })}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
                        <AppButton
                            text="Avançar para Revisão"
                            onPress={handleNext}
                        />
                    </View>
                </>
            )}
        </View>
    )
}

type InfoTileProps = {
    label: string,
    value: string,
    highlight?: boolean,
}

function InfoTile({ label, value, highlight = false }: InfoTileProps) {
    return (
        <View style={styles.tile}>
            <Text style={styles.tileLabel}>{label}</Text>
            <Text style={[styles.tileValue, highlight && styles.tileValueHighlight]}>
                {value}
            </Text>
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
    },

    empty: {
        color: colors.gray2,
        fontSize: 14,
    },

    profileCard: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 12,
        borderWidth: 1.5,
        flexDirection: "row",
        gap: 12,
        padding: 14,
    },

    profileInfo: {
        flex: 1,
        gap: 3,
    },

    name: {
        color: colors.dark1,
        fontSize: 17,
        fontWeight: "bold",
    },

    specialty: {
        color: colors.green1,
        fontSize: 13,
        fontWeight: "500",
    },

    licenseRow: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 3,
    },

    license: {
        color: colors.green1,
        fontSize: 11,
        fontWeight: "bold",
    },

    star: {
        color: colors.yellow1,
        fontSize: 11,
        marginLeft: 2,
    },

    rating: {
        color: colors.dark1,
        fontSize: 11,
        fontWeight: "bold",
    },

    reviews: {
        color: colors.gray2,
        fontSize: 11,
    },

    tiles: {
        flexDirection: "row",
        gap: 10,
    },

    tile: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 10,
        borderWidth: 1.5,
        flex: 1,
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 9,
    },

    tileLabel: {
        color: colors.gray2,
        fontSize: 11,
    },

    tileValue: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "bold",
    },

    tileValueHighlight: {
        color: colors.green1,
    },

    section: {
        gap: 10,
    },

    sectionTitle: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },

    chip: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 8,
        borderWidth: 1.5,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },

    chipText: {
        color: colors.dark1,
        fontSize: 12.5,
    },

    dayRow: {
        flexDirection: "row",
        gap: 8,
    },

    dayCard: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 10,
        borderWidth: 1.5,
        flex: 1,
        gap: 6,
        paddingVertical: 9,
    },

    dayCardActive: {
        backgroundColor: colors.green1,
        borderColor: colors.green1,
    },

    dayWeekday: {
        color: colors.gray2,
        fontSize: 11,
    },

    dayNumber: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    dayTextActive: {
        color: colors.white2,
    },

    slotRow: {
        flexDirection: "row",
        gap: 10,
    },

    slot: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 8,
        borderWidth: 1.5,
        flex: 1,
        paddingVertical: 10,
    },

    slotActive: {
        backgroundColor: colors.green2,
        borderColor: colors.green1,
    },

    slotText: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "bold",
    },

    slotTextActive: {
        color: colors.green1,
    },

    footer: {
        backgroundColor: colors.white1,
        paddingHorizontal: 28,
        paddingTop: 12,
    },
})
