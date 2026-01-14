<template>
  <div class="ai-report-analysis animate-fade-in">
    <h2 class="text-2xl font-bold mb-4 text-brand-blue flex items-center gap-2">
      <svg class="w-7 h-7 text-brand-gold animate-spin-slow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity=".2" stroke-width="4"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-linecap="round"/></svg>
      AI Report Analysis
    </h2>
    <textarea v-model="reportText" placeholder="Type your analysis in English or বাংলা (Bangla)..." rows="6" class="w-full p-2 border-2 border-brand-blue focus:border-brand-gold rounded transition"></textarea>

    <div class="flex items-center gap-3 mt-3">
      <label class="text-sm text-gray-600">Window (days):</label>
      <input type="number" v-model.number="analysisDays" min="7" max="365" class="w-28 p-2 border rounded" />
      <label class="text-sm text-gray-600">Top N:</label>
      <input type="number" v-model.number="topN" min="1" max="20" class="w-20 p-2 border rounded" />
    </div>

    <button @click="analyze" :disabled="loading" class="mt-3 px-6 py-2 bg-brand-blue hover:bg-brand-gold text-white font-semibold rounded shadow transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 disabled:opacity-60 flex items-center gap-2">
      <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity=".2" stroke-width="4"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-linecap="round"/></svg>
      <span>{{ loading ? 'Analyzing...' : 'Analyze' }}</span>
    </button>
    <transition name="fade">
      <div v-if="result" class="mt-6 p-4 bg-brand-blue bg-opacity-5 border-l-4 border-brand-gold rounded animate-fade-in">
        <h3 class="font-semibold text-brand-blue mb-2">Suggestions:</h3>
        <ul class="list-disc pl-6 text-brand-blue">
          <li v-for="(s, i) in result.suggestions" :key="i">{{ s }}</li>
        </ul>

        <h4 class="mt-3 text-brand-gold">Business Summary:</h4>
        <div class="bg-white rounded p-3 border text-sm text-brand-blue">{{ result.business_summary }}</div>

        <h4 class="mt-3 text-brand-gold">Demandable Products:</h4>
        <div v-if="result.demandable_products && result.demandable_products.length" class="bg-white rounded p-3 border text-sm text-brand-blue">
          <ul class="divide-y">
            <li v-for="p in result.demandable_products" :key="p.id" class="py-2">
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-semibold">{{ p.title }}</div>
                  <div class="text-xs text-gray-600">Sold: {{ p.sold_qty }} • Stock: {{ p.stock }}</div>
                </div>
                <div class="text-sm text-brand-gold">{{ p.suggested_action }}</div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else class="text-sm text-gray-600">No demandable products found in the selected period.</div>

        <h4 class="mt-3 text-brand-gold">Discount Candidates:</h4>
        <div v-if="result.discount_candidates && result.discount_candidates.length" class="bg-white rounded p-3 border text-sm text-brand-blue">
          <ul class="divide-y">
            <li v-for="d in result.discount_candidates" :key="d.id" class="py-2">
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-semibold">{{ d.title }}</div>
                  <div class="text-xs text-gray-600">Stock: {{ d.stock }} • Sold: {{ d.sold_qty }}</div>
                  <div class="text-xs text-gray-500">{{ d.reason }}</div>
                </div>
                <div class="text-sm text-red-600">Suggest {{ d.suggested_discount_percent }}% off</div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else class="text-sm text-gray-600">No discount candidates found.</div>

        <h4 class="mt-3 text-brand-gold">Restock Suggestions:</h4>
        <div v-if="result.restock_suggestions && result.restock_suggestions.length" class="bg-white rounded p-3 border text-sm text-brand-blue">
          <ul class="divide-y">
            <li v-for="r in result.restock_suggestions" :key="r.id" class="py-2">
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-semibold">{{ r.title }}</div>
                  <div class="text-xs text-gray-600">Stock: {{ r.stock }} • Sold: {{ r.sold_qty }}</div>
                  <div class="text-xs text-gray-500">{{ r.reason }}</div>
                </div>
                <div class="text-sm text-green-600">Order {{ r.suggested_reorder_qty }}</div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else class="text-sm text-gray-600">No restock suggestions.</div>

        <h4 class="mt-3 text-brand-gold">Sentiment:</h4>
        <pre class="bg-white rounded p-2 border text-sm">{{ result.sentiment }}</pre>
        <h4 class="mt-2 text-brand-gold">ML Label:</h4>
        <pre class="bg-white rounded p-2 border text-sm">{{ result.ml_label }}</pre>

      </div>
    </transition>
    <div v-if="error" class="mt-2 text-red-600">{{ error }}</div>
  </div>
</template>

<script>
import { analyzeReport } from '../services/ai';

export default {
  name: 'AIReportAnalysis',
  data() {
    return {
      reportText: '',
      analysisDays: 30,
      topN: 5,
      result: null,
      loading: false,
      error: null,
    };
  },
  methods: {
    async analyze() {
      this.loading = true;
      this.result = null;
      this.error = null;
      try {
        const response = await analyzeReport(this.reportText, { analysis_days: this.analysisDays, top_n: this.topN });
        this.result = response.data;
      } catch (err) {
        console.error('AI analyze error:', err);
        const respData = err.response?.data;
        // Show detailed message when available
        if (respData) {
          const parts = [];
          if (respData.error) parts.push(respData.error);
          if (respData.exception_type) parts.push(`(${respData.exception_type})`);
          if (respData.message) parts.push(`: ${respData.message}`);
          this.error = parts.join(' ');
        } else if (err.isNetworkError || err.message === 'Network Error') {
          this.error = 'Network error: cannot reach server.';
        } else {
          this.error = 'Failed to analyze report.';
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.ai-report-analysis {
  max-width: 600px;
  margin: 2rem auto;
  background: #f9fbfd;
  border: 1.5px solid #e3e8f0;
  border-radius: 14px;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 24px rgba(44, 62, 80, 0.07);
  transition: box-shadow 0.3s;
}
.text-brand-blue { color: #1a237e; }
.bg-brand-blue { background: #1a237e; }
.border-brand-blue { border-color: #1a237e; }
.text-brand-gold { color: #ffb300; }
.bg-brand-gold { background: #ffb300; }
.border-brand-gold { border-color: #ffb300; }
.animate-fade-in {
  animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: none; }
}
.animate-spin-slow {
  animation: spin 2.5s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
