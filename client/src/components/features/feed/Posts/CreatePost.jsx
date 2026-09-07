import { useState, useMemo, lazy, Suspense } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Image, Smile, PenSquare } from 'lucide-react';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Button } from '@/components/ui/button';

const ModelPost = lazy(() => import('./ModelPost'));

const CreatePost = () => {
  const [showModal, setShowModal] = useState(false);
  const user = useAuthStore(state => state.user);

  const avatarUrl = useMemo(
    () =>
      user?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${
        user?.username || 'default'
      }`,
    [user?.avatar, user?.username]
  );

  return (
    <>
      <div className="rounded-2xl p-4 bg-white dark:bg-neutral-900">
        <div className="flex gap-3 items-start sm:items-center">
          {/* Avatar */}
          <img
            src={avatarUrl}
            alt={user?.fullName || user?.username || 'User'}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />

          {/* Input Area */}
          <div className="flex-1 min-w-0">
            {/* Placeholder */}
            <div
              onClick={() => setShowModal(true)}
              className="min-h-[44px] flex items-center cursor-pointer rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-4 transition-colors"
            >
              <span className="text-neutral-400 text-sm">
                What's on your mind?
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-3">
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(true)}
                  className="rounded-full text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  <Image data-icon="inline-start" />
                  <span className="hidden sm:inline">Media</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(true)}
                  className="rounded-full text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  <Smile data-icon="inline-start" />
                  <span className="hidden sm:inline">Feeling</span>
                </Button>
              </div>

              <Button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-full hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                <PenSquare data-icon="inline-start" />
                <span>Post</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <ModelPost closeModal={() => setShowModal(false)} />
        </Suspense>
      )}
    </>
  );
};

export default CreatePost;
