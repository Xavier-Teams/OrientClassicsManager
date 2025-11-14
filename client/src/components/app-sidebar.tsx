import { 
  BookOpen, 
  FileText, 
  CreditCard, 
  ClipboardCheck, 
  Edit3,
  Briefcase,
  Settings,
  LayoutDashboard,
  Users,
  Bot
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { APP_NAME_SHORT } from "@/lib/constants";

const menuItems = [
  {
    title: "Tổng quan",
    url: "/",
    icon: LayoutDashboard,
    testId: "nav-dashboard",
  },
  {
    title: "Tác phẩm",
    url: "/works",
    icon: BookOpen,
    testId: "nav-works",
  },
  {
    title: "Hợp đồng",
    url: "/contracts",
    icon: FileText,
    testId: "nav-contracts",
  },
  {
    title: "Thanh toán",
    url: "/payments",
    icon: CreditCard,
    testId: "nav-payments",
  },
  {
    title: "Thẩm định",
    url: "/reviews",
    icon: ClipboardCheck,
    testId: "nav-reviews",
  },
  {
    title: "Biên tập",
    url: "/editing",
    icon: Edit3,
    testId: "nav-editing",
  },
  {
    title: "Hành chính",
    url: "/admin-tasks",
    icon: Briefcase,
    testId: "nav-admin-tasks",
  },
];

const bottomMenuItems = [
  {
    title: "Người dùng",
    url: "/users",
    icon: Users,
    testId: "nav-users",
  },
  {
    title: "Trợ lý AI",
    url: "/ai-assistant",
    icon: Bot,
    testId: "nav-ai",
  },
  {
    title: "Cài đặt",
    url: "/settings",
    icon: Settings,
    testId: "nav-settings",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{APP_NAME_SHORT}</span>
            <span className="text-xs text-muted-foreground">Quản lý dự án</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Khác</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          © 2024 ĐHQGHN
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
