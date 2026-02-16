import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  breadcrumb?: string[];
  filters?: React.ReactNode;
}

export function PageHeader({ title, description, filters }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-start gap-3">
          <div>
            <h1 className="hidden md:block text-2xl font-semibold text-[#1a1d2e] dark:text-white tracking-tight leading-tight">
              {title}
            </h1>
            {description && (
              <p className="hidden md:block text-sm text-[#94a3b8] mt-0.5 font-normal leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Filters — placed inline to the right of the title */}
        {filters && (
          <div className="ml-auto flex items-center gap-2">{filters}</div>
        )}
      </div>
    </div>
  );
}
