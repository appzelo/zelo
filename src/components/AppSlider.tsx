import { View, Text, StyleSheet } from "react-native"
import Slider from "@react-native-community/slider"
import { colors } from "../../constants/colors"

type AppSliderProps = {
    title: string,
    minValue: number,
    maxValue: number,
    metricUnit?: string,
    currentValue: number,
    onValueChange: (value: number) => void,
}

export default function AppSlider({
    title,
    minValue,
    maxValue,
    metricUnit,
    currentValue,
    onValueChange,
}: AppSliderProps) {
    return (
        <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.currentValue}>{currentValue}{metricUnit && <Text> {metricUnit}</Text>}</Text>
            </View>
            <Slider  
                step={1}
                minimumValue={minValue}
                maximumValue={maxValue}
                minimumTrackTintColor={colors.green1}
                maximumTrackTintColor={colors.gray2}
                thumbSize={18}
                thumbTintColor={colors.green1}
                onValueChange={onValueChange}
                value={currentValue}
            />
            <View style={styles.sliderFooter}>
                <Text style={{fontSize: 11, flex: 1}}>{minValue}{metricUnit && <Text> {metricUnit}</Text>}</Text>
                <Text style={{fontSize: 11}}>{maxValue}{metricUnit && <Text> {metricUnit}</Text>}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    sliderContainer: {
        gap: 5,
    },

    sliderHeader: {
        flexDirection: "row",
    },

    title: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
    },

    currentValue: {
        color: colors.green1,
        fontSize: 16,
        fontWeight: "bold",
    },

    sliderFooter: {
        flexDirection: "row",
    },
})