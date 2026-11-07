import { View, Text, Pressable, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../utils/constants/colors"
import Icon from "./Icon"

type AppHeaderProps = {
    /** Marca exibida acima do título. */
    eyebrow?: string,
    title: string,
    subtitle?: string,
    /** Quando informado, mostra o botão de configurações. */
    onSettings?: () => void,
}

/**
 * Cabeçalho das telas do profissional. Cuida da área segura do topo para
 * que as telas não precisem repetir o padding do sistema.
 */
export default function AppHeader({
    eyebrow = "Zelo • Especialista",
    title,
    subtitle,
    onSettings,
}: AppHeaderProps) {
    const insets = useSafeAreaInsets()

    return (
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
            <View style={styles.info}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {onSettings && (
                <Pressable
                    style={({ pressed }) => [styles.settings, pressed && styles.settingsPressed]}
                    onPress={onSettings}
                    accessibilityRole="button"
                    accessibilityLabel="Configurações"
                    hitSlop={6}
                >
                    <Icon name="settings" size={20} color={colors.blue1} />
                </Pressable>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        paddingBottom: 16,
        width: "100%",
    },

    info: {
        flex: 1,
        gap: 1,
    },

    eyebrow: {
        color: colors.gray2,
        fontSize: 11,
        fontWeight: "500",
        letterSpacing: 0.2,
    },

    title: {
        color: colors.dark1,
        fontSize: 23,
        fontWeight: "bold",
        letterSpacing: -0.4,
    },

    subtitle: {
        color: colors.gray2,
        fontSize: 12.5,
        lineHeight: 17,
        marginTop: 3,
    },

    settings: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.gray3,
        borderRadius: 21,
        borderWidth: 1.5,
        height: 42,
        justifyContent: "center",
        width: 42,
    },

    settingsPressed: {
        backgroundColor: colors.blue2,
    },
})
