import { useMutation, useQuery } from "react-query"
import { db, Tables } from "../database.ts"
import { User } from "../models/user.ts"
import { QuestDto } from "./quest.ts"

type ScheduledGame = { date: Date, objectId: string }

async function addScheduledGame({ date, questId, dm }: {
    questId: string,
    date: string,
    dm?: User
}) {
    try {
        const entry = await db.Data.of(Tables.scheduledGames)
            .save<ScheduledGame>({ scheduledDate: new Date(date) })

        await db.Data.of(Tables.scheduledGames)
            .addRelation({ objectId: entry.objectId }, "quest", [{ objectId: questId }])

        if (dm) {
            await db.Data.of(Tables.scheduledGames)
                .addRelation({ objectId: entry.objectId }, "dm", [dm])
        }
    } catch (error) {
        console.error(error)
    }
}

type ScheduledGameList = { scheduledDate: number, objectId: string, quest: [QuestDto], dm: [User] }

async function getScheduledGames({ date }: { date: string }) {
    try {
        return db.Data.of(Tables.scheduledGames)
            .find<ScheduledGameList>(
                db.DataQueryBuilder.create()
                    .setWhereClause(`scheduledDate >= '${date}'`)
                    .addRelated(["quest", "dm"]),
            )
    } catch (error) {
        console.error(error)
    }
}

const GET_SCHEDULED_GAMES_LIST_KEY = (date: string) => ["scheduledGames", date]

export function useAddScheduledGameMutation() {
    return useMutation({ mutationFn: addScheduledGame })
}

export function useGetScheduledGamesQuery(date: string) {
    return useQuery({
        queryFn: () => getScheduledGames({ date }),
        queryKey: GET_SCHEDULED_GAMES_LIST_KEY(date),
    })
}