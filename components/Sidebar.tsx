"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, 
  LayoutDashboard, 
  Search, 
  Activity, 
  History,
  Database,
  Network,
  List,
  FileSearch,
  AlertTriangle,
  Server,
  Settings,
  Plug
} from "lucide-react";
import { useInvestigation } from "./InvestigationContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { activeScanId } = useInvestigation();

  const isScanActive = !!activeScanId;
  const scanBaseUrl = isScanActive ? `/investigations/${activeScanId}` : null;

  const NavItem = ({ href, icon: Icon, label, disabled = false }: any) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    
    if (disabled) {
      return (
        <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 cursor-not-allowed">
          <Icon className="w-4 h-4 opacity-50" />
          {label}
        </div>
      );
    }

    return (
      <Link 
        href={href}
        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive 
            ? "bg-blue-900/40 text-blue-400" 
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        }`}
      >
        <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
        {label}
      </Link>
    );
  };

  const Section = ({ title, children }: any) => (
    <div className="mb-6">
      <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="h-16 flex items-center px-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide">SPIDERFOOT CTI</span>
        </div>
      </div>

      <div className="flex-1 p-4">
        <Section title="Dashboard">
          <NavItem href="/" icon={LayoutDashboard} label="Overview" />
        </Section>

        <Section title="Investigations">
          <NavItem href="/investigations/new" icon={Search} label="New Investigation" />
          {isScanActive && (
            <NavItem href={scanBaseUrl} icon={Activity} label="Active Workspace" />
          )}
          <NavItem href="/investigations/history" icon={History} label="Scan History" />
        </Section>

        <Section title="Intelligence">
          <NavItem href={isScanActive ? `${scanBaseUrl}/entities` : "#"} icon={Database} label="Entities" disabled={!isScanActive} />
          <NavItem href={isScanActive ? `${scanBaseUrl}/graph` : "#"} icon={Network} label="Relationships" disabled={!isScanActive} />
          <NavItem href={isScanActive ? `${scanBaseUrl}/events` : "#"} icon={List} label="Event Explorer" disabled={!isScanActive} />
        </Section>

        <Section title="Risk">
          <NavItem href={isScanActive ? `${scanBaseUrl}/findings` : "#"} icon={AlertTriangle} label="Findings" disabled={!isScanActive} />
        </Section>

        <Section title="System">
          <NavItem href="/system/status" icon={Server} label="Platform Status" />
        </Section>
      </div>
    </div>
  );
}
