import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { History, GitBranch, ExternalLink, RefreshCw } from "lucide-react";
import GlassButton from "../ui/GlassButton";
import StatusBadge from "../ui/StatusBadge";
import { rollbackProject } from "../../api/api";

export default function DeployRow({ deployment, projectId, onRollback }) {
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackError, setRollbackError] = useState("");

  const isSuccess = deployment.status === "SUCCESS";

  const handleRollbackClick = () => {
    if (!isSuccess) return;
    setRollbackError("");
    setIsConfirming(true);
  };

  const confirmRollback = async () => {
    setIsConfirming(false);
    setIsRollingBack(true);
    setRollbackError("");

    try {
      await rollbackProject(projectId, deployment.versionNumber);
      if (onRollback) onRollback(deployment.id);
    } catch (error) {
      console.error("Rollback failed", error);
      setRollbackError(
        error.response?.data?.message || error.message || "Rollback failed"
      );
    } finally {
      setIsRollingBack(false);
    }
  };

  const goToLogs = () => {
    const q = projectId
      ? `?projectId=${encodeURIComponent(projectId)}`
      : "";
    navigate(`/deploy/logs/${deployment.id}${q}`);
  };

  return (
    <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-4 mb-3 hover:border-white/[0.12] transition-colors group">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
            <History size={16} className="text-[#a1a1aa]" />
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h4 className="text-[14px] font-semibold text-white tracking-tight truncate">
                {deployment.version}
              </h4>
              <StatusBadge status={deployment.status} />
            </div>
            
            <div className="flex items-center gap-3 text-[13px] text-[#71717a] font-medium truncate">
              <span className="flex items-center gap-1.5 font-mono text-[12px] text-[#a1a1aa] bg-white/[0.04] px-1.5 py-0.5 rounded-md">
                <GitBranch size={12} /> {deployment.branch}
              </span>
              <span className="hidden md:inline text-white/[0.12]">•</span>
              <span className="truncate max-w-[250px]">
                {deployment.commitMessage || "No commit message"}
              </span>
            </div>
            
            {deployment.liveUrl ? (
              <a
                href={deployment.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-2 mt-3 rounded-xl border border-[#22c55e]/25 bg-[#22c55e]/10 px-3 py-2 text-[12px] font-semibold text-[#86efac] shadow-[0_0_0_1px_rgba(34,197,94,0.08)] transition-colors hover:border-[#22c55e]/40 hover:bg-[#22c55e]/14 hover:text-[#dcfce7]"
              >
                <ExternalLink size={12} className="shrink-0" />
                <span className="truncate">{deployment.liveUrl}</span>
              </a>
            ) : null}
            
            {rollbackError && (
              <p className="text-[12px] font-medium text-[#ef4444] mt-2">
                {rollbackError}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
          <p className="text-[13px] font-medium text-[#a1a1aa]">
            {deployment.timeAgo}
          </p>
          <p className="text-[12px] text-[#71717a]">
            by {deployment.author}
          </p>
        </div>

        <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0 flex flex-col sm:flex-row gap-2">
          <GlassButton
            variant="outline"
            onClick={goToLogs}
            className="w-full sm:w-auto h-8 px-3 text-xs"
          >
            View Logs
          </GlassButton>
          
          {isConfirming ? (
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-[#eab308] mr-1">Confirm?</span>
              <GlassButton
                variant="primary"
                onClick={confirmRollback}
                className="h-8 px-3 text-xs"
              >
                Yes
              </GlassButton>
              <GlassButton
                variant="outline"
                onClick={() => setIsConfirming(false)}
                className="h-8 px-3 text-xs"
              >
                No
              </GlassButton>
            </div>
          ) : (
            <GlassButton
              variant={!isSuccess ? "outline" : "secondary"}
              onClick={handleRollbackClick}
              disabled={!isSuccess || isRollingBack}
              className="w-full sm:w-auto h-8 px-3 text-xs"
            >
              {isRollingBack ? (
                <>
                  <RefreshCw size={12} className="mr-1.5 animate-spin" /> Rolling back...
                </>
              ) : isSuccess ? (
                "Rollback to this version"
              ) : (
                "Unavailable"
              )}
            </GlassButton>
          )}
        </div>
      </div>
    </div>
  );
}
