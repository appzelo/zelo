import { View, Text, Pressable, StyleSheet } from "react-native"
import { colors } from "../utils/constants/colors"
import Icon, { IconName } from "./Icon"

type SelectionCardProps = {
    icon: IconName,
    title: string,
    description: string,
    selected: boolean,
    onPress: () => void,
}

export default function SelectionCard({
    icon,
    title,
    description,
    selected,
    onPress,
}: SelectionCardProps) {
    return (
        <Pressable style={[styles.card, selected && styles.cardSelected]} onPress={onPress}>
            <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
                <Icon
                    name={icon}
                    size={26}
                    color={selected ? colors.green1 : colors.gray2}
                />
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