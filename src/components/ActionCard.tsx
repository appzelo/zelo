import { View, Text, Pressable, StyleSheet } from "react-native"
import { colors } from "../utils/constants/colors"
import Icon, { IconName } from "./Icon"

type ActionCardProps = {
    title: string,
    icon: IconName,
    onPress?: () => void,
}

export default function ActionCard({
    title,
    icon,
    onPress,
}: ActionCardProps) {
    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={onPress}
        >
            <View style={styles.iconBox}>
                <Icon name={icon} size={52} color={colors.gray2} />
            </View>
            <Text style={styles.title}>{title}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 16,
        borderWidth: 1.5,
        flexDirection: "row",
        gap: 16,
        minHeight: 118,
        paddingHorizontal: 20,
        paddingVertical: 24,
        width: "100%",
    },

    cardPressed: {
        opacity: 0.8,
    },

    iconBox: {
        alignItems: "center",
        justifyContent: "center",
        width: 66,
    },

    title: {
        color: colors.dark1,
        flex: 1,
        fontSize: 22,
        fontWeight: "600",
        lineHeight: 26,
    },
})
