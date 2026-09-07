import { Outlet } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import SideBarSettings from './SideBarSettings';

const SettingsLayout = () => {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 min-h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="lg:col-span-1 lg:h-full min-h-[calc(100vh-120px)]">
          <SideBarSettings />
        </div>

        {/* Content */}
        <div className="lg:col-span-3 lg:h-full min-h-[calc(100vh-120px)]">
          <Card className="bg-muted rounded-2xl lg:h-full min-h-[calc(100vh-120px)] flex flex-col overflow-hidden">
            <div
              className="p-6 overflow-y-auto flex-1"
              style={{ scrollbarGutter: 'stable' }}
            >
              <Outlet />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
