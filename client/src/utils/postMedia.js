/**
 * Post media helpers: normalize Cloudinary/local URLs, detect media type.
 */

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v|m3u8|ogg)$/i;

export const isVideoUrl = url => {
  if (!url) return false;
  if (VIDEO_EXTENSIONS.test(url)) return true;
  return (
    /\/video\/upload\//i.test(url) ||
    /resource_type=video/i.test(url) ||
    /\/videos?\//i.test(url)
  );
};

const buildCloudinaryUrl = (publicId, type) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return null;
  const resourceType = type === 'video' ? 'video' : 'image';
  const cleanId = publicId.replace(/^\/+/, '');
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${cleanId}`;
};

const ensureAbsoluteUrl = (url, type) => {
  if (!url) return url;
  if (/^(blob:|data:|https?:)/i.test(url)) return url;

  const cloudinaryUrl = buildCloudinaryUrl(url, type);
  if (cloudinaryUrl) return cloudinaryUrl;

  const base =
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  if (!base) return url;
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
};

const getMediaType = item => {
  const rawType =
    item?.type ||
    item?.mediaType ||
    item?.resource_type ||
    item?.resourceType ||
    item?.format;
  if (typeof rawType === 'string') {
    const type = rawType.toLowerCase();
    if (type.startsWith('video')) return 'video';
    if (type === 'image') return 'image';
    if (VIDEO_EXTENSIONS.test(`file.${type}`)) return 'video';
  }
  if (typeof item?.duration === 'number' && item.duration > 0) {
    return 'video';
  }
  if (item?.thumbnail) {
    return 'video';
  }
  const mime = item?.mimetype || item?.mimeType || item?.mime_type;
  if (typeof mime === 'string' && mime.startsWith('video/')) {
    return 'video';
  }
  return null;
};

export const normalizeMediaItem = item => {
  if (!item) return null;
  if (typeof item === 'string') {
    const url = item;
    return { url, type: isVideoUrl(url) ? 'video' : 'image' };
  }

  const rawUrl =
    item.url ||
    item.path ||
    item.secure_url ||
    item.secureUrl ||
    item.secureURL ||
    item.location ||
    item.src ||
    item.fileUrl ||
    item.fileURL ||
    item.preview ||
    item.thumbnail ||
    item.publicId ||
    item.public_id;

  const url =
    typeof rawUrl === 'string'
      ? rawUrl
      : rawUrl?.url ||
        rawUrl?.secure_url ||
        rawUrl?.secureUrl ||
        rawUrl?.path ||
        rawUrl?.src ||
        rawUrl?.location ||
        '';

  if (!url || typeof url !== 'string') return null;

  const inferredType = getMediaType(item) || (isVideoUrl(url) ? 'video' : null);
  const resolvedUrl = ensureAbsoluteUrl(url, inferredType);
  const type = inferredType || (isVideoUrl(resolvedUrl) ? 'video' : 'image');
  return { ...item, url: resolvedUrl, type };
};

export { VIDEO_EXTENSIONS };