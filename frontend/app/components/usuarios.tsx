import React, { useEffect, useRef, useState } from "react";
import ActionButtons from "./ActionButtons";

const users = [
  { name: "Emily Carter", email: "emily.carter@example.com", role: "Admin", status: "Active" },
  { name: "Daniel Harris", email: "daniel.harris@example.com", role: "User", status: "Active" },
  { name: "Chloe Foster", email: "chloe.foster@example.com", role: "User", status: "Inactive" },
  { name: "Noah Parker", email: "noah.parker@example.com", role: "User", status: "Active" },
  { name: "Isabella Morgan", email: "isabella.morgan@example.com", role: "User", status: "Active" },
];

export default function UsersTable() {
  const [selected, setSelected] = useState(() => new Set<number>());
  const headerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    headerRef.current.indeterminate = selected.size > 0 && selected.size < users.length;
  }, [selected]);

  function toggleAll() {
    if (selected.size === users.length) setSelected(new Set());
    else setSelected(new Set(users.map((_, i) => i)));
  }

  function toggleOne(i: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(i);
      else next.delete(i);
      return next;
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
      <table className="w-full">
        <thead className="bg-white">
            <tr>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-900">
              <input
                ref={headerRef}
                type="checkbox"
                checked={selected.size === users.length && users.length > 0}
                onChange={() => toggleAll()}
                className="w-4 h-4"
                aria-label="Seleccionar todo"
              />
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Email</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Role</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Status</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
            {users.map((user, i) => (
            <tr key={i} className="border-b border-gray-300">
              <td className="px-4 py-2 text-sm text-gray-900 text-center">
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={(e) => toggleOne(i, e.target.checked)}
                  className="w-4 h-4"
                  aria-label={`Seleccionar usuario ${user.name}`}
                />
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">{user.name}</td>
              <td className="px-4 py-2 text-sm text-gray-500 text-center">{user.email}</td>
              <td className="px-4 py-2">
                <span className="inline-block rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium">
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-2">
                <span className="inline-block rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium">
                  {user.status}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-500">
                <ActionButtons
                  onEdit={() => console.log("Edit user", user.name)}
                  onDelete={() => console.log("Delete user", user.name)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
