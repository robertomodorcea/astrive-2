import { useBuilder } from './BuilderContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Download,
  Eye,
  Zap,
} from 'lucide-react';

export function TopBar() {
  const { state, setBreakpoint } = useBuilder();

  const breakpoints = [
    { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
    { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-breakpoints">
          {breakpoints.map((bp) => (
            <Tooltip key={bp.key}>
              <TooltipTrigger asChild>
                <button
                  className={`topbar-icon-btn ${state.activeBreakpoint === bp.key ? 'active' : ''}`}
                  onClick={() => setBreakpoint(bp.key)}
                >
                  <bp.icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{bp.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-toolbar">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="topbar-icon-btn">
                <Undo2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="topbar-icon-btn">
                <Redo2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </div>

        <div className="topbar-separator" />

        <div className="topbar-actions">
          <Button variant="outline" size="sm" className="topbar-btn-preview">
            <Eye className="h-4 w-4 mr-1.5" />
            Preview
          </Button>
        </div>
      </div>
    </header>
  );
}
