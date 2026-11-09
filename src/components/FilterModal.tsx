import { useEffect, useRef, useState } from "react"
import {
    Animated,
    Easing,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../utils/constants/colors"
import { SpecialistFilters, countActiveFilters } from "../services/specialists"
import AppButton from "./AppButton"
import Icon from "./Icon"

type FilterModalProps = {
    visible: boolean,
    filters: SpecialistFilters,
    onApply: (filters: SpecialistFilters) => void,
    onClose: () => void,
}

const PRICE_OPTIONS: { label: string, value: number }[] = [
    { label: "Até R$ 100", value: 100 },
    { label: "Até R$ 150", value: 150 },
    { label: "Até R$ 200", value: 200 },
]

const DISTANCE_OPTIONS: { label: string, value: number }[] = [
    { label: "Até 2 km", value: 2 },
    { label: "Até 5 km", value: 5 },
    { label: "Até 10 km", value: 10 },
]

// Altura usada na animação de entrada/saída da folha.
const SHEET_OFFSET = 520

export default function FilterModal({
    visible,
    filters,
    onApply,
    onClose,
}: FilterModalProps) {
    const insets = useSafeAreaInsets()
    const translateY = useRef(new Animated.Value(SHEET_OFFSET)).current

    // Rascunho: só vai para a busca quando o usuário confirma em "Aplicar filtros".
    const [draft, setDraft] = useState<SpecialistFilters>(filters)

    useEffect(() => {
        if (!visible) {
            return
        }

        setDraft(filters)
        translateY.setValue(SHEET_OFFSET)

        Animated.timing(translateY, {
            toValue: 0,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start()
    }, [visible, filters, translateY])

    // A folha desce antes de fechar para não sumir de um frame para o outro.
    function close(after?: () => void) {
        Animated.timing(translateY, {
            toValue: SHEET_OFFSET,
            duration: 180,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                after?.()
                onClose()
            }
        })
    }

    function handleApply() {
        const next = draft

        // Aplicar depois da animação evita re-renderizar a busca no meio da saída.
        close(() => onApply(next))
    }

    const overlayOpacity = translateY.interpolate({
        inputRange: [0, SHEET_OFFSET * 0.7],
        outputRange: [1, 0],
        extrapolate: "clamp",
    })

    const hasActiveFilters = countActiveFilters(draft) > 0

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={() => close()}
        >
            <View style={styles.overlay}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => close()}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar filtros"
                >
                    <Animated.View
                        pointerEvents="none"
                        style={[styles.dim, { opacity: overlayOpacity }]}
                    />
                </Pressable>

                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            paddingBottom: Math.max(insets.bottom, 12) + 8,
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    <View style={styles.grabber} />

                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.title}>Filtros</Text>
                            <Text style={styles.subtitle}>Refine sua busca por profissional</Text>
                        </View>

                        <Pressable
                            style={styles.closeButton}
                            onPress={() => close()}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel="Fechar filtros"
                        >
                            <Icon name="close" size={15} color={colors.gray2} />
                        </Pressable>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Valor por hora</Text>

                            <View style={styles.chipRow}>
                                {PRICE_OPTIONS.map((option) => (
                                    <Chip
                                        key={option.label}
                                        label={option.label}
                                        active={draft.maxPrice === option.value}
                                        onPress={() => setDraft({
                                            ...draft,
                                            // Tocar de novo no mesmo valor remove o filtro.
                                            maxPrice: draft.maxPrice === option.value
                                                ? null
                                                : option.value,
                                        })}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Distância máxima</Text>

                            <View style={styles.chipRow}>
                                {DISTANCE_OPTIONS.map((option) => (
                                    <Chip
                                        key={option.label}
                                        label={option.label}
                                        active={draft.maxDistanceKm === option.value}
                                        onPress={() => setDraft({
                                            ...draft,
                                            maxDistanceKm: draft.maxDistanceKm === option.value
                                                ? null
                                                : option.value,
                                        })}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Disponibilidade</Text>

                            <Pressable
                                style={[
                                    styles.toggleRow,
                                    draft.availableToday && styles.toggleRowActive,
                                ]}
                                onPress={() => setDraft({
                                    ...draft,
                                    availableToday: !draft.availableToday,
                                })}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: draft.availableToday }}
                            >
                                <View style={styles.toggleIcon}>
                                    <Icon name="clock" size={18} color={colors.green1} />
                                </View>

                                <View style={styles.toggleText}>
                                    <Text style={styles.toggleTitle}>Disponível hoje</Text>
                                    <Text style={styles.toggleHint}>
                                        Mostrar apenas quem atende nas próximas horas
                                    </Text>
                                </View>

                                <View style={[
                                    styles.checkbox,
                                    draft.availableToday && styles.checkboxActive,
                                ]}>
                                    {draft.availableToday && (
                                        <Text style={styles.checkboxMark}>✓</Text>
                                    )}
                                </View>
                            </Pressable>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <View style={styles.footerClear}>
                            <AppButton
                                text="Limpar"
                                variant="secondary"
                                onPress={() => setDraft({
                                    maxPrice: null,
                                    maxDistanceKm: null,
                                    availableToday: false,
                                })}
                                disabled={!hasActiveFilters}
                            />
                        </View>

                        <View style={styles.footerApply}>
                            <AppButton
                                text="Aplicar filtros"
                                onPress={handleApply}
                            />
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    )
}

type ChipProps = {
    label: string,
    active: boolean,
    onPress: () => void,
}

function Chip({ label, active, onPress }: ChipProps) {
    return (
        <Pressable
            style={[styles.chip, active && styles.chipActive]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
        >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {label}
            </Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },

    dim: {
        backgroundColor: "#0F172A73",
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },

    sheet: {
        backgroundColor: colors.white2,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 24,
        maxHeight: "88%",
        paddingHorizontal: 24,
        paddingTop: 10,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
    },

    grabber: {
        alignSelf: "center",
        backgroundColor: colors.gray3,
        borderRadius: 2,
        height: 4,
        marginBottom: 14,
        width: 36,
    },

    header: {
        alignItems: "flex-start",
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },

    headerText: {
        flex: 1,
        gap: 3,
    },

    title: {
        color: colors.blue1,
        fontSize: 20,
        fontWeight: "bold",
    },

    subtitle: {
        color: colors.gray2,
        fontSize: 12.5,
    },

    closeButton: {
        alignItems: "center",
        backgroundColor: colors.white1,
        borderColor: colors.gray3,
        borderRadius: 16,
        borderWidth: 1.5,
        height: 32,
        justifyContent: "center",
        width: 32,
    },

    scroll: {
        gap: 22,
        paddingBottom: 10,
    },

    section: {
        gap: 10,
    },

    sectionTitle: {
        color: colors.dark1,
        fontSize: 14,
        fontWeight: "bold",
    },

    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },

    chip: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 10,
        borderWidth: 1.5,
        paddingHorizontal: 14,
        paddingVertical: 9,
    },

    chipActive: {
        backgroundColor: colors.green2,
        borderColor: colors.green1,
    },

    chipText: {
        color: colors.dark1,
        fontSize: 13,
    },

    chipTextActive: {
        color: colors.green1,
        fontWeight: "bold",
    },

    toggleRow: {
        alignItems: "center",
        backgroundColor: colors.white1,
        borderColor: colors.gray1,
        borderRadius: 12,
        borderWidth: 1.5,
        flexDirection: "row",
        gap: 12,
        padding: 12,
    },

    toggleRowActive: {
        backgroundColor: colors.green3,
        borderColor: colors.green1,
    },

    toggleIcon: {
        alignItems: "center",
        backgroundColor: colors.green2,
        borderRadius: 18,
        height: 36,
        justifyContent: "center",
        width: 36,
    },

    toggleText: {
        flex: 1,
        gap: 2,
    },

    toggleTitle: {
        color: colors.dark1,
        fontSize: 14,
        fontWeight: "bold",
    },

    toggleHint: {
        color: colors.gray2,
        fontSize: 11.5,
        lineHeight: 15,
    },

    checkbox: {
        alignItems: "center",
        borderColor: colors.gray1,
        borderRadius: 6,
        borderWidth: 1.5,
        height: 22,
        justifyContent: "center",
        width: 22,
    },

    checkboxActive: {
        backgroundColor: colors.green1,
        borderColor: colors.green1,
    },

    checkboxMark: {
        color: colors.white2,
        fontSize: 13,
        fontWeight: "bold",
        lineHeight: 16,
    },

    footer: {
        borderTopColor: colors.gray3,
        borderTopWidth: 1,
        flexDirection: "row",
        gap: 10,
        paddingTop: 14,
    },

    footerClear: {
        flex: 1,
    },

    footerApply: {
        flex: 1.5,
    },
})
