import { useEffect, useState } from "react";
import { StatCard } from "../components/ui/StatCard";
import { Eye, MousePointer, Percent, Heart } from "lucide-react";
import { getFeedKPIs, getPostsPerformance, getImpressionsByDay } from "../services/adminAnalytics";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function FeedPage() {
  const [kpis, setKpis] = useState({ impressions: 0, clicks: 0, ctr: "0", totalReactions: 0 });
  const [posts, setPosts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ date: string; impressions: number }[]>([]);

  useEffect(() => {
    getFeedKPIs().then(setKpis);
    getPostsPerformance().then(setPosts);
    getImpressionsByDay().then(setChartData);
  }, []);

  const highPerf = posts.filter(p => parseFloat(p.ctr) >= 2);
  const lowPerf = posts.filter(p => parseFloat(p.ctr) < 2);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Feed Analytics</h2>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Impressões" value={kpis.impressions} icon={Eye} />
        <StatCard title="Cliques" value={kpis.clicks} icon={MousePointer} />
        <StatCard title="CTR" value={`${kpis.ctr}%`} icon={Percent} />
        <StatCard title="Reações" value={kpis.totalReactions} icon={Heart} />
      </div>

      <Card>
        <CardHeader><CardTitle>Impressões por dia (últimos 7 dias)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={v => v.slice(5)} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="impressions" stroke="hsl(233, 100%, 69%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {highPerf.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Posts com boa performance</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post ID</TableHead>
                  <TableHead>Impressões</TableHead>
                  <TableHead>Cliques</TableHead>
                  <TableHead>CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highPerf.map(p => (
                  <TableRow key={p.postId}>
                    <TableCell className="font-mono text-xs">{p.postId.slice(0, 8)}...</TableCell>
                    <TableCell>{p.impressions}</TableCell>
                    <TableCell>{p.clicks}</TableCell>
                    <TableCell><StatusBadge label={`${p.ctr}%`} variant={parseFloat(p.ctr) > 10 ? "success" : "info"} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {lowPerf.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Posts com baixo rendimento</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post ID</TableHead>
                  <TableHead>Impressões</TableHead>
                  <TableHead>Cliques</TableHead>
                  <TableHead>CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowPerf.map(p => (
                  <TableRow key={p.postId}>
                    <TableCell className="font-mono text-xs">{p.postId.slice(0, 8)}...</TableCell>
                    <TableCell>{p.impressions}</TableCell>
                    <TableCell>{p.clicks}</TableCell>
                    <TableCell><StatusBadge label={`${p.ctr}%`} variant="destructive" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
