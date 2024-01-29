import { useMutation, useQuery, useQueryClient } from "react-query"
import { db, Tables } from "../database.ts"

export type CreateCampaignRequest = { name: string, gameSystem: string }
export type CreateCampaignResponse = CreateCampaignRequest & { objectId: string }


async function loadCampaigns() {
    const data = await db.Data
        .of(Tables.campaigns)
        .find<{ objectId: string, name: string }>(
            db.DataQueryBuilder.create()
                .addProperties("objectId", "name"),
        )

    return data.map(({ objectId, name }) => (
        { label: name, value: objectId }
    ))
}

async function createCampaign(dto: CreateCampaignRequest) {
    return await db.Data.of(Tables.campaigns).save(dto) as CreateCampaignResponse
}

export const LIST_OF_CAMPAIGNS_QUERY_KEY = "list-of-campaigns"

export function useAvailableCampaignNames() {
    return useQuery(LIST_OF_CAMPAIGNS_QUERY_KEY, loadCampaigns)
}

export function useCreateCampaignMutation() {
    const client = useQueryClient()

    return useMutation({
        mutationFn: createCampaign,
        onSuccess: async () => {
            await client.invalidateQueries(LIST_OF_CAMPAIGNS_QUERY_KEY)
        },
    })
}