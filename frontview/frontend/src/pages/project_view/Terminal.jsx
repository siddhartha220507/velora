import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Terminal, ArrowLeft, Square, Sparkles } from "lucide-react";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import PageWrapper from "../../components/layout/PageWrapper";
import TopNav from "../../components/layout/TopNav";
import TerminalLogs from "../../components/project/TerminalLogs";
import AIModal from "../../components/project/AIModal";
import { stopDeploymentRequest } from "../../api/api";
import GlassButton from "../../components/ui/GlassButton";

const DeploymentLogsPage = () => {
  const { deploymentId } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState("");

  const goBack = () => {
    navigate(projectId ? `/deploy?projectId=${encodeURIComponent(projectId)}` : "/deploy");
  };

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-white font-sans overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />

      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Static Professional Sub-header */}
          <div className="px-10 py-8 border-b border-white/[0.04] bg-[#0d0d0f]/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={goBack}
                className="w-12 h-12 rounded-2xl bg-[#0d0d0f] border border-white/[0.04] text-[#1e1e20] hover:text-white hover:border-white/[0.08] transition-all flex items-center justify-center shadow-elevation-1"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-[1px] h-10 bg-white/[0.04]" />
              <div>
                <div className="flex items-center gap-4 mb-1">
                  <Terminal size={16} className="text-[#22c55e]" />
                  <h1 className="text-[18px] font-black text-white uppercase tracking-tighter leading-none">
                    Build Logs
                  </h1>
                </div>
                {deploymentId && (
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#3f3f46]">Deployment ID: {deploymentId}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <GlassButton
                variant="danger"
                disabled={isStopping || !deploymentId || ["stopped", "failed"].includes(deploymentStatus)}
                onClick={async () => {
                  if (!deploymentId) return;
                  if (["stopped", "failed"].includes(deploymentStatus)) return;
                  setIsStopping(true);
                  try { await stopDeploymentRequest(deploymentId); }
                  finally { setIsStopping(false); }
                }}
                className="h-12 px-8 text-[10px] font-black uppercase tracking-[0.3em] gap-4 shadow-elevation-2"
              >
                <Square size={16} />
                 {isStopping ? "CANCELING..." : ["stopped", "failed"].includes(deploymentStatus) ? "CANCELED" : "CANCEL BUILD"}
              </GlassButton>
            </div>
          </div>

          {/* Terminal Workspace */}
          <div className="flex-1 flex flex-col p-10 lg:p-12 overflow-hidden bg-[#1e1e20]">
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-8 min-h-0">
              
              {/* High-Density Terminal Container */}
              <div className="bg-[#0d0d0f] border border-white/[0.04] rounded-[48px] shadow-elevation-2 flex-1 flex flex-col overflow-hidden">
                {/* Terminal Control Strip */}
                <div className="px-10 py-6 border-b border-white/[0.04] bg-[#0d0d0f]/60 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-6">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#1e1e20]" />
                      <div className="w-2 h-2 rounded-full bg-[#1e1e20]" />
                      <div className="w-2 h-2 rounded-full bg-[#1e1e20]" />
                    </div>
                     <span className="text-[10px] text-[#3f3f46] font-black uppercase tracking-[0.4em] ml-2">CONSOLE</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-1 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[8px] font-black text-[#1e1e20] uppercase tracking-[0.3em]">
                       CONNECTED
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden p-2">
                  <TerminalLogs
                    deploymentId={deploymentId}
                    onErrorDetect={() => setHasError(true)}
                    onStatusChange={setDeploymentStatus}
                  />
                </div>
              </div>

              {/* AI Analyst Overlay Command */}
              <div className="flex justify-end shrink-0">
                <GlassButton
                  variant={hasError ? "danger" : "outline"}
                  onClick={() => setIsAIModalOpen(true)}
                  className={`h-14 px-10 gap-4 text-[10px] font-black uppercase tracking-[0.3em] ${hasError ? "animate-pulse" : ""}`}
                >
                  <Sparkles size={18} />
                   {hasError ? "DEBUG WITH AI" : "ANALYZE LOGS"}
                </GlassButton>
              </div>

              <AIModal
                deploymentId={deploymentId}
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
              />
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
};

export default DeploymentLogsPage;