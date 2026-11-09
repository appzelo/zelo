import { View, Text, Pressable, StyleSheet } from "react-native"
import { colors } from "../utils/constants/colors"
import Icon from "./Icon"

type LocationHeaderProps = {
    patientName: string,
    address: string,
    onSettings: () => void,
}

export default function LocationHeader({
    patientName,
    address,
    onSettings,
}: LocationHeaderProps) {
    return (
        <View style={styles.header}>
            <View style={styles.info}>
                <Text style={styles.patient}>Seu paciente: {patientName}</Text>
                <View style={styles.addressRow}>
                    <Icon name="map-pin" size={13} color={colors.dark1} />
                    <Text style={styles.address}>{address}</Text>
                </View>
            </View>

            <Pressable
                style={({ pressed }) => [styles.settings, pressed && styles.settingsPressed]}
                onPress={onSettings}
                accessibilityRole="button"
                accessibilityLabel="Configurações"
                hitSlop={6}
            >
                <Icon name="settings" size={20} color={colors.blue1} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },

    info: {
        gap: 4,
    },

    patient: {
        color: colors.gray2,
        fontSize: 13,
        fontWeight: "500",
    },

    addressRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 5,
    },

    address: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "bold",
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
