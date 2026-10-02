import { Text, Pressable, StyleSheet } from "react-native"
import { colors } from "../../constants/colors"

type AppButtonProps = {
	text: string,
	onPress?: () => void,
	variant?: "primary" | "secondary",
}

export default function AppButton({
	text,
	onPress,
	variant = "primary",
}: AppButtonProps) {
	return (
		<Pressable 
			style={[
				styles.button, 
				variant === "primary" && styles.primaryButton,
				variant === "secondary" && styles.secondaryButton,
			]} 
			onPress={onPress}
		>
        	<Text 
				style={[
					styles.buttonText, 
					variant === "primary" && styles.primaryText,
					variant === "secondary" && styles.secondaryText,
				]}
			>
				{text}
			</Text>
    	</Pressable>
	)
}

const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        alignSelf: "center",
        borderRadius: 12,
        height: 56,
        justifyContent: "center",
        width: "100%",
    },

    buttonText: {
        fontSize: 18,
        fontWeight: "bold"
    },

	primaryButton: {
        backgroundColor: colors.blue1,
	},

	primaryText: {
        color: colors.white2,
	},

	secondaryButton: {
        backgroundColor: colors.white2,
        borderColor: colors.blue1,
        borderWidth: 2,
	},

	secondaryText: {
        color: colors.blue1,
	},
})