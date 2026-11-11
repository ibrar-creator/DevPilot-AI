
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import LogoutButton from "@/components/auth/LogoutButton";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Bug,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Command,
  FlaskConical,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Code Review", icon: ShieldCheck },
  { label: "Code Explainer", icon: Code2 },
  { label: "AI Debugger", icon: Bug },
  { label: "Test Generator", icon: FlaskConical },
];

const stats = [
  {
    label: "AI requests",
    value: "1,284",
    change: "+12.8%",
    positive: true,
    icon: Zap,
  },
  {
    label: "Code reviews",
    value: "348",
    change: "+8.2%",
    positive: true,
    icon: ShieldCheck,
  },
  {
    label: "Bugs detected",
    value: "126",
    change: "+18.4%",
    positive: true,
    icon: Bug,
  },
  {
    label: "Tests generated",
    value: "512",
    change: "+6.5%",
    positive: true,
    icon: FlaskConical,
  },
];

const activities = [
  {
    title: "Authentication module reviewed",
    detail: "Code Review · JavaScript",
    time: "12 minutes ago",
    status: "Completed",
    icon: ShieldCheck,
  },
  {
    title: "API controller explained",
    detail: "Code Explainer · Node.js",
    time: "45 minutes ago",
    status: "Completed",
    icon: Code2,
  },
  {
    title: "Null reference bug detected",
    detail: "AI Debugger · TypeScript",
    time: "2 hours ago",
    status: "Reviewed",
    icon: Bug,
  },
  {
    title: "Unit tests generated",
    detail: "Test Generator · JavaScript",
    time: "Yesterday",
    status: "Completed",
    icon: FlaskConical,
  },
];

const tools = [
  {
    title: "Code Review",
    description: "Find quality issues, security risks and improvements.",
    icon: ShieldCheck,
    color: "blue",
    label: "Analyze code",
  },
  {
    title: "Code Explainer",
    description: "Understand complex code with simple explanations.",
    icon: Code2,
    color: "violet",
    label: "Explain code",
  },
  {
    title: "AI Debugger",
    description: "Identify bugs and get suggested fixes.",
    icon: Bug,
    color: "orange",
    label: "Debug code",
  },
  {
    title: "Test Generator",
    description: "Generate test cases and expected outputs.",
    icon: FlaskConical,
    color: "green",
    label: "Generate tests",
  },
];

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);

  const selectNavigation = (label: string) => {
    setActiveNav(label);
    setMobileMenu(false);
  };

  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      <div className="dashboard-shell">
        {mobileMenu && (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/70 lg:hidden"
            onClick={() => setMobileMenu(false)}
          />
        )}

        <aside
          className={`sidebar ${
            mobileMenu ? "sidebar-open" : ""
          }`}
        >
          <div className="flex items-center justify-between px-6 py-7">
            <div className="flex items-center gap-3">
              <div className="brand-mark">
                <Command size={21} />
              </div>
              <div>
                <p className="text-[17px] font-bold tracking-tight">
                  DevPilot<span className="text-blue-400">.</span>
                </p>
                <p className="text-[10px] tracking-[0.2em] text-slate-500">
                  AI DEVELOPER PLATFORM
                </p>
              </div>
            </div>

            <button
              className="text-slate-400 lg:hidden"
              onClick={() => setMobileMenu(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 pt-5">
            <p className="section-label">WORKSPACE</p>

            <nav className="mt-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.label;

                return (
                  <button
                    key={item.label}
                    onClick={() => selectNavigation(item.label)}
                    className={`nav-item ${
                      active ? "nav-item-active" : ""
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {active && <span className="nav-indicator" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="px-4 pt-9">
            <p className="section-label">PREFERENCES</p>

            <button
              className={`nav-item mt-3 ${
                activeNav === "Settings" ? "nav-item-active" : ""
              }`}
              onClick={() => selectNavigation("Settings")}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <LogoutButton />
          </div>

          <div className="mt-auto p-4">
            <div className="plan-card">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-400" />
                <span className="text-sm font-semibold">Free Plan</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Upgrade your workspace to unlock more AI capabilities.
              </p>
              <button className="mt-4 w-full rounded-lg bg-blue-500 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-400">
                Explore plans <ArrowUpRight size={13} className="ml-1 inline" />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-white/[0.07] px-2 pt-5">
              <div className="avatar">IH</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">Developer</p>
                <p className="text-xs text-slate-500">Free workspace</p>
              </div>
              <ChevronDown size={16} className="text-slate-500" />
              
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="topbar">
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg border border-white/10 p-2 text-slate-300 lg:hidden"
                onClick={() => setMobileMenu(true)}
                aria-label="Open menu"
              >
                <Menu size={19} />
              </button>

              <div>
                <p className="text-xs text-slate-500">Workspace /</p>
                <p className="text-sm font-semibold">{activeNav}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="search-button hidden sm:flex">
                <Search size={15} />
                <span>Search anything...</span>
                <kbd>⌘ K</kbd>
              </button>

              <div className="relative">
                <button
                  className="icon-button"
                  onClick={() => setNotifications(!notifications)}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="notification-dot" />
                </button>

                {notifications && (
                  <div className="notification-panel">
                    <p className="font-semibold">Notifications</p>
                    <p className="mt-2 text-xs text-slate-400">
                      You&apos;re all caught up. New updates will appear here.
                    </p>
                  </div>
                )}
              </div>

              <div className="avatar">IH</div>
            </div>
          </header>

          <div className="dashboard-content">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="online-dot" />
                  <span className="text-xs font-medium text-emerald-400">
                    ALL SYSTEMS OPERATIONAL
                  </span>
                </div>

                <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back, Developer <span>👋</span>
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  Here&apos;s what&apos;s happening in your development workspace.
                </p>
              </div>

              <button
                onClick={() => selectNavigation("Code Review")}
                className="primary-button"
              >
                <Plus size={17} />
                New AI session
              </button>
            </motion.div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className="stat-card"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        {stat.label}
                      </span>
                      <div className="stat-icon">
                        <Icon size={17} />
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between">
                      <p className="text-2xl font-bold tracking-tight">
                        {stat.value}
                      </p>
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                        <ArrowUpRight size={13} />
                        {stat.change}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Sample dashboard metrics
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <section className="mt-9">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">AI tools</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Your intelligent development toolkit
                  </p>
                </div>
                <span className="text-xs text-blue-400">4 tools available</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {tools.map((tool, index) => {
                  const Icon = tool.icon;

                  return (
                    <motion.button
                      key={tool.title}
                      onClick={() => selectNavigation(tool.title)}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="tool-card text-left"
                    >
                      <div className={`tool-icon tool-${tool.color}`}>
                        <Icon size={21} />
                      </div>
                      <h3 className="mt-5 text-sm font-semibold">
                        {tool.title}
                      </h3>
                      <p className="mt-2 min-h-[40px] text-xs leading-5 text-slate-400">
                        {tool.description}
                      </p>
                      <div className="mt-5 flex items-center justify-between text-xs font-medium text-blue-400">
                        {tool.label}
                        <ArrowUpRight size={15} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            <div className="mt-9 grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
              <section className="panel-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold">Recent activity</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Your latest AI interactions
                    </p>
                  </div>
                  <button className="text-xs font-medium text-blue-400 hover:text-blue-300">
                    View all
                  </button>
                </div>

                <div className="mt-5 divide-y divide-white/[0.06]">
                  {activities.map((activity) => {
                    const Icon = activity.icon;

                    return (
                      <div
                        key={activity.title}
                        className="flex items-center gap-3 py-4"
                      >
                        <div className="activity-icon">
                          <Icon size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {activity.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {activity.detail}
                          </p>
                        </div>
                        <div className="hidden text-right sm:block">
                          <p className="text-[11px] text-slate-400">
                            {activity.time}
                          </p>
                          <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-emerald-400">
                            <Check size={12} />
                            {activity.status}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="panel-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold">Usage overview</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Monthly AI activity
                    </p>
                  </div>
                  <Activity size={18} className="text-blue-400" />
                </div>

                <div className="mt-7">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold">1,284</p>
                      <p className="mt-1 text-xs text-slate-500">
                        AI requests used
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">This month</span>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" />
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    <span>64% used</span>
                    <span>Illustrative usage</span>
                  </div>
                </div>

                <div className="mt-7 rounded-xl border border-blue-400/15 bg-blue-500/[0.07] p-4">
                  <div className="flex gap-3">
                    <div className="rounded-lg bg-blue-500/15 p-2 text-blue-400">
                      <Sparkles size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Build faster with DevPilot
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Use AI-powered tools to improve your coding workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-white/[0.07] py-6 text-xs text-slate-500 sm:flex-row">
              <span>© 2026 DevPilot AI. Your Code. Your AI. Your Copilot.</span>
              <span className="flex items-center gap-2">
                <Clock3 size={13} /> Built for developers
              </span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
