import { View, StyleSheet } from "react-native"
import { colors } from "../utils/constants/colors"

type AvatarProps = {
    size?: number,
}

/**
 * Silhueta de perfil desenhada com Views (sem imagem nem módulo nativo).
 * As proporções são derivadas do tamanho padrão de 46px.
 */
export default function Avatar({ size = 46 }: AvatarProps) {
    const scale = size / 46

    return (
        <View style={[
            styles.avatar,
            {
                borderRadius: size / 2,
                height: size,
                paddingTop: 9 * scale,
                width: size,
            },
        ]}>
            <View style={[
                styles.head,
                {
                    borderRadius: 8 * scale,
                    height: 16 * scale,
                    width: 16 * scale,
                },
            ]}></View>

            <View style={[
                styles.body,
                {
                    borderTopLeftRadius: 15 * scale,
                    borderTopRightRadius: 15 * scale,
                    height: 22 * scale,
                    marginTop: 3 * scale,
                    width: 30 * scale,
                },
            ]}></View>
        </View>
    )
}

const styles = StyleSheet.create({
    avatar: {
        alignItems: "center",
        backgroundColor: colors.gray3,
        overflow: "hidden",
    },

    head: {
        backgroundColor: colors.gray2,
        opacity: 0.35,
    },

    body: {
        backgroundColor: colors.gray2,
        opacity: 0.35,
    },
})
