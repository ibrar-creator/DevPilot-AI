
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { userService } from "@/services/user.service";
import {
  ArrowLeft,
  Settings,
  User,
  ShieldCheck,
  Bell,
  Palette,
  Lock,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, setUser } = useAuth();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [passwordSaving, setPasswordSaving] = useState(false);
const [passwordError, setPasswordError] = useState("");
const [passwordSuccess, setPasswordSuccess] = useState("");

const [showPasswords, setShowPasswords] = useState(false);
const [accountAction, setAccountAction] = useState<
  "deactivate" | "delete" | null
>(null);

const [accountPassword, setAccountPassword] = useState("");
const [accountPasswordVisible, setAccountPasswordVisible] =
  useState(false);

const [accountSaving, setAccountSaving] = useState(false);
const [accountError, setAccountError] = useState("");
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b12] text-slate-400">
        Loading settings...
      </main>
    );
  }
const handlePasswordChange = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  setPasswordError("");
  setPasswordSuccess("");

  if (newPassword.length < 8 || newPassword.length > 72) {
    setPasswordError("Password must contain 8 to 72 characters.");
    return;
  }

  if (
    !/[a-z]/.test(newPassword) ||
    !/[A-Z]/.test(newPassword) ||
    !/[0-9]/.test(newPassword)
  ) {
    setPasswordError(
      "Password must contain uppercase, lowercase and a number."
    );
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordError("New passwords do not match.");
    return;
  }

  try {
    setPasswordSaving(true);

    await userService.changePassword({
      currentPassword,
      newPassword,
    });

    setPasswordSuccess("Password changed. Redirecting to login...");

    setUser(null);

    setTimeout(() => {
      router.replace("/login");
    }, 1200);
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "response" in err) {
      const apiError = err as {
        response?: { data?: { message?: string } };
      };

      setPasswordError(
        apiError.response?.data?.message ||
          "Unable to change password."
      );
    } else {
      setPasswordError("Something went wrong. Please try again.");
    }
  } finally {
    setPasswordSaving(false);
  }
};
const handleAccountAction = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  if (!accountAction) return;

  setAccountError("");

  try {
    setAccountSaving(true);

    const payload = {
      currentPassword: accountPassword,
    };

    if (accountAction === "deactivate") {
      await userService.deactivateAccount(payload);
    } else {
      await userService.deleteAccount(payload);
    }

    setUser(null);
    router.replace("/login");
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "response" in err) {
      const apiError = err as {
        response?: { data?: { message?: string } };
      };

      setAccountError(
        apiError.response?.data?.message ||
          "Unable to complete this action."
      );
    } else {
      setAccountError("Something went wrong. Please try again.");
    }
  } finally {
    setAccountSaving(false);
  }
};

const closeAccountDialog = () => {
  if (accountSaving) return;

  setAccountAction(null);
  setAccountPassword("");
  setAccountPasswordVisible(false);
  setAccountError("");
};
  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 60) {
      setError("Name must contain 2 to 60 characters.");
      setSuccess("");
      return;
    }

    if (trimmedName === user.name) {
      setError("No changes detected.");
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedUser = await userService.updateProfile({
        name: trimmedName,
      });

      setUser(updatedUser);
      setName(updatedUser.name);
      setSuccess("Profile updated successfully!");
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const apiError = err as {
          response?: { data?: { message?: string } };
        };

        setError(
          apiError.response?.data?.message ||
            "Unable to update your profile."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    {
      title: "Security",
      description: "Manage your password and account security.",
      icon: ShieldCheck,
      status: "Coming soon",
    },
    {
      title: "Notifications",
      description: "Control your notification preferences.",
      icon: Bell,
      status: "Coming soon",
    },
    {
      title: "Appearance",
      description: "Customize your workspace appearance.",
      icon: Palette,
      status: "Coming soon",
    },
    {
      title: "Privacy",
      description: "Manage your account privacy.",
      icon: Lock,
      status: "Coming soon",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080b12] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </button>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-3 text-blue-400">
            <Settings size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage your DevPilot workspace.
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-white/[0.07] bg-[#101622] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <User size={20} className="text-blue-400" />
            <h2 className="text-base font-semibold">Edit profile</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="mt-6">
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Full name
            </label>

            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
                setSuccess("");
              }}
              minLength={2}
              maxLength={60}
              required
              className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              placeholder="Enter your full name"
            />

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Email address</p>
                <p className="mt-2 break-all text-sm font-medium">
                  {user.email}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Email cannot be changed here.
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Account role</p>
                <p className="mt-2 text-sm font-medium capitalize">
                  {user.role}
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-400">{error}</p>
            )}

            {success && (
              <p className="mt-4 text-sm text-emerald-400">{success}</p>
            )}

            <button
              type="submit"
              disabled={saving || name.trim() === user.name}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>

<section className="mt-8 rounded-2xl border border-white/[0.07] bg-[#101622] p-5 sm:p-6">
  <div className="flex items-center gap-3">
    <Lock size={20} className="text-blue-400" />
    <div>
      <h2 className="text-base font-semibold">Change password</h2>
      <p className="mt-1 text-xs text-slate-400">
        Update your account password.
      </p>
    </div>
  </div>

  <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
    {[
      {
        label: "Current password",
        value: currentPassword,
        setter: setCurrentPassword,
      },
      {
        label: "New password",
        value: newPassword,
        setter: setNewPassword,
      },
      {
        label: "Confirm new password",
        value: confirmPassword,
        setter: setConfirmPassword,
      },
    ].map((field) => (
      <div key={field.label}>
        <label className="mb-2 block text-sm text-slate-300">
          {field.label}
        </label>

        <div className="relative">
          <input
            type={showPasswords ? "text" : "password"}
            value={field.value}
            onChange={(event) => field.setter(event.target.value)}
            required
            maxLength={72}
            className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-3 pr-12 text-sm text-white outline-none focus:border-blue-500"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />

          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            aria-label="Toggle password visibility"
          >
            {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    ))}

    <p className="text-xs text-slate-500">
      Password must contain at least 8 characters, one uppercase
      letter, one lowercase letter and one number.
    </p>

    {passwordError && (
      <p className="text-sm text-red-400">{passwordError}</p>
    )}

    {passwordSuccess && (
      <p className="text-sm text-emerald-400">{passwordSuccess}</p>
    )}

    <button
      type="submit"
      disabled={passwordSaving}
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
    >
      <Lock size={16} />
      {passwordSaving ? "Updating..." : "Update password"}
    </button>
  </form>
</section>

        <section className="mt-8">
          <h2 className="text-base font-semibold">Other preferences</h2>

          <div className="mt-4 space-y-3">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <div
                  key={section.title}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-[#101622] p-4"
                >
                  <div className="rounded-lg bg-white/[0.05] p-3 text-slate-300">
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold">
                      {section.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {section.description}
                    </p>
                  </div>

                  <span className="shrink-0 text-[10px] text-slate-500">
                    {section.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

<section className="mt-8 rounded-2xl border border-red-500/20 bg-[#101622] p-5 sm:p-6">
  <div>
    <h2 className="text-base font-semibold text-red-400">
      Danger Zone
    </h2>
    <p className="mt-1 text-xs text-slate-400">
      Manage deactivation or permanent removal of your account.
    </p>
  </div>

  <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h3 className="text-sm font-semibold">Deactivate account</h3>
      <p className="mt-1 text-xs text-slate-400">
        Temporarily disable your account. You will not be able to log in.
      </p>
    </div>

    <button
      type="button"
      onClick={() => {
        setAccountAction("deactivate");
        setAccountError("");
      }}
      className="shrink-0 rounded-xl border border-amber-500/30 px-4 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/10"
    >
      Deactivate account
    </button>
  </div>

  <div className="my-6 border-t border-white/[0.07]" />

  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h3 className="text-sm font-semibold">Delete account permanently</h3>
      <p className="mt-1 text-xs text-slate-400">
        Permanently remove your account. This action cannot be undone.
      </p>
    </div>

    <button
      type="button"
      onClick={() => {
        setAccountAction("delete");
        setAccountError("");
      }}
      className="shrink-0 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
    >
      Delete account
    </button>
  </div>
</section>

{accountAction && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-dialog-title"
      className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101622] p-6 shadow-2xl"
    >
      <h2
        id="account-dialog-title"
        className={`text-lg font-semibold ${
          accountAction === "delete" ? "text-red-400" : "text-amber-400"
        }`}
      >
        {accountAction === "delete"
          ? "Permanently delete account?"
          : "Deactivate your account?"}
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {accountAction === "delete"
          ? "Your account will be permanently removed. This action cannot be undone."
          : "Your account will become inactive. You will need assistance to restore access."}
      </p>

      <form onSubmit={handleAccountAction} className="mt-6 space-y-4">
        <label className="block text-sm text-slate-300">
          Confirm your current password
        </label>

        <div className="relative">
          <input
            type={accountPasswordVisible ? "text" : "password"}
            value={accountPassword}
            onChange={(event) => setAccountPassword(event.target.value)}
            required
            maxLength={72}
            autoComplete="current-password"
            placeholder="Enter current password"
            className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-3 pr-12 text-sm text-white outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={() =>
              setAccountPasswordVisible(!accountPasswordVisible)
            }
            aria-label="Toggle password visibility"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {accountPasswordVisible ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {accountError && (
          <p className="text-sm text-red-400">{accountError}</p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={accountSaving}
            onClick={closeAccountDialog}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={accountSaving || !accountPassword}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${
              accountAction === "delete"
                ? "bg-red-600 hover:bg-red-500"
                : "bg-amber-600 hover:bg-amber-500"
            }`}
          >
            {accountSaving
              ? "Processing..."
              : accountAction === "delete"
                ? "Permanently delete"
                : "Confirm deactivation"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      </div>
    </main>
  );
}
