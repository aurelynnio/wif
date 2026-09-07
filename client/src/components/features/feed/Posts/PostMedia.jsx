import VideoPlayer from './VideoPlayer';

const PostMedia = ({ mediaItems, mediaCount, onImageClick, onVideoExpand }) => {
  if (mediaItems.length === 0) return null;

  return (
    <div
      className={`rounded-xl overflow-hidden mb-3 ${
        mediaCount === 1 ? '' : 'grid gap-1'
      } ${mediaCount === 2 ? 'grid-cols-2' : ''} ${
        mediaCount >= 3 ? 'grid-cols-2' : ''
      }`}
    >
      {mediaItems.map((item, index) => {
        const frameClass =
          mediaCount === 1
            ? 'max-h-[450px]'
            : mediaCount === 2
              ? 'aspect-video'
              : 'aspect-square';
        return (
          <div
            key={index}
            className={`relative overflow-hidden ${
              mediaCount === 3 && index === 0 ? 'row-span-2' : ''
            } ${frameClass}`}
          >
            {item.type === 'video' ? (
              <VideoPlayer
                src={item.url}
                onExpand={() => onVideoExpand(item.url)}
                isGrid={mediaCount > 1}
              />
            ) : (
              <img
                className={`w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300 ${
                  mediaCount === 1 ? 'max-h-[450px]' : ''
                }`}
                src={item.url}
                alt={`Post media ${index + 1}`}
                loading="lazy"
                decoding="async"
                onClick={() => onImageClick(item.url)}
              />
            )}
            {mediaCount > 4 && index === 3 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  +{mediaCount - 4}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PostMedia;