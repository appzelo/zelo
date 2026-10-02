import { View, Text, TextInput, StyleSheet, StyleProp, ViewStyle } from "react-native"
import { colors } from "../../constants/colors"

type AppInputProps = {
    showLabel?: boolean,
    label?: string,
    placeholder?: string,
    required?: boolean,
    secureTextEntry?: boolean,
    containerStyle?: StyleProp<ViewStyle>
}

export default function AppInput({
    showLabel = false,
    label,
    placeholder,
    required = false,
    secureTextEntry = false,
    containerStyle,
}: AppInputProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            {showLabel && <Text style={styles.label}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>}
            <TextInput 
                placeholder={placeholder}
                style={styles.input}
                secureTextEntry={secureTextEntry}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 5,
        width: "100%",
    },

    label: {
        alignSelf: "flex-start",
        fontSize: 16,
        fontWeight: "bold",
    },

    required: {
        color: colors.red1,
    },

    input: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 12,
        borderWidth: 2,
        height: 50,
        paddingLeft: 10,
        width: "100%",
    },
})