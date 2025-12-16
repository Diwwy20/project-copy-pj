import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
}

export const SectionHeader = ({ icon: Icon, title }: SectionHeaderProps) => (
  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 mb-4 mt-8">
    <div className="p-1.5 bg-blue-100 rounded-full text-blue-700">
      <Icon className="w-5 h-5" />
    </div>
    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
  </div>
);
