import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function getConfig() {
  const res = await fetch("/api/integrations/mattermost/config");
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ configured: boolean; source: string }>;
}

async function setConfig(webhookUrl: string | null) {
  const res = await fetch("/api/integrations/mattermost/config", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-role": "thu_ky_hop_phan" },
    body: JSON.stringify({ webhookUrl }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function sendTest(text: string, channel?: string) {
  const res = await fetch("/api/integrations/mattermost/test", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-role": "thu_ky_hop_phan" },
    body: JSON.stringify({ text, channel }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function AdminMattermost() {
  const { data, refetch, isFetching } = useQuery({ queryKey: ["mm-config"], queryFn: getConfig });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testMessage, setTestMessage] = useState("Tin thử từ OCM ✅");
  const [testChannel, setTestChannel] = useState("");

  const saveMutation = useMutation({
    mutationFn: () => setConfig(webhookUrl.trim() ? webhookUrl.trim() : null),
    onSuccess: () => refetch(),
  });
  const testMutation = useMutation({
    mutationFn: () => sendTest(testMessage.trim() || "Tin thử", testChannel.trim() || undefined),
  });

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thiết lập Mattermost</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            Trạng thái:{" "}
            <span className="font-medium">
              {data?.configured ? `Đã cấu hình (${data?.source})` : "Chưa cấu hình"}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-4">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                placeholder="https://mattermost.example/hooks/xxxxx"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                className="w-full"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                Lưu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gửi tin thử</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-4">
              <Label htmlFor="testMessage">Nội dung</Label>
              <Input
                id="testMessage"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="testChannel">Kênh (tuỳ chọn)</Label>
              <Input
                id="testChannel"
                value={testChannel}
                onChange={(e) => setTestChannel(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Button
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
            >
              Gửi thử
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
