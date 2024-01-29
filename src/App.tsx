import { NextUIProvider } from "@nextui-org/react"
import { QueryClient, QueryClientProvider } from "react-query"
import { createBrowserRouter, redirect, RouterProvider } from "react-router-dom"
import { UserSessionProvider } from "./lib/context/userSession.tsx"
import { hasPermissionLoader, Permission } from "./lib/permissions.ts"
import { fetchCurrentUser } from "./lib/queries/currentUserQuery.ts"
import { HomePage } from "./pages/bar/HomePage.tsx"
import { CreateQuestNoticePage } from "./pages/bar/CreateQuestNoticePage.tsx"
import { NoticeBoardPage } from "./pages/bar/NoticeBoardPage.tsx"
import { RootLayout } from "./pages/RootLayout.tsx"
import { WelcomePage } from "./pages/welcome/WelcomePage.tsx"

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        loader: async () => {
            return await fetchCurrentUser() === null ? redirect("/welcome") : null
        },
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/notice-board", element: <NoticeBoardPage /> },
            {
                path: "/create-quest-notice",
                element: <CreateQuestNoticePage />,
                loader: hasPermissionLoader("/notice-board", Permission.createQuestNotices),
            },
        ],
    },
    {
        path: "/welcome",
        element: <WelcomePage />,
        loader: async () => {
            return await fetchCurrentUser() !== null ? redirect("/") : null
        },
    },
])

const queryClient = new QueryClient()

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <NextUIProvider>
                <UserSessionProvider>
                    <RouterProvider router={router} />
                </UserSessionProvider>
            </NextUIProvider>
        </QueryClientProvider>
    )
}