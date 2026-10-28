import { View, Text, StyleSheet } from "react-native"
import { colors } from "../utils/constants/colors"
import Icon from "./Icon"

type LocationHeaderProps = {
    patientName: string,
    address: string,
}

export default function LocationHeader({
    patientName,
    address,
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

            <View style={styles.avatar}>
                <View style={styles.avatarDot}></View>
            </View>
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

    avatar: {
        alignItems: "center",
        backgroundColor: colors.green2,
        borderRadius: 17,
        height: 34,
        justifyContent: "center",
        width: 34,
    },

    avatarDot: {
        backgroundColor: colors.green1,
        borderRadius: 5,
        height: 10,
        width: 10,
    },
})
