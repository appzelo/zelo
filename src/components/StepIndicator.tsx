import { View, StyleSheet } from "react-native"
import { colors } from "../utils/constants/colors"

type StepIndicatorProps = {
    /** Etapa atual, começando em 1. */
    current: number,
    total?: number,
}

/** Barras de progresso usadas nos fluxos de várias etapas. */
export default function StepIndicator({
    current,
    total = 3,
}: StepIndicatorProps) {
    return (
        <View
            style={styles.row}
            accessibilityRole="progressbar"
            accessibilityLabel={`Etapa ${current} de ${total}`}
        >
            {Array.from({ length: total }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.segment,
                        index < current ? styles.active : styles.inactive,
                    ]}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        gap: 6,
        width: "100%",
    },

    segment: {
        borderRadius: 2,
        flex: 1,
        height: 4,
    },

    active: {
        backgroundColor: colors.blue1,
    },

    inactive: {
        backgroundColor: colors.gray3,
    },
})
