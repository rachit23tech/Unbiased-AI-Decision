import { create } from "zustand";
import { runApprovalCheck } from "../utils/approvalParams";
import useNotificationStore from "./useNotificationStore";

function loadHistory() {
  try { return JSON.parse(localStorage.getItem("analysis_history") || "[]"); }
  catch { return []; }
}

function saveHistory(history) {
  try { localStorage.setItem("analysis_history", JSON.stringify(history.slice(0, 50))); }
  catch {}
}

const savedHistory = loadHistory();

const useAnalysisStore = create((set) => ({
  result:  savedHistory[0] ?? null,
  history: savedHistory,

  setResult: (result) =>
    set((state) => {
      const { passed, failures } = runApprovalCheck(result);
      const addNotification = useNotificationStore.getState().addNotification;

      const entry = {
        ...result,
        id: Date.now(),
        runAt: new Date().toISOString(),
        approvalStatus: passed ? "approved" : "auto_rejected",
        ...(passed
          ? { approvedAt: new Date().toISOString() }
          : { rejectedAt: new Date().toISOString(), rejectionReasons: failures }),
      };

      const history = [entry, ...state.history].slice(0, 50);
      saveHistory(history);

      if (passed) {
        addNotification({
          type: "success",
          title: "Report auto-approved",
          message: `"${result.fileName}" passed all fairness checks and was automatically approved.`,
          reportId: entry.id,
        });
      } else {
        addNotification({
          type: "error",
          title: "Report auto-rejected",
          message: `"${result.fileName}" failed ${failures.length} check(s): ${failures.join("; ")}.`,
          reportId: entry.id,
        });
      }

      return { result: entry, history };
    }),

  clearResult: () => set({ result: null }),

  approveRun: (id) =>
    set((state) => {
      const history = state.history.map((r) =>
        r.id === id
          ? { ...r, approvalStatus: "approved", approvedAt: new Date().toISOString() }
          : r,
      );
      saveHistory(history);
      const result =
        state.result?.id === id
          ? { ...state.result, approvalStatus: "approved", approvedAt: new Date().toISOString() }
          : state.result;
      return { history, result };
    }),

  rejectRun: (id) =>
    set((state) => {
      const history = state.history.map((r) =>
        r.id === id
          ? { ...r, approvalStatus: "rejected", rejectedAt: new Date().toISOString() }
          : r,
      );
      saveHistory(history);
      const result =
        state.result?.id === id
          ? { ...state.result, approvalStatus: "rejected", rejectedAt: new Date().toISOString() }
          : state.result;
      return { history, result };
    }),
}));

export default useAnalysisStore;
