import { View, Text, StyleSheet } from "react-native"
import { BookingStatus } from "../services/bookings"
import { BOOKING_STATUS } from "../utils/constants/bookingStatus"

type StatusChipProps = {
    status: BookingStatus,
    /** Usa o texto completo em vez do rótulo curto. */
    full?: boolean,
}

export default function StatusChip({ status, full = false }: StatusChipProps) {
    const meta = BOOKING_STATUS[status]

    return (
        <View style={[styles.chip, { backgroundColor: meta.background }]}>
            <Text style={[styles.text, { color: meta.color }]} numberOfLines={1}>
                {full ? meta.label : meta.shortLabel}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    chip: {
        alignSelf: "flex-start",
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },

    text: {
        fontSize: 9.5,
        fontWeight: "bold",
        letterSpacing: 0.2,
    },
})
