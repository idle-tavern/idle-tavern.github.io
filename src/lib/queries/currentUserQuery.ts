import { useQuery } from "react-query"
import { db } from "../database.ts"
import { User } from "../models/user.ts"

export function fetchCurrentUser() {
    return db.UserService.getCurrentUser<User>()
}

export const CURRENT_USER_QUERY_KEY = "currentUser" as const

export function useCurrentUser() {
    return useQuery(CURRENT_USER_QUERY_KEY, fetchCurrentUser)
}