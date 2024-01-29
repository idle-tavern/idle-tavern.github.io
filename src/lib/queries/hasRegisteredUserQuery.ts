import { db, Tables } from "../database.ts"


export async function hasRegisteredUserQuery(email: string) {
    const count = await db.Data.of(Tables.users).getObjectCount(
        db.DataQueryBuilder.create().setWhereClause(`email = '${email}'`),
    )

    return count > 0
}