import { View, Text, StyleSheet } from "react-native"
import { colors } from "../../constants/colors"
import { StyleProp, TextStyle } from "react-native"

type SectionTextProps = {
    title: string,
    showDescription?: boolean,
    description?: string,
    titleStyle?: StyleProp<TextStyle>
}

export default function SectionText({
    title,
    showDescription = false,
    description,
    titleStyle,
}: SectionTextProps) {
    return (
        <View style={styles.container}>
            <Text style={[styles.title, titleStyle]}>{title}</Text>
            {showDescription && <Text style={styles.description}>{description}</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 4,
    },

    title: {
        color: colors.blue1,
        fontSize: 24,
        fontWeight: "bold",
    },

    description: {
        color: colors.gray2,
        fontSize: 14,
    }
})