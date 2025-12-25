<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold">Customer Ledger</h1>
        <p class="text-gray-600">Select a customer to view ledger</p>
      </div>

      <button
        @click="reload"
        class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        :disabled="loading"
      >
        Reload
      </button>
    </div>

    <!-- ALERT -->
    <div
      v-if="alert.show"
      class="mb-4 p-3 rounded border"
      :class="alert.type === 'error'
        ? 'bg-red-50 border-red-300 text-red-800'
        : alert.type === 'warning'
          ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
          : 'bg-green-50 border-green-300 text-green-800'"
    >
      {{ alert.message }}
    </div>

    <!-- CUSTOMER SELECT -->
    <div class="bg-white rounded shadow p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label class="text-sm text-gray-700">Search customer (name/phone)</label>
          <input
            v-model="search"
            @input="debouncedFetchCustomers"
            type="text"
            placeholder="e.g. Rahim / 01xxxxxxxxx"
            class="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <div class="md:col-span-2">
          <label class="text-sm text-gray-700">Select customer</label>
          <select
            v-model="selectedCustomerId"
            @change="onSelectCustomer"
            class="mt-1 w-full border rounded px-3 py-2"
          >
            <option value="">-- Select --</option>
            <option v-for="c in customers" :key="c.id" :value="c.id">
              {{ c.name }} ({{ c.phone }})
            </option>
          </select>

          <p class="text-xs text-gray-500 mt-1" v-if="customers.length === 0 && !customersLoading">
            No customers found.
          </p>
        </div>
      </div>
    </div>

    <!-- SUMMARY -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="bg-white rounded shadow p-4">
        <div class="text-sm text-gray-500">Total Sales</div>
        <div class="text-xl font-semibold">{{ fmt(totals.total_sales) }}</div>
      </div>
      <div class="bg-white rounded shadow p-4">
        <div class="text-sm text-gray-500">Total Paid</div>
        <div class="text-xl font-semibold text-green-600">{{ fmt(totals.total_paid) }}</div>
      </div>
      <div class="bg-white rounded shadow p-4">
        <div class="text-sm text-gray-500">Total Due</div>
        <div class="text-xl font-semibold text-red-600">{{ fmt(totals.total_due) }}</div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="py-10 text-center">
      <div class="inline-block h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-transparent"></div>
      <div class="mt-3 text-gray-600">Loading ledger...</div>
    </div>

    <!-- LEDGER TABLE -->
    <div v-else class="bg-white rounded shadow overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-4 py-3">Date</th>
            <th class="text-left px-4 py-3">Type</th>
            <th class="text-left px-4 py-3">Invoice/Memo</th>
            <th class="text-right px-4 py-3">Debit</th>
            <th class="text-right px-4 py-3">Credit</th>
            <th class="text-right px-4 py-3">Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="ledger.length === 0">
            <td colspan="6" class="px-4 py-10 text-center text-gray-500">
              No ledger entries found.
            </td>
          </tr>

          <tr v-for="row in ledger" :key="rowKey(row)" class="border-t">
            <td class="px-4 py-3">{{ row.date }}</td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded text-xs font-semibold"
                :class="(row.type === 'Sale' || row.type === 'বিক্রয়')
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'"
              >
                {{ (row.type === 'Sale' || row.type === 'বিক্রয়') ? 'Sale' : 'Payment' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span v-if="row.invoice_no">{{ row.invoice_no }}</span>
              <span v-else-if="row.memo_no">{{ row.memo_no }}</span>
              <span v-else>-</span>
            </td>
            <td class="px-4 py-3 text-right">{{ row.debit ? fmt(row.debit) : '-' }}</td>
            <td class="px-4 py-3 text-right">{{ row.credit ? fmt(row.credit) : '-' }}</td>
            <td class="px-4 py-3 text-right font-semibold">
              {{ fmt(row.balance || 0) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- REPAY -->
    <div class="bg-white rounded shadow p-4 mt-4">
      <h2 class="text-lg font-semibold mb-2">Record Payment (Repay)</h2>
      <p class="text-xs text-gray-500 mb-3">
        Posts to customer repay endpoint
      </p>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          v-model.number="repay.amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          class="border rounded px-3 py-2"
        />

        <select v-model="repay.payment_method" class="border rounded px-3 py-2">
          <option value="cash">Cash</option>
          <option value="bkash">bKash</option>
          <option value="nagad">Nagad</option>
          <option value="card">Card</option>
          <option value="bank">Bank Transfer</option>
        </select>

        <input
          v-model="repay.memo_no"
          type="text"
          placeholder="Memo no (optional)"
          class="border rounded px-3 py-2"
        />

        <button
          @click="submitRepay"
          class="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
          :disabled="repayLoading || !selectedCustomerId || !repay.amount || repay.amount <= 0"
        >
          {{ repayLoading ? 'Saving...' : 'Save Payment' }}
        </button>
      </div>

      <textarea
        v-model="repay.remarks"
        rows="2"
        placeholder="Remarks (optional)"
        class="border rounded px-3 py-2 w-full mt-3"
      />
    </div>
  </div>
</template>

<script>
import axios from "@/axios";

export default {
  name: "CustomerLedger",

  data() {
    return {
      customers: [],
      customersLoading: false,
      search: "",
      selectedCustomerId: "",

      loading: false,
      ledger: [],
      totals: { total_sales: 0, total_paid: 0, total_due: 0 },
      customerInfo: { name: "", phone: "", points: 0 },

      repayLoading: false,
      repay: {
        amount: null,
        payment_method: "cash",
        memo_no: "",
        remarks: "",
      },

      alert: { show: false, type: "success", message: "" },

      _debounceTimer: null,
    };
  },

  mounted() {
    // If you ever pass ?id=123 it will auto select
    const qid = this.$route?.query?.id;
    if (qid) this.selectedCustomerId = String(qid);

    this.fetchCustomers().then(() => {
      if (this.selectedCustomerId) this.loadLedger();
    });
  },

  methods: {
    showAlert(message, type = "success") {
      this.alert = { show: true, type, message };
      setTimeout(() => (this.alert.show = false), 4000);
    },

    fmt(n) {
      const num = Number(n || 0);
      return new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        minimumFractionDigits: 2,
      }).format(num);
    },

    rowKey(row) {
      return `${row.model || "row"}-${row.id || row.date}-${row.type}`;
    },

    debouncedFetchCustomers() {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this.fetchCustomers(), 350);
    },

    async fetchCustomers() {
      this.customersLoading = true;
      try {
        // DRF SearchFilter: ?search=...
        const res = await axios.get("customers/", {
          params: this.search ? { search: this.search, page_size: 200 } : { page_size: 200 },
        });

        // DRF pagination support
        const list = res.data?.results || res.data || [];
        this.customers = Array.isArray(list) ? list : [];
      } catch (e) {
        console.error(e);
        this.showAlert("Failed to load customers list", "error");
      } finally {
        this.customersLoading = false;
      }
    },

    onSelectCustomer() {
      // also set query param so refresh keeps selection
      this.$router.replace({
        path: this.$route.path,
        query: this.selectedCustomerId ? { id: this.selectedCustomerId } : {},
      });

      if (this.selectedCustomerId) this.loadLedger();
      else {
        this.ledger = [];
        this.totals = { total_sales: 0, total_paid: 0, total_due: 0 };
        this.customerInfo = { name: "", phone: "", points: 0 };
      }
    },

    reload() {
      if (!this.selectedCustomerId) {
        this.showAlert("Select a customer first.", "warning");
        return;
      }
      this.loadLedger();
    },


    async loadLedger() {
      if (!this.selectedCustomerId) return;

      this.loading = true;
      try {
        const res = await axios.get(`customers/${this.selectedCustomerId}/ledger/`);
        console.log("Ledger API Response:", res.data);

        // Your CustomerViewSet ledger action returns:
        // - customer: {id, name, phone}
        // - summary: {total_sales, total_paid, total_due}
        // - entries: array of ledger entries
        
        if (res.data.customer) {
          this.customerInfo = {
            name: res.data.customer.name || "",
            phone: res.data.customer.phone || "",
            points: res.data.customer.points || 0
          };
        }

        if (res.data.summary) {
          this.totals = {
            total_sales: res.data.summary.total_sales || 0,
            total_paid: res.data.summary.total_paid || 0,
            total_due: res.data.summary.total_due || 0
          };
        }

        this.ledger = res.data.entries || [];
        
        console.log("Ledger entries loaded:", this.ledger.length);
        console.log("Customer info:", this.customerInfo);
        console.log("Totals:", this.totals);

      } catch (e) {
        console.error("Ledger loading error:", e);
        let errorMsg = "Failed to load customer ledger";
        if (e.response) {
          console.error("Response status:", e.response.status);
          console.error("Response data:", e.response.data);
          
          if (e.response.status === 401) {
            errorMsg = "Authentication required. Please login again.";
          } else if (e.response.status === 404) {
            errorMsg = "Customer not found or ledger unavailable.";
          } else if (e.response.status === 403) {
            errorMsg = "You don't have permission to view this ledger.";
          } else {
            errorMsg = e.response.data?.detail || e.response.data?.error || `Error ${e.response.status}: ${e.response.statusText}`;
          }
        } else if (e.request) {
          errorMsg = "Network error. Please check your connection.";
        } else {
          errorMsg = e.message || "An unexpected error occurred.";
        }
        
        this.showAlert(errorMsg, "error");
        this.ledger = [];
        this.totals = { total_sales: 0, total_paid: 0, total_due: 0 };
      } finally {
        this.loading = false;
      }
    },

    async submitRepay() {
      if (!this.selectedCustomerId) {
        this.showAlert("Select a customer first.", "warning");
        return;
      }
      if (!this.repay.amount || this.repay.amount <= 0) {
        this.showAlert("Enter a valid amount.", "warning");
        return;
      }

      this.repayLoading = true;
      try {
        const res = await axios.post(`customers/${this.selectedCustomerId}/repay/`, this.repay);
        if (res.data?.success) {
          this.showAlert("Payment saved successfully!", "success");
          this.repay.amount = null;
          this.repay.memo_no = "";
          this.repay.remarks = "";
          
          await this.loadLedger();
        } else {
          this.showAlert(res.data?.detail || "Payment failed", "error");
        }
      } catch (e) {
        console.error("Repay error:", e);
        
        let errorMsg = "Payment failed";
        if (e.response) {
          errorMsg = e.response.data?.detail || e.response.data?.error || `Error ${e.response.status}`;
        }
        
        this.showAlert(errorMsg, "error");
      } finally {
        this.repayLoading = false;
      }
    },
  },
};
</script>