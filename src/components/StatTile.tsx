import { View, Text, StyleSheet } from "react-native"
import { colors } from "../utils/constants/colors"

type StatTileProps = {
    label: string,
    value: string,
}

/** Cartão de resumo do Início: número grande e rótulo curto. */
export default function StatTile({ label, value }: StatTileProps) {
    return (
        <View style={styles.tile}>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
                {value}
            </Text>
            <Text style={styles.label} numberOfLines={1}>
                {label}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    tile: {
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 12,
        borderWidth: 1.5,
        flex: 1,
        gap: 4,
        minHeight: 88,
        paddingHorizontal: 14,
        paddingVertical: 13,
    },

    value: {
        color: colors.blue1,
        fontSize: 24,
        fontWeight: "bold",
        letterSpacing: -0.5,
    },

    label: {
        color: colors.gray2,
        fontSize: 12,
        fontWeight: "500",
    },
})
