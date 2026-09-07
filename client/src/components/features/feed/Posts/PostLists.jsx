import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { FileText, PenSquare } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Post from './Post';
import { useHomeFeed } from '@/hooks/useFeedQuery';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';

const PostLists = ({ activeTab = 'forYou', onOpenComments, scrollRef }) => {
  const [activeOptionsPostId, setActiveOptionsPostId] = useState(null);

  const handleOptionsToggle = useCallback((postId, isOpen) => {
    if (!postId) return;
    setActiveOptionsPostId(prev =>
      isOpen ? postId : prev === postId ? null : prev
    );
  }, []);
  // React Query Hook
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useHomeFeed(activeTab);

  // Flatten pages to get all posts
  const displayPosts = useMemo(
    () => data?.pages?.flatMap(page => page.posts || page) || [],
    [data]
  );

  const totalCount = hasNextPage ? displayPosts.length + 1 : displayPosts.length;

  // Resolve & cache the scroll container once instead of calling
  // getComputedStyle on every virtualizer scroll/measure tick.
  const scrollContainerRef = useRef(null);
  const getScrollElement = useCallback(() => {
    if (scrollContainerRef.current) return scrollContainerRef.current;
    if (typeof window === 'undefined') return null;
    const el = scrollRef?.current;
    const fallback = document.scrollingElement || document.documentElement;
    let resolved = fallback;
    if (el) {
      const style = window.getComputedStyle(el);
      const canScroll =
        style.overflowY === 'auto' || style.overflowY === 'scroll';
      if (canScroll) resolved = el;
    }
    scrollContainerRef.current = resolved;
    return resolved;
  }, [scrollRef]);

  const rowVirtualizer = useVirtualizer({
    count: totalCount,
    getScrollElement,
    estimateSize: () => 560,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    const isAtEnd = lastItem.index >= displayPosts.length - 1;
    if (isAtEnd && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    virtualItems,
    displayPosts.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
          <FileText size={28} className="text-red-500" />
        </div>
        <h3 className="text-base font-medium text-black dark:text-white mb-2">
          Có lỗi xảy ra
        </h3>
        <p className="text-xs text-neutral-500 text-center max-w-xs mb-4">
          {error?.message || 'Không thể tải bài viết'}
        </p>
        <Button
          onClick={() => refetch()}
          className="rounded-full"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (!displayPosts || displayPosts.length === 0) {
    return (
      <Empty className="py-10">
        <EmptyMedia variant="icon">
          <FileText />
        </EmptyMedia>
        <EmptyTitle>No posts yet</EmptyTitle>
        <EmptyDescription>
          When there are posts, they'll show up here. Be the first to share
          something!
        </EmptyDescription>
        <EmptyContent>
          <Button variant="outline" className="rounded-full">
            <PenSquare data-icon="inline-start" />
            Create Post
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="relative">
      <div
        className="relative w-full"
        style={{ height: rowVirtualizer.getTotalSize() }}
      >
        {virtualItems.map(virtualRow => {
          const isLoaderRow = virtualRow.index > displayPosts.length - 1;
          const post = displayPosts[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className={`absolute top-0 left-0 w-full pb-4 ${
                !isLoaderRow && activeOptionsPostId === post?._id
                  ? 'z-50'
                  : 'z-0'
              }`}
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              {isLoaderRow ? (
                <div className="flex justify-center py-4">
                  <Spinner className="size-6 text-muted-foreground" />
                </div>
              ) : (
                <Post
                  key={post._id}
                  data={post}
                  onOpenComments={onOpenComments}
                  onOptionsToggle={handleOptionsToggle}
                />
              )}
            </div>
          );
        })}
      </div>

      {!hasNextPage && displayPosts.length > 0 && (
        <p className="text-center text-xs text-neutral-400 py-4">
          Bạn đã xem hết bài viết
        </p>
      )}
    </div>
  );
};

export default PostLists;

