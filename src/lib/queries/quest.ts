import { useMutation, useQuery, useQueryClient } from "react-query"
import { db, Tables } from "../database.ts"
import { GAME_SYSTEMS_QUERY_KEY } from "./gameSystems.ts"

type CreateQuestRequest = {
    title: string;
    description: string;
}

export type QuestDto = {
    objectId: string;
    title: string;
    description: string;
    gameSystem: string | null;
}

async function listQuests() {
    return await db.Data
        .of(Tables.quests)
        .find<QuestDto>()
}

async function createQuest(quest: CreateQuestRequest) {
    return db.Data
        .of(Tables.quests)
        .save<QuestDto>({
            title: quest.title,
            description: quest.description,
        })
}

function linkQuestToCampaign({ questId, campaignId }: { questId: string, campaignId: string }) {
    return db.Data
        .of(Tables.campaigns)
        .addRelation(
            { objectId: campaignId },
            "quests",
            [{ objectId: questId }],
        )
}

async function setQuestGameSystem({ questId, gameSystem }: { questId: string, gameSystem: string }) {
    await db.Data.of(Tables.quests).save({ objectId: questId, gameSystem })
}

export function useCreateQuestMutation() {
    const client = useQueryClient()

    return useMutation({
        mutationFn: createQuest,
        onSuccess: () => {
            return client.invalidateQueries({
                queryKey: [GAME_SYSTEMS_QUERY_KEY],
            })
        },
    })
}

export function useSetQuestGameSystemMutation() {
    return useMutation({ mutationFn: setQuestGameSystem })
}

export function useLinkQuestToCampaignMutation() {
    return useMutation({ mutationFn: linkQuestToCampaign })
}

const LIST_QUESTS_QUERY_KEY = "quests"

export function useListQuestsQuery() {
    return useQuery({
        queryKey: LIST_QUESTS_QUERY_KEY,
        queryFn: listQuests,
    })
}