import { redirect } from "react-router-dom"
import { fetchCurrentUser } from "./queries/currentUserQuery.ts"

function bit(n: number) {
    return 1 << n
}

export enum Permission {
    createQuestNotices = bit(0),
}

export function hasAllPermission(permission: number, ...permissions: Permission[]) {
    const mask = permissions.reduce((acc, p) => acc | p, 0)
    return (permission & mask) === mask
}

export function hasPermissionLoader(redirectTo: string, ...permissions: Permission[]) {
    return async () => {
        try {
            const user = await fetchCurrentUser()

            const canAccess = user?.permissions === undefined
                || !hasAllPermission(user.permissions, ...permissions)

            return canAccess ? redirect(redirectTo) : null
        } catch (e) {
            return redirect(redirectTo)
        }
    }
}