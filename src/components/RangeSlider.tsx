import { View, Text, StyleSheet } from "react-native"
import Slider from "@react-native-community/slider"
import { colors } from "../utils/constants/colors"

type RangeSliderProps = {
    label: string,
    value: number,
    min: number,
    max: number,
    step?: number,
    unit?: string,
    hint?: string,
    onChange: (value: number) => void,
}

/**
 * Slider controlado, sem react-hook-form. O AppSlider continua sendo o
 * campo de formulário; este é o controle direto usado na agenda.
 */
export default function RangeSlider({
    label,
    value,
    min,
    max,
    step = 1,
    unit,
    hint,
    onChange,
}: RangeSliderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>
                    {unit ? `${value} ${unit}` : String(value)}
                </Text>
            </View>

            <Slider
                style={styles.slider}
                minimumValue={min}
                maximumValue={max}
                step={step}
                value={value}
                onValueChange={onChange}
                minimumTrackTintColor={colors.green1}
                maximumTrackTintColor={colors.gray3}
                thumbTintColor={colors.green1}
            />

            <View style={styles.footer}>
                <Text style={styles.bound}>{unit ? `${min} ${unit}` : min}</Text>
                <Text style={styles.bound}>{unit ? `${max} ${unit}` : max}</Text>
            </View>

            {hint && <Text style={styles.hint}>{hint}</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 2,
    },

    header: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },

    label: {
        color: colors.dark1,
        fontSize: 14,
        fontWeight: "bold",
    },

    value: {
        color: colors.green1,
        fontSize: 15,
        fontWeight: "bold",
    },

    slider: {
        height: 40,
        width: "100%",
    },

    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    bound: {
        color: colors.gray2,
        fontSize: 11,
    },

    hint: {
        color: colors.gray2,
        fontSize: 11.5,
        lineHeight: 16,
        marginTop: 6,
    },
})
