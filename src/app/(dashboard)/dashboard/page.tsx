import {
  Users,
  UserPlus,
  PhoneCall,
  AlertTriangle,
  Flame,
  Heart,
  Video,
  FileText,
  Handshake,
  Trophy,
  XCircle,
  Building2,
  FolderKanban,
  CheckCircle2,
  IndianRupee,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { auth } from "@/auth";
import { getDashboardStats, getLeadsByStatus, getLeadsByIndustry, getNeedsAttention } from "@/lib/dashboard-data";
import { StatCard } from "@/components/dashboard/stat-card";
import { LeadsByStatusChart, LeadsByIndustryChart } from "@/components/dashboard/dashboard-charts";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { formatINR } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const [stats, byStatus, byIndustry, attention] = await Promise.all([
    getDashboardStats(),
    getLeadsByStatus(),
    getLeadsByIndustry(),
    getNeedsAttention(),
  ]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Welcome back, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Here&apos;s what&apos;s happening across WhiteRose today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Total Leads" value={stats.totalLeads} icon={Users} />
        <StatCard label="New Leads" value={stats.newLeads} icon={UserPlus} />
        <StatCard label="Follow-ups Today" value={stats.followUpsToday} icon={PhoneCall} accent="warning" />
        <StatCard label="Overdue Follow-ups" value={stats.overdueFollowUps} icon={AlertTriangle} accent="danger" />
        <StatCard label="Hot Leads" value={stats.hotLeads} icon={Flame} accent="danger" />
        <StatCard label="Interested Leads" value={stats.interestedLeads} icon={Heart} />
        <StatCard label="Demo Scheduled" value={stats.demoScheduled} icon={Video} />
        <StatCard label="Proposal Sent" value={stats.proposalSent} icon={FileText} />
        <StatCard label="Negotiation" value={stats.negotiation} icon={Handshake} accent="warning" />
        <StatCard label="Won Deals" value={stats.won} icon={Trophy} accent="success" />
        <StatCard label="Lost Deals" value={stats.lost} icon={XCircle} accent="danger" />
        <StatCard label="Total Clients" value={stats.totalClients} icon={Building2} />
        <StatCard label="Active Projects" value={stats.activeProjects} icon={FolderKanban} />
        <StatCard label="Completed Projects" value={stats.completedProjects} icon={CheckCircle2} accent="success" />
        <StatCard label="Expected Revenue" value={formatINR(stats.expectedRevenue)} icon={IndianRupee} accent="success" />
        <StatCard label="Revenue This Month" value={formatINR(stats.revenueThisMonth)} icon={TrendingUp} accent="success" />
        <StatCard label="Outstanding Payments" value={formatINR(stats.outstandingPayments)} icon={Wallet} accent="warning" />
        <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} icon={TrendingUp} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <LeadsByStatusChart data={byStatus} />
          <LeadsByIndustryChart data={byIndustry} />
        </div>
        <NeedsAttention data={attention} />
      </div>
    </div>
  );
}
