import { useCallback, useEffect, useState } from "react"
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    StyleSheet,
} from "react-native"
import { router, useFocusEffect } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../utils/constants/colors"
import {
    dateKey,
    formatCurrency,
    formatDurationLong,
    formatRelativeDayKey,
} from "../../utils/format"
import {
    Booking,
    listBookings,
    subscribeBookings,
} from "../../services/bookings"
import { Specialist, getSpecialist } from "../../services/specialists"
import { Patient, getPatient } from "../../services/patient"
import { BOOKING_STATUS } from "../../utils/constants/bookingStatus"
import AppButton from "../../components/AppButton"
import Avatar from "../../components/Avatar"
import Icon, { IconName } from "../../components/Icon"
import LocationHeader from "../../components/LocationHeader"

const UPCOMING_STATUSES = ["pending", "accepted", "in_progress"]

type NextConsult = {
    booking: Booking,
    specialist: Specialist,
}

export default function Home() {
    const insets = useSafeAreaInsets()

    const [patient, setPatient] = useState<Patient | null>(null)
    const [next, setNext] = useState<NextConsult | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [loaded, setLoaded] = useState(false)

    const load = useCallback(() => {
        let active = true

        getPatient().then(async (currentPatient) => {
            const bookings = await listBookings(currentPatient.id)
            const today = dateKey(new Date())

            // Próxima consulta: pendente ou confirmada, a partir de hoje.
            const upcoming = bookings.filter(
                (booking) =>
                    booking.date >= today
                    && UPCOMING_STATUSES.includes(booking.status),
            )

            const specialist = upcoming[0]
                ? await getSpecialist(upcoming[0].specialistId)
                : null

            if (!active) {
                return
            }

            setPatient(currentPatient)
            setNext(
                upcoming[0] && specialist
                    ? { booking: upcoming[0], specialist }
                    : null,
            )
            setHasMore(upcoming.length > 1)
            setLoaded(true)
        })

        return () => {
            active = false
        }
    }, [])

    // Relê ao voltar para a aba e a cada mudança de status.
    useFocusEffect(load)
    useEffect(() => subscribeBookings(load), [load])

    if (!loaded || !patient) {
        return (
            <View style={[styles.container, { paddingTop: insets.top + 18 }]}>
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            </View>
        )
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 18 }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.scroll,
                    { paddingBottom: Math.max(insets.bottom, 12) + 20 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <LocationHeader
                    patientName={patient.name}
                    address={`${patient.street}, ${patient.streetNumber}`}
                    onSettings={() => router.push("/settings")}
                />

                <View style={styles.intro}>
                    <Text style={styles.welcome}>
                        {`Bem-vinda,${"\n"}${firstName(patient.name)}`}
                    </Text>

                    <Text style={styles.question}>Qual sua necessidade hoje?</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Próxima consulta</Text>

                    {next ? (
                        <>
                            <NextConsultCard consult={next} />

                            {hasMore && (
                                <Pressable
                                    onPress={() => router.navigate("/schedule")}
                                    hitSlop={8}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.moreLink}>
                                        Ver todas as consultas
                                    </Text>
                                </Pressable>
                            )}
                        </>
                    ) : (
                        <EmptyNext />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Acesso rápido</Text>

                    <View style={styles.quickGrid}>
                        <QuickAction
                            icon="search"
                            label="Buscar especialista"
                            onPress={() => router.navigate("/search")}
                        />
                        <QuickAction
                            icon="calendar"
                            label="Minha agenda"
                            onPress={() => router.navigate("/schedule")}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

function NextConsultCard({ consult }: { consult: NextConsult }) {
    const { booking, specialist } = consult
    const pending = booking.status === "pending"

    function handlePress() {
        if (pending) {
            router.push({
                pathname: "/booking/sent",
                params: { bookingId: booking.id },
            })
            return
        }

        router.push(`/appointment/${booking.id}`)
    }

    return (
        <Pressable
            style={({ pressed }) => [styles.nextCard, pressed && styles.cardPressed]}
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel={`Próxima consulta com ${specialist.name}`}
        >
            <View style={styles.nextTop}>
                <View style={styles.dateRow}>
                    <Icon name="calendar" size={15} color={colors.green1} />
                    <Text style={styles.dateText}>
                        {`${formatRelativeDayKey(booking.date)} • ${booking.time}`}
                    </Text>
                </View>

                <StatusBadge status={booking.status} />
            </View>

            <View style={styles.specialistRow}>
                <Avatar size={44} />

                <View style={styles.specialistInfo}>
                    <Text style={styles.specialistName}>{specialist.name}</Text>
                    <Text style={styles.specialistMeta} numberOfLines={1}>
                        {`${specialist.specialty} • ${formatDurationLong(booking.durationMinutes)}`}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.nextBottom}>
                <Text style={styles.price}>{formatCurrency(booking.total)}</Text>

                <View style={styles.detailsLink}>
                    <Text style={styles.detailsText}>
                        {pending ? "Acompanhar solicitação" : "Ver detalhes"}
                    </Text>
                    <Icon name="arrow-right" size={15} color={colors.blue1} />
                </View>
            </View>
        </Pressable>
    )
}

function EmptyNext() {
    return (
        <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
                <Icon name="calendar" size={26} color={colors.gray1} />
            </View>

            <Text style={styles.emptyTitle}>Nenhuma consulta agendada</Text>
            <Text style={styles.emptyHint}>
                Busque um especialista para agendar seu próximo atendimento.
            </Text>

            <View style={styles.emptyAction}>
                <AppButton
                    text="Buscar especialista"
                    icon="search"
                    onPress={() => router.navigate("/search")}
                />
            </View>
        </View>
    )
}

function StatusBadge({ status }: { status: Booking["status"] }) {
    const meta = BOOKING_STATUS[status]
    const label = status === "pending" ? meta.label : meta.requestLabel

    return (
        <View style={[styles.statusBadge, { backgroundColor: meta.background }]}>
            <Text style={[styles.statusText, { color: meta.color }]} numberOfLines={1}>
                {label}
            </Text>
        </View>
    )
}

type QuickActionProps = {
    icon: IconName,
    label: string,
    onPress: () => void,
}

function QuickAction({ icon, label, onPress }: QuickActionProps) {
    return (
        <Pressable
            style={({ pressed }) => [styles.quickCard, pressed && styles.cardPressed]}
            onPress={onPress}
            accessibilityRole="button"
        >
            <View style={styles.quickIcon}>
                <Icon name={icon} size={20} color={colors.blue1} />
            </View>

            <Text style={styles.quickLabel}>{label}</Text>
        </Pressable>
    )
}

/** "Maria das Dores" -> "Maria" */
function firstName(name: string) {
    return name.trim().split(/\s+/)[0] ?? name
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

    scroll: {
        gap: 22,
    },

    intro: {
        gap: 8,
    },

    welcome: {
        color: colors.dark1,
        fontSize: 38,
        fontWeight: "800",
        letterSpacing: -1,
        lineHeight: 42,
    },

    question: {
        color: colors.gray2,
        fontSize: 18,
        fontWeight: "500",
    },

    section: {
        gap: 10,
    },

    sectionTitle: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    nextCard: {
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 16,
        borderWidth: 1.5,
        gap: 12,
        padding: 14,
    },

    cardPressed: {
        backgroundColor: colors.blue2,
    },

    nextTop: {
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
        justifyContent: "space-between",
    },

    dateRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 6,
    },

    dateText: {
        color: colors.green1,
        fontSize: 13,
        fontWeight: "bold",
    },

    statusBadge: {
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },

    statusText: {
        fontSize: 10,
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
        fontSize: 16,
        fontWeight: "bold",
    },

    specialistMeta: {
        color: colors.gray2,
        fontSize: 12.5,
    },

    divider: {
        backgroundColor: colors.gray3,
        height: 1,
        width: "100%",
    },

    nextBottom: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },

    price: {
        color: colors.dark1,
        fontSize: 14,
        fontWeight: "bold",
    },

    detailsLink: {
        alignItems: "center",
        flexDirection: "row",
        gap: 5,
    },

    detailsText: {
        color: colors.blue1,
        fontSize: 13,
        fontWeight: "bold",
    },

    moreLink: {
        color: colors.blue1,
        fontSize: 13,
        fontWeight: "bold",
        paddingVertical: 4,
        textAlign: "center",
    },

    emptyCard: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 20,
    },

    emptyIcon: {
        alignItems: "center",
        backgroundColor: colors.white1,
        borderColor: colors.gray3,
        borderRadius: 28,
        borderWidth: 1.5,
        height: 56,
        justifyContent: "center",
        marginBottom: 12,
        width: 56,
    },

    emptyTitle: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
        textAlign: "center",
    },

    emptyHint: {
        color: colors.gray2,
        fontSize: 12.5,
        lineHeight: 18,
        marginTop: 5,
        textAlign: "center",
    },

    emptyAction: {
        marginTop: 16,
        width: "100%",
    },

    quickGrid: {
        flexDirection: "row",
        gap: 12,
    },

    quickCard: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 14,
        borderWidth: 1.5,
        flex: 1,
        gap: 8,
        justifyContent: "center",
        minHeight: 96,
        paddingHorizontal: 10,
        paddingVertical: 14,
    },

    quickIcon: {
        alignItems: "center",
        backgroundColor: colors.blue2,
        borderRadius: 18,
        height: 36,
        justifyContent: "center",
        width: 36,
    },

    quickLabel: {
        color: colors.blue1,
        fontSize: 13,
        fontWeight: "bold",
        textAlign: "center",
    },
})
