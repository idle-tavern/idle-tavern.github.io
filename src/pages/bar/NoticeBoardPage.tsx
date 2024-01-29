import { Button, Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useUserSession } from "../../lib/context/userSession.tsx"
import { hasAllPermission, Permission } from "../../lib/permissions.ts"
import { useGetScheduledGamesQuery } from "../../lib/queries/scheduledGames.ts"

export function NoticeBoardPage() {
    const { user } = useUserSession()

    const [date, _setDate] = useState(new Date().toISOString().split("T")[0])

    const { data: scheduledGames, isFetching: loadingScheduledGames } = useGetScheduledGamesQuery(date)

    useEffect(() => {console.log(scheduledGames)}, [scheduledGames])

    return (
        <>
            <section className="p-4 flex items-end justify-end">
                {hasAllPermission(user?.permissions ?? 0, Permission.createQuestNotices) && (
                    <Button variant="flat" as={Link} to="/create-quest-notice">Schedule quest</Button>
                )}
            </section>

            {loadingScheduledGames ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {scheduledGames?.map((game) => (
                        <Card key={game.objectId} className="max-w-md p-4">
                            <CardHeader className="flex-row justify-between">
                                <h4 className="text-xl">{game.quest[0].title}</h4>
                                <span className="text-xs text-gray-600">{getFormattedDate(game.scheduledDate)}</span>
                            </CardHeader>
                            <CardBody>
                                <p className="text-sm ">{game.quest[0].description}</p>
                            </CardBody>
                            <CardFooter>
                                <span className="text-sm text-gray-400">{game.dm[0].name}</span>
                            </CardFooter>
                        </Card>
                    ))}
                </ul>
            )}
        </>
    )
}

function getFormattedDate(dateTimestamp: number) {
    const date = new Date(dateTimestamp)
    return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
}