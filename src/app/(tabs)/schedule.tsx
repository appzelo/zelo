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
import { dateKey, formatCurrency, formatDateKey } from "../../utils/format"
import {
    Booking,
    BookingStatus,
    listBookings,
    subscribeBookings,
} from "../../services/bookings"
import { Specialist, getSpecialist } from "../../services/specialists"
import { getPatient } from "../../services/patient"
import AppButton from "../../components/AppButton"
import Avatar from "../../components/Avatar"
import Icon from "../../components/Icon"

type ScheduleItem = {
    booking: Booking,
    specialist: Specialist,
}

const STATUS: Record<BookingStatus, { label: string, color: string, background: string }> = {
    pending: {
        label: "Aguardando confirmação",
        color: colors.yellow1,
        background: colors.yellow2,
    },
    accepted: {
        label: "Confirmado",
        color: colors.green1,
        background: colors.green2,
    },
    rejected: {
        label: "Recusado",
        color: colors.red1,
        background: colors.red2,
    },
}

export default function Schedule() {
    const insets = useSafeAreaInsets()

    const [items, setItems] = useState<ScheduleItem[] | null>(null)

    const load = useCallback(() => {
        let active = true

        getPatient()
            .then((patient) => listBookings(patient.id))
            .then(async (found) => {
                const specialists = await Promise.all(
                    found.map((booking) => getSpecialist(booking.specialistId)),
                )

                if (!active) {
                    return
                }

                // Agendamento de profissional removido do catálogo não entra na lista.
                setItems(
                    found.flatMap((booking, index) => {
                        const specialist = specialists[index]

                        return specialist ? [{ booking, specialist }] : []
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

    const today = dateKey(new Date())
    const upcoming = items?.filter((item) => item.booking.date >= today) ?? []
    const past = (items?.filter((item) => item.booking.date < today) ?? []).reverse()

    return (
        <View style={[styles.container, { paddingTop: insets.top + 18 }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Agenda</Text>
                    <Text style={styles.subtitle}>Seus atendimentos agendados</Text>
                </View>

                {items === null && (
                    <View style={styles.centered}>
                        <ActivityIndicator color={colors.blue1} />
                    </View>
                )}

                {items?.length === 0 && (
                    <View style={styles.centered}>
                        <View style={styles.emptyIcon}>
                            <Icon name="calendar" size={30} color={colors.gray1} />
                        </View>

                        <Text style={styles.emptyTitle}>Nenhum atendimento agendado</Text>
                        <Text style={styles.emptyHint}>
                            Busque um especialista para solicitar seu primeiro atendimento.
                        </Text>

                        <View style={styles.emptyAction}>
                            <AppButton
                                text="Buscar especialista"
                                onPress={() => router.navigate("/search")}
                            />
                        </View>
                    </View>
                )}

                {items !== null && items.length > 0 && (
                    <ScrollView
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    >
                        <Section
                            title="Próximos"
                            items={upcoming}
                        />

                        <Section
                            title="Anteriores"
                            items={past}
                        />
                    </ScrollView>
                )}
            </View>
        </View>
    )
}

type SectionProps = {
    title: string,
    items: ScheduleItem[],
}

function Section({ title, items }: SectionProps) {
    // Seção vazia não ocupa espaço: "Anteriores" só aparece quando há histórico.
    if (items.length === 0) {
        return null
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>

            {items.map((item) => (
                <ScheduleCard
                    key={item.booking.id}
                    booking={item.booking}
                    specialist={item.specialist}
                />
            ))}
        </View>
    )
}

type ScheduleCardProps = {
    booking: Booking,
    specialist: Specialist,
}

function ScheduleCard({ booking, specialist }: ScheduleCardProps) {
    const status = STATUS[booking.status]

    function handlePress() {
        // Confirmado abre a Consulta Confirmada; os outros estados reaproveitam
        // a tela de acompanhamento da solicitação.
        if (booking.status === "accepted") {
            router.push(`/appointment/${booking.id}`)
            return
        }

        router.push({
            pathname: "/booking/sent",
            params: { bookingId: booking.id },
        })
    }

    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={handlePress}
        >
            <View style={styles.cardTop}>
                <Avatar size={42} />

                <View style={styles.cardInfo}>
                    <Text style={styles.name}>{specialist.name}</Text>
                    <Text style={styles.specialty}>{specialist.specialty}</Text>
                </View>
            </View>

            <View style={styles.divider}></View>

            <View style={styles.dateRow}>
                <Icon name="calendar" size={14} color={colors.green1} />
                <Text style={styles.date}>{formatDateKey(booking.date, booking.time)}</Text>
            </View>

            <View style={styles.cardBottom}>
                <View style={[styles.badge, { backgroundColor: status.background }]}>
                    <Text style={[styles.badgeText, { color: status.color }]}>
                        {status.label}
                    </Text>
                </View>

                <Text style={styles.total}>{formatCurrency(booking.total)}</Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white1,
        flex: 1,
        width: "100%",
    },

    content: {
        flex: 1,
        paddingHorizontal: 34,
    },

    header: {
        gap: 4,
        marginBottom: 20,
    },

    title: {
        color: colors.blue1,
        fontSize: 26,
        fontWeight: "bold",
    },

    subtitle: {
        color: colors.gray2,
        fontSize: 13,
    },

    centered: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingBottom: 40,
    },

    emptyIcon: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 32,
        borderWidth: 1.5,
        height: 64,
        justifyContent: "center",
        marginBottom: 14,
        width: 64,
    },

    emptyTitle: {
        color: colors.dark1,
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },

    emptyHint: {
        color: colors.gray2,
        fontSize: 13,
        lineHeight: 18,
        marginTop: 6,
        textAlign: "center",
    },

    emptyAction: {
        marginTop: 22,
        width: "100%",
    },

    list: {
        gap: 22,
        paddingBottom: 24,
    },

    section: {
        gap: 12,
    },

    sectionTitle: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    card: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 14,
        width: "100%",
    },

    cardPressed: {
        opacity: 0.85,
    },

    cardTop: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
    },

    cardInfo: {
        flex: 1,
        gap: 2,
    },

    name: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    specialty: {
        color: colors.gray2,
        fontSize: 12.5,
    },

    divider: {
        backgroundColor: colors.gray3,
        height: 1,
        marginVertical: 10,
        width: "100%",
    },

    dateRow: {
        alignItems: "flex-start",
        flexDirection: "row",
        gap: 6,
    },

    date: {
        color: colors.gray2,
        flex: 1,
        fontSize: 12,
        lineHeight: 16,
    },

    cardBottom: {
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        justifyContent: "space-between",
        marginTop: 10,
    },

    badge: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    badgeText: {
        fontSize: 10.5,
        fontWeight: "bold",
    },

    total: {
        color: colors.blue1,
        fontSize: 14,
        fontWeight: "bold",
    },
})
