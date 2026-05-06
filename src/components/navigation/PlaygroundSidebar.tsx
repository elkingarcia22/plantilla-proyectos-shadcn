import * as React from "react";
import { cn } from "@/lib/utils";
import { UbitsIcon } from "@/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { NavigationItem, NavigationSection } from "./navigationTypes";

interface SidebarProps {
  items: NavigationSection[];
  activeId?: string;
  onItemClick?: (id: string) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  role?: string;
  activeItemId?: string;
  onItemSelect?: (id: string) => void;
}

/**
 * UBITS PREMIUM RAIL SIDEBAR
 * Debug version with forced scrollbar visibility and logging.
 */
export const PlaygroundSidebar: React.FC<SidebarProps> = ({
  items,
  activeId,
  onItemClick,
  header,
  footer,
  className,
  activeItemId,
  onItemSelect,
}) => {
  const currentActiveId = activeId || activeItemId;
  const handleItemClick = onItemClick || onItemSelect;
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Debugging logs
  React.useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      console.log(`[Sidebar Debug] Scroll Height: ${scrollHeight}, Client Height: ${clientHeight}`);
      console.log(`[Sidebar Debug] Is Overflowing: ${scrollHeight > clientHeight}`);
    }
  }, [items]);

  const renderItem = (item: NavigationItem) => {
    const isActive = currentActiveId === item.id;

    return (
      <Tooltip key={item.id} delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={() => handleItemClick?.(item.id)}
            className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group outline-none",
              isActive 
                ? "bg-[#0C5BEF] text-white shadow-lg shadow-brand/20 scale-110" 
                : "text-white/40 hover:bg-white/5 hover:text-white"
            )}
          >
            <UbitsIcon 
              name={item.icon as any} 
              size="sm" 
              className={cn(
                "transition-transform duration-300",
                isActive ? "scale-110 text-white" : "group-hover:scale-110"
              )} 
            />
            {isActive && (
              <div className="absolute -left-4 w-1 h-6 bg-[#0C5BEF] rounded-r-full shadow-[0_0_8px_rgba(12,91,239,0.5)]" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={20} className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "fixed left-6 top-4 bottom-4 w-20 bg-[#111827] flex flex-col items-center py-8 rounded-[32px] shadow-2xl z-50 border border-white/5",
          className
        )}
      >
        {/* Header / Logo */}
        <div className="mb-12 flex-shrink-0">
          {header}
        </div>

        {/* Navigation Body with Forced Visibility Scrollbar */}
        <div 
          ref={scrollRef}
          className="flex-1 flex flex-col items-center w-full overflow-y-auto pt-2 px-4 space-y-8 custom-sidebar-scroll"
        >
          <style dangerouslySetInnerHTML={{ __html: `
            .custom-sidebar-scroll::-webkit-scrollbar {
              width: 6px !important;
              display: block !important;
            }
            .custom-sidebar-scroll::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.02) !important;
            }
            .custom-sidebar-scroll::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.3) !important;
              border-radius: 10px !important;
              border: 1px solid rgba(0, 0, 0, 0.2) !important;
            }
            .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.5) !important;
            }
            /* Firefox alternative */
            .custom-sidebar-scroll {
              scrollbar-width: thin !important;
              scrollbar-color: rgba(255, 255, 255, 0.3) transparent !important;
            }
          `}} />
          
          {items.map((section) => (
            <div key={section.id} className="flex flex-col items-center w-full space-y-6">
              {section.items.map(renderItem)}
            </div>
          ))}

          {/* Spacer to force scroll if needed for testing */}
          <div className="h-20 w-full flex-shrink-0" />
        </div>

        {/* Footer / User Profile */}
        <div className="mt-auto pt-8 flex-shrink-0">
          {footer}
        </div>
      </aside>
    </TooltipProvider>
  );
};
