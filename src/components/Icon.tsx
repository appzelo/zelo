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
    | "chevron-left"
    | "chevron-right"
    | "checkmark-circle"
    | "lock"
    | "mail"
    | "help"
    | "people"
    | "medkit"
    | "clipboard"
    | "notifications"
    | "arrow-right"
    | "play"
    | "stop"
    | "cash"

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
    "chevron-left": "chevron-back",
    "chevron-right": "chevron-forward",
    "checkmark-circle": "checkmark-circle-outline",
    lock: "lock-closed-outline",
    mail: "mail-outline",
    help: "help-circle-outline",
    people: "people-outline",
    medkit: "medkit-outline",
    clipboard: "clipboard-outline",
    notifications: "notifications-outline",
    "arrow-right": "arrow-forward",
    play: "play-circle-outline",
    stop: "stop-circle-outline",
    cash: "cash-outline",
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
