import { View } from "react-native"

export type IconName = "search" | "calendar" | "home" | "map-pin" | "filter"

type IconProps = {
    name: IconName,
    size?: number,
    color?: string,
    strokeWidth?: number,
}

/**
 * Ícones desenhados com Views para não depender de módulos nativos
 * (react-native-svg / fontes) e funcionar em qualquer build do Expo Go.
 */
export default function Icon({
    name,
    size = 24,
    color = "#334155",
    strokeWidth = Math.max(1.5, size * 0.085),
}: IconProps) {
    const s = size
    const sw = strokeWidth

    if (name === "search") {
        const ring = s * 0.66
        const handle = s * 0.44
        const middle = s * 0.6756

        return (
            <View style={{ width: s, height: s }}>
                <View style={{
                    width: ring,
                    height: ring,
                    borderRadius: ring / 2,
                    borderWidth: sw,
                    borderColor: color,
                }} />
                <View style={{
                    position: "absolute",
                    left: middle - sw / 2,
                    top: middle - handle / 2,
                    width: sw,
                    height: handle,
                    borderRadius: sw / 2,
                    backgroundColor: color,
                    transform: [{ rotate: "-45deg" }],
                }} />
            </View>
        )
    }

    if (name === "calendar") {
        return (
            <View style={{ width: s, height: s }}>
                <View style={{
                    position: "absolute",
                    left: s * 0.06,
                    top: s * 0.16,
                    width: s * 0.88,
                    height: s * 0.8,
                    borderWidth: sw,
                    borderColor: color,
                    borderRadius: s * 0.14,
                }} />
                <View style={{
                    position: "absolute",
                    left: s * 0.06 + sw / 2,
                    top: s * 0.44,
                    width: s * 0.88 - sw,
                    height: sw,
                    backgroundColor: color,
                }} />
                <View style={{
                    position: "absolute",
                    left: s * 0.29,
                    top: s * 0.03,
                    width: sw,
                    height: s * 0.22,
                    borderRadius: sw / 2,
                    backgroundColor: color,
                }} />
                <View style={{
                    position: "absolute",
                    right: s * 0.29,
                    top: s * 0.03,
                    width: sw,
                    height: s * 0.22,
                    borderRadius: sw / 2,
                    backgroundColor: color,
                }} />
            </View>
        )
    }

    if (name === "home") {
        const roof = s * 0.5091

        return (
            <View style={{ width: s, height: s }}>
                <View style={{
                    position: "absolute",
                    left: s * 0.5 - roof / 2,
                    top: s * 0.46 - roof / 2,
                    width: roof,
                    height: roof,
                    borderTopWidth: sw,
                    borderLeftWidth: sw,
                    borderColor: color,
                    transform: [{ rotate: "45deg" }],
                }} />
                <View style={{
                    position: "absolute",
                    left: s * 0.14,
                    top: s * 0.44,
                    width: s * 0.72,
                    height: s * 0.50,
                    borderLeftWidth: sw,
                    borderRightWidth: sw,
                    borderBottomWidth: sw,
                    borderColor: color,
                    borderBottomLeftRadius: s * 0.06,
                    borderBottomRightRadius: s * 0.06,
                }} />
                <View style={{
                    position: "absolute",
                    left: s * 0.41,
                    bottom: s * 0.06,
                    width: s * 0.18,
                    height: s * 0.20,
                    backgroundColor: color,
                    borderTopLeftRadius: s * 0.04,
                    borderTopRightRadius: s * 0.04,
                }} />
            </View>
        )
    }

    if (name === "filter") {
        const knob = s * 0.28

        return (
            <View style={{ width: s, height: s }}>
                <View style={{
                    position: "absolute",
                    left: s * 0.08,
                    top: s * 0.34 - sw / 2,
                    width: s * 0.84,
                    height: sw,
                    borderRadius: sw / 2,
                    backgroundColor: color,
                }} />
                <View style={{
                    position: "absolute",
                    left: s * 0.62 - knob / 2,
                    top: s * 0.34 - knob / 2,
                    width: knob,
                    height: knob,
                    borderRadius: knob / 2,
                    borderWidth: sw,
                    borderColor: color,
                }} />
                <View style={{
                    position: "absolute",
                    left: s * 0.08,
                    top: s * 0.68 - sw / 2,
                    width: s * 0.84,
                    height: sw,
                    borderRadius: sw / 2,
                    backgroundColor: color,
                }} />
                <View style={{
                    position: "absolute",
                    left: s * 0.36 - knob / 2,
                    top: s * 0.68 - knob / 2,
                    width: knob,
                    height: knob,
                    borderRadius: knob / 2,
                    borderWidth: sw,
                    borderColor: color,
                }} />
            </View>
        )
    }

    return (
        <View style={{ width: s, height: s }}>
            <View style={{
                position: "absolute",
                left: s * 0.19,
                top: 0,
                width: s * 0.62,
                height: s * 0.62,
                borderRadius: s * 0.31,
                backgroundColor: color,
            }} />
            <View style={{
                position: "absolute",
                left: s * 0.19,
                top: s * 0.31,
                width: 0,
                height: 0,
                borderLeftWidth: s * 0.31,
                borderRightWidth: s * 0.31,
                borderTopWidth: s * 0.64,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopColor: color,
            }} />
        </View>
    )
}
