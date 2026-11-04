import { useState } from "react"
import {
    Alert,
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../utils/constants/colors"
import AppButton from "../../components/AppButton"
import Icon, { IconName } from "../../components/Icon"
import SearchBar from "../../components/SearchBar"

type SettingRow = {
    key: string,
    label: string,
    icon: IconName,
    onPress: () => void,
}

export default function Settings() {
    const insets = useSafeAreaInsets()

    const [query, setQuery] = useState("")

    function handleComingSoon(feature: string) {
        Alert.alert(feature, "Esta área estará disponível em breve.")
    }

    function handleLogout() {
        Alert.alert(
            "Sair da conta",
            "Você precisará entrar novamente para acessar seus atendimentos.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sair",
                    style: "destructive",
                    onPress: () => router.replace("/login"),
                },
            ],
        )
    }

    const rows: SettingRow[] = [
        {
            key: "profile",
            label: "Perfil",
            icon: "user",
            onPress: () => router.push("/settings/edit"),
        },
        {
            key: "privacy",
            label: "Privacidade e segurança",
            icon: "lock",
            onPress: () => handleComingSoon("Privacidade e segurança"),
        },
        {
            key: "help",
            label: "Ajuda e suporte",
            icon: "help",
            onPress: () => handleComingSoon("Ajuda e suporte"),
        },
    ]

    const term = query.trim().toLowerCase()
    const filtered = rows.filter((row) => row.label.toLowerCase().includes(term))

    return (
        <View style={[styles.container, { paddingTop: insets.top + 18 }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Configurações</Text>
                    <Text style={styles.subtitle}>Conta e preferências</Text>
                </View>

                <SearchBar
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Buscar uma configuração..."
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    onScrollBeginDrag={Keyboard.dismiss}
                    showsVerticalScrollIndicator={false}
                >
                    {filtered.length > 0 ? (
                        <View style={styles.listCard}>
                            {filtered.map((row, index) => (
                                <View key={row.key}>
                                    {index > 0 && <View style={styles.divider} />}

                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.row,
                                            pressed && styles.rowPressed,
                                        ]}
                                        onPress={row.onPress}
                                        accessibilityRole="button"
                                        accessibilityLabel={row.label}
                                    >
                                        <View style={styles.rowIcon}>
                                            <Icon
                                                name={row.icon}
                                                size={22}
                                                color={colors.blue1}
                                            />
                                        </View>

                                        <Text style={styles.rowLabel}>{row.label}</Text>

                                        <Icon
                                            name="chevron-right"
                                            size={18}
                                            color={colors.gray2}
                                        />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>
                                Nenhuma configuração encontrada.
                            </Text>
                        </View>
                    )}

                    <View style={styles.logoutSection}>
                        <View style={styles.divider} />

                        <AppButton
                            text="Sair da conta"
                            variant="danger"
                            onPress={handleLogout}
                        />

                        <Text style={styles.logoutHint}>
                            Você precisará entrar novamente para acessar seus atendimentos.
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white1,
        flex: 1,
        width: "100%",
    },

    content: {
        flex: 1,
        paddingHorizontal: 34,
    },

    header: {
        gap: 4,
        marginBottom: 18,
    },

    title: {
        color: colors.blue1,
        fontSize: 26,
        fontWeight: "bold",
    },

    subtitle: {
        color: colors.gray2,
        fontSize: 13,
    },

    scrollView: {
        flex: 1,
        marginTop: 18,
    },

    scrollContent: {
        flexGrow: 1,
        gap: 24,
        justifyContent: "space-between",
        paddingBottom: 28,
    },

    listCard: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 16,
        borderWidth: 1.5,
        overflow: "hidden",
        width: "100%",
    },

    row: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 15,
    },

    rowPressed: {
        backgroundColor: colors.blue2,
    },

    rowIcon: {
        alignItems: "center",
        justifyContent: "center",
        width: 24,
    },

    rowLabel: {
        color: colors.dark1,
        flex: 1,
        fontSize: 15.5,
        fontWeight: "600",
    },

    divider: {
        backgroundColor: colors.gray3,
        height: 1,
        width: "100%",
    },

    empty: {
        alignItems: "center",
        paddingVertical: 32,
    },

    emptyText: {
        color: colors.gray2,
        fontSize: 14,
        textAlign: "center",
    },

    logoutSection: {
        gap: 12,
    },

    logoutHint: {
        color: colors.gray2,
        fontSize: 12,
        lineHeight: 17,
        textAlign: "center",
    },
})
