import { useQuery } from "react-query"
import { db, Tables } from "../database.ts"
import { User } from "../models/user.ts"

function loadDmUsers() {
    return db.Data
        .of(Tables.users)
        .find<User>(
            db.DataQueryBuilder.create()
                .setWhereClause("isDm = true"),
        )
}

const DM_USERS_QUERY_KEY = "dmUsers"

export function useDmUsersQuery() {
    return useQuery({
        queryKey: DM_USERS_QUERY_KEY,
        queryFn: loadDmUsers,
    })
}