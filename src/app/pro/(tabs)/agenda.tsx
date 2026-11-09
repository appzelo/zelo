import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
    formatDuration,
    formatLongDateKey,
    isTodayKey,
    WEEKDAYS_LONG,
    weekdayOfKey,
} from "../../../utils/format"
import {
    Booking,
    listSpecialistBookings,
    subscribeBookings,
} from "../../../services/bookings"
import { Patient, getPatientById } from "../../../services/patient"
import {
    DayAvailability,
    SpecialistAvailability,
    getSpecialistAvailability,
    saveSpecialistAvailability,
} from "../../../services/specialistAvailability"
import AppHeader from "../../../components/AppHeader"
import AppButton from "../../../components/AppButton"
import Icon from "../../../components/Icon"
import MonthCalendar from "../../../components/MonthCalendar"
import RangeSlider from "../../../components/RangeSlider"
import StatusChip from "../../../components/StatusChip"
import WorkingHoursModal from "../../../components/WorkingHoursModal"

/** Profissional logado no modo demonstração (Dr. Marcos). */
const SPECIALIST_ID = "1"

const CONFIRMED_STATUSES: Booking["status"][] = ["accepted", "in_progress", "completed"]

/** Ordem de exibição da semana: segunda a domingo. */
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

type Visit = {
    booking: Booking,
    patient: Patient,
}

type HoursSummaryRow = {
    label: string,
    value: string,
    enabled: boolean,
}

export default function ProAgenda() {
    const [availability, setAvailability] = useState<SpecialistAvailability | null>(null)
    const [visits, setVisits] = useState<Visit[] | null>(null)
    const [selectedKey, setSelectedKey] = useState(() => dateKey(new Date()))
    const [month, setMonth] = useState(() => {
        const today = new Date()

        return new Date(today.getFullYear(), today.getMonth(), 1, 12)
    })
    const [editorOpen, setEditorOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    // Evita que voltar para a aba descarte alterações ainda não salvas.
    const dirtyRef = useRef(false)

    const loadAvailability = useCallback(() => {
        let active = true

        getSpecialistAvailability(SPECIALIST_ID).then((found) => {
            if (active && !dirtyRef.current) {
                setAvailability(found)
            }
        })

        return () => {
            active = false
        }
    }, [])

    useFocusEffect(loadAvailability)

    useEffect(() => {
        return () => {
            if (savedTimer.current) {
                clearTimeout(savedTimer.current)
            }
        }
    }, [])

    const loadVisits = useCallback(() => {
        let active = true

        listSpecialistBookings(SPECIALIST_ID).then(async (bookings) => {
            const patients = await Promise.all(
                bookings.map((booking) => getPatientById(booking.patientId)),
            )

            if (!active) {
                return
            }

            setVisits(
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
    useFocusEffect(loadVisits)
    useEffect(() => subscribeBookings(loadVisits), [loadVisits])

    const confirmedVisits = useMemo(
        () => (visits ?? []).filter(
            (visit) => CONFIRMED_STATUSES.includes(visit.booking.status),
        ),
        [visits],
    )

    const markedDates = useMemo(
        () => Array.from(new Set(confirmedVisits.map((visit) => visit.booking.date))),
        [confirmedVisits],
    )

    const selectedVisits = useMemo(
        () => confirmedVisits
            .filter((visit) => visit.booking.date === selectedKey)
            .sort((a, b) => a.booking.time.localeCompare(b.booking.time)),
        [confirmedVisits, selectedKey],
    )

    const hoursSummary = useMemo(
        () => availability ? summarizeHours(availability.workingHours) : [],
        [availability],
    )

    const weekday = weekdayOfKey(selectedKey)
    const dayHours = availability && weekday !== null
        ? availability.workingHours[weekday]
        : null
    const blocked = availability?.blockedDates.includes(selectedKey) ?? false
    const loading = availability === null || visits === null

    function markDirty() {
        dirtyRef.current = true
        setSaved(false)

        if (savedTimer.current) {
            clearTimeout(savedTimer.current)
            savedTimer.current = null
        }
    }

    function handleChangeMonth(next: Date) {
        setMonth(next)

        const nextKey = dateKey(next)

        // Ao trocar de mês, seleciona o primeiro dia se o dia atual saiu de vista.
        if (selectedKey.slice(0, 7) !== nextKey.slice(0, 7)) {
            setSelectedKey(nextKey)
        }
    }

    function handleToggleBlock(value: boolean) {
        markDirty()

        setAvailability((current) => {
            if (!current) {
                return current
            }

            return {
                ...current,
                blockedDates: value
                    ? Array.from(new Set([...current.blockedDates, selectedKey]))
                    : current.blockedDates.filter((key) => key !== selectedKey),
            }
        })
    }

    function handleApplyHours(workingHours: Record<number, DayAvailability>) {
        markDirty()

        setAvailability((current) => current ? { ...current, workingHours } : current)
    }

    function handleRadius(value: number) {
        markDirty()

        setAvailability((current) => current ? { ...current, radiusKm: value } : current)
    }

    async function handleSave() {
        if (!availability || saving) {
            return
        }

        setSaving(true)

        try {
            const savedAvailability = await saveSpecialistAvailability(availability)

            dirtyRef.current = false
            setAvailability(savedAvailability)
            setSaved(true)

            if (savedTimer.current) {
                clearTimeout(savedTimer.current)
            }

            savedTimer.current = setTimeout(() => setSaved(false), 2600)
        } finally {
            setSaving(false)
        }
    }

    return (
        <View style={styles.container}>
            <AppHeader
                title="Minha agenda"
                subtitle="Horários, bloqueios e raio de atendimento"
            />

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <MonthCalendar
                        month={month}
                        selectedKey={selectedKey}
                        markedDates={markedDates}
                        blockedDates={availability.blockedDates}
                        onSelect={setSelectedKey}
                        onChangeMonth={handleChangeMonth}
                    />

                    <View style={styles.dayHeader}>
                        <View style={styles.dayInfo}>
                            <Text style={styles.dayTitle}>
                                {formatLongDateKey(selectedKey)}
                            </Text>
                            <Text style={[
                                styles.dayHint,
                                blocked && styles.dayHintBlocked,
                            ]}>
                                {blocked
                                    ? "Dia bloqueado para novos atendimentos"
                                    : dayHours?.enabled
                                        ? `Atende das ${dayHours.start} às ${dayHours.end}`
                                        : "Sem atendimento neste dia"}
                            </Text>
                        </View>

                        {isTodayKey(selectedKey) && (
                            <View style={styles.todayBadge}>
                                <Text style={styles.todayBadgeText}>Hoje</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeading}>
                                <View style={styles.cardIcon}>
                                    <Icon name="clock" size={16} color={colors.blue1} />
                                </View>
                                <Text style={styles.cardTitle}>Horário de atendimento</Text>
                            </View>

                            <Pressable
                                onPress={() => setEditorOpen(true)}
                                hitSlop={8}
                                accessibilityRole="button"
                            >
                                <Text style={styles.cardAction}>Editar</Text>
                            </Pressable>
                        </View>

                        <View style={styles.hoursList}>
                            {hoursSummary.map((row) => (
                                <View key={row.label} style={styles.hoursRow}>
                                    <Text style={styles.hoursDay}>{row.label}</Text>

                                    <View style={[
                                        styles.hoursChip,
                                        !row.enabled && styles.hoursChipOff,
                                    ]}>
                                        <Text style={[
                                            styles.hoursValue,
                                            !row.enabled && styles.hoursOff,
                                        ]}>
                                            {row.value}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.card, blocked && styles.blockCardActive]}>
                        <View style={styles.blockRow}>
                            <View style={[
                                styles.cardIcon,
                                blocked && styles.cardIconDanger,
                            ]}>
                                <Icon
                                    name="lock"
                                    size={16}
                                    color={blocked ? colors.red1 : colors.blue1}
                                />
                            </View>

                            <View style={styles.blockInfo}>
                                <Text style={[
                                    styles.cardTitle,
                                    blocked && styles.cardTitleDanger,
                                ]}>
                                    {blocked ? "Dia bloqueado" : "Bloquear este dia"}
                                </Text>
                                <Text style={styles.blockHint}>
                                    Visitas já confirmadas continuam na agenda.
                                </Text>
                            </View>

                            <Switch
                                value={blocked}
                                onValueChange={handleToggleBlock}
                                trackColor={{ false: colors.gray1, true: colors.red1 }}
                                thumbColor={colors.white2}
                                ios_backgroundColor={colors.gray1}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Visitas confirmadas</Text>

                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>
                                    {selectedVisits.length}
                                </Text>
                            </View>
                        </View>

                        {selectedVisits.length > 0 ? (
                            <View style={styles.visitsCard}>
                                {selectedVisits.map((visit, index) => (
                                    <View key={visit.booking.id}>
                                        {index > 0 && <View style={styles.divider} />}

                                        <VisitRow visit={visit} />
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyText}>
                                    Nenhuma visita confirmada neste dia.
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.card}>
                        <RangeSlider
                            label="Raio de atendimento"
                            value={availability.radiusKm}
                            min={1}
                            max={30}
                            unit="km"
                            hint={`Você recebe pedidos de pacientes em até ${availability.radiusKm} km do seu endereço de atendimento.`}
                            onChange={handleRadius}
                        />
                    </View>

                    <View style={styles.saveArea}>
                        <AppButton
                            text={saving ? "Salvando..." : "Salvar disponibilidade"}
                            icon="checkmark-circle"
                            onPress={handleSave}
                            disabled={saving}
                        />

                        {saved && (
                            <Text style={styles.savedText}>Disponibilidade salva.</Text>
                        )}
                    </View>
                </ScrollView>
            )}

            {availability && (
                <WorkingHoursModal
                    visible={editorOpen}
                    initialDay={weekday ?? 1}
                    workingHours={availability.workingHours}
                    onApply={handleApplyHours}
                    onClose={() => setEditorOpen(false)}
                />
            )}
        </View>
    )
}

function VisitRow({ visit }: { visit: Visit }) {
    const { booking, patient } = visit

    return (
        <Pressable
            style={({ pressed }) => [styles.visitRow, pressed && styles.visitRowPressed]}
            onPress={() => router.push(`/pro/appointment/${booking.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Atendimento de ${patient.fullName} às ${booking.time}`}
        >
            <View style={styles.visitTime}>
                <Text style={styles.visitTimeText}>{booking.time}</Text>
                <Text style={styles.visitDuration}>
                    {formatDuration(booking.durationMinutes)}
                </Text>
            </View>

            <View style={styles.visitDivider} />

            <View style={styles.visitInfo}>
                <View style={styles.visitTop}>
                    <Text style={styles.visitName} numberOfLines={1}>
                        {patient.fullName}
                    </Text>

                    <StatusChip status={booking.status} />
                </View>

                <Text style={styles.visitMeta} numberOfLines={1}>
                    {`${patient.neighborhood} • ${formatDistance(booking.distanceKm)}`}
                </Text>
            </View>

            <Icon name="chevron-right" size={16} color={colors.gray2} />
        </Pressable>
    )
}

function summarizeHours(
    hours: Record<number, DayAvailability>,
): HoursSummaryRow[] {
    const groups: { days: number[], hours: DayAvailability }[] = []

    for (const day of DAY_ORDER) {
        const current = hours[day]
        const last = groups[groups.length - 1]

        if (last && sameHours(last.hours, current)) {
            last.days.push(day)
        } else {
            groups.push({ days: [day], hours: current })
        }
    }

    return groups.map((group) => ({
        label: formatDayGroup(group.days),
        value: group.hours.enabled
            ? `${group.hours.start} – ${group.hours.end}`
            : "Folga",
        enabled: group.hours.enabled,
    }))
}

function sameHours(a: DayAvailability, b: DayAvailability) {
    return a.enabled === b.enabled && a.start === b.start && a.end === b.end
}

function formatDayGroup(days: number[]) {
    if (days.length === 1) {
        return WEEKDAYS_LONG[days[0]]
    }

    if (days.length === 2) {
        return `${WEEKDAYS_LONG[days[0]]} e ${WEEKDAYS_LONG[days[1]].toLowerCase()}`
    }

    return `${WEEKDAYS_LONG[days[0]]} a ${WEEKDAYS_LONG[days[days.length - 1]].toLowerCase()}`
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

    dayHeader: {
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 2,
    },

    dayInfo: {
        flex: 1,
        gap: 2,
    },

    dayTitle: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    dayHint: {
        color: colors.gray2,
        fontSize: 12,
    },

    dayHintBlocked: {
        color: colors.red1,
        fontWeight: "bold",
    },

    todayBadge: {
        backgroundColor: colors.green2,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    todayBadgeText: {
        color: colors.green1,
        fontSize: 10,
        fontWeight: "bold",
    },

    card: {
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 12,
        padding: 14,
    },

    cardHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },

    cardHeading: {
        alignItems: "center",
        flexDirection: "row",
        gap: 9,
    },

    cardIcon: {
        alignItems: "center",
        backgroundColor: colors.blue2,
        borderRadius: 9,
        height: 30,
        justifyContent: "center",
        width: 30,
    },

    cardIconDanger: {
        backgroundColor: colors.red2,
    },

    cardTitle: {
        color: colors.dark1,
        fontSize: 14,
        fontWeight: "bold",
    },

    cardTitleDanger: {
        color: colors.red1,
    },

    cardAction: {
        color: colors.blue1,
        fontSize: 12.5,
        fontWeight: "bold",
    },

    hoursList: {
        gap: 7,
    },

    hoursRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },

    hoursDay: {
        color: colors.gray2,
        fontSize: 12.5,
    },

    hoursValue: {
        color: colors.green1,
        fontSize: 11.5,
        fontWeight: "bold",
    },

    hoursChip: {
        backgroundColor: colors.green3,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },

    hoursChipOff: {
        backgroundColor: colors.gray3,
    },

    hoursOff: {
        color: colors.gray2,
        fontWeight: "500",
    },

    blockCardActive: {
        borderColor: colors.red1,
    },

    blockRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
    },

    blockInfo: {
        flex: 1,
        gap: 2,
    },

    blockHint: {
        color: colors.gray2,
        fontSize: 11.5,
        lineHeight: 15,
    },

    section: {
        gap: 10,
    },

    sectionHeader: {
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },

    sectionTitle: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    countBadge: {
        alignItems: "center",
        backgroundColor: colors.blue2,
        borderRadius: 9,
        height: 18,
        justifyContent: "center",
        minWidth: 18,
        paddingHorizontal: 5,
    },

    countText: {
        color: colors.blue1,
        fontSize: 10.5,
        fontWeight: "bold",
    },

    visitsCard: {
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 14,
        borderWidth: 1.5,
        paddingHorizontal: 14,
    },

    visitRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        paddingVertical: 11,
    },

    visitRowPressed: {
        opacity: 0.75,
    },

    visitTime: {
        alignItems: "center",
        gap: 1,
        width: 46,
    },

    visitTimeText: {
        color: colors.blue1,
        fontSize: 15,
        fontWeight: "bold",
    },

    visitDuration: {
        color: colors.gray2,
        fontSize: 10,
        fontWeight: "500",
    },

    visitDivider: {
        backgroundColor: colors.gray3,
        height: 36,
        width: 1,
    },

    visitInfo: {
        flex: 1,
        gap: 3,
    },

    visitTop: {
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
        justifyContent: "space-between",
    },

    visitName: {
        color: colors.dark1,
        flex: 1,
        fontSize: 13.5,
        fontWeight: "bold",
    },

    visitMeta: {
        color: colors.gray2,
        fontSize: 11.5,
    },

    divider: {
        backgroundColor: colors.gray3,
        height: 1,
        width: "100%",
    },

    emptyCard: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 14,
        borderStyle: "dashed",
        borderWidth: 1.5,
        paddingHorizontal: 16,
        paddingVertical: 20,
    },

    emptyText: {
        color: colors.gray2,
        fontSize: 12.5,
        textAlign: "center",
    },

    saveArea: {
        gap: 8,
        paddingTop: 2,
    },

    savedText: {
        color: colors.green1,
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
    },
})
