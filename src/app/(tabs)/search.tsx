import { useEffect, useState } from "react"
import { View, Text, ScrollView, Pressable, StyleSheet, TouchableWithoutFeedback, Keyboard } from "react-native"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../utils/constants/colors"
import SearchBar from "../../components/SearchBar"
import SpecialistCard from "../../components/SpecialistCard"
import FilterModal from "../../components/FilterModal"
import {
    DEFAULT_FILTERS,
    Specialist,
    SpecialistFilters,
    countActiveFilters,
    searchSpecialists,
} from "../../services/specialists"

export default function Search() {
    const insets = useSafeAreaInsets()
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Specialist[] | null>(null)
    const [filters, setFilters] = useState<SpecialistFilters>(DEFAULT_FILTERS)
    const [filterOpen, setFilterOpen] = useState(false)

    const activeFilters = countActiveFilters(filters)

    useEffect(() => {
        let active = true

        searchSpecialists(query, filters).then((found) => {
            if (active) {
                setResults(found)
            }
        })

        return () => {
            active = false
        }
    }, [query, filters])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.container, { paddingTop: insets.top + 18 }]}>
                <View style={styles.content}>
                    <SearchBar
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Nome ou especialidade"
                        onFilterPress={() => {
                            // Teclado aberto cobriria a folha de filtros no Android.
                            Keyboard.dismiss()
                            setFilterOpen(true)
                        }}
                        filterActive={activeFilters > 0}
                    />

                    <View style={styles.header}>
                        <Text style={styles.title}>Especialistas Próximos</Text>

                        {activeFilters > 0 && (
                            <Pressable
                                style={styles.summary}
                                onPress={() => setFilters(DEFAULT_FILTERS)}
                                hitSlop={8}
                            >
                                <Text style={styles.summaryText}>
                                    {activeFilters === 1
                                        ? "1 filtro ativo"
                                        : `${activeFilters} filtros ativos`}
                                </Text>
                                <Text style={styles.summaryClear}>Limpar</Text>
                            </Pressable>
                        )}
                    </View>

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
                            <View style={styles.emptyBox}>
                                <Text style={styles.empty}>
                                    {activeFilters > 0
                                        ? "Nenhum especialista atende a esses filtros."
                                        : "Nenhum especialista encontrado."}
                                </Text>

                                {activeFilters > 0 && (
                                    <Pressable
                                        onPress={() => setFilters(DEFAULT_FILTERS)}
                                        hitSlop={8}
                                    >
                                        <Text style={styles.emptyAction}>Limpar filtros</Text>
                                    </Pressable>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>

                <FilterModal
                    visible={filterOpen}
                    filters={filters}
                    onApply={setFilters}
                    onClose={() => setFilterOpen(false)}
                />
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white1,
        flex: 1,
        paddingHorizontal: "5%",
        width: "100%",
    },

    content: {
        flex: 1,
    },

    header: {
        alignItems: "center",
        gap: 8,
        marginBottom: 26,
        marginTop: 44,
    },

    title: {
        color: colors.blue1,
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },

    summary: {
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },

    summaryText: {
        color: colors.gray2,
        fontSize: 12.5,
    },

    summaryClear: {
        color: colors.blue1,
        fontSize: 12.5,
        fontWeight: "bold",
    },

    list: {
        gap: 16,
        paddingBottom: 24,
    },

    emptyBox: {
        alignItems: "center",
        gap: 8,
        marginTop: 12,
    },

    empty: {
        color: colors.gray2,
        fontSize: 14,
        textAlign: "center",
    },

    emptyAction: {
        color: colors.blue1,
        fontSize: 13,
        fontWeight: "bold",
    },
})
