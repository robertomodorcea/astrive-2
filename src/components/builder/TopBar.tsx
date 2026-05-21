import { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Layout,
  Eye,
  Download,
  Sparkles,
  Settings,
  Save,
  FolderOpen,
  FileText,
  Trash2,
  Copy,
  Scissors,
  ClipboardPaste,
  Keyboard,
  HelpCircle,
  Palette,
  Moon,
  Sun,
  Code2,
  ExternalLink,
  Zap,
} from 'lucide-react';

export function TopBar() {
  const { state, toggleChat } = useBuilder();
  const [activeBreakpoint, setActiveBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const menuItems = [
    {
      label: 'File',
      items: [
        { label: 'New Page', icon: FileText, shortcut: '⌘N' },
        { label: 'Open', icon: FolderOpen, shortcut: '⌘O' },
        { label: 'Save', icon: Save, shortcut: '⌘S' },
        'separator' as const,
        { label: 'Export HTML', icon: Code2, shortcut: '⌘⇧E' },
        { label: 'Export JSON', icon: Download },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', icon: Undo2, shortcut: '⌘Z' },
        { label: 'Redo', icon: Redo2, shortcut: '⌘⇧Z' },
        'separator' as const,
        { label: 'Cut', icon: Scissors, shortcut: '⌘X' },
        { label: 'Copy', icon: Copy, shortcut: '⌘C' },
        { label: 'Paste', icon: ClipboardPaste, shortcut: '⌘V' },
        'separator' as const,
        { label: 'Delete', icon: Trash2, shortcut: '⌫' },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Preview', icon: Eye, shortcut: '⌘P' },
        { label: 'Full Screen', icon: Monitor, shortcut: 'F11' },
        'separator' as const,
        { label: 'Show Grid', icon: Layout },
        { label: 'Keyboard Shortcuts', icon: Keyboard, shortcut: '⌘/' },
      ],
    },
    {
      label: 'Theme',
      items: [
        { label: 'Dark Mode', icon: Moon },
        { label: 'Light Mode', icon: Sun },
        'separator' as const,
        { label: 'Customize Colors', icon: Palette },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'Documentation', icon: HelpCircle },
        { label: 'Open Website', icon: ExternalLink },
      ],
    },
  ];

  const breakpoints = [
    { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
    { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">
          <div className="topbar-logo-icon">
            <Zap className="h-4 w-4 text-purple-400" />
          </div>
          <span className="topbar-logo-text">
            astrive <span className="topbar-logo-tag">Builder</span>
          </span>
        </div>

        <nav className="topbar-menu">
          {menuItems.map((menu) => (
            <DropdownMenu key={menu.label}>
              <DropdownMenuTrigger asChild>
                <button className="topbar-menu-item">{menu.label}</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px]">
                {menu.items.map((item, i) =>
                  item === 'separator' ? (
                    <DropdownMenuSeparator key={i} />
                  ) : (
                    <DropdownMenuItem key={i} className="gap-2">
                      <item.icon className="h-4 w-4 opacity-60" />
                      <span className="flex-1">{item.label}</span>
                      {'shortcut' in item && item.shortcut && (
                        <span className="text-xs text-muted-foreground">{item.shortcut}</span>
                      )}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>
      </div>

      <div className="topbar-center">
        <span className="topbar-title">{state.pageTitle}</span>
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

          <div className="topbar-separator" />

          <div className="topbar-breakpoints">
            {breakpoints.map((bp) => (
              <Tooltip key={bp.key}>
                <TooltipTrigger asChild>
                  <button
                    className={`topbar-icon-btn ${activeBreakpoint === bp.key ? 'active' : ''}`}
                    onClick={() => setActiveBreakpoint(bp.key)}
                  >
                    <bp.icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{bp.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="topbar-separator" />

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="topbar-icon-btn" onClick={() => { }}>
                <Settings className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>

        <div className="topbar-actions">
          <Button
            variant="outline"
            size="sm"
            className="topbar-btn-preview"
            onClick={toggleChat}
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            AI Chat
          </Button>
          <Button variant="outline" size="sm" className="topbar-btn-preview">
            <Eye className="h-4 w-4 mr-1.5" />
            Preview
          </Button>
          <Button size="sm" className="topbar-btn-export">
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
        </div>
      </div>
    </header>
  );
}
