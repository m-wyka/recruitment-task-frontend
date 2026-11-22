import { describe, it, expect } from 'vitest'
import { getCommentsForPhoto, formatCommentDate } from '../../app/utils/comments.js'
import allComments from '../../public/api/comments.json'

const comment = (id, photoId, createdAt) => ({
  id,
  photoId,
  author: `Autor ${id}`,
  avatar: `https://i.pravatar.cc/100?img=${id}`,
  content: `Treść ${id}`,
  createdAt
})

describe('getCommentsForPhoto', () => {
  const comments = [
    comment('1', '1', '2026-08-10T10:00:00Z'),
    comment('2', '2', '2026-08-12T10:00:00Z'),
    comment('3', '1', '2026-08-15T10:00:00Z'),
    comment('4', '10', '2026-08-16T10:00:00Z'),
    comment('5', '1', '2026-08-01T10:00:00Z')
  ]

  it('returns only comments of the given photo, newest first', () => {
    const result = getCommentsForPhoto(comments, '1')

    expect(result.map((c) => c.id)).toEqual(['3', '1', '5'])
  })

  it('matches photoId exactly, not by prefix', () => {
    const result = getCommentsForPhoto(comments, '10')

    expect(result.map((c) => c.id)).toEqual(['4'])
  })

  it('returns an empty array when the photo has no comments', () => {
    expect(getCommentsForPhoto(comments, '999')).toEqual([])
    expect(getCommentsForPhoto([], '1')).toEqual([])
  })

  it('does not mutate the input array', () => {
    const snapshot = [...comments]

    getCommentsForPhoto(comments, '1')

    expect(comments).toEqual(snapshot)
  })

  it('finds 11 comments for photo 1 and 3 for photo 2 in comments.json', () => {
    expect(getCommentsForPhoto(allComments, '1')).toHaveLength(11)
    expect(getCommentsForPhoto(allComments, '2')).toHaveLength(3)
  })
})

describe('formatCommentDate', () => {
  it('formats an ISO date as DD.MM.YYYY with leading zeros', () => {
    expect(formatCommentDate('2026-06-04T08:55:42Z')).toBe('04.06.2026')
    expect(formatCommentDate('2026-08-16T14:45:30Z')).toBe('16.08.2026')
  })

  it("uses the user's time zone, not UTC", () => {
    // 22:30 UTC to już 00:30 następnego dnia w Polsce (czas letni, UTC+2).
    expect(formatCommentDate('2026-08-16T22:30:00Z')).toBe('17.08.2026')
  })
})
