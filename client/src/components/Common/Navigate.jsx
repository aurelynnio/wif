import { useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  MessageCircle,
  Moon,
  Search,
  Sun,
  Settings,
  Bell,
  User,
  LogOut,
  Bookmark,
  PenSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { notify } from '@/utils/notify';
import { useUnreadCount } from '@/hooks/useNotificationQuery';
import { useUnreadMessagesCount } from '@/hooks/useMessageQuery';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Custom Nav Item
const NavItem = ({
  to,
  icon: Icon,
  label,
  onClick,
  badge,
  isActive: forceActive,
  collapsed,
}) => {
  return (
    <NavLink to={to || '#'} onClick={onClick} className="group w-full">
      {({ isActive }) => {
        const active = forceActive !== undefined ? forceActive : isActive;
        const baseClass = collapsed
          ? 'relative flex items-center justify-center w-10 h-10 mx-auto rounded-full transition-all overflow-hidden'
          : 'relative flex items-center gap-3 px-3 py-2.5 rounded-full transition-all w-full overflow-hidden';
        const stateClass = active
          ? 'text-primary-foreground font-medium'
          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white';
        return (
          <div
            className={`${baseClass} ${stateClass}`}
            title={collapsed ? label : undefined}
          >
            {active && (
              <motion.span
                layoutId="sidebarActiveItem"
                className="absolute inset-0 rounded-full bg-primary/90"
                transition={{
                  type: 'tween',
                  duration: 0.18,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            )}
            <div className="relative z-10 flex-shrink-0">
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </div>
            {!collapsed && (
              <span className="relative z-10 text-sm truncate">{label}</span>
            )}
          </div>
        );
      }}
    </NavLink>
  );
};

export default function Navigate({ mobile = false, onCollapsedChange }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  /* State */
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const DEFAULT_USER = {
    name: 'Người dùng',
    username: 'user',
    avatar: '',
  };

  /* Handlers */
  const handleLogout = async () => {
    await logout();
    notify.success('Đăng xuất thành công');
    navigate('/auth/login');
  };

  const toggleTheme = () => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  const { data: messageUnreadCount = 0 } = useUnreadMessagesCount();

  const { data: notificationUnreadCount = 0 } = useUnreadCount();

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/explore', label: 'Explore' },
    {
      icon: Bell,
      path: '/notifications',
      label: 'Notifications',
      badge: notificationUnreadCount,
    },
    {
      icon: MessageCircle,
      path: '/messages',
      label: 'Messages',
      badge: messageUnreadCount,
    },
    { icon: Bookmark, path: '/saved', label: 'Saved' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  // Mobile Bottom Navigation
  if (mobile) {
    return (
      <div className="w-full flex justify-around items-center bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-200/60 dark:border-neutral-800/60 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {navItems.slice(0, 5).map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute -top-1 w-6 h-0.5 rounded-full bg-primary" />
                )}
                <div className="relative">
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
              </>
            )}
          </NavLink>
        ))}
      </div>
    );
  }

  // Desktop Sidebar
  return (
    <div
      className={`h-full flex flex-col py-6 bg-white rounded-r-2xl dark:bg-neutral-900 transition-all duration-300 ease-in-out ${
        collapsed ? 'px-2 w-[72px]' : 'px-4 w-full'
      }`}
    >
      {/* Logo */}
      <Link
        to="/"
        className={`flex items-center gap-3 mb-8 ${
          collapsed ? 'justify-center px-0' : 'px-1'
        }`}
      >
        {!collapsed && (
          <span className="text-xl font-semibold tracking-tight text-black dark:text-white">
            YiBu
          </span>
        )}
      </Link>

      {/* Collapse Toggle */}
      <Button
        type="button"
        onClick={toggleSidebar}
        variant="ghost"
        size="icon"
        className="mb-4 self-center rounded-full bg-neutral-100 text-muted-foreground hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item, i) => (
          <NavItem
            key={i}
            to={item.path}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            collapsed={collapsed}
          />
        ))}

        {/* Settings */}
        <NavItem
          to="/settings"
          icon={Settings}
          label="Settings"
          collapsed={collapsed}
        />

        {/* Theme Toggle - Aligned with NavItem */}
        <button
          type="button"
          onClick={toggleTheme}
          title={
            collapsed ? (isDarkMode ? 'Light mode' : 'Dark mode') : undefined
          }
          aria-label={
            isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
          }
          className="group w-full text-left focus:outline-none"
        >
          <div
            className={`${
              collapsed
                ? 'relative flex items-center justify-center w-10 h-10 mx-auto rounded-full transition-all overflow-hidden'
                : 'relative flex items-center gap-3 px-3 py-2.5 rounded-full transition-all w-full overflow-hidden'
            } text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white`}
          >
            <div className="relative z-10 flex-shrink-0">
              {isDarkMode ? (
                <Sun size={20} strokeWidth={2} />
              ) : (
                <Moon size={20} strokeWidth={2} />
              )}
            </div>
            {!collapsed && (
              <span className="relative z-10 text-sm truncate font-normal">
                {isDarkMode ? 'Light mode' : 'Dark mode'}
              </span>
            )}
          </div>
        </button>

        {/* Create Post Button */}
        {collapsed ? (
          <Button
            variant="default"
            size="icon"
            className="mt-6 mx-auto h-10 w-10 rounded-full hover:opacity-80"
            title="Create Post"
          >
            <PenSquare size={18} />
          </Button>
        ) : (
          <Button
            variant="default"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 font-medium text-sm hover:opacity-90"
          >
            <PenSquare data-icon="inline-start" size={16} />
            <span>Create Post</span>
          </Button>
        )}
      </nav>

      {/* User Profile Card */}
      <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
        <div
          className={`flex items-center gap-3 p-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all group ${
            collapsed ? 'justify-center p-1.5' : ''
          }`}
          title={collapsed ? user?.name || DEFAULT_USER.name : undefined}
        >
          <Link to="/profile" className="relative flex-shrink-0">
            <Avatar className="size-10 ring-2 ring-neutral-200 dark:ring-neutral-700 transition-transform group-hover:scale-105">
              <AvatarImage
                src={user?.avatar || undefined}
                alt={user?.name || DEFAULT_USER.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-sm">
                {(user?.name || DEFAULT_USER.name).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-neutral-900" />
          </Link>
          {!collapsed && (
            <>
              <Link to="/profile" className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black dark:text-white truncate leading-tight group-hover:text-primary transition-colors">
                  {user?.name || DEFAULT_USER.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate leading-tight mt-0.5">
                  @{user?.username || DEFAULT_USER.username}
                </p>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-full size-8 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={16} />
              </Button>
            </>
          )}
        </div>
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="mt-2 flex size-10 mx-auto justify-center rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}
