import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export interface Team {
  name: string;
  logo?: React.ElementType;
  plan?: string;
}

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export interface Project {
  name: string;
  url: string;
  icon?: ComponentType;
}

export interface SidebarData {
  user: User;
  teams?: Team[];
  navMain: NavMainItem[];
  projects?: Project[];
}
