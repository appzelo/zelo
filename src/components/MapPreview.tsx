import { View, Text, StyleSheet } from "react-native"
import { colors } from "../utils/constants/colors"

type MapPreviewProps = {
    /** Mostra o selo "Em rota ativa" enquanto o profissional está a caminho. */
    active?: boolean,
}

/**
 * Mapa ilustrado (estático), desenhado com Views para não depender de
 * módulos nativos nem de chave do Google Maps. Quando o rastreamento real
 * entrar, basta trocar este componente por um react-native-maps.
 */
export default function MapPreview({ active = true }: MapPreviewProps) {
    return (
        <View style={styles.map}>
            <View style={styles.river} />

            <View style={styles.parkA} />
            <View style={styles.parkB} />
            <View style={styles.parkC} />
            <View style={styles.blockA} />

            <View style={styles.roadH1} />
            <View style={styles.roadH2} />
            <View style={styles.roadV1} />
            <View style={styles.roadV2} />

            <View style={styles.routeH} />
            <View style={styles.routeV} />
            <View style={styles.routeTop} />

            <View style={styles.origin} />

            <View style={styles.pin}>
                <View style={styles.pinBody} />
                <View style={styles.pinDot} />
                <View style={styles.pinPointer} />
            </View>

            {active && (
                <View style={styles.chip}>
                    <Text style={styles.chipText}>Em rota ativa</Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    map: {
        backgroundColor: "#E9F1EC",
        borderRadius: 12,
        height: 190,
        overflow: "hidden",
        width: "100%",
    },

    river: {
        backgroundColor: "#C7E4F1",
        height: 320,
        position: "absolute",
        right: -46,
        top: -70,
        transform: [{ rotate: "18deg" }],
        width: 78,
    },

    parkA: {
        backgroundColor: "#D6EAD9",
        borderRadius: 3,
        height: 42,
        left: "3%",
        position: "absolute",
        top: 8,
        width: "28%",
    },

    parkB: {
        backgroundColor: "#D6EAD9",
        borderRadius: 3,
        height: 50,
        left: "46%",
        position: "absolute",
        top: 88,
        width: "20%",
    },

    parkC: {
        backgroundColor: "#D6EAD9",
        borderRadius: 3,
        height: 42,
        left: "6%",
        position: "absolute",
        top: 170,
        width: "26%",
    },

    blockA: {
        backgroundColor: "#F1F4F1",
        borderRadius: 3,
        height: 34,
        left: "44%",
        position: "absolute",
        top: 18,
        width: "24%",
    },

    roadH1: {
        backgroundColor: "#FFFFFF",
        height: 14,
        left: -10,
        position: "absolute",
        top: 64,
        width: "120%",
    },

    roadH2: {
        backgroundColor: "#FFFFFF",
        height: 12,
        left: -10,
        position: "absolute",
        top: 148,
        width: "120%",
    },

    roadV1: {
        backgroundColor: "#FFFFFF",
        height: "120%",
        left: "38%",
        position: "absolute",
        top: -10,
        width: 14,
    },

    roadV2: {
        backgroundColor: "#FFFFFF",
        height: "120%",
        left: "74%",
        position: "absolute",
        top: -10,
        width: 10,
    },

    routeH: {
        backgroundColor: colors.green1,
        borderRadius: 2,
        height: 4,
        left: "9%",
        position: "absolute",
        top: 152,
        width: "33%",
    },

    routeV: {
        backgroundColor: colors.green1,
        borderRadius: 2,
        height: 85,
        left: "40%",
        position: "absolute",
        top: 69,
        width: 4,
    },

    routeTop: {
        backgroundColor: colors.green1,
        borderRadius: 2,
        height: 4,
        left: "40%",
        position: "absolute",
        top: 69,
        width: "27%",
    },

    origin: {
        backgroundColor: "#FFFFFF",
        borderColor: colors.green1,
        borderRadius: 7,
        borderWidth: 3,
        height: 14,
        left: "8%",
        position: "absolute",
        top: 147,
        width: 14,
    },

    pin: {
        height: 34,
        left: "65%",
        position: "absolute",
        top: 44,
        width: 26,
    },

    pinBody: {
        backgroundColor: colors.green1,
        borderRadius: 9,
        height: 26,
        width: 26,
    },

    pinDot: {
        backgroundColor: "#FFFFFF",
        borderRadius: 4,
        height: 8,
        left: 9,
        position: "absolute",
        top: 9,
        width: 8,
    },

    pinPointer: {
        borderLeftColor: "transparent",
        borderLeftWidth: 4,
        borderRightColor: "transparent",
        borderRightWidth: 4,
        borderTopColor: colors.green1,
        borderTopWidth: 6,
        height: 0,
        left: 9,
        position: "absolute",
        top: 24,
        width: 0,
    },

    chip: {
        backgroundColor: "rgba(15, 23, 42, 0.88)",
        borderRadius: 8,
        left: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        position: "absolute",
        top: 12,
    },

    chipText: {
        color: colors.white2,
        fontSize: 11,
        fontWeight: "bold",
    },
})
