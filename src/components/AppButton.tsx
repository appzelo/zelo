import { View, Text, Pressable, StyleSheet } from "react-native"
import { colors } from "../utils/constants/colors"
import Icon, { IconName } from "./Icon"

type AppButtonProps = {
	text: string,
	onPress?: () => void,
	variant?: "primary" | "secondary",
	icon?: IconName,
}

export default function AppButton({
	text,
	onPress,
	variant = "primary",
	icon,
}: AppButtonProps) {
	const primary = variant === "primary"

	return (
		<Pressable 
			style={[
				styles.button, 
				primary && styles.primaryButton,
				variant === "secondary" && styles.secondaryButton,
			]} 
			onPress={onPress}
		>
			<View style={styles.content}>
				{icon && (
					<Icon
						name={icon}
						size={18}
						color={primary ? colors.white2 : colors.blue1}
					/>
				)}
				<Text 
					style={[
						styles.buttonText, 
						primary && styles.primaryText,
						variant === "secondary" && styles.secondaryText,
					]}
				>
					{text}
				</Text>
			</View>
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

	content: {
		alignItems: "center",
		flexDirection: "row",
		gap: 8,
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
