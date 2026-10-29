import { NavLink, Outlet, useLocation, Link } from 'react-router-dom'
import { BookOpen, Boxes, LayoutDashboard, LogOut, Mic, MoreVertical, Settings as SettingsIcon, Tags } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSettings } from '@/hooks/useSettings'
import { Logo } from '@/components/Logo'
import { Sign } from '@/components/Sign'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GlobalVoice } from '@/components/GlobalVoice'
import { CommandBar } from '@/components/CommandBar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/insights', en: 'Insights', hi: 'आज का हाल', icon: LayoutDashboard },
  { to: '/ledger', en: 'Ledger', hi: 'खाता', icon: BookOpen },
  { to: '/stock', en: 'Stock', hi: 'माल', icon: Boxes },
  { to: '/price-sheet', en: 'Price Sheet', hi: 'भाव', icon: Tags },
  { to: '/settings', en: 'Settings', hi: 'सेटिंग', icon: SettingsIcon },
]

const railLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-12 items-center justify-center gap-3 rounded-md px-3 text-[15px] font-medium transition-colors lg:justify-start',
    isActive
      ? 'bg-signal font-semibold text-signal-foreground'
      : 'text-sidebar-foreground hover:bg-sidebar-accent',
  )

const dockLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-full flex-col items-center justify-center gap-0.5 rounded-md text-xs font-medium transition-colors',
    isActive ? 'font-semibold text-primary' : 'text-muted-foreground',
  )

export function AppShell() {
  const { logout, user } = useAuth()
  const { settings } = useSettings()
  const { pathname } = useLocation()
  const onVoice = pathname.startsWith('/ledger/voice')
  const shop = settings?.shopName || user?.email || 'My shop'

  return (
    <div className="min-h-dvh">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col bg-sidebar px-3 py-4 text-sidebar-foreground md:flex lg:w-60">
        <Link to="/insights" className="mb-6 flex h-10 items-center justify-center lg:justify-start lg:px-1" aria-label="SmartLedger home">
          <span className="grid size-9 place-items-center rounded-md bg-signal text-signal-foreground lg:hidden">
            <Mic className="size-5" strokeWidth={2.4} aria-hidden />
          </span>
          <span className="hidden lg:block">
            <Logo onDark />
          </span>
        </Link>
        <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, en, hi, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/ledger'} className={railLink} aria-label={en} title={en}>
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="hidden lg:block">
                <Sign en={en} hi={hi} hiClassName="text-xs" />
              </span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-sidebar-border pt-3">
          <button
            onClick={logout}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-md px-3 text-[15px] font-medium text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:justify-start"
            aria-label="Log out"
          >
            <LogOut className="size-5 shrink-0" aria-hidden />
            <span className="hidden lg:block">Log out</span>
          </button>
        </div>
      </aside>

      <div className="md:pl-[72px] lg:pl-60">
        <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between gap-2 bg-sidebar px-4 text-sidebar-foreground md:border-b md:border-border md:bg-background md:px-6 md:text-foreground lg:px-8">
          <span className="md:hidden">
            <Logo onDark />
          </span>
          <p className="hidden truncate text-sm font-semibold md:block">{shop}</p>
          <div className="flex items-center gap-0.5">
            <CommandBar className="hover:bg-sidebar-accent md:hover:bg-accent" />
            <GlobalVoice className="hover:bg-sidebar-accent md:hover:bg-accent" />
            <ThemeToggle className="hover:bg-sidebar-accent md:hover:bg-accent" />
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="More" className="hover:bg-sidebar-accent hover:text-sidebar-foreground">
                    <MoreVertical aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <SettingsIcon aria-hidden /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={logout}>
                    <LogOut aria-hidden /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1200px] px-4 py-5 pb-32 md:px-6 md:pb-10 lg:px-8">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Main"
        className="no-print fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 items-stretch border-t border-border bg-card px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <NavLink to="/insights" className={dockLink}>
          <LayoutDashboard className="size-5" aria-hidden />
          Insights
        </NavLink>
        <NavLink to="/ledger" end className={dockLink}>
          <BookOpen className="size-5" aria-hidden />
          Ledger
        </NavLink>
        <div className="relative flex justify-center">
          <Link
            to="/ledger/voice"
            aria-label="New sale by voice"
            aria-current={onVoice ? 'page' : undefined}
            className="absolute -top-6 grid size-14 place-items-center rounded-full bg-signal text-signal-foreground shadow-[0_4px_12px_rgba(10,16,32,0.25)] ring-4 ring-background transition-transform active:scale-95"
          >
            <Mic className="size-6" strokeWidth={2.4} aria-hidden />
          </Link>
        </div>
        <NavLink to="/stock" className={dockLink}>
          <Boxes className="size-5" aria-hidden />
          Stock
        </NavLink>
        <NavLink to="/price-sheet" className={dockLink}>
          <Tags className="size-5" aria-hidden />
          Prices
        </NavLink>
      </nav>
    </div>
  )
}
