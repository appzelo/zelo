import { View, Text, Pressable, StyleSheet } from "react-native"
import { colors } from "../../constants/colors"

type SelectionCardProps = {
    title: string,
    description: string,
    selected: boolean,
    onPress: () => void,
}

export default function SelectionCard({
    // icon,
    title,
    description,
    selected,
    onPress,
}: SelectionCardProps) {
    return (
        <Pressable style={[styles.card, selected && styles.cardSelected]} onPress={onPress}>
            <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
                <Text style={[styles.icon, selected && styles.iconSelected]}>Icon</Text>
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>

            <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                <View style={[selected && styles.radioInnerSelected]}></View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 16,
        borderWidth: 3,
        flexDirection: "row",
        gap: 15,
        maxHeight: 130,
        padding: 15,
        width: "100%",
    },

    cardSelected: {
        borderColor: colors.green1,
    },

    iconContainer: {
        alignItems: "center",
        backgroundColor: colors.gray1,
        borderRadius: 26,
        height: 52,
        justifyContent: "center",
        width: 52,
    },

    iconContainerSelected: {
        backgroundColor: colors.green2,
    },

    icon: {
        color: colors.gray2,
        fontWeight: "bold"
    },

    iconSelected: {
        color: colors.green1,
    },

    textContainer: {
        flex: 1,
    },

    title: {
        fontSize: 18,
        fontWeight: "bold",
    },

    description: {
        color: colors.gray2,
        fontSize: 14,
    },

    radioOuter: {
        width: 22,
        height: 22,
        borderColor: colors.gray1,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },

    radioOuterSelected: {
        borderColor: colors.green1,
    },

    radioInnerSelected: {
        width: 10,
        height: 10,
        backgroundColor: colors.green1,
        borderRadius: 5,
    },
})