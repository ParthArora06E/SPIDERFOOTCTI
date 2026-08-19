"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, PieChart as PieChartIcon, Network, MapPin } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import EntityGraph from "./EntityGraph";

interface ScanVisualizationsProps {
  scanId: string;
}

export default function ScanVisualizations({ scanId }: ScanVisualizationsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [graph, setGraph] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorAnalytics, setErrorAnalytics] = useState<string | null>(null);
  const [errorGraph, setErrorGraph] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resAnalytics = await fetch(`/api/spiderfoot/analytics/${scanId}`);
        if (!resAnalytics.ok) throw new Error("Failed to fetch analytics");
        const dataAnalytics = await resAnalytics.json();
        setAnalytics(dataAnalytics);
        setErrorAnalytics(null);
      } catch (err: any) {
        setErrorAnalytics(err.message);
      }

      try {
        const resGraph = await fetch(`/api/spiderfoot/graph/${scanId}`);
        if (!resGraph.ok) throw new Error("Failed to fetch graph");
        const dataGraph = await resGraph.json();
        setGraph(dataGraph);
        setErrorGraph(null);
      } catch (err: any) {
        setErrorGraph(err.message);
      }

      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [scanId]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl w-full h-[600px] flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p>Loading visual analytics...</p>
      </div>
    );
  }

  const hasAnalyticsData = analytics && analytics.totalEvents > 0;
  const hasGraphData = graph && graph.nodes && graph.nodes.length > 0;

  if (!hasAnalyticsData && !hasGraphData && !errorAnalytics && !errorGraph) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
        <PieChartIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No event data available</h3>
        <p className="text-sm">Run a SpiderFoot scan to populate event statistics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-400" />
            Top 10 Event Types
          </h3>
          
          {errorAnalytics ? (
            <div className="flex-grow flex items-center justify-center text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 mr-2" /> {errorAnalytics}
            </div>
          ) : !hasAnalyticsData ? (
            <div className="flex-grow flex items-center justify-center text-slate-500 text-sm">
              No event data available
            </div>
          ) : (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topEventTypes} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis dataKey="eventType" type="category" width={180} stroke="#cbd5e1" fontSize={11} tick={{ fill: '#cbd5e1' }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    cursor={{ fill: '#1e293b' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Risk Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-400" />
            Risk Distribution
          </h3>
          
          {errorAnalytics ? (
            <div className="flex-grow flex items-center justify-center text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 mr-2" /> {errorAnalytics}
            </div>
          ) : !hasAnalyticsData ? (
            <div className="flex-grow flex items-center justify-center text-slate-500 text-sm">
              No risk data available
            </div>
          ) : (
            <div className="h-[350px] w-full flex justify-center items-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ payload, percent }) => `${payload.risk} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {analytics.riskDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Total Text */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-3xl font-bold text-white">{analytics.totalEvents}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Events</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Force Graph Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-green-400" />
          Entity Relationship Graph
        </h3>
        
        {errorGraph ? (
          <div className="h-[600px] w-full border border-slate-800 rounded-lg bg-slate-950 flex flex-col items-center justify-center text-red-400 text-sm gap-2">
            <AlertTriangle className="w-6 h-6" /> {errorGraph}
          </div>
        ) : !hasGraphData ? (
          <div className="h-[600px] w-full border border-slate-800 rounded-lg bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-sm">
            <Network className="w-12 h-12 mb-4 opacity-30" />
            No entity relationships discovered
          </div>
        ) : (
          <EntityGraph nodes={graph.nodes} edges={graph.edges} />
        )}
      </div>
    </div>
  );
}
