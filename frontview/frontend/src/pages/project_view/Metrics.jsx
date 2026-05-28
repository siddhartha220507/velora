import { useState } from "react";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import PageWrapper from "../../components/layout/PageWrapper";
import TopNav from "../../components/layout/TopNav";
import GlassButton from "../../components/ui/GlassButton";
import { PageShell, PageHeader, Card, CardHeader, CardBody, TableHead } from "../../components/layout/PageLayout";
import { RefreshCw, Rocket, ShieldCheck, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, Cpu, BarChart3, Download } from "lucide-react";
import { motion } from "framer-motion";

const Sparkline = ({ data, color }) => {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="w-14 h-7" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={pts} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export default function Metrics() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  const [exporting, setExporting] = useState(false);

  const stats = [
    { title: "Total Deployments", value: "28",      change: "+12%", isPositive: true,  icon: Rocket,       sparklineData: [2,4,3,5,4,7,6],              sparklineColor: "#22c55e" },
    { title: "Build Success", value: "96.4%",   change: "+3.2%", isPositive: true, icon: ShieldCheck,  sparklineData: [90,92,91,95,94,96,97],       sparklineColor: "#22c55e" },
    { title: "Avg Response Time",   value: "2m 34s",  change: "-10s",  isPositive: true, icon: Clock,        sparklineData: [3.5,3.2,3.0,2.8,2.9,2.5,2.4], sparklineColor: "#3b82f6" },
    { title: "Build Errors",  value: "2",       change: "-33%",  isPositive: true, icon: AlertCircle,  sparklineData: [4,3,5,2,3,1,2],              sparklineColor: "#ef4444" },
  ];

  const analyticsData = [
    { id: "AUTH_SERVICE_NODE",     type: "BUILD_SUCCESS",  time: "14:22:01", status: "SUCCESS" },
    { id: "PAYMENT_GATEWAY_NODE",  type: "RUNTIME_ERROR",  time: "13:45:12", status: "ERROR" },
    { id: "WEB_DASHBOARD_NODE",    type: "CONFIG_SYNC",    time: "12:10:55", status: "SUCCESS" },
    { id: "API_GATEWAY_NODE",      type: "ROLLBACK_INIT",  time: "11:30:22", status: "SUCCESS" },
  ];

  const exportAnalytics = () => {
    setExporting(true);
    const headers = ["Project", "Event", "Timestamp", "Status"];
    const rows = analyticsData.map(r => [r.id, r.type, r.time, r.status]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "velora_stats.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setExporting(false), 1000);
  };

  const heatmapData = Array.from({ length: 7 * 12 }, () => Math.floor(Math.random() * 4));

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-white font-sans overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />
      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />
        <div data-lenis-prevent className="flex-1 p-10 lg:p-16 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex items-end justify-between mb-16 pb-12 border-b border-white/[0.04]">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 rounded-lg bg-[#1e1e20] border border-white/[0.04] text-[9px] font-black text-[#52525b] uppercase tracking-[0.3em]">PROJECT STATS</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                </div>
                <h1 className="text-[36px] font-black tracking-tighter uppercase text-white leading-none">Performance Overview</h1>
                <p className="text-[10px] text-[#3f3f46] font-black uppercase tracking-[0.4em] mt-5">Live project metrics and resource usage</p>
              </div>
              <GlassButton 
                variant="secondary" 
                className="h-14 px-10 gap-4 text-[10px] font-black uppercase tracking-[0.25em] shadow-elevation-1"
                onClick={() => {}}
              >
                <RefreshCw size={18} /> REFRESH
              </GlassButton>
            </div>

            <div className="space-y-10">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <div className="p-10 bg-[#1e1e20] border border-white/[0.04] rounded-[48px] flex flex-col gap-8 shadow-elevation-1 hover:shadow-elevation-2 transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center shrink-0 shadow-elevation-2 group-hover:border-white/10 transition-all">
                          <item.icon size={24} className="text-[#3f3f46] group-hover:text-white transition-colors" />
                        </div>
                        <div className="opacity-10 group-hover:opacity-30 transition-opacity">
                          <Sparkline data={item.sparklineData} color={item.sparklineColor} />
                        </div>
                      </div>
                      <div>
                        <p className="text-[32px] font-black text-white tracking-tighter leading-none mb-4">{item.value}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] text-[#52525b] font-black uppercase tracking-[0.3em]">{item.title}</p>
                          <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] ${item.isPositive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                            {item.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {item.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Heatmap */}
                <div className="lg:col-span-2 bg-[#1e1e20] border border-white/[0.04] rounded-[56px] p-12 shadow-elevation-1">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#52525b]">
                        <BarChart3 size={22} />
                      </div>
                      <h3 className="text-[18px] font-black text-white uppercase tracking-tighter">Deployment Activity</h3>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-black text-[#1e1e20] uppercase tracking-[0.3em] select-none">
                      LOW
                      <div className="flex gap-1.5 mx-2">
                        {["bg-white/[0.02]", "bg-[#22c55e]/10", "bg-[#22c55e]/30", "bg-[#22c55e]"].map((c, i) => (
                          <div key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
                        ))}
                      </div>
                      HIGH
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-2">
                    {heatmapData.map((val, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.002 }}
                        className={`aspect-square rounded-[4px] transition-all duration-500 hover:ring-2 hover:ring-white/[0.08] cursor-crosshair ${
                          val === 0 ? "bg-[#0d0d0f]" :
                          val === 1 ? "bg-[#22c55e]/10" :
                          val === 2 ? "bg-[#22c55e]/40" :
                          "bg-[#22c55e]"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-8 text-[9px] font-black text-[#1e1e20] uppercase tracking-[0.4em] px-2">
                    <span>MON</span>
                    <span>TUE</span>
                    <span>WED</span>
                    <span>THU</span>
                    <span>FRI</span>
                    <span>SAT</span>
                    <span>SUN</span>
                  </div>
                </div>

                {/* Infrastructure Payload */}
                <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[56px] p-12 shadow-elevation-1">
                  <div className="flex items-center gap-6 mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#52525b]">
                      <Cpu size={22} />
                    </div>
                    <h3 className="text-[18px] font-black text-white uppercase tracking-tighter">Resource Usage</h3>
                  </div>
                  
                  <div className="space-y-10 py-4">
                    {[
                      { label: "CPU Usage", val: "42%", pct: 42, color: "bg-white" },
                      { label: "Memory Usage", val: "68%", pct: 68, color: "bg-[#22c55e]" },
                      { label: "Network Traffic",  val: "15%", pct: 15, color: "bg-[#3b82f6]" },
                    ].map((bar, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                          <span className="text-[#3f3f46]">{bar.label}</span>
                          <span className="text-white">{bar.val}</span>
                        </div>
                        <div className="h-2 bg-[#0d0d0f] rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            className={`h-full ${bar.color} rounded-full shadow-elevation-1`}
                            initial={{ width: 0 }}
                            animate={{ width: `${bar.pct}%` }}
                            transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Telemetry Table */}
              <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[56px] overflow-hidden shadow-elevation-2">
                <div className="bg-[#0d0d0f]/40 px-12 py-10 border-b border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#52525b] shadow-elevation-1">
                      <BarChart3 size={24} />
                    </div>
                    <h3 className="text-[18px] font-black text-white uppercase tracking-tighter">Recent Activity</h3>
                  </div>
                  <GlassButton 
                    variant="secondary" 
                    className="h-10 px-6 text-[9px] font-black uppercase tracking-widest gap-3" 
                    onClick={exportAnalytics} 
                    disabled={exporting}
                  >
                    <Download size={14} /> {exporting ? "SYNCING..." : "EXPORT CSV"}
                  </GlassButton>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.02]">
                        <th className="px-12 py-8 text-left text-[9px] font-black uppercase tracking-[0.4em] text-[#1e1e20]">PROJECT</th>
                        <th className="px-12 py-8 text-left text-[9px] font-black uppercase tracking-[0.4em] text-[#1e1e20]">EVENT</th>
                        <th className="px-12 py-8 text-left text-[9px] font-black uppercase tracking-[0.4em] text-[#1e1e20]">TIME</th>
                        <th className="px-12 py-8 text-left text-[9px] font-black uppercase tracking-[0.4em] text-[#1e1e20]">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02] bg-[#0d0d0f]/10">
                      {analyticsData.map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-all group">
                          <td className="px-12 py-8 text-[13px] font-black text-white uppercase tracking-tighter">{row.id}</td>
                          <td className="px-12 py-8 text-[10px] font-black text-[#3f3f46] uppercase tracking-[0.3em]">{row.type}</td>
                          <td className="px-12 py-8 text-[11px] font-black text-[#1e1e20] tabular-nums group-hover:text-[#52525b] transition-colors">{row.time}</td>
                          <td className="px-12 py-8">
                            <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] shadow-elevation-1
                              ${row.status === "ERROR"
                                ? "text-[#ef4444] bg-[#ef4444]/5 border-[#ef4444]/10"
                                : "text-[#22c55e] bg-[#22c55e]/5 border-[#22c55e]/10"
                              }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${row.status === "ERROR" ? "bg-[#ef4444]" : "bg-[#22c55e] animate-pulse"}`} />
                              {row.status}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
  );
}