"use client";

import { useState } from "react";

type Account = {
  id: string;
  ten: string;
  email: string;
  role: string;
  status: "Active" | "Banned";
};

const seedAccounts: Account[] = [
  { id: "u01", ten: "Khánh An", email: "khanhan@mmhcs.local", role: "Player", status: "Active" },
  { id: "u02", ten: "Minh Triết", email: "minhtriet@mmhcs.local", role: "Player", status: "Banned" },
  { id: "u03", ten: "Hà My", email: "hamy@mmhcs.local", role: "Player", status: "Active" },
];

export default function Page() {
  const [accounts, setAccounts] = useState<Account[]>(seedAccounts);
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [roleId, setRoleId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState("Player");
  const [createPassword, setCreatePassword] = useState("");

  const toggleBan = (id: string) => {
    setAccounts((ds) =>
      ds.map((a) =>
        a.id === id ? { ...a, status: a.status === "Banned" ? "Active" : "Banned" } : a
      )
    );
  };

  const xoaTaiKhoan = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    if (!confirm(`Xóa tài khoản ${acc.ten}?`)) return;
    setAccounts((ds) => ds.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-300 bg-white p-5 shadow-md">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] text-slate-700">Tài khoản</div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 title-scan">Quản lí tài khoản người chơi</h1>
          <p className="mt-1 text-sm text-slate-700">
            Tạo tài khoản, ban/unban, reset mật khẩu và xóa tài khoản.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateOpen(true);
            setCreateName("");
            setCreateEmail("");
            setCreateRole("Player");
            setCreatePassword("");
          }}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          + Tạo tài khoản
        </button>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md">
        <div className="overflow-hidden rounded-xl border border-slate-300">
          <div className="grid grid-cols-[1.1fr_1.4fr_0.7fr_0.6fr_1.2fr] bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-700">
            <div>Tên</div>
            <div>Email</div>
            <div>Vai trò</div>
            <div>Trạng thái</div>
            <div>Hành động</div>
          </div>
          {accounts.map((x) => (
            <div
              key={x.id}
              className="grid grid-cols-[1.1fr_1.4fr_0.7fr_0.6fr_1.2fr] border-t border-slate-200 px-4 py-3 text-sm"
            >
              <div className="font-semibold text-slate-900">{x.ten}</div>
              <div className="text-slate-700">{x.email}</div>
              <div className="text-slate-800">{x.role}</div>
              <div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                    x.status === "Banned"
                      ? "bg-rose-50 text-rose-700 ring-rose-200"
                      : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  }`}
                >
                  {x.status === "Banned" ? "Bị cấm" : "Hoạt động"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetId(x.id);
                    setNewPassword("");
                  }}
                  className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-300"
                >
                  Reset mật khẩu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleId(x.id);
                    setNewRole(x.role);
                  }}
                  className="rounded-lg bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-200"
                >
                  Đổi vai trò
                </button>
                {x.status === "Banned" ? (
                  <button
                    type="button"
                    onClick={() => toggleBan(x.id)}
                    className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                  >
                    Unban
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleBan(x.id)}
                    className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200"
                  >
                    Ban
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => xoaTaiKhoan(x.id)}
                  className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {resetId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-4 shadow-lg">
            <div className="text-sm font-semibold text-slate-900">Đổi mật khẩu</div>
            <div className="mt-1 text-xs text-slate-600">
              Nhập mật khẩu mới cho tài khoản{" "}
              <span className="font-semibold text-slate-900">
                {accounts.find((a) => a.id === resetId)?.ten ?? "người chơi"}
              </span>
              .
            </div>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="Mật khẩu mới"
              className="mt-3 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setResetId(null);
                  setNewPassword("");
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!newPassword.trim()}
                onClick={() => {
                  if (!newPassword.trim()) return;
                  setResetId(null);
                  setNewPassword("");
                }}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                Lưu mật khẩu
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {roleId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-4 shadow-lg">
            <div className="text-sm font-semibold text-slate-900">Đổi vai trò</div>
            <div className="mt-1 text-xs text-slate-600">
              Chọn vai trò mới cho{" "}
              <span className="font-semibold text-slate-900">
                {accounts.find((a) => a.id === roleId)?.ten ?? "người chơi"}
              </span>
              .
            </div>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="mt-3 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="Player">Player</option>
              <option value="Moderator">Moderator</option>
              <option value="Admin">Admin</option>
            </select>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRoleId(null);
                  setNewRole("");
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!newRole}
                onClick={() => {
                  if (!newRole) return;
                  setAccounts((ds) => ds.map((a) => (a.id === roleId ? { ...a, role: newRole } : a)));
                  setRoleId(null);
                  setNewRole("");
                }}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                Lưu vai trò
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-4 shadow-lg">
            <div className="text-sm font-semibold text-slate-900">Tạo tài khoản</div>
            <div className="mt-1 text-xs text-slate-600">Nhập thông tin tài khoản mới.</div>
            <div className="mt-3 space-y-2">
              <input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Tên người chơi"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
              />
              <input
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="Email"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
              />
              <input
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Mật khẩu"
                type="password"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
              />
              <select
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="Player">Player</option>
                <option value="Moderator">Moderator</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!createName.trim() || !createEmail.trim() || !createPassword.trim()}
                onClick={() => {
                  if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) return;
                  setAccounts((ds) => [
                    ...ds,
                    {
                      id: `u${Date.now()}`,
                      ten: createName.trim(),
                      email: createEmail.trim(),
                      role: createRole,
                      status: "Active",
                    },
                  ]);
                  setCreateOpen(false);
                }}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

