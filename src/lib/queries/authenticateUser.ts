import { useMutation, useQueryClient } from "react-query"
import { db } from "../database.ts"
import { User } from "../models/user.ts"
import { CURRENT_USER_QUERY_KEY } from "./currentUserQuery.ts"

type AuthenticateUserRequest = { email: string, password: string }

export function authenticateUser({ email, password }: AuthenticateUserRequest) {
    return db.UserService.login<User>(email, password, true)
}

export function useAuthenticateUser() {
    const client = useQueryClient()

    return useMutation({
        mutationFn: authenticateUser,
        onSuccess: async () => {
            await client.invalidateQueries(CURRENT_USER_QUERY_KEY)
        },
    })
}