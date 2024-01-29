import Backendless from "backendless"

const BACKENDLESS_APP_ID = "628AE04C-49F5-3859-FFB3-E1646CF6E900"
const BACKENDLESS_API_KEY = "1CC8F9B5-6F8B-4716-BF2A-576934CA9248"
const BACKENDLESS_SERVER_URL = "https://eu-api.backendless.com"

Backendless.initApp({
    appId: BACKENDLESS_APP_ID,
    apiKey: BACKENDLESS_API_KEY,
    serverURL: BACKENDLESS_SERVER_URL,
})

export const db = Backendless

export enum Tables {
    users = "Users",
    quests = "Quest",
    campaigns = "Campaign",
    scheduledGames = "ScheduledGames"
}
