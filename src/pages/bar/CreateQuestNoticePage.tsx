import {
    Autocomplete,
    AutocompleteItem,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Divider,
    Input,
    Textarea,
} from "@nextui-org/react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User } from "../../lib/models/user.ts"
import { useAvailableCampaignNames, useCreateCampaignMutation } from "../../lib/queries/campaigns.ts"
import { useGameSystemsQuery } from "../../lib/queries/gameSystems.ts"
import {
    QuestDto,
    useCreateQuestMutation,
    useLinkQuestToCampaignMutation,
    useListQuestsQuery,
    useSetQuestGameSystemMutation,
} from "../../lib/queries/quest.ts"
import { useAddScheduledGameMutation } from "../../lib/queries/scheduledGames.ts"
import { useDmUsersQuery } from "../../lib/queries/users.ts"

export function CreateQuestNoticePage() {
    const [step, setStep] = useState<number>(0)

    const [questId, setQuestId] = useState<string | undefined>(undefined)

    return (
        <section className="p-6 self-center w-full lg:max-w-[50%]">
            {(() => {
                switch (step) {
                    case 0:
                        return <QuestStep onQuestSelected={quest => {
                            setQuestId(quest.objectId)
                            setStep(1)
                        }} />

                    case 1:
                        return <ContextStep questId={questId!} onContextSet={() => {
                            setStep(2)
                        }} />

                    case 2:
                        return <ScheduleStep questId={questId!} />
                }
            })()}
        </section>
    )
}


type QuestStepProps = { onQuestSelected: (quest: QuestDto) => void }

function QuestStep({ onQuestSelected }: QuestStepProps) {
    const [createNewQuest, setCreateNewQuest] = useState<boolean>(true)

    const [title, setTitle] = useState<string>("")
    const [description, setDescription] = useState<string>("")

    const [selectedQuest, setSelectedQuest] = useState<QuestDto | undefined>(undefined)

    const { data: quests, isFetching: fetchingQuests } = useListQuestsQuery()
    const { mutateAsync: createQuestMutation, isLoading: creatingQuest } = useCreateQuestMutation()

    async function next() {
        if (createNewQuest) {
            onQuestSelected(await createQuestMutation({ title, description }))
            return
        }

        if (selectedQuest !== undefined) {
            onQuestSelected(selectedQuest)
            return
        }
    }

    return (
        <Card className="p-6">
            <CardHeader>
                <h2 className="text-2xl">Quest</h2>
            </CardHeader>

            <CardBody>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-2 justify-center mb-2">
                        <Button variant={createNewQuest ? "solid" : "ghost"}
                                color={createNewQuest ? "primary" : "default"}
                                size="sm" className="flex-1 rounded-r-none"
                                onClick={() => setCreateNewQuest(true)}
                        >New quest</Button>

                        <Button variant={!createNewQuest ? "solid" : "ghost"}
                                color={!createNewQuest ? "primary" : "default"}
                                size="sm" className="flex-1 rounded-l-none ml-[-1px]"
                                onClick={() => setCreateNewQuest(false)}
                        >Existing quest</Button>
                    </div>

                    {createNewQuest ? (
                        <>
                            <Input variant="bordered" type="text" label="What is the quest called?"
                                   value={title} onValueChange={setTitle} />

                            <Textarea variant="bordered" label="Describe the quest..."
                                      value={description} onValueChange={setDescription} />
                        </>
                    ) : (
                        <Autocomplete
                            label="Quest"
                            placeholder="Type to search..."
                            variant="bordered"
                            defaultItems={quests ?? []}
                            isLoading={fetchingQuests}
                            onSelectionChange={key => setSelectedQuest(quests?.find(q => q.objectId === key))}
                        >
                            {(item) => <AutocompleteItem
                                key={item.objectId}>{item.title}</AutocompleteItem>}
                        </Autocomplete>
                    )}
                </div>
            </CardBody>

            <CardFooter>
                <div className="flex-1 flex gap-2 justify-end">
                    <Button variant="flat" color="default" as={Link} to="/notice-board">Cancel</Button>
                    <Button variant="solid" color="primary" isLoading={creatingQuest} onClick={next}>Next</Button>
                </div>
            </CardFooter>
        </Card>
    )
}

type CampaignStepProps = { questId: string, onContextSet: () => void }

function ContextStep({ questId, onContextSet }: CampaignStepProps) {
    const [questType, setQuestType] = useState<"one" | "new" | "existing">("one")

    const [name, setName] = useState<string>("")
    const [gameSystem, setGameSystem] = useState<string>("")
    const [campaignId, setCampaignId] = useState<string | undefined>(undefined)

    const { data: gameSystems, isFetching: loadingGameSystems } = useGameSystemsQuery()
    const { data: campaigns, isFetching: loadingCampaigns } = useAvailableCampaignNames()

    const { mutateAsync: setQuestGameSystem, isLoading: settingGameSystem } = useSetQuestGameSystemMutation()
    const { mutateAsync: createCampaignMutation, isLoading: creatingCampaign } = useCreateCampaignMutation()
    const { mutateAsync: linkCampaign, isLoading: linkingCampaign } = useLinkQuestToCampaignMutation()

    const isLoading = settingGameSystem || creatingCampaign || linkingCampaign

    async function next() {
        switch (questType) {
            case "one":
                if (gameSystem) {
                    await setQuestGameSystem({ questId, gameSystem })
                    onContextSet()
                }
                break

            case "new":
                if (gameSystems && name) {
                    const { objectId: campaignId } = await createCampaignMutation({ name, gameSystem })
                    await linkCampaign({ questId, campaignId })
                    onContextSet()
                }
                break

            case "existing":
                if (campaignId) {
                    await linkCampaign({ questId, campaignId })
                    onContextSet()
                }
                break
        }
    }

    return (
        <Card className="p-6">
            <CardHeader>
                <h2 className="text-2xl">Context</h2>
            </CardHeader>

            <CardBody>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-2 justify-center mb-2">
                        <Button variant={questType === "one" ? "solid" : "ghost"}
                                color={questType === "one" ? "primary" : "default"}
                                size="sm" className="flex-1 rounded-r-none"
                                onClick={() => setQuestType("one")}
                        >One shot</Button>

                        <Button variant={questType === "new" ? "solid" : "ghost"}
                                color={questType === "new" ? "primary" : "default"}
                                size="sm" className="flex-1 rounded-none mx-[-1px]"
                                onClick={() => setQuestType("new")}
                        >New campaign</Button>

                        <Button variant={questType === "existing" ? "solid" : "ghost"}
                                color={questType === "existing" ? "primary" : "default"}
                                size="sm" className="flex-1 rounded-l-none ml-[-1px]"
                                onClick={() => setQuestType("existing")}
                        >Existing campaign</Button>
                    </div>

                    {questType === "one" && (
                        <Autocomplete
                            allowsCustomValue
                            label="Game system"
                            placeholder="Type to search..."
                            description="If the system is not listed, you can type it in and it will be abailable next time."
                            variant="bordered"
                            defaultItems={gameSystems ?? []}
                            isLoading={loadingGameSystems}
                            onSelectionChange={key => setGameSystem(gameSystems?.find(gs => gs.value === key)?.value ?? "")}
                            onValueChange={setGameSystem}
                            value={gameSystem}
                        >
                            {(item) => <AutocompleteItem
                                key={item.value}>{item.label}</AutocompleteItem>}
                        </Autocomplete>
                    )}

                    {questType === "existing" && (
                        <Autocomplete
                            label="Campaign"
                            placeholder="Type to search..."
                            variant="bordered"
                            defaultItems={campaigns ?? []}
                            isLoading={loadingCampaigns}
                            onSelectionChange={key => setCampaignId(campaigns?.find(c => c.value === key)?.value ?? "")}
                            onValueChange={setCampaignId}
                            value={campaignId}
                        >
                            {(item) => <AutocompleteItem
                                key={item.value}>{item.label}</AutocompleteItem>}
                        </Autocomplete>
                    )}

                    {questType === "new" && (
                        <>
                            <Input variant="bordered" type="text" label="What is the campaign called?"
                                   value={name} onValueChange={setName} />

                            <Autocomplete
                                allowsCustomValue
                                label="Game system"
                                placeholder="Type to search..."
                                description="If the system is not listed, you can type it in and it will be abailable next time."
                                variant="bordered"
                                defaultItems={gameSystems ?? []}
                                isLoading={loadingGameSystems}
                                onSelectionChange={key => setGameSystem(gameSystems?.find(gs => gs.value === key)?.value ?? "")}
                                onValueChange={setGameSystem}
                                value={gameSystem}
                            >
                                {(item) => <AutocompleteItem
                                    key={item.value}>{item.label}</AutocompleteItem>}
                            </Autocomplete>
                        </>
                    )}
                </div>
            </CardBody>

            <CardFooter>
                <div className="flex-1 flex gap-2 justify-end">
                    <Button variant="flat" color="default" as={Link} to="/notice-board">Cancel</Button>
                    <Button variant="solid" color="primary" isLoading={isLoading} onClick={next}>Next</Button>
                </div>
            </CardFooter>
        </Card>
    )
}

type ScheduleStepProps = {
    questId: string,
    campaignId?: string,
}

function ScheduleStep({ questId }: ScheduleStepProps) {
    const [dates, setDates] = useState<string[]>([])
    const [selectedDm, setSelectedDm] = useState<Record<string, User>>({})

    const navigate = useNavigate()

    const { data: dms, isFetching: loadingDms } = useDmUsersQuery()
    const { mutateAsync: addSchedulesGame } = useAddScheduledGameMutation()


    const [isLoading, setIsLoading] = useState<boolean>(false)

    function updateDate(index: number, date: string) {
        const newDates = [...dates]
        newDates[index] = date
        setDates(newDates)
    }

    async function next() {
        if (dates.length === 0) {
            return navigate("/notice-board")
        }

        setIsLoading(true)

        await Promise.all(
            dates.map(date => addSchedulesGame({ questId, date, dm: selectedDm[date] })),
        )

        setIsLoading(false)
        navigate("/notice-board")
    }

    return (
        <Card className="p-6">
            <CardHeader>
                <h2 className="text-2xl">Schedule</h2>
            </CardHeader>

            <CardBody>
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-gray-400">When is the game being played?</span>
                    {dates.map((date, i) => (
                        <div className="flex flex-col gap-2">
                            <Input type="date" variant="bordered" size="sm" key={date + i}
                                   value={date.toString()} onValueChange={d => updateDate(i, d)}
                            />
                            <Autocomplete
                                label="Dungeon master (optional)"
                                placeholder="Type to search..."
                                variant="bordered"
                                defaultItems={dms ?? []}
                                isLoading={loadingDms}
                                value={selectedDm[date]?.email ?? ""}
                                onSelectionChange={key => setSelectedDm(d => ({
                                    ...d,
                                    [date]: dms?.find(c => c.email === key)!,
                                }))}
                            >
                                {(item) => <AutocompleteItem
                                    key={item.email}>{item.name}</AutocompleteItem>}
                            </Autocomplete>
                            <Button variant="faded" size="sm" className="w-min"
                                    onClick={() => setDates(d => d.filter((_, j) => j !== i))}>
                                Remove
                            </Button>
                            <Divider className="my-2" />
                        </div>
                    ))}
                    <Button isIconOnly variant="flat" onClick={() => setDates(d => [...d, ""])}>+</Button>
                </div>
            </CardBody>

            <CardFooter>
                <div className="flex-1 flex gap-2 justify-end">
                    <Button variant="flat" color="default" as={Link} to="/notice-board">Cancel</Button>
                    {
                        dates.length === 0 ? (
                            <Button variant="solid" color="primary">Skip</Button>
                        ) : (
                            <Button variant="solid" color="primary" isLoading={isLoading} onClick={next}>Finish</Button>
                        )
                    }
                </div>
            </CardFooter>
        </Card>
    )
}