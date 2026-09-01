"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Shield, User, Mail, Phone, Check, X, Users, RefreshCw } from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { authService } from "@/../services/auth.service";

interface UserItem {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  phone?: string;
  createdAt?: string;
}

const ROLES = [
  "Admin",
  "Merchandiser",
  "QA Manager",
  "Fabric Technologist",
  "Production Lead",
  "Finance Manager",
  "Auditor",
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("Merchandiser");
  const [formPhone, setFormPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getAllUsers();
      if (data && Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err: any) {
      console.warn("Failed to load users:", err);
      setError(err?.message || "Failed to load team users from server.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("Merchandiser");
    setFormPhone("");
    setShowModal(true);
  }

  function handleOpenEdit(user: UserItem) {
    setEditingUser(user);
    setFormName(user.fullName || "");
    setFormEmail(user.email);
    setFormRole(user.role || "Merchandiser");
    setFormPhone(user.phone || "");
    setShowModal(true);
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!formEmail) return;

    setSaving(true);
    setError(null);

    try {
      if (editingUser) {
        // Update user
        const updated = await authService.updateUser(editingUser.id, {
          fullName: formName.trim(),
          role: formRole,
          phone: formPhone.trim(),
        });
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...updated } : u)));
      } else {
        // Create / Register user
        const res = await authService.register(
          formEmail.trim(),
          formName.trim() || formEmail.split("@")[0],
          "Guhaya@2026",
          formRole,
          formPhone.trim()
        );
        if (res?.user) {
          setUsers((prev) => [res.user, ...prev]);
        }
      }
      setShowModal(false);
      await loadUsers();
    } catch (err: any) {
      console.error("Save user error:", err);
      setError(err?.message || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm("Are you sure you want to remove this user from the team?")) return;
    try {
      await authService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      console.error("Delete user error:", err);
      alert(err?.message || "Failed to delete user.");
    }
  }

  return (
    <SourcingShell breadcrumb={<span className="font-semibold text-teal-400">User Management</span>}>
      <div className="space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Users className="text-teal-400" size={26} />
              Team & User Management
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Manage team members, roles, permissions, and Supabase accounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadUsers}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 bg-gray-800/60 hover:bg-gray-800 text-xs text-gray-300 transition"
              title="Refresh users"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-[#00BFA5] hover:bg-[#00a892] text-black font-semibold px-4 py-2 rounded-lg text-xs shadow-lg transition"
            >
              <Plus size={15} />
              <span>Add Team Member</span>
            </button>
          </div>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-xl border border-gray-800 bg-[#0d1414] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-800 bg-black/40 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Joined Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="animate-spin text-teal-400" size={20} />
                        <span>Loading team members from Supabase...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      No team members found in the database. Click &quot;Add Team Member&quot; to onboard users.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const initials = (user.fullName || user.email.split("@")[0]).charAt(0).toUpperCase();
                    return (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/20 text-teal-400 font-bold text-xs border border-teal-500/30 shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm">{user.fullName || user.email.split("@")[0]}</p>
                              <p className="text-gray-400 text-[11px]">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/10 px-2.5 py-1 text-[11px] font-medium text-teal-300 border border-teal-500/20">
                            <Shield size={11} className="text-teal-400" />
                            {user.role || "Merchandiser"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-400">
                          {user.phone ? (
                            <span className="flex items-center gap-1.5">
                              <Phone size={12} className="text-gray-500" />
                              {user.phone}
                            </span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-gray-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Active"}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 rounded-lg border border-gray-700 hover:border-teal-500/50 hover:bg-teal-500/10 text-gray-400 hover:text-teal-300 transition"
                              title="Edit user"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 rounded-lg border border-gray-700 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-300 transition"
                              title="Remove user"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit User Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User size={18} className="text-teal-400" />
                  {editingUser ? "Edit Team Member" : "Add New Team Member"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black/60 px-3.5 py-2 text-white placeholder-gray-600 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingUser)}
                    placeholder="user@guhayasourcing.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black/60 px-3.5 py-2 text-white placeholder-gray-600 focus:border-teal-500 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Assigned Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black/60 px-3.5 py-2 text-white focus:border-teal-500 focus:outline-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="bg-[#0d1414] text-white">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black/60 px-3.5 py-2 text-white placeholder-gray-600 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-[#00BFA5] hover:bg-[#00a892] text-black font-semibold transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingUser ? "Update Member" : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}
