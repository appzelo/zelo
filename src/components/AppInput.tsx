import { View, Text, TextInput, StyleSheet, StyleProp, ViewStyle } from "react-native"
import { colors } from "../../constants/colors"
import { Controller, useFormContext } from "react-hook-form"

type AppInputProps = {
    name: string,
    showLabel?: boolean,
    label?: string,
    placeholder?: string,
    required?: boolean,
    secureTextEntry?: boolean,
    containerStyle?: StyleProp<ViewStyle>
}

export default function AppInput({
    name,
    showLabel = false,
    label,
    placeholder,
    required = false,
    secureTextEntry = false,
    containerStyle,
}: AppInputProps) {
    const { control } = useFormContext()

    return (
        <View style={[styles.container, containerStyle]}>
            {showLabel && <Text style={styles.label}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>}
            <Controller
                name={name}
                control={control}
                render={({field: {onChange, value}}) => (
                    <TextInput 
                        placeholder={placeholder}
                        style={styles.input}
                        secureTextEntry={secureTextEntry}
                        value={value ?? ""}
                        onChangeText={onChange}
                    />
                )}
            >
            </Controller>
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