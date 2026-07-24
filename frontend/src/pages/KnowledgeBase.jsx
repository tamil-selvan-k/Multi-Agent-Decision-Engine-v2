import { useEffect, useState } from "react";
import { Search, FileText } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import { api } from "../api/api.js";

export default function KnowledgeBase() {
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getKnowledgeCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api.getKnowledgeDocuments({ q }).then((docs) => {
        setDocuments(docs);
        setLoading(false);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <Topbar title="Knowledge Base" subtitle="Enterprise knowledge and decision context" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="card p-4 lg:col-span-1 h-fit">
          <p className="text-xs font-medium text-slate-400 uppercase mb-3">All Types</p>
          <div className="space-y-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id === activeCategory ? null : c.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeCategory === c.id
                    ? "bg-brand-100 text-brand-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{c.name}</span>
                <span className="text-xs text-slate-400">{c.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search knowledge base..."
                className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-medium">Document</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400">
                    Loading documents…
                  </td>
                </tr>
              ) : (
                documents.map((d) => (
                  <tr key={d.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {d.name}
                      </div>
                    </td>
                    <td className="py-3 text-slate-500">{d.type}</td>
                    <td className="py-3 text-slate-500">{d.updated}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <a href="#" className="text-brand-600 text-sm font-medium inline-block mt-4">
            View all knowledge →
          </a>
        </div>
      </div>
    </div>
  );
}
