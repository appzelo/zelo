import { View, Text, Pressable, StyleSheet } from "react-native"
import { colors } from "../utils/constants/colors"
import { Specialist } from "../services/specialists"
import Avatar from "./Avatar"

type SpecialistCardProps = {
    specialist: Specialist,
    onPress?: () => void,
}

export default function SpecialistCard({
    specialist,
    onPress,
}: SpecialistCardProps) {
    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && onPress !== undefined && styles.cardPressed]}
            onPress={onPress}
        >
            <View style={styles.top}>
                <Avatar size={46} />

                <View style={styles.info}>
                    <Text style={styles.name}>{specialist.name}</Text>
                    <Text style={styles.specialty}>{specialist.specialty}</Text>
                </View>

                <View style={[
                    styles.pill,
                    specialist.availableToday ? styles.pillToday : styles.pillSoon,
                ]}>
                    <Text style={[
                        styles.pillText,
                        specialist.availableToday ? styles.pillTextToday : styles.pillTextSoon,
                    ]}>
                        {specialist.availableToday ? "Disponível Hoje" : "Amanhã"}
                    </Text>
                </View>
            </View>

            <View style={styles.divider}></View>

            <View style={styles.bottom}>
                <Text style={styles.star}>★</Text>
                <Text style={styles.rating}>{specialist.rating.toFixed(1)}</Text>
                <Text style={styles.distance}>{specialist.distanceKm} km de distância</Text>

                <View style={styles.priceBox}>
                    <Text style={styles.price}>R$ {specialist.pricePerHour}</Text>
                    <Text style={styles.perHour}>/h</Text>
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 14,
        width: "100%",
    },

    cardPressed: {
        opacity: 0.85,
    },

    top: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
    },

    info: {
        flex: 1,
        gap: 2,
    },

    name: {
        color: colors.dark1,
        fontSize: 15,
        fontWeight: "bold",
    },

    specialty: {
        color: colors.gray2,
        fontSize: 12.5,
    },

    pill: {
        alignSelf: "flex-start",
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },

    pillSoon: {
        backgroundColor: colors.blue2,
    },

    pillToday: {
        backgroundColor: colors.green2,
    },

    pillText: {
        fontSize: 10.5,
        fontWeight: "bold",
    },

    pillTextSoon: {
        color: colors.gray2,
    },

    pillTextToday: {
        color: colors.green1,
    },

    divider: {
        backgroundColor: colors.gray3,
        height: 1,
        marginVertical: 10,
        width: "100%",
    },

    bottom: {
        alignItems: "center",
        flexDirection: "row",
        gap: 5,
    },

    star: {
        color: colors.yellow1,
        fontSize: 14,
    },

    rating: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "bold",
    },

    distance: {
        color: colors.gray2,
        fontSize: 12,
        marginLeft: 4,
    },

    priceBox: {
        alignItems: "flex-end",
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
    },

    price: {
        color: colors.blue1,
        fontSize: 14,
        fontWeight: "bold",
    },

    perHour: {
        color: colors.gray2,
        fontSize: 11,
        marginBottom: 1,
        marginLeft: 2,
    },
})
