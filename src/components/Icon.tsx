import Ionicons from "@expo/vector-icons/Ionicons"
import { ComponentProps } from "react"

export type IconName =
    | "search"
    | "calendar"
    | "home"
    | "map-pin"
    | "filter"
    | "person"
    | "user"
    | "clock"
    | "navigation"
    | "alert"
    | "close"
    | "edit"
    | "settings"
    | "chevron-right"
    | "lock"
    | "help"
    | "people"
    | "medkit"
    | "clipboard"
    | "notifications"
    | "arrow-right"

type IoniconName = ComponentProps<typeof Ionicons>["name"]

/**
 * Nomes usados no app -> ícones do Ionicons.
 * Centralizar o mapa aqui mantém as telas independentes da biblioteca.
 */
const ICONS: Record<IconName, IoniconName> = {
    search: "search-outline",
    calendar: "calendar-outline",
    home: "home-outline",
    "map-pin": "location-outline",
    filter: "options-outline",
    person: "person",
    user: "person-outline",
    clock: "time-outline",
    navigation: "navigate-outline",
    alert: "warning-outline",
    close: "close",
    edit: "create-outline",
    settings: "settings-outline",
    "chevron-right": "chevron-forward",
    lock: "lock-closed-outline",
    help: "help-circle-outline",
    people: "people-outline",
    medkit: "medkit-outline",
    clipboard: "clipboard-outline",
    notifications: "notifications-outline",
    "arrow-right": "arrow-forward",
}

type IconProps = {
    name: IconName,
    size?: number,
    color?: string,
    /** Mantido por compatibilidade: o Ionicons não usa espessura de traço. */
    strokeWidth?: number,
}

export default function Icon({
    name,
    size = 24,
    color = "#334155",
}: IconProps) {
    return <Ionicons name={ICONS[name]} size={size} color={color} />
}
