import { useCallback, useEffect, useMemo, useState } from "react"
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    StyleSheet,
} from "react-native"
import { router, useFocusEffect } from "expo-router"
import { colors } from "../../../utils/constants/colors"
import {
    formatCurrency,
    formatShortDateKey,
    WEEKDAYS_SHORT,
    weekdayOfKey,
} from "../../../utils/format"
import {
    Booking,
    BookingStatus,
    listSpecialistBookings,
    subscribeBookings,
} from "../../../services/bookings"
import { Patient, getPatientById } from "../../../services/patient"
import { BOOKING_STATUS } from "../../../utils/constants/bookingStatus"
import AppHeader from "../../../components/AppHeader"
import Icon from "../../../components/Icon"
import StatusChip from "../../../components/StatusChip"

/** Profissional logado no modo demonstração (Dr. Marcos). */
const SPECIALIST_ID = "1"

type RequestFilter = "all" | "pending" | "closed"

const FILTERS: { key: RequestFilter, label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "pending", label: "Pendentes" },
    { key: "closed", label: "Finalizadas" },
]

const CLOSED_STATUSES: BookingStatus[] = ["completed", "rejected"]

type RequestItem = {
    booking: Booking,
    patient: Patient,
}

export default function ProRequests() {
    const [items, setItems] = useState<RequestItem[] | null>(null)
    const [filter, setFilter] = useState<RequestFilter>("all")

    const load = useCallback(() => {
        let active = true

        listSpecialistBookings(SPECIALIST_ID).then(async (bookings) => {
            const patients = await Promise.all(
                bookings.map((booking) => getPatientById(booking.patientId)),
            )

            if (!active) {
                return
            }

            setItems(
                bookings.flatMap((booking, index) => {
                    const patient = patients[index]

                    return patient ? [{ booking, patient }] : []
                }),
            )
        })

        return () => {
            active = false
        }
    }, [])

    // Relê ao voltar para a aba e a cada mudança de status.
    useFocusEffect(load)
    useEffect(() => subscribeBookings(load), [load])

    const sorted = useMemo(
        () => [...(items ?? [])].sort(compareRequests),
        [items],
    )

    const counts = useMemo(() => ({
        all: sorted.length,
        pending: sorted.filter((item) => item.booking.status === "pending").length,
        closed: sorted.filter(
            (item) => CLOSED_STATUSES.includes(item.booking.status),
        ).length,
    }), [sorted])

    const visible = sorted.filter((item) => {
        if (filter === "pending") {
            return item.booking.status === "pending"
        }

        if (filter === "closed") {
            return CLOSED_STATUSES.includes(item.booking.status)
        }

        return true
    })

    return (
        <View style={styles.container}>
            <AppHeader
                title="Solicitações"
                subtitle="Acompanhe pedidos e confirme seus próximos atendimentos domiciliares."
            />

            {items === null ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filters}
                    >
                        {FILTERS.map((option) => {
                            const active = option.key === filter

                            return (
                                <Pressable
                                    key={option.key}
                                    style={[
                                        styles.filterPill,
                                        active && styles.filterPillActive,
                                    ]}
                                    onPress={() => setFilter(option.key)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: active }}
                                >
                                    <Text style={[
                                        styles.filterText,
                                        active && styles.filterTextActive,
                                    ]}>
                                        {`${option.label} (${counts[option.key]})`}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </ScrollView>

                    {visible.length > 0 ? (
                        <View style={styles.list}>
                            {visible.map((item) => (
                                <RequestCard key={item.booking.id} item={item} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyCard}>
                            <Icon name="clipboard" size={22} color={colors.gray2} />

                            <Text style={styles.emptyTitle}>
                                Nenhuma solicitação neste filtro
                            </Text>
                            <Text style={styles.emptyHint}>
                                Novos pedidos aparecem aqui assim que forem enviados.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    )
}

function RequestCard({ item }: { item: RequestItem }) {
    const { booking, patient } = item
    const closed = CLOSED_STATUSES.includes(booking.status)
    const pending = booking.status === "pending"

    // Recusadas e concluídas abrem o resumo; confirmadas abrem o atendimento.
    const route = pending || closed
        ? `/pro/request/${booking.id}`
        : `/pro/appointment/${booking.id}`

    const action = pending
        ? "Ver solicitação"
        : closed
            ? "Ver resumo"
            : "Ver atendimento"

    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => router.push(route)}
            accessibilityRole="button"
            accessibilityLabel={`${patient.fullName}, ${action}`}
        >
            <View style={styles.cardTop}>
                <StatusChip
                    status={booking.status}
                    label={BOOKING_STATUS[booking.status].requestLabel}
                />

                <Text style={styles.price}>{formatCurrency(booking.price)}</Text>
            </View>

            <Text style={styles.name} numberOfLines={1}>
                {patient.fullName}
            </Text>

            <Text style={styles.meta}>{formatRequestDate(booking)}</Text>

            <Text style={styles.meta} numberOfLines={1}>
                {`${patient.neighborhood} • ${formatDistance(booking.distanceKm)}`}
            </Text>

            <View style={styles.cardFooter}>
                <Text style={styles.action}>{action}</Text>
                <Icon name="chevron-right" size={16} color={colors.blue1} />
            </View>
        </Pressable>
    )
}

/** Pendentes primeiro, depois confirmadas; finalizadas da mais recente. */
function compareRequests(a: RequestItem, b: RequestItem) {
    const rankDiff = statusRank(a.booking.status) - statusRank(b.booking.status)

    if (rankDiff !== 0) {
        return rankDiff
    }

    const keyA = `${a.booking.date} ${a.booking.time}`
    const keyB = `${b.booking.date} ${b.booking.time}`

    return statusRank(a.booking.status) === 2
        ? keyB.localeCompare(keyA)
        : keyA.localeCompare(keyB)
}

function statusRank(status: BookingStatus) {
    if (status === "pending") {
        return 0
    }

    if (status === "accepted" || status === "in_progress") {
        return 1
    }

    return 2
}

/** "Ter, 27/10 • 09:00 – 10:00" */
function formatRequestDate(booking: Booking) {
    const weekday = weekdayOfKey(booking.date)
    const day = weekday === null
        ? formatShortDateKey(booking.date)
        : `${WEEKDAYS_SHORT[weekday]}, ${formatShortDateKey(booking.date)}`

    return `${day} • ${booking.time} – ${addMinutes(booking.time, booking.durationMinutes)}`
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
    },

    scroll: {
        gap: 14,
        paddingBottom: 28,
    },

    filters: {
        gap: 8,
        paddingRight: 8,
    },

    filterPill: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 18,
        borderWidth: 1.5,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },

    filterPillActive: {
        backgroundColor: colors.blue1,
        borderColor: colors.blue1,
    },

    filterText: {
        color: colors.dark1,
        fontSize: 12.5,
        fontWeight: "600",
    },

    filterTextActive: {
        color: colors.white2,
        fontWeight: "bold",
    },

    list: {
        gap: 12,
    },

    card: {
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 14,
        borderWidth: 1.5,
        padding: 14,
    },

    cardPressed: {
        opacity: 0.75,
    },

    cardTop: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    price: {
        color: colors.green1,
        fontSize: 15,
        fontWeight: "bold",
    },

    name: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    meta: {
        color: colors.gray2,
        fontSize: 12,
        lineHeight: 18,
    },

    cardFooter: {
        alignItems: "center",
        borderTopColor: colors.gray3,
        borderTopWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 11,
        paddingTop: 11,
    },

    action: {
        color: colors.blue1,
        fontSize: 12.5,
        fontWeight: "bold",
    },

    emptyCard: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 14,
        borderStyle: "dashed",
        borderWidth: 1.5,
        gap: 6,
        paddingHorizontal: 20,
        paddingVertical: 26,
    },

    emptyTitle: {
        color: colors.dark1,
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },

    emptyHint: {
        color: colors.gray2,
        fontSize: 12,
        lineHeight: 17,
        textAlign: "center",
    },
})
