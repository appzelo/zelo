import { useEffect, useRef, useState } from "react"
import {
    Animated,
    Easing,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../utils/constants/colors"
import { WEEKDAYS_SHORT } from "../utils/format"
import { DayAvailability } from "../services/specialistAvailability"
import AppButton from "./AppButton"
import Icon from "./Icon"

type WorkingHoursModalProps = {
    visible: boolean,
    /** Dia aberto ao abrir o editor: 0 = domingo ... 6 = sábado. */
    initialDay: number,
    workingHours: Record<number, DayAvailability>,
    onApply: (workingHours: Record<number, DayAvailability>) => void,
    onClose: () => void,
}

const SHEET_OFFSET = 720

/** Ordem de exibição da semana: segunda a domingo. */
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

const HOURS = Array.from({ length: 18 }, (_, index) => {
    return `${String(6 + index).padStart(2, "0")}:00`
})

function hourValue(time: string) {
    return Number(time.slice(0, 2))
}

function addHour(time: string) {
    const next = Math.min(23, hourValue(time) + 1)

    return `${String(next).padStart(2, "0")}:00`
}

function cloneHours(hours: Record<number, DayAvailability>) {
    return Object.fromEntries(
        Object.entries(hours).map(([day, value]) => [Number(day), { ...value }]),
    ) as Record<number, DayAvailability>
}

export default function WorkingHoursModal({
    visible,
    initialDay,
    workingHours,
    onApply,
    onClose,
}: WorkingHoursModalProps) {
    const insets = useSafeAreaInsets()
    const translateY = useRef(new Animated.Value(SHEET_OFFSET)).current

    // Rascunho: só substitui os horários da agenda quando o usuário aplica.
    const [draft, setDraft] = useState(() => cloneHours(workingHours))
    const [day, setDay] = useState(initialDay)

    useEffect(() => {
        if (!visible) {
            return
        }

        setDraft(cloneHours(workingHours))
        setDay(initialDay)
        translateY.setValue(SHEET_OFFSET)

        Animated.timing(translateY, {
            toValue: 0,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start()
    }, [visible, workingHours, initialDay, translateY])

    function close(after?: () => void) {
        Animated.timing(translateY, {
            toValue: SHEET_OFFSET,
            duration: 180,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                after?.()
                onClose()
            }
        })
    }

    function updateDay(change: Partial<DayAvailability>) {
        setDraft((current) => ({
            ...current,
            [day]: { ...current[day], ...change },
        }))
    }

    function handleStart(start: string) {
        setDraft((current) => {
            const selected = current[day]
            // Se o início passar do fim, empurra o fim para a hora seguinte.
            const end = hourValue(start) >= hourValue(selected.end)
                ? addHour(start)
                : selected.end

            return {
                ...current,
                [day]: { ...selected, start, end },
            }
        })
    }

    const selected = draft[day]
    const startOptions = HOURS.filter((hour) => hourValue(hour) < hourValue(selected.end))
    const endOptions = HOURS.filter((hour) => hourValue(hour) > hourValue(selected.start))

    const overlayOpacity = translateY.interpolate({
        inputRange: [0, SHEET_OFFSET * 0.7],
        outputRange: [1, 0],
        extrapolate: "clamp",
    })

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={() => close()}
        >
            <View style={styles.overlay}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => close()}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar horários"
                >
                    <Animated.View
                        pointerEvents="none"
                        style={[styles.dim, { opacity: overlayOpacity }]}
                    />
                </Pressable>

                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            paddingBottom: Math.max(insets.bottom, 12) + 8,
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    <View style={styles.grabber} />

                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.title}>Horário de atendimento</Text>
                            <Text style={styles.subtitle}>
                                Defina os horários de cada dia da semana
                            </Text>
                        </View>

                        <Pressable
                            style={styles.closeButton}
                            onPress={() => close()}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel="Fechar horários"
                        >
                            <Icon name="close" size={15} color={colors.gray2} />
                        </Pressable>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        <View style={styles.days}>
                            {DAY_ORDER.map((weekday) => {
                                const active = weekday === day
                                const enabled = draft[weekday].enabled

                                return (
                                    <Pressable
                                        key={weekday}
                                        style={[styles.dayChip, active && styles.dayChipActive]}
                                        onPress={() => setDay(weekday)}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: active }}
                                    >
                                        <Text style={[
                                            styles.dayChipText,
                                            active && styles.dayChipTextActive,
                                        ]}>
                                            {WEEKDAYS_SHORT[weekday]}
                                        </Text>

                                        <View style={[
                                            styles.dayDot,
                                            enabled && styles.dayDotEnabled,
                                            active && enabled && styles.dayDotActive,
                                        ]} />
                                    </Pressable>
                                )
                            })}
                        </View>

                        <View style={[styles.toggleRow, selected.enabled && styles.toggleRowActive]}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleTitle}>
                                    {selected.enabled ? "Atende neste dia" : "Folga neste dia"}
                                </Text>
                                <Text style={styles.toggleHint}>
                                    {selected.enabled
                                        ? `Das ${selected.start} às ${selected.end}`
                                        : "O dia não aparece para novos agendamentos"}
                                </Text>
                            </View>

                            <Switch
                                value={selected.enabled}
                                onValueChange={(enabled) => updateDay({ enabled })}
                                trackColor={{ false: colors.gray1, true: colors.green1 }}
                                thumbColor={colors.white2}
                                ios_backgroundColor={colors.gray1}
                            />
                        </View>

                        {selected.enabled && (
                            <>
                                <HourRow
                                    label="Início"
                                    value={selected.start}
                                    options={startOptions}
                                    onSelect={handleStart}
                                />

                                <HourRow
                                    label="Fim"
                                    value={selected.end}
                                    options={endOptions}
                                    onSelect={(end) => updateDay({ end })}
                                />

                                <View style={styles.summary}>
                                    <Icon name="clock" size={15} color={colors.green1} />
                                    <Text style={styles.summaryText}>
                                        {`Atendimento das ${selected.start} às ${selected.end}`}
                                    </Text>
                                </View>
                            </>
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        <View style={styles.footerButton}>
                            <AppButton
                                text="Cancelar"
                                variant="secondary"
                                onPress={() => close()}
                            />
                        </View>

                        <View style={styles.footerButton}>
                            <AppButton
                                text="Aplicar"
                                onPress={() => close(() => onApply(draft))}
                            />
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    )
}

type HourRowProps = {
    label: string,
    value: string,
    options: string[],
    onSelect: (hour: string) => void,
}

function HourRow({ label, value, options, onSelect }: HourRowProps) {
    return (
        <View style={styles.hourSection}>
            <Text style={styles.hourLabel}>{label}</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hourOptions}
            >
                {options.map((hour) => {
                    const active = hour === value

                    return (
                        <Pressable
                            key={hour}
                            style={[styles.hourChip, active && styles.hourChipActive]}
                            onPress={() => onSelect(hour)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                        >
                            <Text style={[
                                styles.hourText,
                                active && styles.hourTextActive,
                            ]}>
                                {hour}
                            </Text>
                        </Pressable>
                    )
                })}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },

    dim: {
        backgroundColor: "#0F172A73",
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },

    sheet: {
        backgroundColor: colors.white2,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 24,
        maxHeight: "88%",
        paddingHorizontal: 24,
        paddingTop: 10,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
    },

    grabber: {
        alignSelf: "center",
        backgroundColor: colors.gray3,
        borderRadius: 2,
        height: 4,
        marginBottom: 14,
        width: 36,
    },

    header: {
        alignItems: "flex-start",
        flexDirection: "row",
        gap: 12,
        marginBottom: 18,
    },

    headerText: {
        flex: 1,
        gap: 3,
    },

    title: {
        color: colors.blue1,
        fontSize: 20,
        fontWeight: "bold",
    },

    subtitle: {
        color: colors.gray2,
        fontSize: 12.5,
    },

    closeButton: {
        alignItems: "center",
        backgroundColor: colors.white1,
        borderColor: colors.gray3,
        borderRadius: 16,
        borderWidth: 1.5,
        height: 32,
        justifyContent: "center",
        width: 32,
    },

    scroll: {
        gap: 20,
        paddingBottom: 10,
    },

    days: {
        flexDirection: "row",
        gap: 6,
    },

    dayChip: {
        alignItems: "center",
        backgroundColor: colors.white1,
        borderColor: colors.gray3,
        borderRadius: 10,
        borderWidth: 1.5,
        flex: 1,
        gap: 4,
        paddingVertical: 8,
    },

    dayChipActive: {
        backgroundColor: colors.green2,
        borderColor: colors.green1,
    },

    dayChipText: {
        color: colors.gray2,
        fontSize: 11.5,
        fontWeight: "bold",
    },

    dayChipTextActive: {
        color: colors.green1,
    },

    dayDot: {
        backgroundColor: "transparent",
        borderRadius: 2,
        height: 4,
        width: 4,
    },

    dayDotEnabled: {
        backgroundColor: colors.green1,
    },

    dayDotActive: {
        backgroundColor: colors.green1,
    },

    toggleRow: {
        alignItems: "center",
        backgroundColor: colors.white1,
        borderColor: colors.gray3,
        borderRadius: 12,
        borderWidth: 1.5,
        flexDirection: "row",
        gap: 12,
        padding: 12,
    },

    toggleRowActive: {
        backgroundColor: colors.green3,
        borderColor: colors.green1,
    },

    toggleInfo: {
        flex: 1,
        gap: 2,
    },

    toggleTitle: {
        color: colors.dark1,
        fontSize: 14,
        fontWeight: "bold",
    },

    toggleHint: {
        color: colors.gray2,
        fontSize: 11.5,
        lineHeight: 15,
    },

    hourSection: {
        gap: 8,
    },

    hourLabel: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "bold",
    },

    hourOptions: {
        gap: 8,
        paddingRight: 8,
    },

    hourChip: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 9,
        borderWidth: 1.5,
        justifyContent: "center",
        minWidth: 60,
        paddingHorizontal: 10,
        paddingVertical: 9,
    },

    hourChipActive: {
        backgroundColor: colors.green1,
        borderColor: colors.green1,
    },

    hourText: {
        color: colors.dark1,
        fontSize: 13,
    },

    hourTextActive: {
        color: colors.white2,
        fontWeight: "bold",
    },

    summary: {
        alignItems: "center",
        backgroundColor: colors.green3,
        borderRadius: 10,
        flexDirection: "row",
        gap: 7,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },

    summaryText: {
        color: colors.green1,
        fontSize: 12.5,
        fontWeight: "bold",
    },

    footer: {
        borderTopColor: colors.gray3,
        borderTopWidth: 1,
        flexDirection: "row",
        gap: 10,
        paddingTop: 14,
    },

    footerButton: {
        flex: 1,
    },
})
