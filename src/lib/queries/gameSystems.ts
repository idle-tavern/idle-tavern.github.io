import { useQuery } from "react-query"
import { db, Tables } from "../database.ts"

type GameSystem = {
    label: string
    value: string
}

async function loadGameSystems() {
    try {
        const [
            gameSystemsResponse,
            campaignGameSystemsResponse,
        ] = await Promise.all([

            db.Data.of(Tables.quests)
                .find<{ gameSystem: string }>(
                    db.DataQueryBuilder.create()
                        .addProperty("gameSystem")
                        .setWhereClause("gameSystem != null")
                        .setDistinct(true),
                ),

            db.Data.of(Tables.campaigns)
                .find<{ gameSystem: string }>(
                    db.DataQueryBuilder.create()
                        .addProperty("gameSystem")
                        .setWhereClause("gameSystem != null")
                        .setDistinct(true),
                ),
        ])

        const allGameSystemNames =
            [...gameSystemsResponse, ...campaignGameSystemsResponse]
                .map(({ gameSystem }) => gameSystem)
                .filter(gameSystem => !!gameSystem)

        return Array
            .from(new Set(allGameSystemNames).values())
            .map(gameSystem => ({ label: gameSystem, value: gameSystem }))

    } catch (error) {
        console.error(error)
        return [] as GameSystem[]
    }
}

export const GAME_SYSTEMS_QUERY_KEY = "gameSystems"

export function useGameSystemsQuery() {
    return useQuery(GAME_SYSTEMS_QUERY_KEY, loadGameSystems)
}