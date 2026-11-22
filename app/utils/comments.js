/**
 * Zwraca komentarze należące do zdjęcia `photoId`, od najnowszego.
 * Nie modyfikuje przekazanej tablicy.
 */
export const getCommentsForPhoto = (comments, photoId) =>
  comments
    .filter((comment) => comment.photoId === photoId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

// Jeden formatter dla wszystkich komentarzy, np. "16.08.2026".
const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

export const formatCommentDate = (isoDate) =>
  dateFormatter.format(new Date(isoDate))
