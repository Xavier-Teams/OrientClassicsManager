import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles, Search, FileText, Languages } from "lucide-react";

export default function AIAssistant() {
  const features = [
    {
      icon: Languages,
      title: "Trợ lý dịch thuật",
      description: "Hỗ trợ dịch và đề xuất thuật ngữ chuyên ngành",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      icon: Search,
      title: "Tìm kiếm thông minh",
      description: "Tìm kiếm ngữ nghĩa trong tác phẩm và tài liệu",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      icon: FileText,
      title: "Phân tích văn bản",
      description: "Phân tích cấu trúc và nội dung văn bản",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      icon: Sparkles,
      title: "Đề xuất cải tiến",
      description: "Gợi ý cải tiến chất lượng dịch thuật",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" data-testid="heading-ai">
          <Bot className="h-8 w-8 text-primary" />
          Trợ lý AI
        </h1>
        <p className="text-muted-foreground mt-1">
          Sử dụng AI để hỗ trợ dịch thuật và phân tích văn bản
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="hover-elevate">
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-2`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card data-testid="card-ai-chat">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Trò chuyện với AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="min-h-[300px] border rounded-lg p-4 bg-muted/30">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2">AI Assistant</Badge>
                <p className="text-sm">
                  Xin chào! Tôi là trợ lý AI của hệ thống Kinh điển phương Đông. 
                  Tôi có thể giúp bạn:
                </p>
                <ul className="text-sm list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li>Dịch thuật và đề xuất thuật ngữ chuyên ngành</li>
                  <li>Tìm kiếm thông minh trong tác phẩm</li>
                  <li>Phân tích cấu trúc văn bản</li>
                  <li>Đề xuất cải tiến chất lượng</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Nhập câu hỏi hoặc yêu cầu của bạn..."
              className="min-h-[80px]"
              data-testid="textarea-ai-input"
            />
            <Button size="icon" className="shrink-0" data-testid="button-send-ai">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử tương tác</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Chưa có lịch sử tương tác
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
