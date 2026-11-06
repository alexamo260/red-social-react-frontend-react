export const getAvatarUrl = (image, fallback) => (
  image && image !== 'default.png'
    ? `/api/show-avatar/${encodeURIComponent(image)}`
    : fallback
)
