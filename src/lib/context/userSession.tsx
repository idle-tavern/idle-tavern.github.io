import { createContext, PropsWithChildren, useContext } from "react"
import { User } from "../models/user.ts"
import { useCurrentUser } from "../queries/currentUserQuery.ts"

type UserSessionContext = {
    user: User | null;
}

const context =
    createContext<UserSessionContext>({ user: null })

export function UserSessionProvider({ children }: PropsWithChildren) {
    const { data } = useCurrentUser()

    return (
        <context.Provider value={{ user: data ?? null }}>
            {children}
        </context.Provider>
    )
}

export function useUserSession() {
    return useContext(context)
}