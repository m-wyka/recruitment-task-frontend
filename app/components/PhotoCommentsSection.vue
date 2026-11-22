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

const { data, status, error, refresh } = useFetch('/api/comments.json', {
  // Jeden plik dla wszystkich zdjęć — wspólny klucz, filtrujemy lokalnie.
  key: 'comments',
  // W `nuxt dev` SSR nie widzi plików z public/ (404), więc pobieramy po stronie klienta.
  server: false,
  default: () => []
})

const comments = computed(() => getCommentsForPhoto(data.value, props.photoId))

// Przy `server: false` serwer renderuje komponent w stanie `idle`. Traktujemy go
// jak ładowanie, żeby przed pobraniem danych nie mignął pusty stan.
const isLoading = computed(
  () => status.value === 'idle' || status.value === 'pending'
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

    <div
      v-if="isLoading"
      class="flex items-center gap-3 text-gray-500"
      role="status"
      aria-live="polite"
    >
      <span
        class="w-4 h-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"
        aria-hidden="true"
      />
      Ładowanie komentarzy...
    </div>

    <div v-else-if="error" class="flex flex-col items-start gap-2 text-red-700">
      <p class="m-0">Nie udało się pobrać komentarzy.</p>
      <button
        type="button"
        class="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 hover:border-blue-600 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40"
        @click="refresh()"
      >
        Spróbuj ponownie
      </button>
    </div>

    <p v-else-if="comments.length === 0" class="m-0 text-gray-500">
      Brak komentarzy do tego zdjęcia.
    </p>

    <ul v-else role="list" class="flex flex-col gap-6">
      <li v-for="comment in comments" :key="comment.id" class="flex gap-4">
        <img
          :src="comment.avatar"
          alt=""
          width="64"
          height="64"
          loading="lazy"
          class="w-16 h-16 shrink-0 rounded-xl object-cover"
        />
        <div class="flex flex-col gap-2">
          <div class="flex items-baseline gap-4">
            <span class="font-semibold text-gray-800">
              {{ comment.author }}
            </span>
            <time :datetime="comment.createdAt" class="text-sm text-gray-500">
              {{ formatCommentDate(comment.createdAt) }}
            </time>
          </div>
          <p class="text-gray-800">{{ comment.content }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
