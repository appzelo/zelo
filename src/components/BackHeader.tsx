import { View, Pressable, Text, StyleSheet } from "react-native"
import { router } from "expo-router"
import { colors } from "../../constants/colors"

type BackHeaderProps = {
    text?: string,
    onPress?: () => void,
}

export default function BackHeader({
    text,
    onPress = () => {router.back()},
}: BackHeaderProps) {
    return (
        <View style={styles.header}>
            <Pressable style={styles.back} onPress={onPress}>
                <Text style={styles.backIcon}>←</Text>
            </Pressable>
            <Text style={styles.text}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        paddingBottom: 15,
        paddingTop: 50,
    },

    back: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: "100%",
        borderWidth: 2,
        height: 48,
        width: 48,
    },

    backIcon: {
        fontSize: 24,
        fontWeight: "bold",
    },

    text: {
        fontSize: 20,
        fontWeight: "bold",
    },
})