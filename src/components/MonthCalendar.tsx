import { View, Text, Pressable, StyleSheet } from "react-native"
import { colors } from "../utils/constants/colors"
import { WEEKDAYS_SHORT, dateKey, formatMonthYear } from "../utils/format"
import Icon from "./Icon"

type MonthCalendarProps = {
    /** Primeiro dia do mês exibido, ao meio-dia. */
    month: Date,
    selectedKey: string,
    /** Dias com visitas confirmadas. */
    markedDates: string[],
    /** Dias bloqueados pelo profissional. */
    blockedDates: string[],
    onSelect: (key: string) => void,
    onChangeMonth: (month: Date) => void,
}

// Seis semanas mantêm a altura do calendário estável entre os meses.
const CELLS = 42

export default function MonthCalendar({
    month,
    selectedKey,
    markedDates,
    blockedDates,
    onSelect,
    onChangeMonth,
}: MonthCalendarProps) {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const firstWeekday = new Date(year, monthIndex, 1, 12).getDay()
    const daysInMonth = new Date(year, monthIndex + 1, 0, 12).getDate()
    const today = dateKey(new Date())

    const cells = Array.from({ length: CELLS }, (_, index) => {
        const day = index - firstWeekday + 1

        if (day < 1 || day > daysInMonth) {
            return null
        }

        const date = new Date(year, monthIndex, day, 12)

        return { key: dateKey(date), day }
    })

    const weeks = Array.from({ length: CELLS / 7 }, (_, week) => {
        return cells.slice(week * 7, week * 7 + 7)
    })

    function changeMonth(offset: number) {
        onChangeMonth(new Date(year, monthIndex + offset, 1, 12))
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Pressable
                    style={styles.navButton}
                    onPress={() => changeMonth(-1)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Mês anterior"
                >
                    <Icon name="chevron-left" size={18} color={colors.blue1} />
                </Pressable>

                <Text style={styles.month}>{formatMonthYear(month)}</Text>

                <Pressable
                    style={styles.navButton}
                    onPress={() => changeMonth(1)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Próximo mês"
                >
                    <Icon name="chevron-right" size={18} color={colors.blue1} />
                </Pressable>
            </View>

            <View style={styles.weekdays}>
                {WEEKDAYS_SHORT.map((weekday) => (
                    <Text key={weekday} style={styles.weekday}>
                        {weekday}
                    </Text>
                ))}
            </View>

            <View style={styles.weeks}>
                {weeks.map((week, weekIndex) => (
                    <View key={`week-${weekIndex}`} style={styles.week}>
                        {week.map((cell, index) => {
                            if (!cell) {
                                return (
                                    <View
                                        key={`empty-${weekIndex}-${index}`}
                                        style={styles.cell}
                                    />
                                )
                            }

                            const selected = cell.key === selectedKey
                            const isToday = cell.key === today
                            const blocked = blockedDates.includes(cell.key)
                            const marked = markedDates.includes(cell.key)

                            return (
                                <Pressable
                                    key={cell.key}
                                    style={styles.cell}
                                    onPress={() => onSelect(cell.key)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected }}
                                    accessibilityLabel={`Dia ${cell.day}`}
                                >
                                    <View style={[
                                        styles.dayCircle,
                                        selected && styles.dayCircleSelected,
                                        !selected && isToday && styles.dayCircleToday,
                                    ]}>
                                        <Text style={[
                                            styles.dayText,
                                            selected && styles.dayTextSelected,
                                            !selected && isToday && styles.dayTextToday,
                                            !selected && blocked && styles.dayTextBlocked,
                                        ]}>
                                            {cell.day}
                                        </Text>
                                    </View>

                                    <View style={[
                                        styles.dot,
                                        marked
                                            ? styles.dotMarked
                                            : blocked
                                                ? styles.dotBlocked
                                                : styles.dotEmpty,
                                    ]} />
                                </Pressable>
                            )
                        })}
                    </View>
                ))}
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, styles.dotMarked]} />
                    <Text style={styles.legendText}>Visitas</Text>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.dot, styles.dotBlocked]} />
                    <Text style={styles.legendText}>Dia bloqueado</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 16,
        borderWidth: 1.5,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 6,
    },

    header: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
        paddingHorizontal: 2,
    },

    navButton: {
        alignItems: "center",
        borderRadius: 16,
        height: 32,
        justifyContent: "center",
        width: 32,
    },

    month: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    weekdays: {
        flexDirection: "row",
        marginBottom: 2,
    },

    weekday: {
        color: colors.gray2,
        flex: 1,
        fontSize: 10.5,
        fontWeight: "bold",
        textAlign: "center",
    },

    weeks: {
        width: "100%",
    },

    week: {
        flexDirection: "row",
        width: "100%",
    },

    cell: {
        alignItems: "center",
        flex: 1,
        height: 42,
        justifyContent: "flex-start",
        paddingTop: 3,
    },

    dayCircle: {
        alignItems: "center",
        borderRadius: 16,
        height: 32,
        justifyContent: "center",
        width: 32,
    },

    dayCircleSelected: {
        backgroundColor: colors.green1,
    },

    dayCircleToday: {
        borderColor: colors.green1,
        borderWidth: 1.5,
    },

    dayText: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "500",
    },

    dayTextSelected: {
        color: colors.white2,
        fontWeight: "bold",
    },

    dayTextToday: {
        color: colors.green1,
        fontWeight: "bold",
    },

    dayTextBlocked: {
        color: colors.red1,
    },

    dot: {
        borderRadius: 2,
        height: 4,
        marginTop: 2,
        width: 4,
    },

    dotMarked: {
        backgroundColor: colors.green1,
    },

    dotBlocked: {
        backgroundColor: colors.red1,
    },

    dotEmpty: {
        backgroundColor: "transparent",
    },

    legend: {
        borderTopColor: colors.gray3,
        borderTopWidth: 1,
        flexDirection: "row",
        gap: 16,
        marginTop: 8,
        paddingBottom: 8,
        paddingTop: 9,
    },

    legendItem: {
        alignItems: "center",
        flexDirection: "row",
        gap: 5,
    },

    legendText: {
        color: colors.gray2,
        fontSize: 10.5,
    },
})
