import { View, Text, TextInput, StyleSheet, StyleProp, ViewStyle, KeyboardTypeOptions, TextInputProps } from "react-native"
import { colors } from "../utils/constants/colors"
import { Controller, useFormContext } from "react-hook-form"
import type { RegisterOptions } from "react-hook-form"
import { applyMask, InputMask, MASK_MAX_LENGTH } from "../utils/mask"

type AppInputProps = {
    name: string,
    showLabel?: boolean,
    label?: string,
    placeholder?: string,
    secureTextEntry?: boolean,
    containerStyle?: StyleProp<ViewStyle>,
    keyboardType?: KeyboardTypeOptions,
    required?: boolean,
    mask?: InputMask,
    maxLength?: number,
    autoCapitalize?: TextInputProps["autoCapitalize"],
    rules?: RegisterOptions,
}

export default function AppInput({
    name,
    showLabel = false,
    label,
    placeholder,
    secureTextEntry = false,
    containerStyle,
    keyboardType = "default",
    required = false,
    mask,
    maxLength,
    autoCapitalize,
    rules,
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
                rules={rules}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                    <>
                        <TextInput 
                            placeholder={placeholder}
                            style={[styles.input, error && styles.inputError]}
                            secureTextEntry={secureTextEntry}
                            value={value ?? ""}
                            onChangeText={(text) => onChange(mask ? applyMask(text, mask) : text)}
                            keyboardType={keyboardType}
                            maxLength={maxLength ?? (mask ? MASK_MAX_LENGTH[mask] : undefined)}
                            autoCapitalize={autoCapitalize}
                        />
                        {error?.message && (
                            <Text style={styles.errorText}>{error.message}</Text>
                        )}
                    </>
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

    inputError: {
        borderColor: colors.red1,
    },

    errorText: {
        color: colors.red1,
        fontSize: 12.5,
        fontWeight: "600",
    },
})