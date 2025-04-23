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
</script>
// Datahämtning
const { data: json } = await useAsyncData ('dataset', () => $fetch('/api/dataset'))
<script scoped>

</script>