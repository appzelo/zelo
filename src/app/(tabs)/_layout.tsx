import { Keyboard } from "react-native"
import { Tabs } from "expo-router/js-tabs"
import BottomNav, { TabName } from "../../components/BottomNav"

export const unstable_settings = {
    initialRouteName: "home",
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                animation: "none",
                headerShown: false,
            }}
            tabBar={({ state, navigation }) => {
                const activeTab = state.routes[state.index].name as TabName

                return (
                    <BottomNav
                        activeTab={activeTab}
                        onTabPress={(tab) => {
                            const route = state.routes.find((item) => item.name === tab)

                            if (route) {
                                navigation.navigate(route.name)
                            }
                        }}
                    />
                )
            }}
        >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="search" listeners={{blur: () => Keyboard.dismiss()}} />
            <Tabs.Screen name="schedule" />
        </Tabs>
    )
}
