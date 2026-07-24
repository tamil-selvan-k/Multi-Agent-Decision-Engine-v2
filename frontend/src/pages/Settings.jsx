import { useEffect, useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { api } from "../api/api.js";

export default function Settings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.getMe().then(setUser);
  }, []);

  return (
    <div>
      <Topbar title="Settings" subtitle="Manage your account and platform preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Account</h3>
          <div className="space-y-4">
            <Field label="Name" value={user?.name ?? ""} />
            <Field label="Email" value={user?.email ?? ""} />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Preferences</h3>
          <div className="space-y-3">
            <ToggleRow label="Email notifications" defaultChecked />
            <ToggleRow label="Weekly digest" defaultChecked />
            <ToggleRow label="Dark mode" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <label className="text-xs text-slate-400">{label}</label>
      <input
        readOnly
        value={value}
        className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50"
      />
    </div>
  );
}

function ToggleRow({ label, defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <button
        onClick={() => setChecked((c) => !c)}
        className={`w-10 h-6 rounded-full transition-colors relative ${
          checked ? "bg-brand-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
