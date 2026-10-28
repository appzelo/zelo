import { useEffect, useState } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableWithoutFeedback, Keyboard } from "react-native"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../utils/constants/colors"
import SearchBar from "../../components/SearchBar"
import SpecialistCard from "../../components/SpecialistCard"
import { Specialist, searchSpecialists } from "../../services/specialists"

export default function Search() {
    const insets = useSafeAreaInsets()
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Specialist[] | null>(null)

    useEffect(() => {
        let active = true

        searchSpecialists(query).then((found) => {
            if (active) {
                setResults(found)
            }
        })

        return () => {
            active = false
        }
    }, [query])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.container, { paddingTop: insets.top + 18 }]}>
                <View style={styles.content}>
                    <SearchBar
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Nome ou especialidade"
                    />

                    <Text style={styles.title}>Especialistas Próximos</Text>

                    <ScrollView
                        contentContainerStyle={styles.list}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {results?.map((specialist) => (
                            <SpecialistCard
                                key={specialist.id}
                                specialist={specialist}
                                onPress={() => router.push(`/specialist/${specialist.id}`)}
                            />
                        ))}

                        {results?.length === 0 && (
                            <Text style={styles.empty}>Nenhum especialista encontrado.</Text>
                        )}
                    </ScrollView>
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white1,
        flex: 1,
        width: "100%",
    },

    content: {
        flex: 1,
        paddingHorizontal: 34,
    },

    title: {
        color: colors.blue1,
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 26,
        marginTop: 44,
        textAlign: "center",
    },

    list: {
        gap: 16,
        paddingBottom: 24,
    },

    empty: {
        color: colors.gray2,
        fontSize: 14,
        marginTop: 12,
        textAlign: "center",
    },
})
