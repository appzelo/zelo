import { View, TextInput, Pressable, StyleSheet } from "react-native"
import { colors } from "../utils/constants/colors"
import Icon from "./Icon"

type SearchBarProps = {
    value: string,
    onChangeText: (text: string) => void,
    onFilterPress?: () => void,
    placeholder?: string,
    /** Indica que há filtros aplicados na busca. */
    filterActive?: boolean,
}

export default function SearchBar({
    value,
    onChangeText,
    onFilterPress,
    placeholder,
    filterActive = false,
}: SearchBarProps) {
    return (
        <View style={styles.container}>
            <Icon name="search" size={22} color={colors.dark1} />

            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.gray2}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />

            <Pressable
                onPress={onFilterPress}
                hitSlop={10}
                style={styles.filter}
                accessibilityRole="button"
                accessibilityLabel="Filtros"
            >
                <Icon
                    name="filter"
                    size={22}
                    color={filterActive ? colors.blue1 : colors.dark1}
                />

                {filterActive && <View style={styles.filterDot} />}
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: colors.white2,
        borderColor: colors.blue1,
        borderRadius: 12,
        borderWidth: 2,
        flexDirection: "row",
        gap: 10,
        height: 52,
        paddingHorizontal: 12,
        width: "100%",
    },

    input: {
        color: colors.dark1,
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },

    filter: {
        alignItems: "center",
        justifyContent: "center",
    },

    filterDot: {
        backgroundColor: colors.green1,
        borderColor: colors.white2,
        borderRadius: 5,
        borderWidth: 1.5,
        height: 10,
        position: "absolute",
        right: -3,
        top: -3,
        width: 10,
    },
})
