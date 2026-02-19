"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!res.ok) {
      router.replace("/login");
      return;
    }

    const data = await res.json();
    setName(data.name);
    setLoading(false);
  }

  function openConfirm() {
    if (!oldPassword) {
      alert("Bitte altes Passwort eingeben");
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      alert("Neues Passwort muss mindestens 4 Zeichen haben");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Neue Passwörter stimmen nicht überein");
      return;
    }

    setShowConfirmModal(true);
  }

  async function changePassword() {
    const res = await fetch("/api/users/change-password", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Fehler");
      return;
    }

    alert("Passwort erfolgreich geändert");

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowConfirmModal(false);
  }

  if (loading) {
    return <main className="p-6">Lade...</main>;
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        Profil von {name}
      </h1>

      <section className="bg-white p-4 rounded-xl shadow space-y-4">

        {/* Altes Passwort */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Altes Passwort
          </label>
          <div className="flex">
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border p-2 rounded-l"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="px-3 border rounded-r bg-gray-100"
            >
              👁
            </button>
          </div>
        </div>

        {/* Neues Passwort */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Neues Passwort
          </label>
          <div className="flex">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border p-2 rounded-l"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="px-3 border rounded-r bg-gray-100"
            >
              👁
            </button>
          </div>
        </div>

        {/* Wiederholen */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Neues Passwort wiederholen
          </label>
          <div className="flex">
            <input
              type={showConfirmPw ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="w-full border p-2 rounded-l"
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPw(!showConfirmPw)
              }
              className="px-3 border rounded-r bg-gray-100"
            >
              👁
            </button>
          </div>
        </div>

        <button
          onClick={openConfirm}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Passwort ändern
        </button>
      </section>

      {/* 🔥 Bestätigungs-Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow space-y-4 w-80">
            <h2 className="font-bold text-lg">
              Passwort wirklich ändern?
            </h2>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1 border rounded"
              >
                Abbrechen
              </button>

              <button
                onClick={changePassword}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Ja, ändern
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
