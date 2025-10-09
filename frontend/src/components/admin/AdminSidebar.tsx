import { 
  Home, 
  Users, 
  UserCheck, 
  Star, 
  Settings, 
  Activity,
  ChevronRight
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Prestadores", url: "/admin/prestadores", icon: UserCheck },
  { title: "Contratantes", url: "/admin/contratantes", icon: Users },
  { title: "Avaliações", url: "/admin/avaliacoes", icon: Star },
  { title: "Serviços", url: "/admin/servicos", icon: Settings },
  { title: "Atividade", url: "/admin/atividade", icon: Activity },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-accent text-primary font-semibold" 
      : "hover:bg-accent/50 text-foreground";
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-sidebar-foreground">
                  ServicesClimber
                </h2>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(item.url)}
                      end={item.url === "/admin"}
                    >
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && (
                        <>
                          <span>{item.title}</span>
                          <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}