import {
    Link as NavbarLink,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
} from "@nextui-org/react"
import { PropsWithChildren, useState } from "react"
import { Outlet, useLocation } from "react-router"
import { Link } from "react-router-dom"

import background from "../assets/images/bar.jpg"

export function RootLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div
            className="dark text-foreground bg-background flex flex-col h-screen"
            style={{ background: `url(${background}) center / cover` }}
        >
            <div className="flex flex-1 flex-col bg-background/60 dark:bg-default-150/50">
                <Navbar className="flex-grow-0" onMenuOpenChange={setIsMenuOpen}>
                    <NavbarContent>
                        <NavbarMenuToggle
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            className="sm:hidden"
                        />
                        <NavbarBrand>
                            <p className="font-bold text-inherit">ACME</p>
                        </NavbarBrand>
                    </NavbarContent>

                    <NavbarContent className="hidden sm:flex gap-4" justify="center">
                        <NavItemList />
                    </NavbarContent>
                    <NavbarMenu className="max-w-md">
                        <NavItemList />
                    </NavbarMenu>

                    <NavbarContent justify="end">
                        <NavbarItem className="lg:flex">
                            {/*<Link href="#">Login</Link>*/}
                        </NavbarItem>
                    </NavbarContent>

                </Navbar>

                <Outlet />
            </div>
        </div>
    )
}

function NavItemList() {
    return (
        <>
            <NavbarMenuItem>
                <IdleNavLink to="/">
                    <Link to="/">Home</Link>
                </IdleNavLink>
            </NavbarMenuItem>

            <NavbarMenuItem>
                <IdleNavLink to="/notice-board">
                    <Link to="/notice-board">Notice Board</Link>
                </IdleNavLink>
            </NavbarMenuItem>
        </>
    )
}

type IdleNavLinkProps = { to: string }

function IdleNavLink({ to, children }: PropsWithChildren<IdleNavLinkProps>) {
    const { pathname } = useLocation()
    const color = pathname.endsWith(to) ? "primary" : "foreground"

    return (
        <NavbarLink as="span" className="w-full" color={color} size="sm">
            {children}
        </NavbarLink>
    )
}


