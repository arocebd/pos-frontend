<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800">Dashboard Overview</h1>
          <p class="text-gray-600 mt-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
            </svg>
            <span>{{ monthLabel }}</span>
            </p>
          </div>
        </div>
      </div>
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" :class="kpis.month_vat_amount > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'">
      <!-- Today's Sales Card -->
      <div class="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-green-500">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Today's Sales</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">৳ {{ fmtNumber(kpis.today_total) }}</p>
            <p class="text-sm text-green-600 mt-1 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
              </svg>
              {{ kpis.today_sales_count || 0 }} orders
            </p>
          </div>
          <div class="bg-green-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Monthly Sales Card -->
      <div class="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-blue-500">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Monthly Sales</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">৳ {{ fmtNumber(kpis.month_total) }}</p>
            <p class="text-sm text-blue-600 mt-1 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
              </svg>
              {{ kpis.month_sales_count || 0 }} orders
            </p>
          </div>
          <div class="bg-blue-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Monthly VAT Card (only show if VAT exists) -->
      <div v-if="kpis.month_vat_amount > 0" class="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-purple-500">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Monthly VAT</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">৳ {{ fmtNumber(kpis.month_vat_amount) }}</p>
            <p class="text-sm text-purple-600 mt-1 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Tax Collected
            </p>
            <p class="text-xs text-gray-500 mt-2">
              Base Sales: ৳{{ fmtNumber(kpis.month_base_sales) }}
            </p>
          </div>
          <div class="bg-purple-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Stock Alert Card -->
      <div 
        class="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        :class="stockAlertBorderClass"
        @click="openStockAlerts"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Stock Alerts</p>
            <p class="text-3xl font-bold mt-2" :class="stockAlertTextClass">
              {{ (kpis.stock_alerts?.low_stock_count || 0) + (kpis.stock_alerts?.out_of_stock_count || 0) }}
            </p>
            <p class="text-sm mt-1" :class="stockAlertSubtextClass">
              <span v-if="kpis.stock_alerts?.out_of_stock_count > 0">
                ⚠️ {{ kpis.stock_alerts.out_of_stock_count }} out of stock
              </span>
              <span v-else-if="kpis.stock_alerts?.low_stock_count > 0">
                ⚡ {{ kpis.stock_alerts.low_stock_count }} low stock
              </span>
              <span v-else class="text-green-600">
                ✓ All products in stock
              </span>
            </p>
          </div>
          <div :class="stockAlertIconClass" class="p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Due Amount Card -->
      <div 
        class="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        :class="dueAmountBorderClass"
        @click="openDueDetails"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Due</p>
            <p class="text-3xl font-bold mt-2" :class="dueAmountTextClass">
              ৳ {{ fmtNumber(kpis.total_due_amount) }}
            </p>
            <p class="text-sm mt-1" :class="dueAmountSubtextClass">
              {{ kpis.total_customers_with_due || 0 }} customers
              <span v-if="kpis.total_due_amount > 0" class="ml-2 px-2 py-1 text-xs rounded-full" :class="dueAmountBadgeClass">
                {{ getDuePriorityText() }}
              </span>
            </p>
          </div>
          <div :class="dueAmountIconClass" class="p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              <path d="M18 9h-2v4h2a1 1 0 001-1v-2a1 1 0 00-1-1z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Additional Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Daily Sales Chart -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold text-gray-800">Daily Sales Trend</h3>
            <p class="text-gray-500 text-sm">Sales performance this month</p>
          </div>
          <div class="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-medium">৳ {{ fmtNumber(kpis.month_total) }} Total</span>
          </div>
        </div>
        <div class="h-72">
          <canvas ref="dailyLineRef"></canvas>
        </div>
      </div>

      <!-- Inventory Health -->
      <div class="bg-white rounded-2xl p-6 shadow-lg">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold text-gray-800">Inventory Health</h3>
            <p class="text-gray-500 text-sm">Stock status overview</p>
          </div>
          <div class="text-sm text-gray-500">Total: {{ kpis.total_products || 0 }}</div>
        </div>
        
        <div class="space-y-4">
          <!-- Stock Status Progress Bars -->
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium">Healthy Stock</span>
              <span class="text-green-600 font-bold">{{ kpis.stock_alerts?.healthy_stock_count || 0 }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                :style="{ width: `${kpis.stock_alerts?.stock_status_summary?.healthy_percentage || 0}%` }"
              ></div>
            </div>
          </div>
          
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium">Low Stock</span>
              <span class="text-yellow-600 font-bold">{{ kpis.stock_alerts?.low_stock_count || 0 }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-yellow-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                :style="{ width: `${kpis.stock_alerts?.stock_status_summary?.low_stock_percentage || 0}%` }"
              ></div>
            </div>
          </div>
          
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium">Out of Stock</span>
              <span class="text-red-600 font-bold">{{ kpis.stock_alerts?.out_of_stock_count || 0 }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                :style="{ width: `${kpis.stock_alerts?.stock_status_summary?.out_of_stock_percentage || 0}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="mt-8 pt-6 border-t border-gray-100">
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <p class="text-2xl font-bold text-blue-600">{{ kpis.products_in_stock || 0 }}</p>
              <p class="text-sm text-gray-600">Total Units</p>
            </div>
            <div class="text-center p-3 bg-orange-50 rounded-lg">
              <p class="text-2xl font-bold text-orange-600">৳ {{ fmtNumber(kpis.average_sale_value || 0) }}</p>
              <p class="text-sm text-gray-600">Avg. Sale</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Products -->
      <div class="bg-white rounded-2xl p-6 shadow-lg">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold text-gray-800">Top Products</h3>
            <p class="text-gray-500 text-sm">Best sellers this month</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span class="text-sm font-medium text-gray-700">By Quantity</span>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 text-gray-600 font-semibold">Product</th>
                <th class="text-right py-3 px-4 text-gray-600 font-semibold">Quantity</th>
                <th class="text-right py-3 px-4 text-gray-600 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(product, index) in topProducts" 
                :key="product.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                      <span class="text-orange-600 font-bold">{{ index + 1 }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-800">{{ product.title }}</p>
                      <p class="text-xs text-gray-500">Code: {{ product.product_code || 'N/A' }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 text-right">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {{ product.qty }} units
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <span class="font-bold text-gray-800">৳ {{ fmtNumber(product.total) }}</span>
                </td>
              </tr>
              <tr v-if="topProducts.length === 0">
                <td colspan="3" class="py-8 text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="mt-2">No sales data available</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Customers with Due -->
      <div class="bg-white rounded-2xl p-6 shadow-lg">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold text-gray-800">Outstanding Dues</h3>
            <p class="text-gray-500 text-sm">Top customers with pending payments</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            <span class="text-sm font-medium text-gray-700">By Amount</span>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 text-gray-600 font-semibold">Customer</th>
                <th class="text-left py-3 px-4 text-gray-600 font-semibold">Phone</th>
                <th class="text-right py-3 px-4 text-gray-600 font-semibold">Due Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="customer in topCustomersWithDue" 
                :key="customer.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-800">{{ customer.name }}</p>
                      <p class="text-xs text-gray-500">Total: ৳ {{ fmtNumber(customer.total_purchases) }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="text-gray-700">{{ customer.phone }}</span>
                </td>
                <td class="py-3 px-4 text-right">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                    ৳ {{ fmtNumber(customer.due_amount) }}
                  </span>
                </td>
              </tr>
              <tr v-if="topCustomersWithDue.length === 0">
                <td colspan="3" class="py-8 text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="mt-2">No outstanding dues</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="kpis.total_due_amount > 0" class="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">Total Outstanding:</p>
              <p class="text-2xl font-bold text-red-600">৳ {{ fmtNumber(kpis.total_due_amount) }}</p>
            </div>
            <button 
              @click="openDueDetails"
              class="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
              </svg>
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Alerts Modal -->
    <div v-if="showStockAlerts" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h3 class="text-2xl font-bold text-gray-800">Stock Alerts & Inventory</h3>
            <p class="text-gray-500">Monitor and manage your stock levels</p>
          </div>
          <button 
            @click="showStockAlerts = false"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="stockAlertsData.loading" class="py-12 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p class="mt-4 text-gray-500">Loading stock alerts...</p>
        </div>

        <!-- Content -->
        <div v-else>
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border-l-4 border-red-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-red-600">Out of Stock</p>
                  <p class="text-3xl font-bold text-red-700 mt-1">{{ stockAlertsData.stats?.out_of_stock || 0 }}</p>
                  <p class="text-xs text-red-600 mt-1">
                    {{ stockAlertsData.stats?.percentage_out_of_stock || 0 }}% of inventory
                  </p>
                </div>
                <div class="bg-red-500 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border-l-4 border-yellow-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-yellow-600">Low Stock</p>
                  <p class="text-3xl font-bold text-yellow-700 mt-1">{{ stockAlertsData.stats?.total_low_stock || 0 }}</p>
                  <p class="text-xs text-yellow-600 mt-1">
                    {{ stockAlertsData.stats?.percentage_low_stock || 0 }}% of inventory
                  </p>
                </div>
                <div class="bg-yellow-500 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-l-4 border-blue-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-blue-600">Healthy Stock</p>
                  <p class="text-3xl font-bold text-blue-700 mt-1">
                    {{ (stockAlertsData.stats?.total_products || 0) - (stockAlertsData.stats?.total_alerts || 0) }}
                  </p>
                  <p class="text-xs text-blue-600 mt-1">
                    {{
                      Math.round((((stockAlertsData.stats?.total_products || 0) - (stockAlertsData.stats?.total_alerts || 0)) / 
                      (stockAlertsData.stats?.total_products || 1) * 100) * 10) / 10
                    }}% of inventory
                  </p>
                </div>
                <div class="bg-blue-500 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="mb-6">
            <div class="flex border-b border-gray-200">
              <button 
                v-for="tab in stockTabs"
                :key="tab.id"
                @click="activeStockTab = tab.id"
                :class="{
                  'border-b-2 border-orange-500 text-orange-600': activeStockTab === tab.id,
                  'text-gray-500 hover:text-gray-700': activeStockTab !== tab.id
                }"
                class="px-4 py-3 font-medium text-sm transition-colors relative"
              >
                {{ tab.label }}
                <span 
                  v-if="tab.count > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {{ tab.count }}
                </span>
              </button>
            </div>
          </div>

          <!-- Tables -->
          <div v-if="activeStockTab === 'out_of_stock' && stockAlertsData.out_of_stock_products?.length > 0">
            <div class="mb-4">
              <h4 class="text-lg font-semibold text-red-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Out of Stock Products (Urgent Action Required)
              </h4>
              <p class="text-sm text-gray-500">These products need immediate restocking</p>
            </div>
            <div class="overflow-x-auto rounded-lg border border-red-200">
              <table class="w-full">
                <thead class="bg-red-50">
                  <tr>
                    <th class="text-left p-3 text-red-700 font-semibold">Product</th>
                    <th class="text-left p-3 text-red-700 font-semibold">Category</th>
                    <th class="text-left p-3 text-red-700 font-semibold">Code</th>
                    <th class="text-left p-3 text-red-700 font-semibold">Price</th>
                    <th class="text-left p-3 text-red-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="product in stockAlertsData.out_of_stock_products" 
                    :key="product.id"
                    class="border-t border-red-100 hover:bg-red-50 transition-colors"
                  >
                    <td class="p-3 font-medium">{{ product.title }}</td>
                    <td class="p-3">{{ product.category }}</td>
                    <td class="p-3 text-gray-500">{{ product.product_code }}</td>
                    <td class="p-3 font-semibold">৳ {{ fmtNumber(product.selling_price) }}</td>
                    <td class="p-3">
                      <button 
                        @click="restockProduct(product)"
                        class="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        Restock Now
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeStockTab === 'low_stock' && stockAlertsData.low_stock_products?.length > 0">
            <div class="mb-4">
              <h4 class="text-lg font-semibold text-yellow-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Low Stock Products (Below {{ stockAlertsData.threshold || 10 }} units)
              </h4>
              <p class="text-sm text-gray-500">Consider restocking these products soon</p>
            </div>
            <div class="overflow-x-auto rounded-lg border border-yellow-200">
              <table class="w-full">
                <thead class="bg-yellow-50">
                  <tr>
                    <th class="text-left p-3 text-yellow-700 font-semibold">Product</th>
                    <th class="text-left p-3 text-yellow-700 font-semibold">Stock</th>
                    <th class="text-left p-3 text-yellow-700 font-semibold">Threshold</th>
                    <th class="text-left p-3 text-yellow-700 font-semibold">Value</th>
                    <th class="text-left p-3 text-yellow-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="product in stockAlertsData.low_stock_products" 
                    :key="product.id"
                    class="border-t border-yellow-100 hover:bg-yellow-50 transition-colors"
                  >
                    <td class="p-3 font-medium">{{ product.title }}</td>
                    <td class="p-3">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800">
                        {{ product.current_stock }} units
                      </span>
                    </td>
                    <td class="p-3">{{ product.threshold }} units</td>
                    <td class="p-3 font-semibold">৳ {{ fmtNumber(product.stock_value) }}</td>
                    <td class="p-3">
                      <button 
                        @click="restockProduct(product)"
                        class="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        Plan Restock
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeStockTab === 'all' && stockAlertsData.all_alert_products?.length > 0">
            <div class="mb-4">
              <h4 class="text-lg font-semibold text-gray-800">All Stock Alerts</h4>
              <p class="text-sm text-gray-500">Complete overview of stock alerts</p>
            </div>
            <div class="overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left p-3 text-gray-700 font-semibold">Status</th>
                    <th class="text-left p-3 text-gray-700 font-semibold">Product</th>
                    <th class="text-left p-3 text-gray-700 font-semibold">Category</th>
                    <th class="text-left p-3 text-gray-700 font-semibold">Current Stock</th>
                    <th class="text-left p-3 text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="product in stockAlertsData.all_alert_products" 
                    :key="product.id"
                    :class="{
                      'border-t hover:bg-red-50': product.status === 'out_of_stock',
                      'border-t hover:bg-yellow-50': product.status === 'low_stock'
                    }"
                    class="transition-colors"
                  >
                    <td class="p-3">
                      <span 
                        :class="{
                          'px-3 py-1 rounded-full text-sm font-bold': true,
                          'bg-red-100 text-red-700': product.status === 'out_of_stock',
                          'bg-yellow-100 text-yellow-700': product.status === 'low_stock'
                        }"
                      >
                        {{ product.status === 'out_of_stock' ? 'OUT OF STOCK' : 'LOW STOCK' }}
                      </span>
                    </td>
                    <td class="p-3 font-medium">{{ product.title }}</td>
                    <td class="p-3">{{ product.category }}</td>
                    <td class="p-3 font-semibold">{{ product.current_stock }} units</td>
                    <td class="p-3">
                      <button 
                        @click="restockProduct(product)"
                        class="px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-sm"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="stockAlertsData.all_alert_products?.length === 0" class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 class="text-xl font-semibold text-gray-800 mt-4">All Good!</h4>
            <p class="text-gray-500 mt-2">No stock alerts at the moment. Your inventory is well-managed.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Due Details Modal -->
    <div v-if="showDueDetails" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h3 class="text-2xl font-bold text-gray-800">Outstanding Payments</h3>
            <p class="text-gray-500">Manage and track customer dues</p>
          </div>
          <button 
            @click="showDueDetails = false"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="dueDetailsData.loading" class="py-12 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p class="mt-4 text-gray-500">Loading due details...</p>
        </div>

        <!-- Content -->
        <div v-else>
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border-l-4 border-red-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-red-600">Total Due</p>
                  <p class="text-3xl font-bold text-red-700 mt-1">৳ {{ fmtNumber(dueDetailsData.customer_due_summary?.total_due || 0) }}</p>
                  <p class="text-xs text-red-600 mt-1">{{ dueDetailsData.customer_due_summary?.total_customers_with_due || 0 }} customers</p>
                </div>
                <div class="bg-red-500 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-l-4 border-blue-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-blue-600">Average Due</p>
                  <p class="text-3xl font-bold text-blue-700 mt-1">৳ {{ fmtNumber(dueDetailsData.customer_due_summary?.average_due_per_customer || 0) }}</p>
                  <p class="text-xs text-blue-600 mt-1">Per customer</p>
                </div>
                <div class="bg-blue-500 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-l-4 border-green-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-green-600">Collections Impact</p>
                  <p class="text-3xl font-bold text-green-700 mt-1">
                    {{ dueDetailsData.customer_due_summary?.total_customers_with_due || 0 }}
                  </p>
                  <p class="text-xs text-green-600 mt-1">Customers to follow up</p>
                </div>
                <div class="bg-green-500 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer List -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-800 mb-4">Customer Due Details</h4>
            <div class="overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left p-3 text-gray-700 font-semibold">Customer</th>
                    <th class="text-left p-3 text-gray-700 font-semibold">Phone</th>
                    <th class="text-left p-3 text-gray-700 font-semibold">Total Purchases</th>
                    <th class="text-left p-3 text-gray-700 font-semibold">Due Amount</th>
                    <th class="text-left p-3 text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="customer in dueDetailsData.customer_due_summary?.customers || []" 
                    :key="customer.id"
                    class="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td class="p-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <span class="font-bold text-orange-600">{{ customer.name.charAt(0) }}</span>
                        </div>
                        <div>
                          <p class="font-medium text-gray-800">{{ customer.name }}</p>
                          <p class="text-xs text-gray-500" v-if="customer.last_sale_date">
                            Last purchase: {{ formatDate(customer.last_sale_date) }}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="p-3">{{ customer.phone }}</td>
                    <td class="p-3">
                      <span class="font-semibold text-gray-700">৳ {{ fmtNumber(customer.total_purchases) }}</span>
                    </td>
                    <td class="p-3">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                        ৳ {{ fmtNumber(customer.due_amount) }}
                      </span>
                    </td>
                    <td class="p-3">
                      <button 
                        @click="collectPayment(customer)"
                        class="px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:from-orange-600 hover:to-green-600 transition-all duration-300 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        Collect Payment
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="dueDetailsData.customer_due_summary?.customers?.length === 0" class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 class="text-xl font-semibold text-gray-800 mt-4">All Payments Collected!</h4>
            <p class="text-gray-500 mt-2">No outstanding dues from customers. Great job!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading / Error States -->
    <div v-if="loading" class="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
        <p class="mt-4 text-xl font-semibold text-gray-700">Loading Dashboard...</p>
        <p class="text-gray-500">Fetching the latest data</p>
      </div>
    </div>

    <div v-if="error" class="fixed top-4 right-4 z-50">
      <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg max-w-md animate-slide-in">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Dashboard Error</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
            <div class="mt-4">
              <button 
                @click="retryLoading"
                class="text-sm font-medium text-red-800 hover:text-red-900"
              >
                Try again →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import axios from "../axios";
import Chart from "chart.js/auto";
import { useRouter } from "vue-router";

const router = useRouter();

// ----- State -----
const loading = ref(false);
const error = ref("");
const monthLabel = ref("");
const shopName = ref("My Shop");
const activeStockTab = ref('out_of_stock');

// Dashboard data
const kpis = ref({
  today_total: 0,
  month_total: 0,
  products_in_stock: 0,
  today_sales_count: 0,
  month_sales_count: 0,
  average_sale_value: 0,
  total_products: 0,
  total_customers: 0,
  stock_alerts: {
    low_stock_count: 0,
    out_of_stock_count: 0,
    healthy_stock_count: 0,
    threshold: 10,
    has_alerts: false,
    stock_status_summary: {
      low_stock_percentage: 0,
      out_of_stock_percentage: 0,
      healthy_percentage: 0
    }
  },
  total_due_amount: 0,
  total_customers_with_due: 0,
  // VAT metrics
  today_vat_amount: 0,
  month_vat_amount: 0,
  today_base_sales: 0,
  month_base_sales: 0,
  customer_due_summary: {
    total_due: 0,
    total_customers_with_due: 0,
    customers: [],
    average_due_per_customer: 0
  }
});

// Modal states
const showStockAlerts = ref(false);
const showDueDetails = ref(false);

const topProduct = ref({ id: null, title: "", qty: 0, total: 0 });
const topProducts = ref([]);
const topCustomersWithDue = ref([]);

const stockAlertsData = ref({
  loading: false,
  error: null,
  stats: {},
  out_of_stock_products: [],
  low_stock_products: [],
  all_alert_products: []
});

const dueDetailsData = ref({
  loading: false,
  error: null,
  customer_due_summary: {
    total_due: 0,
    total_customers_with_due: 0,
    customers: [],
    average_due_per_customer: 0
  }
});

// Restock modal data
const restockProductData = ref({
  loading: false,
  submitting: false,
  product: null,
  suggested_quantity: 10,
  last_purchase_price: null,
  recent_suppliers: [],
  all_suppliers: []
});

const restockForm = ref({
  product_id: null,
  quantity: 10,
  purchase_price: 0,
  supplier_id: '',
  new_supplier: {
    name: '',
    phone: ''
  }
});

// Chart refs
const dailyLineRef = ref(null);
const categoryBarRef = ref(null);
let dailyChart, categoryChart;

// Stock tabs
const stockTabs = computed(() => [
  { id: 'out_of_stock', label: 'Out of Stock', count: stockAlertsData.value.out_of_stock_products?.length || 0 },
  { id: 'low_stock', label: 'Low Stock', count: stockAlertsData.value.low_stock_products?.length || 0 },
  { id: 'all', label: 'All Alerts', count: stockAlertsData.value.all_alert_products?.length || 0 }
]);

// ----- Computed Properties -----
const stockAlertBorderClass = computed(() => {
  if (kpis.value.stock_alerts?.out_of_stock_count > 0) {
    return "border-l-4 border-red-500 hover:border-red-600";
  } else if (kpis.value.stock_alerts?.low_stock_count > 0) {
    return "border-l-4 border-yellow-500 hover:border-yellow-600";
  }
  return "border-l-4 border-green-500 hover:border-green-600";
});

const stockAlertTextClass = computed(() => {
  if (kpis.value.stock_alerts?.out_of_stock_count > 0) {
    return "text-red-600";
  } else if (kpis.value.stock_alerts?.low_stock_count > 0) {
    return "text-yellow-600";
  }
  return "text-green-600";
});

const stockAlertSubtextClass = computed(() => {
  if (kpis.value.stock_alerts?.out_of_stock_count > 0) {
    return "text-red-500";
  } else if (kpis.value.stock_alerts?.low_stock_count > 0) {
    return "text-yellow-500";
  }
  return "text-green-500";
});

const stockAlertIconClass = computed(() => {
  if (kpis.value.stock_alerts?.out_of_stock_count > 0) {
    return "bg-red-100 text-red-600";
  } else if (kpis.value.stock_alerts?.low_stock_count > 0) {
    return "bg-yellow-100 text-yellow-600";
  }
  return "bg-green-100 text-green-600";
});

const dueAmountBorderClass = computed(() => {
  const due = kpis.value.total_due_amount;
  if (due > 50000) return "border-l-4 border-red-500 hover:border-red-600";
  if (due > 20000) return "border-l-4 border-yellow-500 hover:border-yellow-600";
  if (due > 0) return "border-l-4 border-orange-500 hover:border-orange-600";
  return "border-l-4 border-green-500 hover:border-green-600";
});

const dueAmountTextClass = computed(() => {
  const due = kpis.value.total_due_amount;
  if (due > 50000) return "text-red-600";
  if (due > 20000) return "text-yellow-600";
  if (due > 0) return "text-orange-600";
  return "text-green-600";
});

const dueAmountSubtextClass = computed(() => {
  const due = kpis.value.total_due_amount;
  if (due > 0) return "text-gray-600";
  return "text-green-600";
});

const dueAmountIconClass = computed(() => {
  const due = kpis.value.total_due_amount;
  if (due > 50000) return "bg-red-100 text-red-600";
  if (due > 20000) return "bg-yellow-100 text-yellow-600";
  if (due > 0) return "bg-orange-100 text-orange-600";
  return "bg-green-100 text-green-600";
});

const dueAmountBadgeClass = computed(() => {
  const due = kpis.value.total_due_amount;
  if (due > 50000) return "bg-red-500 text-white";
  if (due > 20000) return "bg-yellow-500 text-white";
  return "bg-orange-500 text-white";
});

// ----- Helper Functions -----
function fmtNumber(n) {
  const num = Number(n || 0);
  return num.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getDuePriorityText() {
  const due = kpis.value.total_due_amount;
  if (due === 0) return "All Clear";
  if (due < 5000) return "Low";
  if (due < 20000) return "Medium";
  if (due < 50000) return "High";
  return "Critical";
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function firstDayOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function lastDayOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function ymd(date) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// ----- Data Loading Functions -----
async function loadDashboard() {
  loading.value = true;
  error.value = "";

  try {
    // Load comprehensive dashboard metrics
    const dashboardRes = await axios.get(`/dashboard/comprehensive-metrics/`);
    const data = dashboardRes.data;
    
    // Update KPIs
    kpis.value = {
      today_total: data.today_total || 0,
      month_total: data.month_total || 0,
      products_in_stock: data.products_in_stock || 0,
      today_sales_count: data.today_sales_count || 0,
      month_sales_count: data.month_sales_count || 0,
      average_sale_value: data.average_sale_value || 0,
      total_products: data.total_products || 0,
      total_customers: data.total_customers || 0,
      stock_alerts: data.stock_alerts || kpis.value.stock_alerts,
      total_due_amount: data.total_due_amount || 0,
      total_customers_with_due: data.total_customers_with_due || 0,
      // VAT metrics from backend
      today_vat_amount: data.today_vat_amount || 0,
      month_vat_amount: data.month_vat_amount || 0,
      today_base_sales: data.today_base_sales || 0,
      month_base_sales: data.month_base_sales || 0
    };
    
    // Update month label
    monthLabel.value = data.month_label || new Date().toLocaleString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    // Load top product data
    if (data.top_product?.title) {
      topProduct.value = {
        id: data.top_product.id,
        title: data.top_product.title,
        qty: data.top_product.qty || 0,
        total: data.top_product.total || 0
      };
    }

    // Load additional data in parallel
    await Promise.all([
      loadTopProducts(),
      loadDueSummary(),
      loadDailySalesChart(),
      loadCategoryChart()
    ]);

  } catch (e) {
    console.error("Dashboard load error:", e);
    error.value = e.response?.data?.detail || "Failed to load dashboard data. Please try again.";
  } finally {
    loading.value = false;
  }
}

async function loadTopProducts() {
  try {
    const now = new Date();
    const from = ymd(firstDayOfMonth(now));
    const to = ymd(lastDayOfMonth(now));
    
    const res = await axios.get(`/dashboard/top-products/?from=${from}&to=${to}&limit=5`);
    topProducts.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.warn("Failed to load top products:", e);
    topProducts.value = [];
  }
}

async function loadDueSummary() {
  try {
    const res = await axios.get(`/dashboard/due-summary/`);
    dueDetailsData.value.customer_due_summary = res.data.customer_due_summary || {};
    topCustomersWithDue.value = res.data.customer_due_summary?.customers || [];
  } catch (e) {
    console.warn("Failed to load due summary:", e);
  }
}

async function loadDailySalesChart() {
  try {
    const now = new Date();
    const from = ymd(firstDayOfMonth(now));
    const to = ymd(lastDayOfMonth(now));
    
    const res = await axios.get(`/dashboard/daily/?from=${from}&to=${to}`);
    const daily = Array.isArray(res.data) ? res.data : [];
    renderDailyChart(daily);
  } catch (e) {
    console.warn("Failed to load daily sales:", e);
  }
}

async function loadCategoryChart() {
  try {
    const now = new Date();
    const from = ymd(firstDayOfMonth(now));
    const to = ymd(lastDayOfMonth(now));
    
    const res = await axios.get(`/dashboard/category-summary/?from=${from}&to=${to}`);
    const categories = Array.isArray(res.data) ? res.data : [];
    renderCategoryChart(categories);
  } catch (e) {
    console.warn("Failed to load category chart:", e);
  }
}

async function loadStockAlerts() {
  stockAlertsData.value.loading = true;
  try {
    const res = await axios.get('/dashboard/stock-alerts/');
    Object.assign(stockAlertsData.value, res.data);
  } catch (e) {
    console.error("Failed to load stock alerts:", e);
    error.value = "Failed to load stock alerts.";
  } finally {
    stockAlertsData.value.loading = false;
  }
}

async function loadDueDetails() {
  dueDetailsData.value.loading = true;
  try {
    const res = await axios.get('/dashboard/due-summary/');
    dueDetailsData.value.customer_due_summary = res.data.customer_due_summary || {};
  } catch (e) {
    console.error("Failed to load due details:", e);
    error.value = "Failed to load due details.";
  } finally {
    dueDetailsData.value.loading = false;
  }
}

// ----- Event Handlers -----
function openStockAlerts() {
  showStockAlerts.value = true;
  loadStockAlerts();
}

function openDueDetails() {
  showDueDetails.value = true;
  loadDueDetails();
}

// FIXED: Restock product function - Navigate to AddPurchase page
function restockProduct(product) {
  console.log("Restocking product:", product);
  router.push({
    path: '/add-purchase',
    query: { product_id: product.id }
  });
}

// FIXED: Open restock modal
function openRestockModal(product) {
  console.log("Opening restock modal for:", product);
  showRestockModal.value = true;
  restockForm.value.product_id = product.id;
  
  // Set default quantity based on status
  if (product.status === 'out_of_stock') {
    restockForm.value.quantity = 20;
  } else if (product.current_stock && product.threshold) {
    restockForm.value.quantity = Math.max(10, product.threshold - product.current_stock + 5);
  } else {
    restockForm.value.quantity = 10;
  }
  
  // Set price
  if (product.purchased_price) {
    restockForm.value.purchase_price = product.purchased_price;
  } else if (product.selling_price) {
    restockForm.value.purchase_price = product.selling_price * 0.8;
  } else {
    restockForm.value.purchase_price = 0;
  }
  
  loadRestockProductData(product.id);
}

// FIXED: Close restock modal
function closeRestockModal() {
  showRestockModal.value = false;
  restockProductData.value = {
    loading: false,
    submitting: false,
    product: null,
    suggested_quantity: 10,
    last_purchase_price: null,
    recent_suppliers: [],
    all_suppliers: []
  };
  restockForm.value = {
    product_id: null,
    quantity: 10,
    purchase_price: 0,
    supplier_id: '',
    new_supplier: {
      name: '',
      phone: ''
    }
  };
}

// FIXED: Load product data for restock
async function loadRestockProductData(productId) {
  restockProductData.value.loading = true;
  try {
    const response = await axios.get(`/purchases/quick-restock/?product_id=${productId}`);
    restockProductData.value = {
      ...restockProductData.value,
      ...response.data,
      loading: false
    };
    
    // Set default values from API response
    if (response.data.suggested_quantity) {
      restockForm.value.quantity = response.data.suggested_quantity;
    }
    if (response.data.last_purchase_price) {
      restockForm.value.purchase_price = response.data.last_purchase_price;
    } else if (response.data.product?.purchased_price) {
      restockForm.value.purchase_price = response.data.product.purchased_price;
    }
    
    // Auto-select first recent supplier if available
    if (response.data.recent_suppliers?.length > 0) {
      restockForm.value.supplier_id = response.data.recent_suppliers[0].id;
    }
  } catch (error) {
    console.error("Failed to load product data:", error);
    showToast({
      type: 'error',
      message: "Failed to load product details",
      details: error.response?.data?.detail || error.message
    });
    closeRestockModal();
  } finally {
    restockProductData.value.loading = false;
  }
}

// FIXED: Submit restock form
async function submitRestock() {
  restockProductData.value.submitting = true;
  
  try {
    let supplierId = restockForm.value.supplier_id;
    
    // If creating new supplier
    if (supplierId === 'new' && restockForm.value.new_supplier.name) {
      try {
        // Create new supplier first
        const supplierResponse = await axios.post('/suppliers/', {
          name: restockForm.value.new_supplier.name,
          phone: restockForm.value.new_supplier.phone || 'N/A',
          address: ''
        });
        supplierId = supplierResponse.data.id;
      } catch (error) {
        console.error("Failed to create supplier:", error);
        showToast({
          type: 'error',
          message: "Failed to create supplier",
          details: error.response?.data?.detail || error.message
        });
        restockProductData.value.submitting = false;
        return;
      }
    }
    
    if (!supplierId) {
      showToast({
        type: 'error',
        message: "Please select or create a supplier"
      });
      restockProductData.value.submitting = false;
      return;
    }
    
    // Submit restock
    const response = await axios.post('/supplier/purchases/', {
      product_id: restockForm.value.product_id,
      quantity: restockForm.value.quantity,
      purchase_price: restockForm.value.purchase_price,
      supplier_id: supplierId
    });
    
    // Show success message
    showToast({
      type: 'success',
      message: response.data.message || "Product restocked successfully!",
      details: `New stock: ${response.data.data?.new_stock || restockForm.value.quantity} units`
    });
    
    // Refresh dashboard data
    loadDashboard();
    
    // Close modal
    closeRestockModal();
    
    // If we were in stock alerts modal, refresh that too
    if (showStockAlerts.value) {
      loadStockAlerts();
    }
    
  } catch (error) {
    console.error("Restock failed:", error);
    showToast({
      type: 'error',
      message: error.response?.data?.error || 'Failed to restock product',
      details: error.response?.data?.detail || 'Please try again'
    });
  } finally {
    restockProductData.value.submitting = false;
  }
}

// FIXED: Show toast notification
function showToast(toast) {
  // Create toast element
  const toastEl = document.createElement('div');
  toastEl.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg animate-slide-in ${
    toast.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
  }`;
  
  toastEl.innerHTML = `
    <div class="flex items-start">
      <div class="flex-shrink-0">
        ${toast.type === 'success' ? 
          '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>' :
          '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>'
        }
      </div>
      <div class="ml-3">
        <p class="font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}">${toast.message}</p>
        ${toast.details ? `<p class="mt-1 text-sm ${toast.type === 'success' ? 'text-green-600' : 'text-red-600'}">${toast.details}</p>` : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(toastEl);
  
  // Remove toast after 5 seconds
  setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(toastEl);
    }, 300);
  }, 5000);
}

// FIXED: Collect payment function
function collectPayment(customer) {
  console.log("Collecting payment for customer:", customer);
  // Navigate to due payments page with customer filter
  router.push({
    path: '/due-payment',
    query: { customer_id: customer.id }
  });
}

function refreshDashboard() {
  loadDashboard();
}

function retryLoading() {
  error.value = "";
  loadDashboard();
}

// ----- Chart Functions -----
function renderDailyChart(daily) {
  const labels = [];
  const data = [];

  const start = firstDayOfMonth();
  const end = lastDayOfMonth();
  const map = new Map(daily.map(d => [d.date, Number(d.total || 0)]));
  
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    const key = ymd(dt);
    labels.push(dt.getDate());
    data.push(map.get(key) || 0);
  }

  if (dailyChart) dailyChart.destroy();
  
  const ctx = dailyLineRef.value.getContext('2d');
  dailyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{ 
        label: "Sales (৳)", 
        data, 
        tension: 0.4,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#f97316',
          borderWidth: 1,
          callbacks: {
            label: (context) => `৳ ${context.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        x: { 
          grid: { display: false },
          ticks: { color: '#6b7280' }
        },
        y: { 
          beginAtZero: true,
          ticks: { 
            color: '#6b7280',
            callback: v => "৳ " + v.toLocaleString() 
          },
          grid: { color: '#f3f4f6' }
        }
      }
    }
  });
}

function renderCategoryChart(rows) {
  if (!categoryBarRef.value) return;
  
  const labels = rows.map(r => r.category || "—");
  const data = rows.map(r => Number(r.total || 0));

  if (categoryChart) categoryChart.destroy();
  
  const ctx = categoryBarRef.value.getContext('2d');
  categoryChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ 
        label: "Sales (৳)", 
        data,
        backgroundColor: [
          '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5',
          '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e'
        ],
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#f97316',
          borderWidth: 1,
          callbacks: {
            label: (context) => `৳ ${context.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        x: { 
          grid: { display: false },
          ticks: { color: '#6b7280' }
        },
        y: { 
          beginAtZero: true,
          ticks: { 
            color: '#6b7280',
            callback: v => "৳ " + v.toLocaleString() 
          },
          grid: { color: '#f3f4f6' }
        }
      }
    }
  });
}

// ----- Watch for Modal Changes -----
watch(showStockAlerts, (newVal) => {
  if (newVal) {
    loadStockAlerts();
  }
});

watch(showDueDetails, (newVal) => {
  if (newVal) {
    loadDueDetails();
  }
});

// ----- Initialize Dashboard -----
onMounted(() => {
  // Get shop name from localStorage or user profile
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  shopName.value = userProfile.shop?.shop_name || 'My Shop';
  
  loadDashboard();
  
  // Auto-refresh every 5 minutes
  setInterval(() => {
    if (!loading.value && !showStockAlerts.value && !showDueDetails.value) {
      loadDashboard();
    }
  }, 300000); // 5 minutes
});
</script>

<style>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

.transition-all {
  transition-property: all;
}

.duration-300 {
  transition-duration: 300ms;
}

.duration-1000 {
  transition-duration: 1000ms;
}

.ease-out {
  transition-timing-function: ease-out;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #fb923c;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #f97316;
}
</style>