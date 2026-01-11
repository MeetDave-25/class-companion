import { useState } from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  Users,
  ClipboardList,
  Calendar,
  FileSpreadsheet,
  GraduationCap,
  Menu,
  X,
  BookOpen,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: GraduationCap },
  { id: "attendance", label: "QR Attendance", icon: QrCode },
  { id: "sessions", label: "Session History", icon: ClipboardList },
  { id: "students", label: "Students", icon: Users },
  { id: "subjects", label: "Subjects", icon: BookOpen },
  { id: "marks", label: "Test Marks", icon: ClipboardList },
  { id: "timetable", label: "Timetable", icon: Calendar },
  { id: "export", label: "Export Data", icon: FileSpreadsheet },
];

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card shadow-card md:hidden"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-card z-40 shadow-card",
          "flex flex-col border-r border-border"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">AttendEase</h1>
              <p className="text-xs text-muted-foreground">College Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                  isActive
                    ? "gradient-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="px-4 py-3 rounded-xl bg-secondary">
            <p className="text-sm font-medium">Teacher Dashboard</p>
            <p className="text-xs text-muted-foreground">
              {authAPI.getCurrentUser()?.email || 'Not logged in'}
            </p>
          </div>
          <Button
            onClick={() => authAPI.logout()}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
