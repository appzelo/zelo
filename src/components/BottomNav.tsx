import { View, Text, Pressable, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../utils/constants/colors"
import Icon, { IconName } from "./Icon"

export type TabName = "home" | "search" | "schedule" | "agenda" | "requests"

export type BottomNavVariant = "patient" | "specialist"

type BottomNavProps = {
    activeTab: TabName,
    onTabPress?: (tab: TabName) => void,
    variant?: BottomNavVariant,
}

const patientTabs: { name: TabName, label: string, icon: IconName }[] = [
    { name: "home", label: "Início", icon: "home" },
    { name: "search", label: "Buscar", icon: "search" },
    { name: "schedule", label: "Agenda", icon: "calendar" },
]

const specialistTabs: { name: TabName, label: string, icon: IconName }[] = [
    { name: "home", label: "Início", icon: "home" },
    { name: "agenda", label: "Agenda", icon: "calendar" },
    { name: "requests", label: "Pedidos", icon: "clipboard" },
]

export default function BottomNav({
    activeTab,
    onTabPress,
    variant = "patient",
}: BottomNavProps) {
    const insets = useSafeAreaInsets()
    const tabs = variant === "specialist" ? specialistTabs : patientTabs

    return (
        <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
            {tabs.map((tab) => {
                const active = tab.name === activeTab

                return (
                    <Pressable
                        key={tab.name}
                        style={[styles.tab, active && styles.tabActive]}
                        onPress={() => onTabPress?.(tab.name)}
                    >
                        <Icon
                            name={tab.icon}
                            size={21}
                            color={active ? colors.blue1 : colors.gray2}
                            strokeWidth={active ? 2 : 1.8}
                        />
                        <Text style={[styles.label, active && styles.labelActive]}>
                            {tab.label}
                        </Text>
                    </Pressable>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    nav: {
        alignItems: "center",
        backgroundColor: colors.white1,
        borderTopColor: colors.gray3,
        borderTopWidth: 1,
        flexDirection: "row",
        paddingHorizontal: 22,
        paddingTop: 10,
        width: "100%",
    },

    tab: {
        alignItems: "center",
        borderRadius: 14,
        flex: 1,
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 9,
    },

    tabActive: {
        backgroundColor: colors.blue2,
    },

    label: {
        color: colors.gray2,
        fontSize: 11,
        fontWeight: "500",
    },

    labelActive: {
        color: colors.blue1,
        fontWeight: "bold",
    },
})
