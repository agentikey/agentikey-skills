import { Link, Route, Routes } from "react-router-dom";
import RunList from "./pages/RunList.tsx";
import RunDetail from "./pages/RunDetail.tsx";
import CaseDetail from "./pages/CaseDetail.tsx";
import RunInProgress from "./pages/RunInProgress.tsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-slate-100 px-6 py-3 shadow">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Eval Dashboard
        </Link>
        <span className="ml-4 text-xs text-slate-400">
          local · trigger + view eval runs
        </span>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-6">
        <Routes>
          <Route path="/" element={<RunList />} />
          <Route path="/runs/:runId" element={<RunDetail />} />
          <Route
            path="/runs/:runId/:skill/:caseId"
            element={<CaseDetail />}
          />
          <Route path="/run/:tempId" element={<RunInProgress />} />
        </Routes>
      </main>
      <footer className="text-xs text-slate-500 text-center py-3 border-t border-slate-200">
        Reads <code className="font-mono">skills-evaluator/runs/</code> · spawns{" "}
        <code className="font-mono">npm run eval</code> on demand
      </footer>
    </div>
  );
}
