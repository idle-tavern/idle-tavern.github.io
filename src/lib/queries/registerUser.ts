import { db } from "../database.ts"

type RegisterUserRequest = { email: string, name: string, password: string }

export function registerUser(request: RegisterUserRequest) {
    return db.UserService.register(request)
}