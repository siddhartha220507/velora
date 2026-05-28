import React from 'react';
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import PageWrapper from "../../components/layout/PageWrapper";
import TopNav from "../../components/layout/TopNav";
import { PageShell, PageHeader, Card, EmptyState } from "../../components/layout/PageLayout";
import { Webhook, Zap, Plus } from "lucide-react";
import GlassButton from "../../components/ui/GlassButton";

export default function Webhooks() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-white font-sans overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />
      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />
        <PageShell>
          <PageHeader title="Integrations" subtitle="Connect external triggers and automated workflows via HTTP webhooks">
            <GlassButton variant="primary" className="h-10 px-5 text-[11px] font-black uppercase tracking-widest">
              <Plus size={14} /> New Endpoint
            </GlassButton>
          </PageHeader>

          <Card noPad className="bg-[#1e1e20] border-white/[0.04] rounded-[32px] overflow-hidden shadow-elevation-2">
            <EmptyState 
              icon={Webhook} 
              title="No Webhooks Configured" 
              subtitle="Connect GitHub, GitLab, or custom CI/CD pipelines to automate your deployment cycle."
            >
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 p-4 bg-[#0d0d0f] border border-white/5 rounded-2xl max-w-sm">
                   <div className="w-10 h-10 rounded-xl bg-[#22c55e]/5 flex items-center justify-center text-[#22c55e] shrink-0 shadow-elevation-1">
                      <Zap size={18} />
                   </div>
                   <p className="text-[12px] text-[#52525b] font-medium leading-relaxed text-left">
                      Automate your build process by triggering deployments on every git push or external API call.
                   </p>
                </div>
                <GlassButton variant="secondary" className="h-10 px-6 text-[11px] font-black uppercase tracking-widest">
                   Review Documentation
                </GlassButton>
              </div>
            </EmptyState>
          </Card>
        </PageShell>
      </PageWrapper>
    </div>
  );
}
