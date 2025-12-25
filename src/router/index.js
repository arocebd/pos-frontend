import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '@/pages/Dashboard.vue'
import AddProduct from '@/pages/AddProduct.vue'
import Products from '@/pages/Products.vue'
import ViewProduct from '@/pages/ViewProduct.vue'
import POSPage from '@/pages/POSPage.vue'
import InvoicePage from '@/pages/InvoicePage.vue'
import Customer from '@/pages/Customer.vue'
import Sales from '@/pages/Sales.vue'
import Expenses from '@/pages/Expenses.vue'
import Suppliers from '@/pages/Suppliers.vue'
import AddPurchase from '@/pages/AddPurchase.vue'
import SupplierLedger from '@/pages/SupplierLedger.vue'
import SalesReport from '@/pages/SalesReport.vue'
import BusinessOverview from '@/pages/BusinessOverview.vue'
import Login from '@/pages/Login.vue'
import Registration from '@/pages/Registration.vue'
import SubscriptionStatus from '@/pages/SubscriptionStatus.vue'
import CustomerLedger from '@/pages/CustomerLedger.vue'
import PaymentRequest from '@/pages/PaymentRequest.vue'
import DuePayment from '@/pages/DuePayment.vue'
import ShopSettings from '@/pages/ShopSettings.vue'
import UserProfile from '@/pages/UserProfile.vue'

const routes = [
  // PUBLIC ROUTES
  { path: '/login', name: 'Login', component: Login },
  { path: '/registration', name: 'Registration', component: Registration },
  
  // PAYMENT REQUEST - FIXED
  {
    path: '/payment-request', 
    name: 'PaymentRequest', 
    component: PaymentRequest,
    props: (route) => ({
      shopId: route.query.shop_id,
      phone: route.query.phone,
      plan: route.query.plan,
      amount: route.query.amount
    })
  },

  // REGISTRATION SUCCESS PAGE
  {
    path: '/registration-success',
    name: 'RegistrationSuccess',
    component: () => import('@/pages/PaymentPending.vue'),
    props: route => ({
      requires_payment: route.query.requires_payment,
      phone: route.query.phone,
      shop_id: route.query.shop_id
    }),
  },
  
  // redirect root to dashboard
  {
    path: '/',
    redirect: '/dashboard',
  },

  // MAIN LAYOUT + PROTECTED CHILD ROUTES
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'add-product', name: 'AddProduct', component: AddProduct },
      { path: 'products', name: 'Products', component: Products },
      { path: 'products/:id', name: 'ViewProduct', component: ViewProduct, props: true },
      { path: 'edit-product/:id', name: 'EditProduct', component: () => import('@/pages/EditProduct.vue'), props: true },
      { path: 'pos', name: 'POS', component: POSPage },
      { path: 'invoice/:id', name: 'Invoice', component: InvoicePage, props: true },
      { path: 'customer', name: 'Customer', component: Customer },
      { path: 'customer-ledger', name: 'CustomerLedgerList', component: CustomerLedger },
      { path: 'customer-ledger/:id', name: 'CustomerLedgerDetail', component: CustomerLedger, props: true },
      { path: 'due-payment', name: 'DuePayment', component: DuePayment },
      { path: 'sales', name: 'Sales', component: Sales },
      { path: 'expenses', name: 'Expenses', component: Expenses },
      { path: 'suppliers', name: 'Suppliers', component: Suppliers },
      { path: 'add-purchase', name: 'AddPurchase', component: AddPurchase },
      { path: 'supplier-ledger/:id', name: 'SupplierLedger', component: SupplierLedger, props: true },
      { path: 'sales-report', name: 'SalesReport', component: SalesReport },
      { path: 'business-overview', name: 'BusinessOverview', component: BusinessOverview },

      // NEW SETTINGS / SUBSCRIPTION PAGES (under layout)
      { path: 'user/profile', name: 'UserProfile', component: UserProfile },
      { path: 'shop/settings', name: 'ShopSettings', component: ShopSettings, meta: { requiresAuth: true, role: 'admin' } },
      { path: 'subscription-status', name: 'SubscriptionStatus', component: SubscriptionStatus },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ✅ UPDATED AUTH GUARD
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access') || localStorage.getItem('token')
  const publicRoutes = ['/login', '/registration', '/registration-success', '/payment-request']
  const isPublicRoute = publicRoutes.includes(to.path)
  const requiresAuth = to.matched.some(record => record.meta?.requiresAuth)
  const requiredRole = to.meta?.role

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user?.profile?.role || null

  // 1. Allow payment-request page without auth
  if (to.path === '/payment-request') return next()

  // 2. If logged in and going to public route, redirect to dashboard
  if (token && isPublicRoute) return next('/dashboard')

  // 3. If protected route and not logged in, redirect to login
  if (requiresAuth && !token) return next('/login')

  // 4. If subscription inactive
  const shopStatus = localStorage.getItem('shop_status')
  if (requiresAuth && token && shopStatus === 'inactive' && to.path !== '/subscription-status') {
    return next('/subscription-status')
  }

  // ✅ 5. Role-based restriction (e.g. admin-only routes)
  if (requiredRole && userRole !== requiredRole) {
    return next('/dashboard')  // or a 403 page
  }

  next()
})

// ✅ Add response interceptor to handle 402 Payment Required
import axios from '@/axios'

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 402) {
      // Payment required - subscription inactive or expired
      localStorage.setItem('subscription_error', JSON.stringify(error.response.data))
      router.push('/subscription')
      return Promise.reject(error)
    }
    
    // Handle 401 Unauthorized (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.removeItem('user')
      router.push('/login')
    }
    
    return Promise.reject(error)
  }
)

export default router