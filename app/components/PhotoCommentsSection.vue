<script setup>
/**
 * PhotoCommentsSection — pobiera komentarze z `/api/comments.json`
 * i pokazuje te, które należą do zdjęcia `photoId`.
 *
 * Format pojedynczego komentarza:
 * {
 *   "id": "4866",
 *   "photoId": "1",
 *   "author": "Marta Lewandowska",
 *   "avatar": "https://i.pravatar.cc/100?img=5",
 *   "content": "Wow, klimat tego miejsca jest niepowtarzalny.",
 *   "createdAt": "2026-08-16T14:45:30Z"
 * }
 */
const props = defineProps({
  photoId: {
    type: String,
    required: true
  }
})

const { data } = useFetch('/api/comments.json', {
  // Jeden plik dla wszystkich zdjęć — wspólny klucz, filtrujemy lokalnie.
  key: 'comments',
  // W `nuxt dev` SSR nie widzi plików z public/ (404), więc pobieramy po stronie klienta.
  server: false,
  default: () => []
})

const comments = computed(() =>
  data.value
    .filter((comment) => comment.photoId === props.photoId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
)
</script>

<template>
  <section
    class="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm"
    aria-labelledby="comments-heading"
  >
    <h2 id="comments-heading" class="text-lg font-semibold mb-4 mt-0">
      Komentarze
    </h2>

    <div class="flex flex-col gap-6">
      <div v-for="comment in comments" :key="comment.id">
        <div class="flex gap-4">
          <img
            :src="comment.avatar"
            :alt="comment.author"
            class="rounded-xl max-w-16"
          />
          <div class="flex flex-col gap-2">
            <div class="flex items-baseline gap-4">
              <span class="font-semibold text-gray-800">
                {{ comment.author }}
              </span>
              <time :datetime="comment.createdAt" class="text-sm text-gray-500">
                {{ comment.createdAt }}
              </time>
            </div>
            <p class="text-gray-800">{{ comment.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
