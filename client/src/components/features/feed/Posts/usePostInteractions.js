import { useCallback, useEffect, useState } from 'react';
import {
  useToggleLike,
  useToggleSave,
  useDeletePost,
  useSharePost,
} from '@/hooks/usePostsQuery';
import { notify } from '@/utils/notify';

/**
 * Like/save state (optimistic) + options menu + delete/share actions for a post.
 * Local like/save state is synced back from `data` so server refetches stay in sync.
 */
export const usePostInteractions = ({ data, onDelete, onOptionsToggle }) => {
  const postId = data?._id;

  const [isLiked, setIsLiked] = useState(data?.isLiked || false);
  const [isSaved, setIsSaved] = useState(data?.isSaved || false);
  const [likeCount, setLikeCount] = useState(
    data?.likeCount || data?.likesCount || 0
  );
  const [showOptions, setShowOptions] = useState(false);

  const { mutate: toggleLike, isPending: likeLoading } = useToggleLike();
  const { mutate: toggleSave, isPending: saveLoading } = useToggleSave();
  const { mutateAsync: deletePostMutation, isPending: deletePending } =
    useDeletePost();
  const { mutateAsync: sharePostMutation, isPending: sharePending } =
    useSharePost();

  useEffect(() => {
    setIsLiked(data?.isLiked || false);
    setIsSaved(data?.isSaved || false);
    setLikeCount(data?.likeCount || data?.likesCount || 0);
  }, [
    data?._id,
    data?.isLiked,
    data?.isSaved,
    data?.likeCount,
    data?.likesCount,
  ]);

  const handleLike = useCallback(() => {
    if (likeLoading || !postId) return;

    const prevLiked = isLiked;
    const prevCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    toggleLike(postId, {
      onError: error => {
        // Revert on failure
        setIsLiked(prevLiked);
        setLikeCount(prevCount);
        notify.error(error?.response?.data?.message || 'Thao tác thất bại');
      },
    });
  }, [postId, isLiked, likeCount, likeLoading, toggleLike]);

  const handleSave = useCallback(() => {
    if (saveLoading || !postId) return;

    const prevSaved = isSaved;

    // Optimistic update
    setIsSaved(!isSaved);

    toggleSave(
      { postId, isSaved: prevSaved },
      {
        onSuccess: () => {
          notify.success(!prevSaved ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết');
        },
        onError: error => {
          // Revert on failure
          setIsSaved(prevSaved);
          notify.error(error?.response?.data?.message || 'Thao tác thất bại');
        },
      }
    );
  }, [postId, isSaved, saveLoading, toggleSave]);

  const closeOptions = useCallback(() => {
    setShowOptions(false);
    onOptionsToggle?.(postId, false);
  }, [postId, onOptionsToggle]);

  // Controlled open state for the DropdownMenu; keeps parent z-index in sync
  const handleOptionsChange = useCallback(
    (open) => {
      setShowOptions(open);
      onOptionsToggle?.(postId, open);
    },
    [postId, onOptionsToggle]
  );

  /** @returns {Promise<boolean>} success */
  const handleDelete = useCallback(async () => {
    if (deletePending || !postId) return false;

    try {
      await deletePostMutation(postId);
      notify.success('Đã xóa bài viết');
      setShowOptions(false);
      onOptionsToggle?.(postId, false);
      // Notify parent to remove from list
      onDelete?.(postId);
      return true;
    } catch (error) {
      notify.error(error?.response?.data?.message || 'Xóa bài viết thất bại');
      return false;
    }
  }, [deletePending, postId, onDelete, onOptionsToggle, deletePostMutation]);

  const handleShare = useCallback(async () => {
    if (sharePending || !postId) return;

    try {
      await sharePostMutation({ postId });
      notify.success('Đã chia sẻ bài viết');
      closeOptions();
    } catch (error) {
      notify.error(error?.response?.data?.message || 'Chia sẻ thất bại');
    }
  }, [postId, sharePending, sharePostMutation, closeOptions]);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    notify.success('Đã sao chép link');
    closeOptions();
  }, [postId, closeOptions]);

  return {
    isLiked,
    isSaved,
    likeCount,
    likeLoading,
    saveLoading,
    deletePending,
    sharePending,
    showOptions,
    handleLike,
    handleSave,
    handleDelete,
    handleShare,
    handleCopyLink,
    handleOptionsChange,
    closeOptions,
  };
};