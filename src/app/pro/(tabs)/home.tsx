import { useCallback, useEffect, useState } from "react"
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Switch,
    ActivityIndicator,
    StyleSheet,
} from "react-native"
import { router, useFocusEffect } from "expo-router"
import { colors } from "../../../utils/constants/colors"
import {
    dateKey,
    formatDurationLong,
    formatLongDateKey,
    formatWeekdayDateKey,
    isTodayKey,
    weekdayOfKey,
} from "../../../utils/format"
import {
    Booking,
    listSpecialistBookings,
    subscribeBookings,
} from "../../../services/bookings"
import { Specialist, getSpecialist } from "../../../services/specialists"
import { Patient, getPatientById } from "../../../services/patient"
import {
    SpecialistAvailability,
    getSpecialistAvailability,
    saveSpecialistAvailability,
} from "../../../services/specialistAvailability"
import AppHeader from "../../../components/AppHeader"
import StatTile from "../../../components/StatTile"
import Avatar from "../../../components/Avatar"
import Icon, { IconName } from "../../../components/Icon"

/** Profissional logado no modo demonstração (Dr. Marcos). */
const SPECIALIST_ID = "1"

const CONFIRMED_STATUSES = ["accepted", "in_progress"]

type Visit = {
    booking: Booking,
    patient: Patient,
}

export default function ProHome() {
    const [specialist, setSpecialist] = useState<Specialist | null>(null)
    const [visits, setVisits] = useState<Visit[] | null>(null)
    const [availability, setAvailability] = useState<SpecialistAvailability | null>(null)

    const load = useCallback(() => {
        let mounted = true

        Promise.all([
            getSpecialist(SPECIALIST_ID),
            listSpecialistBookings(SPECIALIST_ID),
            getSpecialistAvailability(SPECIALIST_ID),
        ]).then(async ([foundSpecialist, bookings, foundAvailability]) => {
            const patients = await Promise.all(
                bookings.map((booking) => getPatientById(booking.patientId)),
            )

            if (!mounted) {
                return
            }

            setSpecialist(foundSpecialist)
            setAvailability(foundAvailability)
            setVisits(
                bookings.flatMap((booking, index) => {
                    const patient = patients[index]

                    return patient ? [{ booking, patient }] : []
                }),
            )
        })

        return () => {
            mounted = false
        }
    }, [])

    // Relê ao voltar para a aba e a cada mudança de status.
    useFocusEffect(load)
    useEffect(() => subscribeBookings(load), [load])

    const today = dateKey(new Date())
    const todayWeekday = weekdayOfKey(today)
    const todayHours = availability && todayWeekday !== null
        ? availability.workingHours[todayWeekday]
        : null

    const availableToday = todayHours?.enabled === true
        && !(availability?.blockedDates.includes(today) ?? false)

    async function handleAvailabilityChange(value: boolean) {
        if (!availability || todayWeekday === null) {
            return
        }

        const currentHours = availability.workingHours[todayWeekday]

        // Desligar bloqueia só o dia de hoje; ligar libera o dia e garante
        // que o dia da semana esteja ativo na agenda.
        const next: SpecialistAvailability = {
            ...availability,
            workingHours: {
                ...availability.workingHours,
                [todayWeekday]: {
                    ...currentHours,
                    enabled: value ? true : currentHours.enabled,
                },
            },
            blockedDates: value
                ? availability.blockedDates.filter((key) => key !== today)
                : Array.from(new Set([...availability.blockedDates, today])),
        }

        setAvailability(next)

        await saveSpecialistAvailability(next)
    }

    const pendingRequests = (visits ?? []).filter(
        (visit) => visit.booking.status === "pending",
    )

    const upcomingVisits = (visits ?? []).filter(
        (visit) =>
            visit.booking.date >= today
            && CONFIRMED_STATUSES.includes(visit.booking.status),
    )

    const nextVisits = upcomingVisits.slice(0, 3)
    const allVisitsToday = nextVisits.every((visit) => isTodayKey(visit.booking.date))

    return (
        <View style={styles.container}>
            <AppHeader
                title={specialist ? `Olá, ${shortName(specialist.name)}` : "Início"}
                onSettings={() => router.push("/pro/settings")}
            />

            {visits === null || !specialist || !availability ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.profile}>
                        <Avatar size={50} />

                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{specialist.name}</Text>
                            <Text style={styles.profileSpecialty}>{specialist.specialty}</Text>
                            <Text style={styles.profileLicense}>
                                {`${specialist.license} • Ativo e regular`}
                            </Text>
                        </View>
                    </View>

                    <View
                        style={[
                            styles.availability,
                            !availableToday && styles.availabilityOff,
                        ]}
                    >
                        <View style={styles.availabilityInfo}>
                            <Text
                                style={[
                                    styles.availabilityTitle,
                                    !availableToday && styles.availabilityTitleOff,
                                ]}
                            >
                                {availableToday ? "Disponível hoje" : "Indisponível hoje"}
                            </Text>
                            <Text style={styles.availabilityDate}>
                                {formatLongDateKey(today)}
                            </Text>
                        </View>

                        <Switch
                            value={availableToday}
                            onValueChange={handleAvailabilityChange}
                            trackColor={{ false: colors.gray1, true: colors.green1 }}
                            thumbColor={colors.white2}
                            ios_backgroundColor={colors.gray1}
                            style={styles.switch}
                        />
                    </View>

                    <View style={styles.stats}>
                        <StatTile
                            value={String(pendingRequests.length)}
                            label="Pedidos pendentes"
                        />
                        <StatTile
                            value={String(upcomingVisits.length)}
                            label="Próximas visitas"
                        />
                    </View>

                    {pendingRequests.length > 0 && (
                        <RequestBanner
                            requests={pendingRequests}
                            onPress={() => router.navigate("/pro/requests")}
                        />
                    )}

                    <View style={styles.section}>
                        <SectionHeader
                            title="Próximas visitas"
                            action="Ver agenda"
                            onAction={() => router.navigate("/pro/agenda")}
                        />

                        <View style={styles.visitsCard}>
                            {nextVisits.length > 0 && (
                                <View style={styles.visitsBadge}>
                                    <Text style={styles.visitsBadgeText}>
                                        {allVisitsToday ? "Hoje • Confirmadas" : "Próximas • Confirmadas"}
                                    </Text>
                                </View>
                            )}

                            {nextVisits.length > 0 ? (
                                nextVisits.map((visit, index) => (
                                    <View key={visit.booking.id}>
                                        {index > 0 && <View style={styles.divider} />}

                                        <UpcomingVisitRow visit={visit} />
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyVisits}>
                                    Nenhuma visita confirmada para os próximos dias.
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Acesso rápido</Text>

                        <View style={styles.quickGrid}>
                            <QuickAction
                                icon="calendar"
                                label="Agenda"
                                onPress={() => router.navigate("/pro/agenda")}
                            />
                            <QuickAction
                                icon="clipboard"
                                label="Pedidos"
                                onPress={() => router.navigate("/pro/requests")}
                            />
                            <QuickAction
                                icon="settings"
                                label="Preferências"
                                onPress={() => router.push("/pro/settings")}
                            />
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    )
}

type RequestBannerProps = {
    requests: Visit[],
    onPress: () => void,
}

function RequestBanner({ requests, onPress }: RequestBannerProps) {
    const names = joinNames(requests.map((visit) => visit.patient.name.split(" ")[0]))
    const date = formatWeekdayDateKey(requests[0].booking.date)

    return (
        <View style={styles.requestCard}>
            <View style={styles.requestTop}>
                <Icon name="notifications" size={20} color={colors.green1} />

                <View style={styles.requestInfo}>
                    <Text style={styles.requestTitle}>
                        {requests.length === 1
                            ? "1 solicitação aguarda resposta"
                            : `${requests.length} solicitações aguardam resposta`}
                    </Text>
                    <Text style={styles.requestSubtitle}>{`${names} • ${date}`}</Text>
                </View>
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.reviewButton,
                    pressed && styles.reviewButtonPressed,
                ]}
                onPress={onPress}
                accessibilityRole="button"
            >
                <Icon name="arrow-right" size={17} color={colors.blue1} />
                <Text style={styles.reviewText}>Revisar solicitações</Text>
            </Pressable>
        </View>
    )
}

function UpcomingVisitRow({ visit }: { visit: Visit }) {
    const { booking, patient } = visit

    return (
        <View style={styles.visitRow}>
            <Icon name="clock" size={17} color={colors.green1} />

            <View style={styles.visitInfo}>
                <Text style={styles.visitTitle} numberOfLines={1}>
                    {`${booking.time} • ${patient.fullName}`}
                </Text>
                <Text style={styles.visitMeta} numberOfLines={1}>
                    {`${patient.neighborhood} • ${formatDistance(booking.distanceKm)} • ${formatDurationLong(booking.durationMinutes)}`}
                </Text>
            </View>
        </View>
    )
}

type SectionHeaderProps = {
    title: string,
    action?: string,
    onAction?: () => void,
}

function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>

            {action && (
                <Pressable onPress={onAction} hitSlop={8}>
                    <Text style={styles.sectionAction}>{action}</Text>
                </Pressable>
            )}
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
            style={({ pressed }) => [styles.quickCard, pressed && styles.quickCardPressed]}
            onPress={onPress}
            accessibilityRole="button"
        >
            <View style={styles.quickIcon}>
                <Icon name={icon} size={18} color={colors.blue1} />
            </View>

            <Text style={styles.quickLabel}>{label}</Text>
        </Pressable>
    )
}

/** "Dr. Marcos Silva" -> "Dr. Marcos" */
function shortName(name: string) {
    return name.trim().split(/\s+/).slice(0, 2).join(" ")
}

/** "Helena e José" | "Helena, José e mais 1" */
function joinNames(names: string[]) {
    if (names.length <= 2) {
        return names.join(" e ")
    }

    return `${names.slice(0, 2).join(", ")} e mais ${names.length - 2}`
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
        gap: 16,
        paddingBottom: 28,
    },

    profile: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 2,
    },

    profileInfo: {
        flex: 1,
        gap: 1,
    },

    profileName: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    profileSpecialty: {
        color: colors.green1,
        fontSize: 12.5,
        fontWeight: "500",
    },

    profileLicense: {
        color: colors.green1,
        fontSize: 11.5,
        fontWeight: "bold",
        marginTop: 1,
    },

    availability: {
        alignItems: "center",
        backgroundColor: colors.green3,
        borderColor: colors.green1,
        borderRadius: 14,
        borderWidth: 1.5,
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },

    availabilityOff: {
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
    },

    availabilityInfo: {
        flex: 1,
        gap: 2,
    },

    availabilityTitle: {
        color: colors.green1,
        fontSize: 15,
        fontWeight: "bold",
    },

    availabilityTitleOff: {
        color: colors.gray2,
    },

    availabilityDate: {
        color: colors.gray2,
        fontSize: 12.5,
    },

    switch: {
        transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },

    stats: {
        flexDirection: "row",
        gap: 12,
    },

    requestCard: {
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 12,
        padding: 14,
    },

    requestTop: {
        alignItems: "flex-start",
        flexDirection: "row",
        gap: 10,
    },

    requestInfo: {
        flex: 1,
        gap: 2,
    },

    requestTitle: {
        color: colors.dark1,
        fontSize: 13.5,
        fontWeight: "bold",
        lineHeight: 18,
    },

    requestSubtitle: {
        color: colors.gray2,
        fontSize: 12,
    },

    reviewButton: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 10,
        borderWidth: 1.5,
        flexDirection: "row",
        gap: 8,
        height: 46,
        justifyContent: "center",
    },

    reviewButtonPressed: {
        backgroundColor: colors.blue2,
    },

    reviewText: {
        color: colors.blue1,
        fontSize: 14.5,
        fontWeight: "bold",
    },

    section: {
        gap: 10,
    },

    sectionHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },

    sectionTitle: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    sectionAction: {
        color: colors.blue1,
        fontSize: 13,
        fontWeight: "bold",
    },

    visitsCard: {
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 12,
        borderWidth: 1.5,
        paddingBottom: 4,
        paddingHorizontal: 14,
        paddingTop: 12,
    },

    visitsBadge: {
        alignSelf: "flex-start",
        backgroundColor: colors.green2,
        borderRadius: 6,
        marginBottom: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    visitsBadgeText: {
        color: colors.green1,
        fontSize: 10,
        fontWeight: "bold",
    },

    visitRow: {
        alignItems: "flex-start",
        flexDirection: "row",
        gap: 9,
        paddingVertical: 10,
    },

    visitInfo: {
        flex: 1,
        gap: 2,
    },

    visitTitle: {
        color: colors.dark1,
        fontSize: 13.5,
        fontWeight: "bold",
        lineHeight: 18,
    },

    visitMeta: {
        color: colors.gray2,
        fontSize: 12,
    },

    divider: {
        backgroundColor: colors.gray3,
        height: 1,
        width: "100%",
    },

    emptyVisits: {
        color: colors.gray2,
        fontSize: 12.5,
        paddingVertical: 10,
    },

    quickGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },

    quickCard: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 8,
        justifyContent: "center",
        minHeight: 88,
        paddingVertical: 14,
        width: "47.5%",
    },

    quickCardPressed: {
        backgroundColor: colors.blue2,
    },

    quickIcon: {
        alignItems: "center",
        backgroundColor: colors.blue2,
        borderRadius: 17,
        height: 34,
        justifyContent: "center",
        width: 34,
    },

    quickLabel: {
        color: colors.blue1,
        fontSize: 13.5,
        fontWeight: "bold",
    },
})
