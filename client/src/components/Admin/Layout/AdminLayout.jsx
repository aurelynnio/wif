import { useState, useEffect } from 'react';
import { Menu, Moon, Sun, Bell, Command } from 'lucide-react';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';

const pageLabels = {
  dashboard: 'Tổng quan',
  users: 'Người dùng',
  posts: 'Bài viết',
  comments: 'Bình luận',
  reports: 'Báo cáo',
  interactions: 'Tương tác',
  banned: 'Tài khoản bị chặn',
  revenue: 'Doanh thu',
  broadcast: 'Thông báo',
  systemhealth: 'Hệ thống',
  settings: 'Cài đặt',
  adminlogs: 'Nhật ký',
};

const AdminLayout = ({ children, activePage, setActivePage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      localStorage.setItem('appearance', 'light'); // backward compat
      setIsDarkMode(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('appearance', 'dark'); // backward compat
      setIsDarkMode(true);
    }
  };

  const handleOverlayKeyDown = e => {
    if (e.key === 'Escape') {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="admin-shell flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-full fixed left-0 top-0 z-30 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-[76px]'
        }`}
      >
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onKeyDown={handleOverlayKeyDown}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div
            className="absolute inset-0 bg-black/25"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 admin-card">
            <Sidebar
              activePage={activePage}
              setActivePage={setActivePage}
              sidebarOpen={true}
              mobile={true}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-h-[100dvh] transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-[76px]'
        }`}
      >
        {/* Header */}
        <header className="admin-header h-14 sticky top-0 z-20 backdrop-blur-md flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden -ml-2 rounded-lg text-text-secondary hover:bg-surface-hover"
              aria-label="Open admin menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </Button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                Admin Console
              </p>
              <h1 className="text-base font-semibold text-content">
                {pageLabels[activePage] || activePage}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Search Hint */}
            <Button
              type="button"
              variant="ghost"
              className="hidden items-center gap-2 rounded-lg bg-surface-secondary px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover md:flex"
              aria-label="Tìm nhanh (gợi ý phím tắt K)"
            >
              <Command size={12} strokeWidth={1.8} />
              <span>K</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              type="button"
              variant="ghost"
              onClick={toggleTheme}
              className="rounded-lg p-2 text-text-secondary hover:bg-surface-hover"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun size={18} strokeWidth={1.5} />
              ) : (
                <Moon size={18} strokeWidth={1.5} />
              )}
            </Button>

            {/* Notifications */}
            <Button
              type="button"
              variant="ghost"
              className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-hover"
              aria-label="Notifications"
            >
              <Bell size={18} strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main
          id="main-content"
          className="flex-1 px-4 lg:px-6 py-6 overflow-x-hidden overflow-y-auto"
        >
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
