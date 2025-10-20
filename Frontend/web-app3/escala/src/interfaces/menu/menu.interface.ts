export interface MenuItem {
  id: number;
  title: string;
  destination: string;
  location: "header" | "footer" | "sidebar";
  active: boolean;
  child_items?: MenuItem[];
}
