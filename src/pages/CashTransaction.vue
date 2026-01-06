<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Cash Ledger / Transactions</h1>
      <div class="flex gap-2">
        <button @click="exportPDF" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Export PDF
        </button>
        <button @click="exportExcel" class="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800">
          Export Excel
        </button>
        <button @click="syncTransactions" :disabled="syncing" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {{ syncing ? 'Syncing...' : '🔄 Sync All' }}
        </button>
        <button @click="openAddModal = true" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          + Add Transaction
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div class="bg-white rounded-2xl shadow p-4 border-l-4 border-green-500">
        <p class="text-xs text-gray-500">Total Credit (In)</p>
        <p class="text-2xl font-bold text-green-600">৳ {{ formatMoney(summary.total_credit) }}</p>
      </div>
      <div class="bg-white rounded-2xl shadow p-4 border-l-4 border-red-500">
        <p class="text-xs text-gray-500">Total Debit (Out)</p>
        <p class="text-2xl font-bold text-red-600">৳ {{ formatMoney(summary.total_debit) }}</p>
      </div>
      <div class="bg-white rounded-2xl shadow p-4 border-l-4 border-blue-500">
        <p class="text-xs text-gray-500">Current Balance</p>
        <p class="text-2xl font-bold" :class="summary.current_balance >= 0 ? 'text-blue-600' : 'text-red-600'">
          ৳ {{ formatMoney(summary.current_balance) }}
        </p>
      </div>
      <div class="bg-white rounded-2xl shadow p-4 border-l-4 border-purple-500">
        <p class="text-xs text-gray-500">Total Transactions</p>
        <p class="text-2xl font-bold text-purple-600">{{ summary.total_transactions }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
      <div>
        <label class="text-xs text-gray-500">From Date</label>
        <input type="date" v-model="filters.start_date" class="w-full border rounded p-2" />
      </div>
      <div>
        <label class="text-xs text-gray-500">To Date</label>
        <input type="date" v-model="filters.end_date" class="w-full border rounded p-2" />
      </div>
      <div>
        <label class="text-xs text-gray-500">Type</label>
        <select v-model="filters.transaction_type" class="w-full border rounded p-2">
          <option value="">All</option>
          <option value="credit">Credit (In)</option>
          <option value="debit">Debit (Out)</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-gray-500">Source</label>
        <select v-model="filters.source" class="w-full border rounded p-2">
          <option value="">All Sources</option>
          <option value="sale">Sales</option>
          <option value="expense">Expenses</option>
          <option value="purchase">Purchases</option>
          <option value="supplier_payment">Supplier Payments</option>
          <option value="customer_payment">Customer Due Payments</option>
          <option value="investment">Investments</option>
          <option value="bank_deposit">Bank Deposits</option>
          <option value="bank_withdrawal">Bank Withdrawals</option>
          <option value="opening_balance">Opening Balance</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="flex items-end">
        <button @click="loadData" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full">
          🔍 Filter
        </button>
      </div>
    </div>

    <!-- Opening Balance Section -->
    <div class="bg-yellow-50 rounded-2xl shadow p-4 mb-4 border border-yellow-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-yellow-800">💰 Opening Balance</p>
          <p class="text-xs text-yellow-600">Set your initial cash balance to start tracking</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-lg font-bold text-yellow-800">৳ {{ formatMoney(openingBalance) }}</span>
          <button @click="openOpeningBalanceModal = true" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
            {{ openingBalance > 0 ? 'Update' : 'Set' }} Opening Balance
          </button>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-2xl shadow overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="px-3 py-2 text-left">Date</th>
            <th class="px-3 py-2 text-left">Type</th>
            <th class="px-3 py-2 text-left">Source</th>
            <th class="px-3 py-2 text-left">Description</th>
            <th class="px-3 py-2 text-right">Credit (৳)</th>
            <th class="px-3 py-2 text-right">Debit (৳)</th>
            <th class="px-3 py-2 text-right">Balance (৳)</th>
            <th class="px-3 py-2 text-left">Payment Method</th>
            <th class="px-3 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in transactions" :key="t.id" class="border-t hover:bg-gray-50">
            <td class="px-3 py-2">{{ t.date }}</td>
            <td class="px-3 py-2">
              <span :class="t.transaction_type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                    class="px-2 py-1 rounded text-xs font-medium">
                {{ t.transaction_type_display }}
              </span>
            </td>
            <td class="px-3 py-2">
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">{{ t.source_display }}</span>
            </td>
            <td class="px-3 py-2 max-w-xs truncate">
              {{ getDescription(t) }}
            </td>
            <td class="px-3 py-2 text-right text-green-600 font-medium">
              {{ t.transaction_type === 'credit' ? formatMoney(t.amount) : '—' }}
            </td>
            <td class="px-3 py-2 text-right text-red-600 font-medium">
              {{ t.transaction_type === 'debit' ? formatMoney(t.amount) : '—' }}
            </td>
            <td class="px-3 py-2 text-right font-semibold" :class="t.running_balance >= 0 ? 'text-blue-600' : 'text-red-600'">
              {{ formatMoney(t.running_balance) }}
            </td>
            <td class="px-3 py-2">{{ t.payment_method_display }}</td>
            <td class="px-3 py-2 text-center">
              <button v-if="t.is_manual" @click="deleteTransaction(t.id)" class="text-red-600 hover:text-red-800">🗑️</button>
              <span v-else class="text-gray-400 text-xs">Auto</span>
            </td>
          </tr>
          <tr v-if="!transactions.length">
            <td colspan="9" class="px-3 py-8 text-center text-gray-400">
              No transactions found. Click "Sync All" to import from other modules.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Transaction Modal -->
    <div v-if="openAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4">
        <h2 class="text-xl font-bold mb-4">➕ Add Manual Transaction</h2>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-gray-500">Date</label>
              <input type="date" v-model="newTransaction.date" class="w-full border rounded p-2" />
            </div>
            <div>
              <label class="text-xs text-gray-500">Transaction Type</label>
              <select v-model="newTransaction.transaction_type" class="w-full border rounded p-2">
                <option value="credit">Credit (Money In)</option>
                <option value="debit">Debit (Money Out)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="text-xs text-gray-500">Source / Category</label>
            <select v-model="newTransaction.source" class="w-full border rounded p-2">
              <option value="investment">Investment / Capital</option>
              <option value="bank_deposit">Bank Deposit</option>
              <option value="bank_withdrawal">Bank Withdrawal</option>
              <option value="adjustment">Adjustment</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label class="text-xs text-gray-500">Amount (৳)</label>
            <input type="number" v-model="newTransaction.amount" step="0.01" min="0" class="w-full border rounded p-2" placeholder="0.00" />
          </div>
          
          <div>
            <label class="text-xs text-gray-500">Payment Method</label>
            <select v-model="newTransaction.payment_method" class="w-full border rounded p-2">
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div v-if="newTransaction.payment_method === 'bank' || newTransaction.payment_method === 'cheque'">
            <label class="text-xs text-gray-500">Bank Name</label>
            <input type="text" v-model="newTransaction.bank_name" class="w-full border rounded p-2" placeholder="e.g., Sonali Bank" />
          </div>
          
          <div v-if="newTransaction.payment_method === 'cheque' || newTransaction.source === 'bank_deposit' || newTransaction.source === 'bank_withdrawal'">
            <label class="text-xs text-gray-500">Reference / Cheque No</label>
            <input type="text" v-model="newTransaction.reference_no" class="w-full border rounded p-2" placeholder="Transaction ID / Cheque No" />
          </div>
          
          <div>
            <label class="text-xs text-gray-500">Description</label>
            <textarea v-model="newTransaction.description" class="w-full border rounded p-2" rows="2" placeholder="Add notes about this transaction"></textarea>
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-6">
          <button @click="openAddModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button @click="saveTransaction" :disabled="saving" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
            {{ saving ? 'Saving...' : 'Save Transaction' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Opening Balance Modal -->
    <div v-if="openOpeningBalanceModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-bold mb-4">💰 Set Opening Balance</h2>
        
        <div class="space-y-4">
          <div>
            <label class="text-xs text-gray-500">Date</label>
            <input type="date" v-model="openingBalanceData.date" class="w-full border rounded p-2" />
          </div>
          
          <div>
            <label class="text-xs text-gray-500">Opening Cash Balance (৳)</label>
            <input type="number" v-model="openingBalanceData.amount" step="0.01" min="0" class="w-full border rounded p-2" placeholder="0.00" />
          </div>
          
          <div>
            <label class="text-xs text-gray-500">Description (Optional)</label>
            <textarea v-model="openingBalanceData.description" class="w-full border rounded p-2" rows="2" placeholder="e.g., Initial cash balance as of start date"></textarea>
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-6">
          <button @click="openOpeningBalanceModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button @click="saveOpeningBalance" :disabled="saving" class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50">
            {{ saving ? 'Saving...' : 'Save Opening Balance' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '../axios'

const transactions = ref([])
const summary = ref({
  total_credit: 0,
  total_debit: 0,
  current_balance: 0,
  total_transactions: 0
})
const openingBalance = ref(0)

const filters = ref({
  start_date: '',
  end_date: '',
  transaction_type: '',
  source: ''
})

const openAddModal = ref(false)
const openOpeningBalanceModal = ref(false)
const saving = ref(false)
const syncing = ref(false)

const newTransaction = ref({
  date: new Date().toISOString().split('T')[0],
  transaction_type: 'credit',
  source: 'investment',
  amount: '',
  payment_method: 'cash',
  bank_name: '',
  reference_no: '',
  description: ''
})

const openingBalanceData = ref({
  date: new Date().toISOString().split('T')[0],
  amount: '',
  description: ''
})

function formatMoney(val) {
  return Number(val || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getDescription(t) {
  if (t.description) return t.description
  if (t.reference_details) {
    const ref = t.reference_details
    switch (ref.type) {
      case 'sale':
        return `Sale to ${ref.customer} - ৳${ref.total}`
      case 'expense':
        return `${ref.category}: ${ref.description || ''}`
      case 'purchase':
        return `Purchase from ${ref.supplier} (${ref.invoice_no})`
      case 'supplier_payment':
        return `Payment to ${ref.supplier}`
      case 'customer_payment':
        return `Due collection from ${ref.customer}`
    }
  }
  return t.source_display
}

async function loadData() {
  try {
    const params = {}
    if (filters.value.start_date) params.start_date = filters.value.start_date
    if (filters.value.end_date) params.end_date = filters.value.end_date
    if (filters.value.transaction_type) params.transaction_type = filters.value.transaction_type
    if (filters.value.source) params.source = filters.value.source
    
    const { data } = await axios.get('cash-transactions/', { params })
    transactions.value = data.transactions || []
    summary.value = {
      total_credit: data.summary?.total_credit || 0,
      total_debit: data.summary?.total_debit || 0,
      current_balance: data.summary?.current_balance || 0,
      total_transactions: transactions.value.length
    }
    
    // Find opening balance
    const opening = transactions.value.find(t => t.source === 'opening_balance')
    openingBalance.value = opening ? opening.amount : 0
  } catch (error) {
    console.error('Error loading transactions:', error)
    alert('Failed to load transactions')
  }
}

async function syncTransactions() {
  try {
    syncing.value = true
    await axios.post('cash-transactions/sync/')
    await loadData()
    alert('Transactions synced successfully!')
  } catch (error) {
    console.error('Error syncing transactions:', error)
    alert('Failed to sync transactions')
  } finally {
    syncing.value = false
  }
}

async function exportPDF() {
  try {
    const params = {}
    if (filters.value.start_date) params.start_date = filters.value.start_date
    if (filters.value.end_date) params.end_date = filters.value.end_date
    if (filters.value.transaction_type) params.transaction_type = filters.value.transaction_type
    if (filters.value.source) params.source = filters.value.source

    console.log('Exporting PDF with params:', params)

    // Get the token
    const token = localStorage.getItem("access") || localStorage.getItem("token")
    
    const response = await axios.get('cash-transactions/export/pdf/', {
      params,
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('PDF response received:', response.status, response.headers['content-type'])

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cash_ledger_${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('PDF download initiated')
  } catch (error) {
    console.error('Error exporting PDF:', error)
    console.error('Error details:', error.response?.data, error.response?.status)
    alert(`Failed to export PDF: ${error.message || 'Unknown error'}`)
  }
}

async function exportExcel() {
  try {
    const params = {}
    if (filters.value.start_date) params.start_date = filters.value.start_date
    if (filters.value.end_date) params.end_date = filters.value.end_date
    if (filters.value.transaction_type) params.transaction_type = filters.value.transaction_type
    if (filters.value.source) params.source = filters.value.source

    console.log('Exporting Excel with params:', params)

    // Get the token
    const token = localStorage.getItem("access") || localStorage.getItem("token")

    const response = await axios.get('cash-transactions/export/excel/', {
      params,
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('Excel response received:', response.status, response.headers['content-type'])

    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cash_ledger_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('Excel download initiated')
  } catch (error) {
    console.error('Error exporting Excel:', error)
    console.error('Error details:', error.response?.data, error.response?.status)
    alert(`Failed to export Excel: ${error.message || 'Unknown error'}`)
  }
}

async function saveTransaction() {
  if (!newTransaction.value.amount || newTransaction.value.amount <= 0) {
    alert('Please enter a valid amount')
    return
  }
  
  try {
    saving.value = true
    await axios.post('cash-transactions/create/', newTransaction.value)
    openAddModal.value = false
    resetNewTransaction()
    await loadData()
  } catch (error) {
    console.error('Error saving transaction:', error)
    alert('Failed to save transaction')
  } finally {
    saving.value = false
  }
}

async function saveOpeningBalance() {
  if (!openingBalanceData.value.amount || openingBalanceData.value.amount < 0) {
    alert('Please enter a valid amount')
    return
  }
  
  try {
    saving.value = true
    await axios.post('cash-transactions/opening-balance/', openingBalanceData.value)
    openOpeningBalanceModal.value = false
    await loadData()
  } catch (error) {
    console.error('Error saving opening balance:', error)
    alert('Failed to save opening balance')
  } finally {
    saving.value = false
  }
}

async function deleteTransaction(id) {
  if (!confirm('Are you sure you want to delete this transaction?')) return
  
  try {
    await axios.delete(`cash-transactions/${id}/delete/`)
    await loadData()
  } catch (error) {
    console.error('Error deleting transaction:', error)
    alert('Failed to delete transaction')
  }
}

function resetNewTransaction() {
  newTransaction.value = {
    date: new Date().toISOString().split('T')[0],
    transaction_type: 'credit',
    source: 'investment',
    amount: '',
    payment_method: 'cash',
    bank_name: '',
    reference_no: '',
    description: ''
  }
}

onMounted(() => {
  // Set default date range (last 30 days)
  const today = new Date()
  const prior = new Date()
  prior.setDate(today.getDate() - 30)
  
  filters.value.start_date = prior.toISOString().split('T')[0]
  filters.value.end_date = today.toISOString().split('T')[0]
  
  loadData()
})
</script>
