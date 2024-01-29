import { Button, Card, CardBody, CardFooter, CardHeader, Input } from "@nextui-org/react"
import { CSSProperties, useState } from "react"
import { useNavigate } from "react-router-dom"
import background from "../../assets/images/login-door.jpeg"
import { authenticateUser } from "../../lib/queries/authenticateUser.ts"
import { hasRegisteredUserQuery } from "../../lib/queries/hasRegisteredUserQuery.ts"
import { registerUser } from "../../lib/queries/registerUser.ts"

const cardClasses = [
    "border-none",
    "bg-background/60",
    "dark:bg-default-150/50",
    "max-w-[610px]",
    "text-white",
    "flex-1",
    "m-12",
    "p-4",

    "transition",
    "duration-300",
    "ease-in-out",
].join(" ")

function getOffset(target: number, current: number) {
    if (target === current) return 0
    return target > current ? 100 : -100
}

const IDENTIFY = 0
const NAME = 1
const AUTHENTICATE = 2

export function WelcomePage() {
    const navigate = useNavigate()

    const [current, setCurrent] = useState(IDENTIFY)
    const [isLoading, setIsLoading] = useState(false)
    const [isNew, setIsNew] = useState(false)

    const [email, setEmail] = useState("")
    const [name, setName] = useState("")

    async function submitEmail(email: string) {
        setIsLoading(true)
        setEmail(email)

        try {
            const hasRegistered = await hasRegisteredUserQuery(email)
            setIsNew(!hasRegistered)
            setCurrent(hasRegistered ? AUTHENTICATE : NAME)
        } catch (e) {

            // TODO nic: Show error
            console.error(e)

        } finally {
            setIsLoading(false)
        }
    }

    function submitName(name: string) {
        setName(name)
        setCurrent(AUTHENTICATE)
    }

    async function submitPassword(password: string) {
        setIsLoading(true)

        try {
            if (isNew) {
                await registerUser({ email, password, name })
            }

            await authenticateUser({ email, password })
            navigate("/", { replace: true })
        } catch (e) {

            // TODO nic: Show error
            console.error(e)

        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main
            className="dark text-foreground bg-background max-w-full h-screen bg-cover bg-center flex flex-col justify-center items-center"
            style={{ background: `url(${background}) center` }}
        >
            <div className="flex flex-col justify-center items-center text-center mt-16  p-6 w-full bg-background/60 dark:bg-default-150/50">
                {(() => {
                    switch (current) {
                        case IDENTIFY:
                            return (
                                <>
                                    <h1 className="text-6xl font-bold text-white">Good day, traveller</h1>
                                    <span className="text-2xl font-bold text-white mx-2">Welcome to the Idle Tavern, please identify yourself...</span>
                                </>
                            )

                        case NAME:
                            return (
                                <>
                                    <h1 className="text-6xl font-bold text-white">You're new...</h1>
                                    <span className="text-2xl font-bold text-white mx-2">What can we call you?</span>
                                </>
                            )

                        case AUTHENTICATE:
                            return isNew ? (

                                <>
                                    <h1 className="text-6xl font-bold text-white">Good to see you again</h1>
                                    <span className="text-2xl font-bold text-white mx-2">
                                        What is the secret password?
                                    </span>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-6xl font-bold text-white">It's nice to meet you, {name}</h1>
                                    <span className="text-2xl font-bold text-white mx-2">
                                        We need a secret password so that I know it's you next time...
                                    </span>
                                </>
                            )
                    }
                })()}
            </div>
            <section className="flex w-full justify-center">
                <IdentifyCard
                    current={current} loading={isLoading} onSubmit={submitEmail}
                    style={{
                        position: current === IDENTIFY ? "unset" : "absolute",
                        transform: `translateX(${getOffset(IDENTIFY, current)}vw)`,
                    }}
                />
                <NameCard
                    current={current} loading={isLoading} onSubmit={submitName} onBack={() => setCurrent(IDENTIFY)}
                    style={{
                        visibility: current === NAME ? "visible" : "hidden",
                        position: current === NAME ? "unset" : "absolute",
                        transform: `translateX(${getOffset(NAME, current)}vw)`,
                    }}
                />
                <PasswordCard
                    isNew={isNew}
                    current={current} loading={isLoading} onSubmit={submitPassword}
                    style={{
                        position: current === AUTHENTICATE ? "unset" : "absolute",
                        transform: `translateX(${getOffset(AUTHENTICATE, current)}vw)`,
                    }}
                />
            </section>
        </main>
    )
}

type CardProps = {
    current: number,
    onSubmit: (value: string) => void
    loading?: boolean,
    style?: CSSProperties
}

function IdentifyCard({ style, loading, onSubmit }: CardProps) {
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")

    function submitEmail(email: string) {
        if (!email) {
            setError("Email is required")
            return
        }

        if (!email.includes("@")) {
            setError("Email is invalid")
            return
        }

        setError("")
        onSubmit(email)
    }

    return (
        <Card isBlurred shadow="sm" className={cardClasses} style={style}>
            <CardHeader>
                <h4 className="text-2xl font-bold text-gray-300">Identify yourself</h4>
            </CardHeader>
            <CardBody>
                <Input
                    type="email"
                    variant="bordered"
                    placeholder="Email"
                    errorMessage={error}
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </CardBody>
            <CardFooter className="justify-end">
                <Button color="primary" isLoading={loading} onClick={() => submitEmail(email)}>
                    Identify yourself...
                </Button>
            </CardFooter>
        </Card>
    )
}

function PasswordCard({ style, isNew, loading, onSubmit }: CardProps & { isNew: boolean }) {
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    function submitPassword(password: string) {
        if (!password) {
            setError("Password is required")
            return
        }

        if (password.length < 8) {
            setError("Password is too short")
            return
        }

        setError("")
        onSubmit(password)
    }

    return (
        <Card isBlurred shadow="sm" className={cardClasses} style={style}>
            <CardHeader>
                <h4 className="text-2xl font-bold text-gray-300">
                    {isNew ? "What should the password be?" : "What is the secret password?"}
                </h4>
            </CardHeader>
            <CardBody>
                <Input
                    type="password"
                    variant="bordered"
                    placeholder="Password"
                    errorMessage={error}
                    description="Password must be at least 8 characters long"
                    autoComplete={isNew ? "new-password" : "current-password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </CardBody>
            <CardFooter className="justify-end">
                <Button color="primary" isLoading={loading} onClick={() => submitPassword(password)}>
                    Whisper password
                </Button>
            </CardFooter>
        </Card>
    )
}

function NameCard({ style, loading, onSubmit, onBack }: CardProps & { onBack: () => void }) {
    const [name, setName] = useState("")
    const [error, setError] = useState("")

    function submitName(name: string) {
        if (!name) {
            setError("We need to call you something...")
            return
        }

        setError("")
        onSubmit(name)
    }

    return (
        <Card isBlurred shadow="sm" className={cardClasses} style={style}>
            <CardHeader>
                <h4 className="text-2xl font-bold text-gray-300">What can we call you?</h4>
            </CardHeader>
            <CardBody>
                <Input
                    type="text"
                    variant="bordered"
                    placeholder="Name"
                    errorMessage={error}
                    autoComplete="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </CardBody>
            <CardFooter className="justify-end gap-2">
                <Button variant="bordered" isLoading={loading} onClick={onBack}>
                    No, I have been before!
                </Button>
                <Button color="primary" isLoading={loading} onClick={() => submitName(name)}>
                    Introduce yourself...
                </Button>
            </CardFooter>
        </Card>
    )
}