import { View, Pressable, Text, StyleSheet } from "react-native"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../utils/constants/colors"

type BackHeaderProps = {
    text?: string,
    onPress?: () => void,
}

export default function BackHeader({
    text,
    onPress = () => {router.back()},
}: BackHeaderProps) {
    const insets = useSafeAreaInsets()

    return (
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
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
    },

    back: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 22,
        borderWidth: 2,
        height: 44,
        width: 44,
    },

    backIcon: {
        fontSize: 22,
        fontWeight: "bold",
    },

    text: {
        flexShrink: 1,
        fontSize: 18,
        fontWeight: "bold",
    },
})