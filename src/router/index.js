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


const routes = [
  { path: '/login', name: 'Login', component: Login },
  
  {
    path: '/',
    redirect: '/dashboard',
  },
  
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),

    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'add-product', name: 'AddProduct', component: AddProduct },
      { path: 'products', name: 'Products', component: Products }, // ✅ product list
      { path: 'products/:id', name: 'ViewProduct', component: ViewProduct, props: true },
      { path: 'edit-product/:id', name: 'EditProduct', component: () => import('@/pages/EditProduct.vue'), props: true }, // ✅ fixed route
      { path: 'pos', name: 'POS', component: POSPage },
      { path: 'invoice/:id', name: 'Invoice', component: InvoicePage, props: true },
      { path: 'customer', name: 'Customer', component: Customer },
      { path: 'sales', name: 'Sales', component: Sales },
      { path: 'expenses', name: 'Expenses', component: Expenses },
      { path: 'suppliers', name: 'Suppliers', component: Suppliers },
      { path: 'add-purchase', name: 'AddPurchase', component: AddPurchase },
      { path: 'supplier-ledger/:id', name: 'SupplierLedger', component: SupplierLedger, props: true },
      { path: 'sales-report', name: 'SalesReport', component: SalesReport },
      { path: 'business-overview', name: 'BusinessOverview', component: BusinessOverview },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (!token && to.path !== "/login") next("/login");
  else next();
});


export default router


