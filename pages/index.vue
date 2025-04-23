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

// start av mätning
const renderStart = ref(0)

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

// Mätlogik
const getReloadCount = () => Number(localStorage.getItem('reloadCount') || '0')
const incrementReloadCount = () => localStorage.setItem('reloadCount', getReloadCount() + 1)
const clearReloadCount = () => localStorage.removeItem('reloadCount')

const saveRenderTime = (label, time) => {
  const existing = JSON.parse(localStorage.getItem('renderTimes') || '[]')
  existing.push({ label, time })
  localStorage.setItem('renderTimes', JSON.stringify(existing))
}

// kör mätning
onMounted(async () => {
  renderStart.value = performance.now()

  await nextTick() // vänta på DOM
  setTimeout(() => {
    const end = performance.now()
    const time = end - renderStart.value

    const label = `Reload ${getReloadCount()}`
    saveRenderTime(label, time)

    if (getReloadCount() < 50) {
      incrementReloadCount()
      setTimeout(() => location.reload(), 500)
    } else {
      exportCSV()
      clearReloadCount()
    }
  }, 100) // litet andrum
})
</script>

<style scoped>
body {
            font-family: sans-serif;
            margin: 0;
            background: #f4f4f4;
        }

        header {
            background: black;
            color: white;
            text-align: center;
            padding: 1rem;
        }

        .container {
            width: 30%;
            height: 60%;
            margin: 40px auto;
        }

        .card {
            background: white;
            border-radius: 5px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            padding: 1rem;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: 0.2s;
        }

        .card:hover {
            transform: scale(1.2);
        }

        .sidebar {
            position: fixed;
            top: 0;
            width: 100px;
            height: 100%;
            background: black;
            display: flex;
            color: white;
            justify-content: center;
            text-align: center;
            align-items: center;
        }

        .sidebar.left {
            left: 0;
        }

        .sidebar.right {
            right: 0;
        }

        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
        }


        .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            max-height: fit-content;
            position: relative;
        }

        .close-btn {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 1.5rem;
            cursor: pointer;
        }

        select {
            padding: 0.5rem 1rem;
            font-size: 1rem;
            margin: 1rem auto;
            display: block;
            border: 1px solid #ccc;
            border-radius: 5px;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: 0.2s;
        }

        select:hover {
            border-color: #666;
        }


        #app {
            background-color: white;
            display: flex;
            justify-content: center;
        }

        .pagination {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
        }

        .pagination button {
            padding: 0.5rem 1rem;
            background-color: black;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        .pagination button:disabled {
            background-color: #aaa;
            cursor: not-allowed;
        }

        .exportCSV {
            text-align: center;
            margin-top: 1rem;
            z-index: 999;
            display: flex;
            justify-content: center;
        }
</style>