import { BookingStatus } from "../../services/bookings"
import { colors } from "./colors"

type StatusMeta = {
    /** Texto completo, usado nas listas do paciente. */
    label: string,
    /** Texto curto, usado nos chips compactos do profissional. */
    shortLabel: string,
    color: string,
    background: string,
}

/**
 * Fonte única dos textos e cores de status. O paciente e o profissional
 * mostram o mesmo estado com a mesma linguagem.
 */
export const BOOKING_STATUS: Record<BookingStatus, StatusMeta> = {
    pending: {
        label: "Aguardando confirmação",
        shortLabel: "Pendente",
        color: colors.yellow1,
        background: colors.yellow2,
    },
    accepted: {
        label: "Confirmado",
        shortLabel: "Confirmado",
        color: colors.green1,
        background: colors.green2,
    },
    in_progress: {
        label: "Em atendimento",
        shortLabel: "Em atendimento",
        color: colors.blue1,
        background: colors.blue2,
    },
    completed: {
        label: "Concluído",
        shortLabel: "Concluído",
        color: colors.gray2,
        background: colors.gray3,
    },
    rejected: {
        label: "Recusado",
        shortLabel: "Recusado",
        color: colors.red1,
        background: colors.red2,
    },
}
