<template>
    <div>
    <header>
      <h1>Nyheter: Drug Overdose Deaths In The US</h1>
    </header>

    <div class="container">
      <select v-model="selectedPanel">
        <option value="Alla">Alla</option>
        <option v-for="panel in panels" :key="panel">{{ panel }}</option>
      </select>

      <div class="card" v-for="item in paginatedArticles" :key="item.id" @click="selectArticle(item)">
        <h3>{{ item.year }} – {{ item.ageGroup }} – {{ item.gender }}</h3>
        <p><strong>Drug type:</strong> {{ item.panel }}</p>
      </div>

      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Föregående</button>
        <span>Sida {{ currentPage }} av {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Nästa</button>
      </div>

      <div class="exportCSV">
        <button @click="exportCSV">Exportera som CSV</button>
      </div>
    </div>

    <div class="modal" v-if="selectedArticle" @click.self="selectedArticle = null">
      <div class="modal-content">
        <span class="close-btn" @click="selectedArticle = null">&times;</span>
        <h2>{{ selectedArticle.year }} – {{ selectedArticle.ageGroup }} – {{ selectedArticle.gender }}</h2>
        <p><strong>Drug type:</strong> {{ selectedArticle.panel }}</p>
        <p><strong>State:</strong> {{ selectedArticle.state }}</p>
        <p><strong>Race:</strong> {{ selectedArticle.race }}</p>
        <p><strong>Deaths:</strong> {{ selectedArticle.estimate }} per 100 000</p>
        <p>{{ selectedArticle.description }}</p>
      </div>
    </div>

    <div class="sidebar left"></div>
    <div class="sidebar right"></div>
  </div>
</template>

<script setup>
import {ref, computedn onMountedn nextTick } from 'vue'

const selectedPanel = ref('Alla')
const selectedArticle = ref(null)
const articles = ref([])
const currentPage = ref(1)
const articlesPerPage = 10

// Datahämtning
const { data: json } = await useAsyncData ('dataset', () => $fetch('/api/dataset'))

// initiera artiklar
if (json.value?.data) {
    articles.value = json.value.data.map((row, index) => ({
        id: index,
        year: row[17],
        ageGroup: row[15],
        gender: row[16],
        panel: row[9],
    estimate: row[21],
    state: row[5],
    race: row[14],
    description: `Under ${row[17]} was ${row[21]} deaths per 100 000 reported among ${row[15]?.toLowerCase()}.`
  }))
}

//Funktioner
const selectArticle = (item) => selectedArticle.value = item

const panels = computed(() => ['Alla', ...new Set(articles.value.map(a => a.panel))])
const filteredArticles = computed(() =>
  selectedPanel.value === 'Alla' ? articles.value : articles.value.filter(a => a.panel === selectedPanel.value)
)
const totalPages = computed(() => Math.ceil(filteredArticles.value.length / articlesPerPage))
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * articlesPerPage
  return filteredArticles.value.slice(start, start + articlesPerPage)
})
const nextPage = () => currentPage.value < totalPages.value && currentPage.value++
const prevPage = () => currentPage.value > 1 && currentPage.value--

// nedladdning av csv
const exportCSV = () => {
  const data = JSON.parse(localStorage.getItem('renderTimes') || '[]')
  const header = 'Index,Label,Time(ms)\n'
  const rows = data.map((item, i) => `${i + 1},${item.label},${item.time.toFixed(2)}`)
  const blob = new Blob([header + rows.join('\n')], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'render-times.csv'
  link.click()
  localStorage.removeItem('renderTimes')
  localStorage.removeItem('reloadCount')
}

</script>

<style scoped>

</style>