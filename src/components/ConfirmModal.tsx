import {
    View,
    Text,
    Pressable,
    Modal,
    ActivityIndicator,
    StyleSheet,
} from "react-native"
import { colors } from "../utils/constants/colors"

type ConfirmModalProps = {
    visible: boolean,
    title: string,
    message: string,
    confirmText: string,
    cancelText: string,
    /** Pinta a ação principal de vermelho em vez de azul. */
    destructive?: boolean,
    /** Desabilita os botões e mostra o carregando no confirmar. */
    loading?: boolean,
    onConfirm: () => void,
    onCancel: () => void,
}

/**
 * Confirmação em diálogo centralizado, usada em ações que mudam o estado
 * do atendimento (recusar solicitação, encerrar consulta).
 */
export default function ConfirmModal({
    visible,
    title,
    message,
    confirmText,
    cancelText,
    destructive = false,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={() => {
                if (!loading) {
                    onCancel()
                }
            }}
        >
            <View style={styles.overlay}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => {
                        if (!loading) {
                            onCancel()
                        }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar confirmação"
                />

                <View style={styles.card}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.actions}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                styles.cancelButton,
                                pressed && styles.pressed,
                                loading && styles.disabled,
                            ]}
                            onPress={onCancel}
                            disabled={loading}
                            accessibilityRole="button"
                        >
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                destructive ? styles.dangerButton : styles.confirmButton,
                                pressed && styles.pressed,
                                loading && styles.disabled,
                            ]}
                            onPress={onConfirm}
                            disabled={loading}
                            accessibilityRole="button"
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white2} size="small" />
                            ) : (
                                <Text style={styles.confirmText}>{confirmText}</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        alignItems: "center",
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: "7%",
    },

    card: {
        backgroundColor: colors.white2,
        borderRadius: 18,
        gap: 8,
        maxWidth: 380,
        padding: 20,
        width: "100%",
    },

    title: {
        color: colors.dark1,
        fontSize: 17,
        fontWeight: "bold",
    },

    message: {
        color: colors.gray2,
        fontSize: 13,
        lineHeight: 19,
    },

    actions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
    },

    button: {
        alignItems: "center",
        borderRadius: 10,
        flex: 1,
        height: 46,
        justifyContent: "center",
        paddingHorizontal: 10,
    },

    cancelButton: {
        backgroundColor: colors.gray3,
    },

    confirmButton: {
        backgroundColor: colors.blue1,
    },

    dangerButton: {
        backgroundColor: colors.red1,
    },

    pressed: {
        opacity: 0.8,
    },

    disabled: {
        opacity: 0.6,
    },

    cancelText: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "bold",
    },

    confirmText: {
        color: colors.white2,
        fontSize: 13,
        fontWeight: "bold",
    },
})
