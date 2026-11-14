"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { motion } from "framer-motion";
import LogoutButton from "@/components/auth/LogoutButton";
import { analyticsService } from "@/services/analytics.service";
import type { DashboardAnalytics } from "@/types/analytics";
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
  FileText,
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Code Review", icon: ShieldCheck },
  { label: "Code Explainer", icon: Code2 },
  { label: "AI Debugger", icon: Bug },
  { label: "Test Generator", icon: FlaskConical },
];

const getStats = (analytics: DashboardAnalytics | null) => [
  {
    label: "AI requests",
    value: analytics?.overview.totalRequests ?? 0,
    icon: Zap,
  },
  {
    label: "Code reviews",
    value: analytics?.overview.codeReviews ?? 0,
    icon: ShieldCheck,
  },
  {
    label: "Bugs detected",
    value: analytics?.overview.bugsDetected ?? 0,
    icon: Bug,
  },
  {
    label: "Tests generated",
    value: analytics?.overview.testsGenerated ?? 0,
    icon: FlaskConical,
  },
];
const getActivityDetails = (tool: string) => {
  switch (tool) {
    case "code-review":
      return {
        title: "Code review completed",
        detail: "Code Review",
        icon: ShieldCheck,
      };

    case "code-explainer":
      return {
        title: "Code explanation generated",
        detail: "Code Explainer",
        icon: Code2,
      };

    case "ai-debugger":
      return {
        title: "Code debugging completed",
        detail: "AI Debugger",
        icon: Bug,
      };

    case "test-generator":
      return {
        title: "Test cases generated",
        detail: "Test Generator",
        icon: FlaskConical,
      };

    default:
      return {
        title: "AI activity completed",
        detail: "AI Tool",
        icon: FileText,
      };
  }
};

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
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);

const [analyticsLoading, setAnalyticsLoading] = useState(true);

const [analyticsError, setAnalyticsError] = useState(false);
  const stats = getStats(analytics);
  const selectNavigation = (label: string) => {
    setActiveNav(label);
    setMobileMenu(false);

    const routes: Record<string, string> = {
      Overview: "/",
      "Code Review": "/code-review",
      "Code Explainer": "/code-explainer",
      "AI Debugger": "/ai-debugger",
      "Test Generator": "/test-generator",
      Settings: "/settings",
    };

    const route = routes[label];

    if (route) {
      router.push(route);
    }
  };
  const router = useRouter();
  const { user, loading } = useAuth();
  const userName = user?.name || "Developer";

  const firstName = userName.trim().split(/\s+/)[0];

  const userInitials =
    userName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);
useEffect(() => {
  if (loading || !user) return;

  let cancelled = false;

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(false);

      const result =
        await analyticsService.getDashboardAnalytics();

      if (!cancelled) {
        setAnalytics(result);
      }
    } catch (error) {
      console.error("Dashboard analytics error:", error);

      if (!cancelled) {
        setAnalyticsError(true);
      }
    } finally {
      if (!cancelled) {
        setAnalyticsLoading(false);
      }
    }
  };

  fetchAnalytics();

  return () => {
    cancelled = true;
  };
}, [loading, user]);
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b12] text-white">
        <p className="text-sm text-slate-400">Checking your session...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b12] text-white">
        <p className="text-sm text-slate-400">Redirecting to login...</p>
      </main>
    );
  }

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

        <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
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
                    className={`nav-item ${active ? "nav-item-active" : ""}`}
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
              <div className="avatar">{userInitials}</div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
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

              <div className="avatar">{userInitials}</div>
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
                  Welcome back, {firstName} <span>👋</span>
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  Here&apos;s what&apos;s happening in your development
                  workspace.
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
                        {analyticsLoading ? "..." : stat.value.toLocaleString()}
                      </p>
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                        <ArrowUpRight size={13} />
                        {stat.value}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Actual account statistics
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
                  {analyticsLoading ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      Loading recent activities...
                    </p>
                  ) : analyticsError ? (
                    <p className="py-8 text-center text-sm text-red-400">
                      Unable to load recent activities.
                    </p>
                  ) : !analytics?.recentActivities.length ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No AI activity yet. Start using your AI tools!
                    </p>
                  ) : (
                    analytics.recentActivities.map((activity) => {
                      const details = getActivityDetails(activity.tool);
                      const Icon = details.icon;

                      return (
                        <div
                          key={activity._id}
                          className="flex items-center gap-3 py-4"
                        >
                          <div className="activity-icon">
                            <Icon size={17} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {details.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {details.detail} · {activity.language}
                            </p>
                          </div>

                          <div className="hidden text-right sm:block">
                            <p className="text-[11px] text-slate-400">
                              {new Date(activity.createdAt).toLocaleString()}
                            </p>

                            <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-emerald-400">
                              <Check size={12} />
                              Completed
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
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
                      <p className="text-3xl font-bold">
                        {analyticsLoading
                          ? "..."
                          : (
                              analytics?.usage.monthlyRequests ?? 0
                            ).toLocaleString()}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        AI requests this month
                      </p>
                    </div>

                    <span className="text-xs text-slate-400">This month</span>
                  </div>

                  <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-400">
                      Monthly token consumption
                    </p>

                    <p className="mt-2 text-xl font-semibold">
                      {analyticsLoading
                        ? "..."
                        : (
                            analytics?.usage.monthlyTokens ?? 0
                          ).toLocaleString()}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Tokens used by your AI tools
                    </p>
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
