<template>
  <div class="max-w-7xl mx-auto p-4 md:p-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Point of Sale</h2>
        <p class="text-gray-600 mt-1">Quick & easy sales processing</p>
      </div>
      <div class="flex items-center gap-3 mt-4 md:mt-0">
        <div class="bg-white border rounded-lg px-3 py-2">
          <label class="text-sm text-gray-600 mr-2">Paper:</label>
          <select v-model="paperSize" class="text-sm border-none focus:ring-0 focus:outline-none bg-transparent">
            <option value="58mm">58mm</option>
            <option value="80mm">80mm</option>
            <option value="A4">A4</option>
          </select>
        </div>
        <div class="bg-blue-50 px-4 py-2 rounded-lg">
          <span class="text-sm text-gray-600">Cart:</span>
          <span class="ml-2 font-semibold text-blue-700">{{ cart.length }} items</span>
        </div>
        <div class="bg-green-50 px-4 py-2 rounded-lg">
          <span class="text-sm text-gray-600">Total:</span>
          <span class="ml-2 font-bold text-green-700">৳{{ finalTotal.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 space-y-6">
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Search Products</h3>
          <div class="relative">
            <div class="flex gap-3">
              <div class="flex-1 relative">
                <input
                  v-model="barcodeInput"
                  @input="searchProducts"
                  @keyup.enter="addProductByCode"
                  :disabled="saleCompleted"
                  placeholder="Scan barcode or search product by code/name..."
                  class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
                />
                <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button
                @click="addProductByCode"
                :disabled="saleCompleted"
                class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>

            <div v-if="suggestions.length" class="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              <div v-for="item in suggestions" :key="getProductKey(item)" 
                   @click="selectSuggestion(item)"
                   class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <img v-if="item.image_url" :src="item.image_url" :alt="item.title" 
                         class="w-10 h-10 object-cover rounded-lg" />
                    <div v-else class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div class="font-medium text-gray-800">{{ getProductDisplayName(item) }}</div>
                      <div class="text-sm text-gray-500">{{ item.product_code || item.sku }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-blue-600">৳{{ getProductPrice(item) }}</div>
                    <div v-if="getProductStock(item) > 0" class="text-xs text-green-600">Stock: {{ getProductStock(item) }}</div>
                    <div v-else class="text-xs text-red-600">Out of stock</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Cart Items</h3>
            <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {{ cart.length }} items
            </span>
          </div>

          <div v-if="cart.length === 0 && !saleCompleted" class="text-center py-8">
            <div class="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 class="text-lg font-medium text-gray-600 mb-2">Cart is empty</h4>
            <p class="text-sm text-gray-500">Add products to start a sale</p>
          </div>

          <div v-if="cart.length > 0" class="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            <div v-for="(item, index) in cart" :key="index" 
                 class="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
              <div class="flex-shrink-0">
                <img v-if="item.image_url" :src="item.image_url" :alt="item.title" 
                     class="w-12 h-12 object-cover rounded-lg" />
                <div v-else class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <div class="flex justify-between">
                  <div>
                    <h5 class="font-medium text-gray-800 truncate">{{ item.title }}</h5>
                    <div v-if="item.variant_name" class="text-sm text-blue-600 font-medium">{{ item.variant_name }}</div>
                    <div class="flex items-center gap-2 flex-wrap mt-0.5">
                      <div v-if="item.base_unit" class="text-xs text-gray-500">
                        Base: {{ item.base_unit }} | Price: ৳{{ item.base_price.toFixed(2) }}/{{ item.base_unit }}
                      </div>
                      <div v-if="item.vat_applicable && item.vat_percent > 0" class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        VAT {{ item.vat_percent }}%
                      </div>
                    </div>
                  </div>
                  <button
                    @click="removeItem(index)"
                    :disabled="saleCompleted"
                    class="text-red-400 hover:text-red-600 transition"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div class="flex items-center justify-between mt-2 gap-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <button
                      @click="decreaseQuantity(index)"
                      :disabled="saleCompleted"
                      class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      v-model.number="item.quantity"
                      :min="isWeightUnit(item.base_unit) ? '0.001' : '1'"
                      :step="isWeightUnit(item.base_unit) ? '0.001' : '1'"
                      :disabled="saleCompleted"
                      class="w-20 text-center border border-gray-300 rounded-lg py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      @input="recalculateItemPrice(index)"
                    />
                    
                    <select
                      v-if="isWeightUnit(item.base_unit)"
                      v-model="item.display_unit"
                      @change="onUnitChange(index)"
                      :disabled="saleCompleted"
                      class="border border-gray-300 rounded-lg py-1 px-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option v-for="unit in getAvailableUnits(item.base_unit)" :key="unit" :value="unit">
                        {{ unit }}
                      </option>
                    </select>
                    <span v-else class="text-sm text-gray-600 font-medium">{{ item.base_unit }}</span>
                    
                    <button
                      @click="item.quantity++; recalculateItemPrice(index)"
                      :disabled="saleCompleted"
                      class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-blue-700">৳{{ getItemTotal(item).toFixed(2) }}</div>
                    <div class="text-sm text-gray-500">৳{{ getItemUnitPrice(item).toFixed(2) }}/{{ item.display_unit || item.base_unit }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="cart.length > 0" class="bg-white rounded-2xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Cart Summary</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-medium text-gray-800">৳{{ subtotal.toFixed(2) }}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Discount (৳)</span>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  v-model.number="discount"
                  :disabled="saleCompleted"
                  min="0"
                  :max="subtotal"
                  class="w-24 px-3 py-1 border border-gray-300 rounded-lg text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  @input="recalculateTotals"
                />
                <span class="text-sm text-gray-500">BDT</span>
              </div>
            </div>
            
<div v-if="!isGuest && customer.points > 0" class="border-t border-gray-100 pt-3">
  <div class="flex justify-between items-center mb-2">
    <span class="text-gray-600">Redeem Points</span>
    <div class="flex items-center gap-2">
      <input
        type="number"
        v-model.number="redeemPoints"
        :disabled="saleCompleted"
        :max="Math.min(customer.points, totalBeforePoints)"
        min="0"
        step="1"
        class="w-20 px-3 py-1 border border-gray-300 rounded-lg text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        @click="applyMaxPoints"
        :disabled="saleCompleted"
        class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
      >
        Max
      </button>
    </div>
  </div>
  <div class="text-xs text-gray-500">
    <div class="flex justify-between">
      <span>Available: {{ customer.points }} points</span>
      <span>Discount: ৳{{ pointsValue.toFixed(2) }}</span>
    </div>
    <div class="text-right">1 point = ৳1 discount</div>
  </div>
</div>
            <div v-if="pointsValue > 0" class="flex justify-between items-center">
              <span class="text-gray-600">Points Discount</span>
              <span class="font-medium text-red-600">-৳{{ pointsValue.toFixed(2) }}</span>
            </div>
            
            <div class="flex items-center justify-between border-t border-gray-100 pt-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="vatApplicableAtCheckout" 
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  :disabled="saleCompleted"
                />
                <span class="text-gray-700 font-medium">Apply VAT</span>
              </label>
              <div v-if="vatApplicableAtCheckout && vatAmount > 0" class="text-sm font-medium text-purple-700">
                +৳{{ vatAmount.toFixed(2) }}
              </div>
            </div>
            
            <div class="pt-3 border-t border-gray-100">
              <div class="flex justify-between items-center text-lg font-bold">
                <span class="text-gray-800">Total Amount</span>
                <span class="text-blue-700">৳{{ finalTotal.toFixed(2) }}</span>
              </div>
              <div v-if="pointsEarned > 0" class="text-sm text-green-600 text-right mt-1">
                +{{ pointsEarned }} points will be earned
              </div>
              <div v-if="redeemPoints > 0" class="text-sm text-blue-600 text-right mt-1">
                {{ redeemPoints }} points redeemed
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                @click="paymentMethod = method.value"
                :class="[
                  'py-3 px-4 rounded-xl border transition-all',
                  paymentMethod === method.value 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                ]"
                :disabled="saleCompleted"
              >
                <div class="flex flex-col items-center">
                  <div class="text-2xl mb-1">{{ method.icon }}</div>
                  <span class="text-sm font-medium">{{ method.label }}</span>
                </div>
              </button>
            </div>
          </div>

          <div v-if="paymentMethod === 'cash'" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Received Amount</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
              <input
                type="number"
                v-model.number="receivedAmount"
                :disabled="saleCompleted"
                min="0"
                step="0.01"
                placeholder="Enter received amount"
                @input="calculateExchange"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
              />
            </div>
            
            <div v-if="receivedAmount > 0 && receivedAmount >= finalTotal" class="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
              <div class="flex justify-between items-center">
                <span class="text-green-700">Exchange:</span>
                <span class="font-bold text-green-800">৳{{ exchangeAmount.toFixed(2) }}</span>
              </div>
            </div>
            <div v-if="receivedAmount > 0 && receivedAmount < finalTotal" class="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
              <div class="flex justify-between items-center">
                <span class="text-red-700">Due:</span>
                <span class="font-bold text-red-800">৳{{ (finalTotal - receivedAmount).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div v-if="paymentMethod !== 'cash' && paymentMethod !== 'due'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Transaction ID</label>
              <input
                v-model="transactionId"
                :disabled="saleCompleted"
                placeholder="Enter transaction ID"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
              />
            </div>

            <div v-if="paymentMethod === 'due'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Paid Now (Optional)</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
                  <input
                    type="number"
                    v-model.number="paidAmount"
                    :disabled="saleCompleted"
                    :max="finalTotal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
                    @input="calculateDueAmount"
                  />
                </div>
              </div>

              <div v-if="dueAmount > 0" class="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="bg-yellow-100 p-2 rounded-lg">
                      <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-semibold text-yellow-800">Due Amount</h4>
                      <p class="text-sm text-yellow-600">Will be added to customer's account</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold text-yellow-800">৳{{ dueAmount.toFixed(2) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!saleCompleted" class="bg-white rounded-2xl shadow-lg p-6">
  <div class="grid grid-cols-2 gap-3 mb-3">
    <button
      @click="clearCart"
      :disabled="saleCompleted"
      class="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      Clear Cart
    </button>
    <button
      @click="printInvoice"
      :disabled="cart.length === 0 || saleCompleted"
      class="py-3 px-4 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      Print Invoice
    </button>
  </div>
  
  <button
    @click="checkout"
    :disabled="cart.length === 0 || saleCompleted || (paymentMethod === 'due' && isGuest)"
    class="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
  >
    Complete Sale
    <span class="ml-2">৳{{ finalTotal.toFixed(2) }}</span>
  </button>
</div>

<div v-if="saleCompleted" class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
  <div class="flex flex-col items-center text-center">
    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
      <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h3 class="text-xl font-bold text-green-800 mb-2">Sale Completed Successfully!</h3>
    <p class="text-green-600 mb-4">Invoice #{{ lastSaleId }} | Total: ৳{{ lastSaleTotal }}</p>
    
    <div class="grid grid-cols-1 gap-3 w-full mb-4">
      <button
        @click="printInvoice"
        class="py-3 px-4 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition font-medium flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Invoice
      </button>
    </div>
    
    <div class="grid grid-cols-2 gap-3 w-full mb-6">
      <div class="bg-white p-3 rounded-lg">
        <div class="text-sm text-gray-500">Payment</div>
        <div class="font-medium">{{ getPaymentMethodName(paymentMethod).toUpperCase() }}</div>
      </div>
      <div class="bg-white p-3 rounded-lg">
        <div class="text-sm text-gray-500">Points Earned</div>
        <div class="font-medium text-green-600">+{{ pointsEarned }}</div>
      </div>
    </div>
    
    <button
      @click="startNewSale"
      class="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-medium"
    >
      Start New Sale
    </button>
  </div>
</div>
</div>

      <div class="lg:col-span-4 space-y-6">
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Customer Information</h3>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-600">Mode:</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="isGuest" class="sr-only peer" :disabled="saleCompleted">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                  after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full 
                  after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span class="ml-3 text-sm font-medium text-gray-900">
                  {{ isGuest ? 'Guest' : 'Registered' }}
                </span>
              </label>
            </div>
          </div>

          <div :class="{ 'opacity-50': isGuest }">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Customer Name <span v-if="!isGuest" class="text-red-500">*</span>
              </label>
              <input
                v-model="customer.name"
                :disabled="saleCompleted || isGuest"
                placeholder="Enter customer name"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
              />
            </div>

            <div class="mb-4 relative">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span v-if="!isGuest" class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="customer.phone"
                  @input="searchCustomers"
                  @focus="searchCustomers"
                  :disabled="saleCompleted || isGuest"
                  placeholder="01XXXXXXXXX"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
                />
                <button
                  @click="fetchCustomerByPhone"
                  :disabled="saleCompleted || isGuest"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              <div v-if="!isGuest && customerSuggestions.length > 0 && customer.phone" 
                   class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                <div v-for="cust in customerSuggestions" :key="cust.id" 
                     @click="selectCustomer(cust)"
                     class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-medium text-gray-800">{{ cust.name }}</div>
                      <div class="text-sm text-gray-600">{{ cust.phone }}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        ⭐ {{ cust.points }} pts
                      </span>
                      <span v-if="cust.total_due > 0" class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Due: ৳{{ cust.total_due?.toFixed(2) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!isGuest && (customer.points > 0 || customer.total_due > 0)" class="mt-6 space-y-3">
            <div v-if="customer.points > 0" class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="bg-green-100 p-2 rounded-lg">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-green-800">Loyalty Points</h4>
                    <p class="text-sm text-green-600">Available: <span class="font-bold">{{ customer.points }} points</span></p>
                  </div>
                </div>
                <button
                  v-if="totalBeforePoints > 0 && !saleCompleted"
                  @click="applyMaxPoints"
                  class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  Use Max Points
                </button>
              </div>
            </div>

            <div v-if="customer.total_due > 0" class="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="bg-yellow-100 p-2 rounded-lg">
                    <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-yellow-800">Outstanding Balance</h4>
                    <p class="text-sm text-yellow-600">Total Due: <span class="font-bold">৳{{ customer.total_due?.toFixed(2) }}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isGuest" class="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="bg-blue-100 p-2 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-blue-800">Guest Sale</h4>
                <p class="text-sm text-blue-600">Customer information is optional</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!saleCompleted" class="bg-white rounded-2xl shadow-lg p-6">
          <h4 class="text-lg font-semibold text-gray-700 mb-4">Quick Add Products</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3">
            <div v-for="p in allProducts.slice(0, 8)" :key="p.id"
                 @click="addToCart(p)"
                 class="border border-gray-200 rounded-xl p-3 hover:shadow-md hover:border-blue-300 cursor-pointer transition group">
              <div class="relative mb-2">
                <img v-if="p.image_url" :src="p.image_url" :alt="p.title"
                     class="w-full h-20 object-cover rounded-lg" />
                <div v-else class="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  + Add
                </div>
              </div>
              <h5 class="font-medium text-sm text-gray-800 truncate">{{ p.title }}</h5>
              <p class="text-xs text-gray-500 truncate">{{ p.product_code }}</p>
              <div class="flex justify-between items-center mt-2">
                <span class="font-bold text-blue-700">৳{{ p.selling_price || p.regular_price }}</span>
                <span v-if="p.stock > 0" class="text-xs text-green-600">{{ p.stock }}</span>
                <span v-else class="text-xs text-red-600">Out</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="print-area" class="hidden">
      <div class="invoice-container">
        <div class="shop-header text-center mb-4">
          <div v-if="shop_logo" class="logo-container mb-2">
            <img :src="shop_logo" alt="Shop Logo" class="shop-logo" />
          </div>
          <h1 class="text-xl font-bold">{{ shop_name }}</h1>
          <p class="text-sm">{{ location || 'No Address' }}</p>
          <p class="text-sm">Phone: {{ phone }} | {{ email_or_link || 'No Website/Link' }}</p>
        </div>

        <div class="invoice-details border-t border-b py-2 my-2 text-sm">
          <div class="flex justify-between">
            <span>Invoice #:</span>
            <span class="font-medium">{{ lastSaleId || 'DRAFT' }}</span>
          </div>
          <div class="flex justify-between">
            <span>Date:</span>
            <span>{{ new Date().toLocaleString('en-BD') }}</span>
          </div>
          <div class="flex justify-between">
            <span>Customer:</span>
            <span>{{ isGuest ? 'Guest' : (customer.name || 'N/A') }}</span>
          </div>
          <div class="flex justify-between">
            <span>Phone:</span>
            <span>{{ isGuest ? 'N/A' : (customer.phone || 'N/A') }}</span>
          </div>
        </div>

        <table class="items-table w-full my-4 text-sm">
          <thead>
            <tr class="border-b border-t">
              <th class="text-left py-1">SL.</th>
              <th class="text-left py-1">Description (Product, Qty, Unit)</th>
              <th class="text-right py-1">Rate</th>
              <th class="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in cart" :key="index" class="border-b">
              <td class="py-1">{{ index + 1 }}</td>
              <td class="py-1">{{ item.title }} <span class="text-xs text-gray-600">({{ item.quantity }} {{ item.display_unit || item.base_unit }})</span></td>
              <td class="text-right py-1">৳{{ getItemUnitPrice(item).toFixed(2) }}/{{ item.display_unit || item.base_unit }}</td>
              <td class="text-right py-1">৳{{ getItemTotal(item).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals-section text-sm space-y-1">
          <div class="flex justify-between">
            <span>Total:</span>
            <span>৳{{ subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="discount > 0" class="flex justify-between">
            <span>Discount:</span>
            <span class="text-red-600">-৳{{ discount.toFixed(2) }}</span>
          </div>
          <div v-if="redeemPoints > 0" class="flex justify-between">
            <span>Redeemed Points:</span>
            <span class="text-red-600">-{{ redeemPoints }} pts (-৳{{ pointsValue.toFixed(2) }})</span>
          </div>
          <div v-if="vatApplicableAtCheckout && vatAmount > 0" class="flex justify-between">
            <span>VAT:</span>
            <span>+৳{{ vatAmount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between font-bold border-t pt-2 mt-2">
            <span>Subtotal:</span>
            <span>৳{{ finalTotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between border-t pt-2 mt-2">
            <span>Paid:</span>
            <span>৳{{ 
              paymentMethod === 'due' ? paidAmount.toFixed(2) : 
              paymentMethod === 'cash' ? receivedAmount.toFixed(2) : 
              finalTotal.toFixed(2) 
            }}</span>
          </div>
          <div v-if="paymentMethod === 'cash' && exchangeAmount > 0" class="flex justify-between">
            <span>Exchange:</span>
            <span>৳{{ exchangeAmount.toFixed(2) }}</span>
          </div>
          <div v-if="paymentMethod === 'due' && dueAmount > 0" class="flex justify-between">
            <span>Due Amount:</span>
            <span class="text-red-600">৳{{ dueAmount.toFixed(2) }}</span>
          </div>
          <div v-if="!isGuest" class="flex justify-between border-t pt-2 mt-2">
            <span>Points Earned:</span>
            <span class="text-green-600">+{{ pointsEarned }} pts</span>
          </div>
          <div v-if="!isGuest" class="flex justify-between">
            <span>Total Points:</span>
            <span class="font-bold">{{ (customer.points + pointsEarned - redeemPoints) }} pts</span>
          </div>
          <div class="flex justify-between">
            <span>Payment Method:</span>
            <span class="font-medium">{{ getPaymentMethodName(paymentMethod) }}</span>
          </div>
          <div v-if="transactionId" class="flex justify-between">
            <span>Transaction ID:</span>
            <span class="font-mono text-xs">{{ transactionId }}</span>
          </div>
        </div>

        <div class="footer text-center mt-6 pt-4 border-t">
          <p class="font-medium">Thank you for shopping!</p>
          <p class="text-xs text-gray-600">Please visit again</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "../axios";

// Refs
const isGuest = ref(true);
const customer = ref({ name: "", phone: "", points: 0, total_due: 0 });
const cart = ref([]);
const barcodeInput = ref("");
const discount = ref(0);
const redeemPoints = ref(0);
const dueAmount = ref(0);
const receivedAmount = ref(0);
const exchangeAmount = ref(0);
const paidAmount = ref(0);
const suggestions = ref([]);
const customerSuggestions = ref([]);
const allProducts = ref([]);
const loading = ref(false);
const paperSize = ref("58mm");
const saleCompleted = ref(false);
const lastSaleId = ref(null);
const lastSaleTotal = ref("0.00");
const paymentMethod = ref("cash");
const transactionId = ref("");
const vatApplicableAtCheckout = ref(false);

// Shop Info
const shop_logo = ref("");
const shop_name = ref("");
const location = ref("");
const phone = ref("");
const email_or_link = ref("");

// Payment methods with icons
const paymentMethods = [
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "bkash", label: "bKash", icon: "📱" },
  { value: "nagad", label: "Nagad", icon: "📱" },
  { value: "card", label: "Card", icon: "💳" },
  { value: "due", label: "Due", icon: "📝" },
];

// Computed properties
const subtotal = computed(() => 
  cart.value.reduce((sum, item) => sum + getItemTotal(item), 0)
);

const totalBeforePoints = computed(() => 
  Math.max(0, subtotal.value - (Number(discount.value) || 0))
);

// VAT amount computed per item after applying proportional discount
const vatAmount = computed(() => {
  if (!vatApplicableAtCheckout.value) {
    console.log("VAT not applied - checkbox not checked");
    return 0;
  }
  const sub = subtotal.value || 0;
  const disc = Number(discount.value || 0);
  
  console.log("Calculating VAT - Cart items:", cart.value.map(i => ({
    title: i.title,
    vat_applicable: i.vat_applicable,
    vat_percent: i.vat_percent,
    itemTotal: getItemTotal(i)
  })));
  
  const totalVat = cart.value.reduce((sum, item) => {
    const itemBase = getItemTotal(item); // base line total
    let itemAfterDiscount = itemBase;
    if (sub > 0 && disc > 0) {
      itemAfterDiscount = itemBase - (itemBase / sub) * disc;
    }
    const vat = (item.vat_applicable && item.vat_percent) ? (itemAfterDiscount * (Number(item.vat_percent) / 100)) : 0;
    console.log(`Item: ${item.title}, VAT: ${vat}, vat_applicable: ${item.vat_applicable}, vat_percent: ${item.vat_percent}`);
    return sum + vat;
  }, 0);
  
  console.log("Total VAT Amount:", totalVat);
  return totalVat;
});

const finalTotal = computed(() => 
  Math.max(0, totalBeforePoints.value + (vatApplicableAtCheckout.value ? vatAmount.value : 0) - pointsValue.value)
);

// Points value: 1 point = 1 Tk discount - FIXED: Now properly defined as computed
const pointsValue = computed(() => {
  if (isGuest.value || !customer.value.points) return 0;
  
  // Calculate how many points can be used (max points = customer points)
  const maxPointsToUse = Math.min(customer.value.points, totalBeforePoints.value);
  
  // Use redeemed points, but not more than max
  const pointsToUse = Math.min(redeemPoints.value, maxPointsToUse);
  
  // 1 point = 1 Tk
  return pointsToUse; // This is the discount value in Taka
});
const pointsEarned = computed(() => 
  Math.floor(finalTotal.value / 100) // Earn 1 point for every 100 Tk spent
);

// Watch for changes
watch(isGuest, (val) => {
  customerSuggestions.value = [];
  redeemPoints.value = 0;
  paidAmount.value = 0;
  dueAmount.value = 0;
  receivedAmount.value = 0;
  exchangeAmount.value = 0;
  
  if (val) {
    customer.value = { name: "", phone: "", points: 0, total_due: 0 };
  }
});

watch([paidAmount, finalTotal], () => {
  calculateDueAmount();
});

watch(paymentMethod, (newVal) => {
  if (newVal !== 'due') {
    paidAmount.value = 0;
    dueAmount.value = 0;
  } else {
    calculateDueAmount();
  }
  
  if (newVal !== 'cash') {
    receivedAmount.value = 0;
    exchangeAmount.value = 0;
  }
});

watch([redeemPoints, discount, subtotal], () => {
});

// Functions
function calculateDueAmount() {
  dueAmount.value = Math.max(0, finalTotal.value - (Number(paidAmount.value) || 0));
}

function calculateExchange() {
  exchangeAmount.value = Math.max(0, (Number(receivedAmount.value) || 0) - finalTotal.value);
}

function applyMaxPoints() {
  if (isGuest.value || !customer.value.points) {
    redeemPoints.value = 0;
    return;
  }
  
  // Maximum points that can be used = min(customer points, total before points)
  const maxPoints = Math.min(customer.value.points, totalBeforePoints.value);
  redeemPoints.value = maxPoints;
}

function recalculateTotals() {
  // Compute subtotal locally for debug/logging without writing to computed ref
  const localSubtotal = cart.value.reduce((sum, item) => sum + getItemTotal(item), 0);

  // pointsValue is computed, so it auto-updates
  if (paymentMethod.value === 'due') {
    calculateDueAmount();
  }
  if (paymentMethod.value === 'cash') {
    calculateExchange();
  }
}

function getPaymentMethodName(method) {
  const methods = {
    'cash': 'Cash',
    'bkash': 'bKash',
    'nagad': 'Nagad',
    'card': 'Card',
    'due': 'Due Payment'
  };
  return methods[method] || method;
}

async function searchCustomers() {
  if (isGuest.value) return;

  const phone = (customer.value.phone || "").trim();
  if (!phone || phone.length < 3) {
    customerSuggestions.value = [];
    return;
  }

  try {
    const res = await axios.get(`/customers/?search=${encodeURIComponent(phone)}`);
    customerSuggestions.value = res.data.results || res.data || [];
  } catch (err) {
    console.error("Customer search error:", err);
    customerSuggestions.value = [];
  }
}

function selectCustomer(cust) {
  customer.value = {
    name: cust.name,
    phone: cust.phone,
    points: cust.points || 0,
    total_due: cust.total_due || 0
  };
  customerSuggestions.value = [];
}

async function fetchCustomerByPhone() {
  if (isGuest.value) return;

  const phone = (customer.value.phone || "").trim();
  if (!phone) {
    customer.value.name = "";
    customer.value.points = 0;
    customer.value.total_due = 0;
    return;
  }

  try {
    const res = await axios.get(`/customer-lookup/?phone=${encodeURIComponent(phone)}`);
    if (res.data && !res.data.error && !res.data.message) {
      customer.value.name = res.data.name;
      customer.value.points = res.data.points || 0;
      // Fetch due amount for customer
      const ledgerRes = await axios.get(`/customer-ledger/${res.data.id}/`);
      if (ledgerRes.data.totals) {
        customer.value.total_due = ledgerRes.data.totals.total_due || 0;
      }
    }
  } catch (err) {
    if (err.response?.status !== 404) {
      console.error("Customer lookup error:", err);
    }
  }
}

// Helper functions for product variants
function getProductKey(product) {
  if (product.variant_id) {
    return `variant-${product.variant_id}`;
  }
  return `product-${product.id}`;
}

function getProductDisplayName(product) {
  if (product.variant_name) {
    return `${product.title} - ${product.variant_name}`;
  }
  return product.title;
}

function getProductPrice(product) {
  return parseFloat(product.selling_price || product.regular_price || 0);
}

function getProductStock(product) {
  return product.stock || 0;
}

async function fetchAllProducts() {
  loading.value = true;
  try {
    const res = await axios.get("/products/");
    allProducts.value = res.data.results || res.data || [];
    
    // Also fetch product variants
    try {
      const variantsRes = await axios.get("/product-variants/");
      const variants = variantsRes.data || [];
      
      // Add variants as separate searchable items
      variants.forEach(variant => {
        const product = allProducts.value.find(p => p.id === variant.product);
        if (product) {
          allProducts.value.push({
            ...variant,
            variant_id: variant.id,
            id: variant.product,
            title: product.title,
            product_code: variant.sku || variant.barcode || product.product_code,
            variant_name: variant.variant_name,
            selling_price: variant.selling_price || product.selling_price,
            regular_price: variant.selling_price || product.regular_price,
            stock: variant.stock,
            image_url: product.image_url,
            base_unit: product.base_unit || 'pcs',
            vat_applicable: product.vat_applicable || false,
            vat_percent: product.vat_percent || 0,
            isVariant: true
          });
        }
      });
    } catch (variantErr) {
      console.log("No variants found or error fetching variants:", variantErr);
    }
  } catch (err) {
    console.error("Error fetching products:", err);
    alert("Failed to load products. Check if backend is running.");
  } finally {
    loading.value = false;
  }
}

async function searchProducts() {
  if (!barcodeInput.value.trim()) {
    suggestions.value = [];
    return;
  }
  try {
    const res = await axios.get(`/products/?search=${encodeURIComponent(barcodeInput.value)}`);
    const products = res.data.results || res.data || [];
    
    // Also search in variants
    const variantsRes = await axios.get(`/product-variants/?search=${encodeURIComponent(barcodeInput.value)}`);
    const variants = variantsRes.data || [];
    
    // Combine products and variants
    suggestions.value = [...products];
    
    // Add variants with proper structure
    for (const variant of variants) {
      const product = products.find(p => p.id === variant.product);
      if (product) {
        suggestions.value.push({
          ...variant,
          variant_id: variant.id,
          id: variant.product,
          title: product.title,
          product_code: variant.sku || variant.barcode || product.product_code,
          variant_name: variant.variant_name,
          selling_price: variant.selling_price || product.selling_price,
          regular_price: variant.selling_price || product.regular_price,
          stock: variant.stock,
          image_url: product.image_url,
          base_unit: product.base_unit || 'pcs',
          vat_applicable: product.vat_applicable || false,
          vat_percent: product.vat_percent || 0,
          isVariant: true
        });
      }
    }
  } catch (err) {
    console.error("Search error:", err);
    suggestions.value = [];
  }
}

function selectSuggestion(item) {
  addToCart(item);
  barcodeInput.value = "";
  suggestions.value = [];
}

async function addProductByCode() {
  if (!barcodeInput.value.trim()) return;

  try {
    // Try to find in product lookup first
    const res = await axios.get(`/product-lookup/?code=${encodeURIComponent(barcodeInput.value)}`);
    if (res.data && !res.data.error) {
      addToCart(res.data);
      barcodeInput.value = "";
      suggestions.value = [];
      return;
    }
  } catch (err) {
    // If not found in products, try variants
    try {
      const variantsRes = await axios.get(`/product-variants/?search=${encodeURIComponent(barcodeInput.value)}`);
      const variants = variantsRes.data || [];
      
      if (variants.length > 0) {
        const variant = variants[0];
        // Fetch the parent product
        const productRes = await axios.get(`/products/${variant.product}/`);
        const product = productRes.data;
        
        addToCart({
          ...variant,
          variant_id: variant.id,
          id: variant.product,
          title: product.title,
          product_code: variant.sku || variant.barcode || product.product_code,
          variant_name: variant.variant_name,
          selling_price: variant.selling_price || product.selling_price,
          regular_price: variant.selling_price || product.regular_price,
          stock: variant.stock,
          image_url: product.image_url,
          base_unit: product.base_unit || 'pcs',
          vat_applicable: product.vat_applicable || false,
          vat_percent: product.vat_percent || 0,
          isVariant: true
        });
        
        barcodeInput.value = "";
        suggestions.value = [];
        return;
      }
    } catch (variantErr) {
      console.error("Variant lookup error:", variantErr);
    }
    
    console.error("Error fetching product:", err);
    alert("Product not found!");
  }
}

function addToCart(product) {
  console.log("Adding to cart - Product data:", {
    id: product.id,
    title: product.title,
    vat_applicable: product.vat_applicable,
    vat_percent: product.vat_percent
  });
  
  const cartKey = getProductKey(product);
  const existing = cart.value.find((i) => getProductKey(i) === cartKey);
  if (existing) {
    existing.quantity++;
    recalculateItemPrice(cart.value.indexOf(existing));
  } else {
    const baseUnit = product.base_unit || 'pcs';
    const basePrice = parseFloat(getProductPrice(product));
    
    const cartItem = {
      id: product.id,
      variant_id: product.variant_id || null,
      title: product.isVariant ? product.title : product.title,
      variant_name: product.variant_name || null,
      base_unit: baseUnit,
      display_unit: baseUnit,
      base_price: basePrice,
      price: basePrice,
      quantity: 1,
      vat_applicable: !!product.vat_applicable,
      vat_percent: Number(product.vat_percent || 0),
      image_url: product.image_url || null,
    };
    
    console.log("Cart item created:", cartItem);
    cart.value.push(cartItem);
  }
  recalculateTotals();
}

function removeItem(index) {
  cart.value.splice(index, 1);
  recalculateTotals();
}

function clearCart() {
  cart.value = [];
  discount.value = 0;
  redeemPoints.value = 0;
  // pointsValue is computed, so don't reset it here
  suggestions.value = [];
  saleCompleted.value = false;
  paymentMethod.value = "cash";
  paidAmount.value = 0;
  receivedAmount.value = 0;
  exchangeAmount.value = 0;
  transactionId.value = "";
  lastSaleId.value = null;
  lastSaleTotal.value = "0.00";
}

// Unit conversion helper functions
function isWeightUnit(unit) {
  return ['kg', 'g', 'ltr', 'ml'].includes(unit);
}

function getAvailableUnits(baseUnit) {
  const unitGroups = {
    'kg': ['kg', 'g'],
    'g': ['kg', 'g'],
    'ltr': ['ltr', 'ml'],
    'ml': ['ltr', 'ml']
  };
  return unitGroups[baseUnit] || [baseUnit];
}

function getConversionFactor(fromUnit, toUnit) {
  const conversions = {
    'kg_to_g': 1000,
    'g_to_kg': 0.001,
    'ltr_to_ml': 1000,
    'ml_to_ltr': 0.001
  };
  
  if (fromUnit === toUnit) return 1;
  
  const key = `${fromUnit}_to_${toUnit}`;
  return conversions[key] || 1;
}

function convertToBaseUnit(quantity, displayUnit, baseUnit) {
  if (displayUnit === baseUnit) return quantity;
  const factor = getConversionFactor(displayUnit, baseUnit);
  return quantity * factor;
}

function onUnitChange(index) {
  const item = cart.value[index];
  recalculateItemPrice(index);
}

function recalculateItemPrice(index) {
  const item = cart.value[index];
  if (!item.base_unit || !item.display_unit) return;
  
  // Just trigger recalculation of totals
  recalculateTotals();
}

function getItemUnitPrice(item) {
  if (!item.base_unit || item.base_unit === 'pcs') {
    return item.base_price;
  }
  // Calculate price per display unit
  // Example: ৳75/kg, display in g -> ৳75/1000 = ৳0.075/g
  if (item.display_unit !== item.base_unit) {
    const factor = getConversionFactor(item.display_unit, item.base_unit);
    // factor is how to convert display to base (g to kg = 0.001)
    // We want price per display unit: base_price * factor
    return item.base_price * factor;
  }
  return item.base_price;
}

function getItemTotal(item) {
  if (!item.base_unit || item.base_unit === 'pcs') {
    const t = item.base_price * item.quantity;

    return t;
  }
  // Convert to base unit and calculate
  const displayUnit = item.display_unit || item.base_unit;
  const baseQuantity = convertToBaseUnit(item.quantity, displayUnit, item.base_unit);
  const total = item.base_price * baseQuantity;

  return total;
}

function decreaseQuantity(index) {
  const item = cart.value[index];
  const minQty = isWeightUnit(item.base_unit) ? 0.001 : 1;
  
  if (item.quantity > minQty) {
    if (isWeightUnit(item.base_unit)) {
      item.quantity = Math.max(minQty, item.quantity - 0.1);
    } else {
      item.quantity--;
    }
    recalculateItemPrice(index);
  } else {
    removeItem(index);
  }
}

function printInvoice() {
  if (cart.value.length === 0) {
    alert("Cart is empty! Add products to print invoice.");
    return;
  }

  const printArea = document.getElementById("print-area");
  if (!printArea) {
    alert("Print area not found!");
    return;
  }

  const win = window.open("", "_blank", "width=600,height=800");
  if (!win) {
    alert("Popup blocked! Please allow popups for printing.");
    return;
  }

  // CSS for different paper sizes
  const paperStyles = {
    '58mm': `
      @page { size: 58mm auto; margin: 2mm; }
      body { width: 58mm; font-size: 10px; margin: 0; padding: 0; }
      .shop-logo { max-width: 40px; max-height: 40px; margin: 0 auto; }
      .invoice-container { padding: 2mm; }
    `,
    '80mm': `
      @page { size: 80mm auto; margin: 3mm; }
      body { width: 80mm; font-size: 12px; margin: 0; padding: 0; }
      .shop-logo { max-width: 50px; max-height: 50px; margin: 0 auto; }
      .invoice-container { padding: 3mm; }
    `,
    'A4': `
      @page { size: A4; margin: 15mm; }
      body { width: 210mm; font-size: 14px; margin: 0; padding: 0; }
      .shop-logo { max-width: 80px; max-height: 80px; margin: 0 auto; }
      .invoice-container { padding: 5mm; }
    `
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice #${lastSaleId.value || 'DRAFT'}</title>
  <style>
    body { 
      font-family: 'Courier New', monospace, sans-serif; 
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    ${paperStyles[paperSize.value]}
    
    .shop-header { 
      text-align: center; 
      margin-bottom: 10px; 
      padding-bottom: 5px;
      border-bottom: 1px dashed #000;
    }
    
    .logo-container { 
      margin-bottom: 5px; 
    }
    
    .shop-logo { 
      object-fit: contain; 
    }
    
    .invoice-details { 
      padding: 5px 0; 
      border-top: 1px dashed #000; 
      border-bottom: 1px dashed #000; 
    }
    
    .items-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 10px 0; 
    }
    
    .items-table th, 
    .items-table td { 
      padding: 3px 0; 
      border-bottom: 1px dashed #ccc; 
    }
    
    .items-table th { 
      border-top: 1px solid #000; 
      border-bottom: 1px solid #000; 
      font-weight: bold; 
    }
    
    .totals-section { 
      margin-top: 10px; 
    }
    
    .footer { 
      margin-top: 15px; 
      padding-top: 10px; 
      border-top: 1px dashed #000;
    }
    
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    
    @media print {
      body { 
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  </style>
</head>
<body>
  ${printArea.innerHTML}
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();

  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 300);
}

function startNewSale() {
  clearCart();
  customer.value = { name: "", phone: "", points: 0, total_due: 0 };
  isGuest.value = true;
}

async function checkout() {
  if (!cart.value.length) {
    alert("Cart is empty!");
    return;
  }

  // Validation
  if (paymentMethod.value === 'due') {
    if (isGuest.value) {
      alert("Due payment is only available for registered customers. Please select a customer or use another payment method.");
      return;
    }
    
    if (!customer.value.phone || !customer.value.name) {
      alert("Customer phone and name are required for due payments.");
      return;
    }

    if (dueAmount.value <= 0) {
      alert("Due amount must be greater than 0 for due payments.");
      return;
    }
  }

  // Validate cash payment
  if (paymentMethod.value === 'cash') {
    if (receivedAmount.value < finalTotal.value) {
      alert(`Received amount (৳${receivedAmount.value.toFixed(2)}) is less than total amount (৳${finalTotal.value.toFixed(2)}). Please collect the full amount or change payment method.`);
      return;
    }
  }

  // Validate quantities
  for (const item of cart.value) {
    if (item.quantity < 1) {
      alert("Please set valid quantities for all products!");
      return;
    }
  }

  try {
    const payload = {
      customer_data: isGuest.value
        ? null
        : {
            name: customer.value.name?.trim() || "",
            phone: customer.value.phone?.trim() || "",
          },
      subtotal: parseFloat(subtotal.value),
      discount: parseFloat(discount.value || 0),
      redeemed_points: parseInt(redeemPoints.value || 0),
      vat_applicable: !!vatApplicableAtCheckout.value,
      vat_amount: parseFloat(vatAmount.value || 0),
      total: parseFloat(finalTotal.value),
      payment: {
        method: paymentMethod.value,
        paid_amount: Number(paidAmount.value || 0),
        trx_id: transactionId.value || null,
        received_amount: paymentMethod.value === 'cash' ? Number(receivedAmount.value || 0) : null,
        exchange_amount: paymentMethod.value === 'cash' ? Number(exchangeAmount.value || 0) : null,
      },
      items: cart.value.map((item) => ({
        product: parseInt(item.id),
        product_variant: item.variant_id ? parseInt(item.variant_id) : null,
        quantity: parseFloat(item.quantity),
        unit: item.display_unit || item.base_unit,
        price: parseFloat(getItemUnitPrice(item)),
        total: parseFloat(getItemTotal(item)),
        vat_applicable: !!item.vat_applicable,
        vat_percent: Number(item.vat_percent || 0),
        vat_amount: (vatApplicableAtCheckout.value && item.vat_applicable) ? parseFloat(((() => {
          const sub = subtotal.value || 0;
          const disc = Number(discount.value || 0);
          const itemBase = getItemTotal(item);
          const itemAfterDiscount = (sub>0 && disc>0) ? (itemBase - (itemBase/sub)*disc) : itemBase;
          return itemAfterDiscount * (Number(item.vat_percent || 0)/100);
        })()).toFixed(2)) : 0,
      })),

    };

    console.log("Checkout Payload:", payload);

    const res = await axios.post("/sales/", payload);
    
    if (res.data.success) {
      const sale = res.data.data;
      
      saleCompleted.value = true;
      lastSaleId.value = sale.id;
      lastSaleTotal.value = finalTotal.value.toFixed(2);

      let message = `✅ Sale Completed!\nInvoice #${sale.id}\nTotal: ৳${finalTotal.value.toFixed(2)}\nPayment: ${paymentMethod.value.toUpperCase()}`;
      
      if (paymentMethod.value === 'due' && dueAmount.value > 0) {
        message += `\nPaid Now: ৳${paidAmount.value.toFixed(2)}\nDue: ৳${dueAmount.value.toFixed(2)}`;
        message += `\n\nDue amount added to ${customer.value.name}'s account`;
      }
      
      if (paymentMethod.value === 'cash') {
        message += `\nReceived: ৳${receivedAmount.value.toFixed(2)}\nExchange: ৳${exchangeAmount.value.toFixed(2)}`;
      }
      
      if (!isGuest.value && redeemPoints.value > 0) {
        message += `\nRedeemed: ${redeemPoints.value} points (৳${pointsValue.value.toFixed(2)})`;
      }

      if (sale.earned_points > 0) {
        message += `\nEarned: +${sale.earned_points} points`;
      }

      alert(message);

      // Update customer points if available
      if (sale.customer && sale.customer.points !== undefined) {
        customer.value.points = sale.customer.points;
      }
    } else {
      alert("Checkout failed: " + JSON.stringify(res.data.errors || res.data.error));
    }
  } catch (err) {
    console.error("Checkout Error:", err);
    if (err.response?.data) {
      alert("Checkout failed: " + JSON.stringify(err.response.data));
    } else {
      alert("Checkout failed: " + err.message);
    }
  }
}

// Lifecycle
onMounted(async () => {
  try {
    const shopRes = await axios.get("/user/profile/");
    
    if (shopRes.data && shopRes.data.shop) {
      const shopData = shopRes.data.shop;
      
      // Load shop info
      shop_logo.value = shopData.logo_url || shopData.logo || '';
      shop_name.value = shopData.shop_name || "POS";
      location.value = shopData.location || "";
      phone.value = shopData.phone || "";
      email_or_link.value = shopData.email_or_link || "";
      
      console.log("Shop data loaded from API:", { 
        logo: shop_logo.value, 
        name: shop_name.value,
        phone: phone.value,
        location: location.value,
        email_or_link: email_or_link.value
      });
    } else {
      // Fallback to localStorage if API fails
      loadShopFromLocalStorage();
    }
  } catch (e) {
    console.error("Error loading shop data from API:", e);
    // Fallback to localStorage
    loadShopFromLocalStorage();
  }
  
  fetchAllProducts();
});

function loadShopFromLocalStorage() {
  try {
    const shop = JSON.parse(localStorage.getItem('shop') || '{}');
    
    // Handle logo URL - check if it's a relative URL and make it absolute
    let logoUrl = shop.logo_url || shop.logo || '';
    if (logoUrl && !logoUrl.startsWith('http')) {
      // If logo is relative path, prepend API base URL
      const apiBase = axios.defaults.baseURL || 'http://localhost:8000';
      logoUrl = apiBase + logoUrl;
    }
    
    shop_logo.value = logoUrl;
    shop_name.value = shop.shop_name || "POS";
    location.value = shop.location || "";
    phone.value = shop.phone || "";
    email_or_link.value = shop.email_or_link || "";
    
    console.log("Shop data loaded from localStorage:", { 
      logo: shop_logo.value, 
      name: shop_name.value,
      phone: phone.value,
      location: location.value,
      email_or_link: email_or_link.value
    });
    
  } catch (e) {
    console.error("Error loading shop data from localStorage:", e);
    // Set defaults
    shop_logo.value = "";
    shop_name.value = "POS";
    location.value = "";
    phone.value = "";
    email_or_link.value = "";
  }
  
  fetchAllProducts();
};
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #print-area,
  #print-area * {
    visibility: visible;
  }
  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
  }
}

/* Custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>