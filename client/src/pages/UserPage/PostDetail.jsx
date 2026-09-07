import { useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';
import api from '@/axios/axiosConfig';
import { POST_API } from '@/axios/apiEndpoint';
import { extractData } from '@/utils/apiUtils';
import Post from '@/components/features/feed/Posts/Post';
import CommentModal from '@/components/features/feed/Comment/CommentModal';

/**
 * PostDetail - Trang chi tiết một bài viết (/post/:postId)
 * Được truy cập từ Explore, HashtagPosts, Notifications và link chia sẻ.
 */
const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const commentsRef = useRef(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await api.get(POST_API.GET_BY_ID(postId));
      return extractData(response);
    },
    enabled: !!postId,
  });

  // Khi bấm nút comment trên post, cuộn xuống phần bình luận
  const handleOpenComments = useCallback(() => {
    commentsRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  // Sau khi xoá bài viết trên trang này, quay lại trang trước
  const handleDelete = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-surface-hover transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft size={20} className="text-content" />
        </button>
        <h1 className="text-lg font-bold text-content">Bài viết</h1>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-text-tertiary" />
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center mb-4">
            <FileText size={28} className="text-text-tertiary" />
          </div>
          <h3 className="text-base font-medium text-content mb-2">
            Không thể tải bài viết
          </h3>
          <p className="text-xs text-text-tertiary text-center max-w-xs mb-4">
            Bài viết có thể đã bị xoá hoặc không tồn tại.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-surface-secondary text-content text-sm font-medium rounded-full hover:opacity-80 transition-opacity"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Post + Comments */}
      {!isLoading && !isError && data && (
        <div className="space-y-4">
          <Post
            key={data._id}
            data={data}
            onOpenComments={handleOpenComments}
            onDelete={handleDelete}
          />

          {/* Comments panel luôn hiển thị */}
          <div ref={commentsRef} className="scroll-mt-4">
            <CommentModal postId={data._id} variant="panel" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
