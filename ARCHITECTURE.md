# 🏗️ Agentic Customer Portal - Architecture Guide

> Complete guide for developers working on the Agentic Customer Portal

---

## 📋 Table of Contents

1. [Tech Stack](#-tech-stack)
2. [Project Structure](#-project-structure)
3. [Module Architecture](#-module-architecture)
4. [Routing System](#-routing-system)
5. [State Management](#-state-management)
6. [API Integration](#-api-integration)
7. [Authentication & Permissions](#-authentication--permissions)
8. [Component Patterns](#-component-patterns)
9. [Style Guidelines](#-style-guidelines)
10. [Code Quality Standards](#-code-quality-standards)
11. [Complete Examples](#-complete-examples)

---

## 🛠️ Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue 3 | 3.5.14 | Frontend framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 6.3.5 | Build tool |
| Pinia | 3.0.2 | State management |
| Vue Router | 4.5.1 | Routing (file-based) |
| Vuetify | 3.8.5 | UI component library |

### Key Libraries

- **@vueuse/core** - Composition utilities
- **ofetch** - HTTP client
- **CASL** - Permission system
- **TipTap** - Rich text editor
- **ApexCharts/Chart.js** - Data visualization
- **wavesurfer.js** - Audio playback

### Auto-Import System

The following are **automatically imported** (no manual imports needed):

```typescript
// Vue APIs
ref, computed, watch, onMounted, reactive, nextTick

// Vue Router
useRoute, useRouter

// Pinia
defineStore, storeToRefs

// VueUse Composables
useWindowSize, useMouse, useStorage, etc.

// All stores from src/modules/**/stores/
useAssistantsStore, useUsersStore, etc.

// All composables from src/composables/
useNotify, useCompliance, etc.

// All utilities from src/utils/
formatPhoneNumber, $api, etc.
```

**Manually import only:**

- Components
- Types/Interfaces
- Specific library functions

---

## 📁 Project Structure

```
agentic-customer-portal/
├── src/
│   ├── modules/              # Feature modules (modular architecture)
│   │   ├── assistants/
│   │   │   ├── pages/        # File-based routes
│   │   │   ├── stores/       # Pinia stores
│   │   │   └── types/        # TypeScript types
│   │   ├── calls/
│   │   ├── chats/
│   │   ├── compliance/
│   │   ├── dashboard/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── root/             # Root-level pages (/, /login, etc.)
│   │   ├── sms/
│   │   └── users/
│   │
│   ├── stores/               # Global stores
│   │   ├── assistant-templates.ts
│   │   ├── confirm-dialog.ts
│   │   ├── integrations.ts
│   │   └── ...
│   │
│   ├── composables/          # Reusable composables
│   │   ├── useNotify.ts
│   │   └── useCompliance.ts
│   │
│   ├── utils/                # Utility functions
│   │   ├── api.ts            # HTTP client
│   │   ├── formatters.ts     # Format helpers
│   │   └── constants.ts
│   │
│   ├── types/                # Global TypeScript types
│   │   ├── actions.ts
│   │   ├── compliance.ts
│   │   └── ...
│   │
│   ├── components/           # Shared components
│   │   ├── dialogs/
│   │   ├── AssistantWizard.vue
│   │   └── ...
│   │
│   ├── plugins/              # Auto-loaded plugins
│   │   ├── 1.router/         # Router (loads first)
│   │   ├── 2.pinia.ts        # State management
│   │   ├── casl/             # Permissions
│   │   ├── vuetify/          # UI framework
│   │   └── i18n/             # Internationalization
│   │
│   ├── layouts/              # Layout templates
│   │   ├── default.vue
│   │   └── blank.vue
│   │
│   ├── @core/                # Core design system
│   │   ├── components/
│   │   ├── composable/
│   │   ├── utils/
│   │   └── scss/
│   │
│   ├── @layouts/             # Layout system
│   │   ├── components/
│   │   └── stores/
│   │
│   ├── App.vue               # Root component
│   └── main.ts               # Entry point
│
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── themeConfig.ts
```

---

## 🧩 Module Architecture

### Overview

**ALL new features MUST be created as modules** in `src/modules/`. This ensures:

- Clear separation of concerns
- Easy to maintain and scale
- Self-contained feature logic
- Auto-discovered routes and stores

### Module Structure

Every module must follow this structure:

```
src/modules/feature-name/
├── pages/                    # Vue pages (file-based routing)
│   ├── index.vue            # /feature-name/
│   ├── [id].vue             # /feature-name/:id
│   └── [id]/
│       └── [tab].vue        # /feature-name/:id/:tab
├── stores/                   # Pinia stores
│   └── feature-name.ts
└── types/                    # TypeScript interfaces
    ├── feature-name.type.ts
    └── ...
```

### Module Routing Rules

| Module Name | Route Mounting |
|-------------|----------------|
| `root` | `/` (special case) |
| `assistants` | `/assistants/` |
| `users` | `/users/` |
| Any other | `/<module-name>/` |

### Creating a New Module - Step by Step

#### Step 1: Create Directory Structure

```bash
src/modules/products/
├── pages/
├── stores/
└── types/
```

#### Step 2: Define TypeScript Types

**`src/modules/products/types/product.type.ts`**

```typescript
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  isActive: boolean
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
}

export interface CreateProductDto {
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
}
```

#### Step 3: Create Pinia Store

**`src/modules/products/stores/products.ts`**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ApiError } from '@/utils/api'
import type { Product, ProductFilters, CreateProductDto } from '../types/product.type'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const selectedProduct = ref<Product | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ProductFilters>({})

  const activeProducts = computed(() => 
    products.value.filter(p => p.isActive)
  )

  const filteredProducts = computed(() => {
    let result = activeProducts.value

    if (filters.value.category) {
      result = result.filter(p => p.category === filters.value.category)
    }

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      )
    }

    if (filters.value.minPrice !== undefined) {
      result = result.filter(p => p.price >= filters.value.minPrice!)
    }

    if (filters.value.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filters.value.maxPrice!)
    }

    return result
  })

  const totalProducts = computed(() => products.value.length)
  const totalValue = computed(() => 
    products.value.reduce((sum, p) => sum + p.price, 0)
  )

  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await $api.get('/products')
      products.value = response.result
    } catch (err) {
      if (err instanceof ApiError) {
        error.value = err.message
      } else {
        error.value = 'Failed to fetch products'
      }
    } finally {
      loading.value = false
    }
  }

  const fetchProductById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await $api.get(`/products/${id}`)
      selectedProduct.value = response.result
      return response.result
    } catch (err) {
      if (err instanceof ApiError) {
        error.value = err.message
      } else {
        error.value = 'Failed to fetch product'
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (dto: CreateProductDto) => {
    loading.value = true
    error.value = null
    try {
      const response = await $api.post('/products', dto)
      products.value.push(response.result)
      return response.result
    } catch (err) {
      if (err instanceof ApiError) {
        error.value = err.message
      } else {
        error.value = 'Failed to create product'
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    loading.value = true
    error.value = null
    try {
      const response = await $api.patch(`/products/${id}`, updates)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.result
      }
      if (selectedProduct.value?.id === id) {
        selectedProduct.value = response.result
      }
      return response.result
    } catch (err) {
      if (err instanceof ApiError) {
        error.value = err.message
      } else {
        error.value = 'Failed to update product'
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await $api.delete(`/products/${id}`)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value.splice(index, 1)
      }
      if (selectedProduct.value?.id === id) {
        selectedProduct.value = null
      }
      return true
    } catch (err) {
      if (err instanceof ApiError) {
        error.value = err.message
      } else {
        error.value = 'Failed to delete product'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: ProductFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const resetError = () => {
    error.value = null
  }

  return {
    products,
    selectedProduct,
    loading,
    error,
    filters,
    activeProducts,
    filteredProducts,
    totalProducts,
    totalValue,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilters,
    clearFilters,
    resetError,
  }
})
```

#### Step 4: Create Pages

**`src/modules/products/pages/index.vue`** (Product List)

```vue
<script setup lang="ts">
import type { Product } from '../types/product.type'

const productsStore = useProductsStore()
const router = useRouter()
const showCreateDialog = ref(false)

definePage({
  meta: {
    action: 'read',
    subject: 'products',
  },
})

onMounted(async () => {
  await productsStore.fetchProducts()
})

const openProduct = (id: string) => {
  router.push({ name: 'products-id', params: { id } })
}

const handleCreateProduct = () => {
  showCreateDialog.value = true
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}
</script>

<template>
  <div>
    <VRow class="mb-6">
      <VCol cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 mb-2">Products</h1>
            <p class="text-body-1 text-medium-emphasis">
              Manage your product catalog
            </p>
          </div>
          <VBtn
            color="primary"
            variant="elevated"
            prepend-icon="tabler-plus"
            @click="handleCreateProduct"
          >
            Add Product
          </VBtn>
        </div>
      </VCol>
    </VRow>

    <VRow v-if="productsStore.loading" class="mb-6">
      <VCol cols="12" class="d-flex justify-center align-center" style="min-height: 400px">
        <VProgressCircular indeterminate color="primary" size="64" width="4" />
      </VCol>
    </VRow>

    <VAlert
      v-else-if="productsStore.error"
      type="error"
      variant="tonal"
      closable
      class="mb-6"
      @click:close="productsStore.resetError()"
    >
      {{ productsStore.error }}
    </VAlert>

    <VRow v-else>
      <VCol
        v-for="product in productsStore.filteredProducts"
        :key="product.id"
        cols="12"
        sm="6"
        md="4"
      >
        <VCard class="h-100 d-flex flex-column">
          <VImg
            v-if="product.imageUrl"
            :src="product.imageUrl"
            height="200"
            cover
          />
          <div v-else class="bg-surface-variant d-flex align-center justify-center" style="height: 200px">
            <VIcon icon="tabler-photo" size="64" color="disabled" />
          </div>

          <VCardTitle class="d-flex justify-space-between align-center">
            <span>{{ product.name }}</span>
            <VChip
              :color="product.isActive ? 'success' : 'error'"
              size="small"
              variant="tonal"
            >
              {{ product.isActive ? 'Active' : 'Inactive' }}
            </VChip>
          </VCardTitle>

          <VCardText class="flex-grow-1">
            <p class="text-body-2 mb-4">{{ product.description }}</p>
            <div class="d-flex justify-space-between align-center">
              <span class="text-h6">{{ formatPrice(product.price) }}</span>
              <VChip size="small" variant="outlined">
                {{ product.category }}
              </VChip>
            </div>
          </VCardText>

          <VCardActions>
            <VBtn
              variant="tonal"
              color="primary"
              block
              @click="openProduct(product.id)"
            >
              View Details
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>

      <VCol v-if="productsStore.filteredProducts.length === 0" cols="12">
        <VCard>
          <VCardText class="text-center pa-12">
            <VIcon icon="tabler-package" size="64" color="disabled" class="mb-4" />
            <h3 class="text-h6 mb-2">No products found</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Get started by creating your first product
            </p>
            <VBtn
              color="primary"
              variant="elevated"
              @click="handleCreateProduct"
            >
              Create Product
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
```

**`src/modules/products/pages/[id].vue`** (Product Detail)

```vue
<script setup lang="ts">
const route = useRoute('products-id')
const router = useRouter()
const productsStore = useProductsStore()

const productId = computed(() => route.params.id as string)
const product = computed(() => productsStore.selectedProduct)

const showEditDialog = ref(false)
const showDeleteDialog = ref(false)

definePage({
  meta: {
    action: 'read',
    subject: 'products',
  },
})

onMounted(async () => {
  await productsStore.fetchProductById(productId.value)
})

const handleEdit = () => {
  showEditDialog.value = true
}

const handleDelete = async () => {
  const success = await productsStore.deleteProduct(productId.value)
  if (success) {
    router.push({ name: 'products' })
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div>
    <VRow v-if="productsStore.loading" class="mb-6">
      <VCol cols="12" class="d-flex justify-center align-center" style="min-height: 400px">
        <VProgressCircular indeterminate color="primary" size="64" width="4" />
      </VCol>
    </VRow>

    <VAlert
      v-else-if="productsStore.error"
      type="error"
      variant="tonal"
      closable
      class="mb-6"
      @click:close="productsStore.resetError()"
    >
      {{ productsStore.error }}
    </VAlert>

    <div v-else-if="product">
      <VRow class="mb-6">
        <VCol cols="12">
          <VBtn
            variant="text"
            prepend-icon="tabler-arrow-left"
            @click="router.back()"
          >
            Back to Products
          </VBtn>
        </VCol>
      </VRow>

      <VRow>
        <VCol cols="12" md="8">
          <VCard>
            <VImg
              v-if="product.imageUrl"
              :src="product.imageUrl"
              height="400"
              cover
            />
            <div v-else class="bg-surface-variant d-flex align-center justify-center" style="height: 400px">
              <VIcon icon="tabler-photo" size="96" color="disabled" />
            </div>

            <VCardTitle class="d-flex justify-space-between align-center pa-6">
              <span class="text-h4">{{ product.name }}</span>
              <VChip
                :color="product.isActive ? 'success' : 'error'"
                size="large"
                variant="tonal"
              >
                {{ product.isActive ? 'Active' : 'Inactive' }}
              </VChip>
            </VCardTitle>

            <VDivider />

            <VCardText class="pa-6">
              <h6 class="text-h6 mb-4">Description</h6>
              <p class="text-body-1 mb-6">{{ product.description }}</p>

              <VRow>
                <VCol cols="6">
                  <div class="mb-4">
                    <p class="text-caption text-medium-emphasis mb-1">Price</p>
                    <p class="text-h5">{{ formatPrice(product.price) }}</p>
                  </div>
                </VCol>
                <VCol cols="6">
                  <div class="mb-4">
                    <p class="text-caption text-medium-emphasis mb-1">Category</p>
                    <VChip variant="tonal">{{ product.category }}</VChip>
                  </div>
                </VCol>
                <VCol cols="6">
                  <div class="mb-4">
                    <p class="text-caption text-medium-emphasis mb-1">Created</p>
                    <p class="text-body-2">{{ formatDate(product.createdAt) }}</p>
                  </div>
                </VCol>
                <VCol cols="6">
                  <div class="mb-4">
                    <p class="text-caption text-medium-emphasis mb-1">Last Updated</p>
                    <p class="text-body-2">{{ formatDate(product.updatedAt) }}</p>
                  </div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" md="4">
          <VCard>
            <VCardTitle class="pa-6">Actions</VCardTitle>
            <VDivider />
            <VCardText class="pa-6">
              <VBtn
                color="primary"
                variant="elevated"
                block
                prepend-icon="tabler-edit"
                class="mb-4"
                @click="handleEdit"
              >
                Edit Product
              </VBtn>
              <VBtn
                color="error"
                variant="outlined"
                block
                prepend-icon="tabler-trash"
                @click="showDeleteDialog = true"
              >
                Delete Product
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <VDialog v-model="showDeleteDialog" max-width="500">
      <VCard>
        <VCardTitle class="text-h5 pa-6">
          Delete Product?
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-6">
          Are you sure you want to delete "{{ product?.name }}"? This action cannot be undone.
        </VCardText>
        <VDivider />
        <VCardActions class="pa-6">
          <VSpacer />
          <VBtn variant="outlined" @click="showDeleteDialog = false">
            Cancel
          </VBtn>
          <VBtn
            color="error"
            variant="elevated"
            @click="handleDelete"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
```

---

## 🛣️ Routing System

### File-Based Routing

Routes are **automatically generated** from file names. No manual route configuration needed.

#### Route Patterns

| File Path | Generated Route | Params |
|-----------|----------------|--------|
| `modules/products/pages/index.vue` | `/products` | - |
| `modules/products/pages/[id].vue` | `/products/:id` | `id` |
| `modules/products/pages/[id]/[tab].vue` | `/products/:id/:tab` | `id`, `tab` |
| `modules/products/pages/[...error].vue` | `/products/*` | Catch-all |
| `modules/root/pages/login.vue` | `/login` | - |

#### Page Metadata with `definePage()`

Define permissions and layout in every page:

```typescript
definePage({
  meta: {
    action: 'read',        // CASL action: create, read, update, delete
    subject: 'products',   // CASL subject
    public: false,         // Allow unauthenticated access
    unauthenticatedOnly: false, // Only for logged-out users (login page)
  },
})
```

#### Accessing Route Parameters

```vue
<script setup lang="ts">
// Typed route access
const route = useRoute('products-id')
const productId = route.params.id // TypeScript knows this exists

// Generic route access
const route = useRoute()
const id = route.params.id
const tab = route.params.tab
const query = route.query.search
</script>
```

#### Programmatic Navigation

```typescript
const router = useRouter()

// Navigate by name (recommended)
router.push({ name: 'products-id', params: { id: '123' } })

// Navigate by path
router.push('/products/123')

// Navigate with query params
router.push({ 
  name: 'products', 
  query: { search: 'laptop', category: 'electronics' } 
})

// Go back
router.back()

// Replace current route (no history entry)
router.replace({ name: 'products' })
```

---

## 📊 State Management

### Pinia Store Pattern

Every store follows the **Composition API** pattern with a clear structure:

```typescript
export const useMyStore = defineStore('myStore', () => {
  // 1️⃣ STATE
  const items = ref<Item[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 2️⃣ COMPUTED (Getters)
  const activeItems = computed(() => items.value.filter(i => i.isActive))
  const itemCount = computed(() => items.value.length)

  // 3️⃣ ACTIONS
  const fetchItems = async () => {
    // ... API logic
  }

  // 4️⃣ RETURN (Public API)
  return {
    items,
    loading,
    error,
    activeItems,
    itemCount,
    fetchItems,
  }
})
```

### Store Location Rules

| Store Type | Location | Example |
|------------|----------|---------|
| Module-specific | `src/modules/<module>/stores/` | `products.ts` |
| Global/Shared | `src/stores/` | `confirm-dialog.ts` |

**Rule:** Prefer module-specific stores. Only use global stores for truly cross-cutting concerns.

### Using Stores in Components

```vue
<script setup lang="ts">
// Auto-imported, no import statement needed
const productsStore = useProductsStore()

// Access state directly
const products = productsStore.products
const loading = productsStore.loading

// Call actions
onMounted(() => {
  productsStore.fetchProducts()
})

// Use storeToRefs for reactive destructuring
const { products, loading } = storeToRefs(productsStore)
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-for="product in products" :key="product.id">
    {{ product.name }}
  </div>
</template>
```

### Store Communication

```typescript
// Store A can use Store B
export const useOrdersStore = defineStore('orders', () => {
  const productsStore = useProductsStore()
  
  const createOrder = async (productId: string) => {
    const product = productsStore.products.find(p => p.id === productId)
    if (!product) {
      throw new Error('Product not found')
    }
    // Create order logic...
  }

  return { createOrder }
})
```

---

## 🌐 API Integration

### HTTP Client: `$api`

**Location:** `src/utils/api.ts`

**ALWAYS use `$api`** - never use `fetch`, `axios`, or other HTTP clients.

### API Methods

```typescript
// GET request
const response = await $api.get('/products')
const products = response.result

// POST request
const response = await $api.post('/products', {
  name: 'New Product',
  price: 99.99
})
const newProduct = response.result

// PUT request (full update)
const response = await $api.put('/products/123', productData)

// PATCH request (partial update)
const response = await $api.patch('/products/123', { price: 79.99 })

// DELETE request
await $api.delete('/products/123')
```

### API Response Structure

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean
  result: T | T[]
  message?: string
}
```

**Important:** Access data via `response.result`, NOT `response.data`

### Error Handling

```typescript
import { ApiError } from '@/utils/api'

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await $api.get('/endpoint')
    data.value = response.result
  } catch (err) {
    if (err instanceof ApiError) {
      // Structured error from API
      error.value = err.message
      statusCode.value = err.status
    } else {
      // Unexpected error
      error.value = 'An unexpected error occurred'
    }
  } finally {
    loading.value = false
  }
}
```

### Auto-401 Handling

The API client automatically handles 401 (Unauthorized) responses:

```typescript
// On 401 response:
// 1. Clears all auth cookies
// 2. Clears CASL permissions
// 3. Redirects to /login
// NO manual handling needed!
```

---

## 🔐 Authentication & Permissions

### Cookie-Based Authentication

Authentication data is stored in cookies:

```typescript
// Access auth data
const accessToken = useCookie('accessToken')
const userInfo = useCookie('userInfo')
const userPermissions = useCookie('userPermissions')

// Login (typically in auth store)
const login = async (email: string, password: string) => {
  const response = await $api.post('/auth/login', { email, password })
  
  useCookie('accessToken').value = response.result.token
  useCookie('userInfo').value = response.result.user
  useCookie('userPermissions').value = response.result.permissions
}

// Logout
const logout = () => {
  useCookie('accessToken').value = null
  useCookie('userInfo').value = null
  useCookie('userPermissions').value = null
  router.push('/login')
}

// Check if logged in
const isLoggedIn = computed(() => {
  return !!(useCookie('accessToken').value && useCookie('userInfo').value)
})
```

### CASL Permissions

Define and check permissions using CASL:

```vue
<script setup lang="ts">
const ability = useAbility()

// Check permissions
const canCreateProducts = ability.can('create', 'products')
const canEditProducts = ability.can('update', 'products')
const canDeleteProducts = ability.can('delete', 'products')

// Use in functions
const handleDelete = (productId: string) => {
  if (!ability.can('delete', 'products')) {
    alert('You do not have permission to delete products')
    return
  }
  // Delete logic...
}
</script>

<template>
  <!-- Conditional rendering based on permissions -->
  <VBtn
    v-if="canCreateProducts"
    @click="createProduct"
  >
    Create Product
  </VBtn>

  <VBtn
    v-if="canDeleteProducts"
    color="error"
    @click="handleDelete"
  >
    Delete
  </VBtn>
</template>
```

### Navigation Guards

Guards are automatically applied based on page metadata:

```typescript
// In page
definePage({
  meta: {
    action: 'read',
    subject: 'products',
  },
})

// Guard logic (automatic):
// 1. Check if user is logged in
// 2. Check if user has permission (ability.can('read', 'products'))
// 3. Redirect to /login if not logged in
// 4. Redirect to /not-authorized if no permission
```

### Public and Unauthenticated-Only Pages

```typescript
// Public page (accessible to everyone)
definePage({
  meta: {
    public: true,
  },
})

// Unauthenticated-only (login, register pages)
definePage({
  meta: {
    unauthenticatedOnly: true,
  },
})
```

---

## 🧱 Component Patterns

### Component Structure Order

**ALWAYS follow this order in `<script setup>`:**

```vue
<script setup lang="ts">
// 1. Manual imports (types, components, libraries)
import type { Product } from '../types/product.type'
import ProductForm from '@/components/ProductForm.vue'

// 2. Props and Emits
const props = defineProps<{
  productId: string
  initialData?: Product
}>()

const emit = defineEmits<{
  save: [product: Product]
  cancel: []
}>()

// 3. Store initialization
const productsStore = useProductsStore()
const notifyStore = useNotify()

// 4. Router/Route access
const router = useRouter()
const route = useRoute()

// 5. Local reactive state (if absolutely necessary)
const showDialog = ref(false)
const formData = reactive({
  name: '',
  price: 0,
})

// 6. Computed values
const isValid = computed(() => {
  return formData.name && formData.price > 0
})

// 7. Functions (only UI logic)
const handleSubmit = () => {
  if (!isValid.value) {
    return
  }
  emit('save', formData)
}

// 8. Lifecycle hooks
onMounted(() => {
  productsStore.fetchProducts()
})

// 9. definePage metadata (at end)
definePage({
  meta: {
    action: 'read',
    subject: 'products',
  },
})
</script>
```

### Component Communication

#### Parent to Child (Props)

```vue
<!-- Parent -->
<template>
  <ProductCard
    :product="product"
    :show-actions="true"
    @edit="handleEdit"
  />
</template>

<!-- Child: ProductCard.vue -->
<script setup lang="ts">
import type { Product } from '@/types/product'

const props = defineProps<{
  product: Product
  showActions?: boolean
}>()

const emit = defineEmits<{
  edit: [productId: string]
}>()
</script>
```

#### Child to Parent (Emits)

```vue
<!-- Child -->
<script setup lang="ts">
const emit = defineEmits<{
  save: [data: FormData]
  cancel: []
}>()

const handleSave = () => {
  emit('save', formData)
}
</script>

<template>
  <VBtn @click="handleSave">Save</VBtn>
</template>

<!-- Parent -->
<template>
  <ProductForm
    @save="handleSaveProduct"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
const handleSaveProduct = (data: FormData) => {
  // Handle save
}
</script>
```

#### Sibling Components (Shared Store)

```vue
<!-- Component A -->
<script setup lang="ts">
const cartStore = useCartStore()

const addToCart = (product: Product) => {
  cartStore.addItem(product)
}
</script>

<!-- Component B (updates automatically) -->
<script setup lang="ts">
const cartStore = useCartStore()
const itemCount = computed(() => cartStore.items.length)
</script>

<template>
  <VBadge :content="itemCount">
    <VIcon icon="tabler-shopping-cart" />
  </VBadge>
</template>
```

---

## 🎨 Style Guidelines

### ❌ NO Custom CSS

**NEVER use:**

- `<style>` tags
- `style` attributes
- Custom CSS classes
- Any CSS frameworks other than Vuetify

### ✅ ONLY Vuetify Props

Style everything using Vuetify component props:

```vue
<!-- ✅ CORRECT -->
<VBtn
  color="primary"
  variant="elevated"
  size="large"
  prepend-icon="tabler-plus"
  rounded="lg"
  elevation="2"
>
  Add Product
</VBtn>

<VCard
  elevation="4"
  rounded="xl"
  class="pa-6"
>
  <VCardTitle class="text-h5 mb-4">
    Title
  </VCardTitle>
</VCard>

<!-- ❌ WRONG -->
<button style="background: blue; padding: 10px;">
  Add Product
</button>

<style>
.custom-card {
  border-radius: 20px;
  padding: 24px;
}
</style>
```

### Vuetify Utility Classes (Allowed)

Only these utility classes are allowed:

```vue
<!-- Spacing -->
pa-4     → padding all
ma-2     → margin all
px-6     → padding x-axis
mt-4     → margin top

<!-- Layout -->
d-flex
flex-column
flex-row
justify-space-between
align-center

<!-- Typography -->
text-h1, text-h2, text-h3, text-h4, text-h5, text-h6
text-body-1, text-body-2
text-caption
text-center

<!-- Colors -->
bg-primary
bg-surface
text-primary
text-error

<!-- Display -->
d-none
d-block
d-inline-block
```

### Common Vuetify Components

```vue
<!-- Buttons -->
<VBtn color="primary" variant="elevated">Button</VBtn>
<VBtn color="error" variant="outlined">Cancel</VBtn>
<VBtn color="success" variant="tonal">Save</VBtn>

<!-- Cards -->
<VCard elevation="2" rounded="lg">
  <VCardTitle>Title</VCardTitle>
  <VCardText>Content</VCardText>
  <VCardActions>
    <VBtn>Action</VBtn>
  </VCardActions>
</VCard>

<!-- Forms -->
<VTextField
  v-model="name"
  label="Product Name"
  placeholder="Enter name"
  :error-messages="errors.name"
/>

<VSelect
  v-model="category"
  :items="categories"
  label="Category"
/>

<VTextarea
  v-model="description"
  label="Description"
  rows="4"
/>

<!-- Layout -->
<VRow>
  <VCol cols="12" md="6">
    Content
  </VCol>
  <VCol cols="12" md="6">
    Content
  </VCol>
</VRow>

<!-- Loading -->
<VProgressCircular indeterminate color="primary" />
<VProgressLinear indeterminate color="primary" />

<!-- Alerts -->
<VAlert type="success" variant="tonal">
  Success message
</VAlert>

<!-- Dialogs -->
<VDialog v-model="showDialog" max-width="500">
  <VCard>
    <VCardTitle>Title</VCardTitle>
    <VCardText>Content</VCardText>
  </VCard>
</VDialog>
```

---

## ✨ Code Quality Standards

### 1. NO Console.log

```typescript
// ❌ NEVER
console.log('Debug info')
console.error('Error')

// ✅ Use notification system
const { notify } = useNotify()
notify('Operation successful', 'success')
notify('Error occurred', 'error')
```

### 2. NO Comments

Write self-documenting code:

```typescript
// ❌ BAD
function calc(a: number, b: number) {
  // Calculate the sum
  return a + b
}

// ✅ GOOD
function calculateTotalPrice(basePrice: number, tax: number): number {
  return basePrice + tax
}
```

### 3. Proper Conditional Format

```typescript
// ❌ NEVER single-line
if (!user) return null
if (isValid) doSomething()

// ✅ ALWAYS use braces
if (!user) {
  return null
}

if (isValid) {
  doSomething()
}

// ✅ Even for single statements
if (error) {
  showError(error)
}
```

### 4. TypeScript Strict Mode

```typescript
// ❌ NEVER use 'any'
const data: any = await fetchData()

// ✅ ALWAYS define proper types
interface Product {
  id: string
  name: string
  price: number
}

const data: Product = await fetchData()

// ✅ Use generics
async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await $api.get(endpoint)
  return response.result
}
```

### 5. Import Organization

```typescript
// 1. Type imports
import type { Product } from '../types/product.type'
import type { ApiResponse } from '@/types/api'

// 2. Component imports
import ProductCard from '@/components/ProductCard.vue'

// 3. Library imports (if not auto-imported)
import { debounce } from '@/utils/helpers'

// Note: Vue APIs, Router, Pinia, VueUse are auto-imported
// NO need to import: ref, computed, useRouter, defineStore, etc.
```

### 6. Error Handling

```typescript
// ✅ ALWAYS handle errors in stores
const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await $api.get('/data')
    data.value = response.result
  } catch (err) {
    if (err instanceof ApiError) {
      error.value = err.message
    } else {
      error.value = 'Unexpected error occurred'
    }
  } finally {
    loading.value = false
  }
}
```

### 7. Before Completing Tasks

**ALWAYS run:**

```bash
npm run tsc:check
```

Fix ALL TypeScript errors before submitting code.

---

## 📝 Complete Examples

### Example 1: Complete CRUD Module

This example shows a complete module with all CRUD operations.

See the [Products Module Example](#creating-a-new-module---step-by-step) above for full implementation.

### Example 2: Form with Validation

```vue
<script setup lang="ts">
import type { CreateProductDto } from '../types/product.type'

const emit = defineEmits<{
  submit: [data: CreateProductDto]
  cancel: []
}>()

const formData = reactive<CreateProductDto>({
  name: '',
  description: '',
  price: 0,
  category: '',
})

const errors = reactive({
  name: '',
  description: '',
  price: '',
  category: '',
})

const categories = [
  'Electronics',
  'Clothing',
  'Food',
  'Books',
  'Toys',
]

const validateForm = (): boolean => {
  let isValid = true

  if (!formData.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  } else {
    errors.name = ''
  }

  if (!formData.description.trim()) {
    errors.description = 'Description is required'
    isValid = false
  } else {
    errors.description = ''
  }

  if (formData.price <= 0) {
    errors.price = 'Price must be greater than 0'
    isValid = false
  } else {
    errors.price = ''
  }

  if (!formData.category) {
    errors.category = 'Category is required'
    isValid = false
  } else {
    errors.category = ''
  }

  return isValid
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }
  emit('submit', formData)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <VForm @submit.prevent="handleSubmit">
    <VRow>
      <VCol cols="12">
        <VTextField
          v-model="formData.name"
          label="Product Name"
          placeholder="Enter product name"
          :error-messages="errors.name"
          required
        />
      </VCol>

      <VCol cols="12">
        <VTextarea
          v-model="formData.description"
          label="Description"
          placeholder="Enter product description"
          :error-messages="errors.description"
          rows="4"
          required
        />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField
          v-model.number="formData.price"
          label="Price"
          placeholder="0.00"
          type="number"
          step="0.01"
          prefix="$"
          :error-messages="errors.price"
          required
        />
      </VCol>

      <VCol cols="12" md="6">
        <VSelect
          v-model="formData.category"
          :items="categories"
          label="Category"
          placeholder="Select category"
          :error-messages="errors.category"
          required
        />
      </VCol>

      <VCol cols="12" class="d-flex gap-4">
        <VBtn
          type="submit"
          color="primary"
          variant="elevated"
        >
          Save Product
        </VBtn>
        <VBtn
          variant="outlined"
          @click="handleCancel"
        >
          Cancel
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
```

### Example 3: Data Table with Filters

```vue
<script setup lang="ts">
import type { Product } from '../types/product.type'

const productsStore = useProductsStore()

const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const sortBy = ref<'name' | 'price' | 'createdAt'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const categories = computed(() => {
  const cats = new Set(productsStore.products.map(p => p.category))
  return Array.from(cats)
})

const filteredAndSortedProducts = computed(() => {
  let result = [...productsStore.products]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    )
  }

  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  result.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = (bVal as string).toLowerCase()
    }

    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return result
})

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Category', key: 'category', sortable: true },
  { title: 'Price', key: 'price', sortable: true },
  { title: 'Status', key: 'isActive', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
]

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = null
  sortBy.value = 'name'
  sortOrder.value = 'asc'
}

onMounted(() => {
  productsStore.fetchProducts()
})
</script>

<template>
  <div>
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
              v-model="searchQuery"
              label="Search"
              placeholder="Search products..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect
              v-model="selectedCategory"
              :items="categories"
              label="Category"
              placeholder="All categories"
              clearable
            />
          </VCol>
          <VCol cols="12" md="2" class="d-flex align-center">
            <VBtn
              variant="outlined"
              block
              @click="clearFilters"
            >
              Clear Filters
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VCard>
      <VDataTable
        :headers="headers"
        :items="filteredAndSortedProducts"
        :loading="productsStore.loading"
        item-value="id"
      >
        <template #item.price="{ item }">
          <span class="font-weight-medium">
            {{ formatPrice(item.price) }}
          </span>
        </template>

        <template #item.isActive="{ item }">
          <VChip
            :color="item.isActive ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ item.isActive ? 'Active' : 'Inactive' }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <VBtn
              icon="tabler-eye"
              variant="text"
              size="small"
              @click="viewProduct(item.id)"
            />
            <VBtn
              icon="tabler-edit"
              variant="text"
              size="small"
              color="primary"
              @click="editProduct(item.id)"
            />
            <VBtn
              icon="tabler-trash"
              variant="text"
              size="small"
              color="error"
              @click="deleteProduct(item.id)"
            />
          </div>
        </template>
      </VDataTable>
    </VCard>
  </div>
</template>
```

### Example 4: Composable for Notifications

```typescript
// src/composables/useNotify.ts
export const useNotify = () => {
  const isOpen = ref(false)
  const message = ref('')
  const color = ref<'success' | 'error' | 'warning' | 'info'>('success')
  const timeout = ref(3000)

  const notify = (
    msg: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
    duration = 3000
  ) => {
    message.value = msg
    color.value = type
    timeout.value = duration
    isOpen.value = true
  }

  const success = (msg: string, duration?: number) => {
    notify(msg, 'success', duration)
  }

  const error = (msg: string, duration?: number) => {
    notify(msg, 'error', duration)
  }

  const warning = (msg: string, duration?: number) => {
    notify(msg, 'warning', duration)
  }

  const info = (msg: string, duration?: number) => {
    notify(msg, 'info', duration)
  }

  return {
    isOpen,
    message,
    color,
    timeout,
    notify,
    success,
    error,
    warning,
    info,
  }
}
```

### Example 5: Utility Functions

```typescript
// src/utils/formatters.ts

export const formatPrice = (price: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  }
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')
  }
  
  return phone
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength) + '...'
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

---

## 🎯 Quick Reference Checklist

Before submitting code, verify:

- [ ] No `console.log` statements
- [ ] No comments in code
- [ ] All conditionals use braces
- [ ] No custom CSS (only Vuetify props)
- [ ] All TypeScript types defined
- [ ] Business logic in stores, not components
- [ ] Auto-imports used correctly
- [ ] API calls use `$api`
- [ ] Error handling in place
- [ ] Loading states managed
- [ ] Permissions defined with `definePage()`
- [ ] `npm run tsc:check` passes

---

## 📚 Additional Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vuetify Documentation](https://vuetifyjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [VueUse Documentation](https://vueuse.org/)

---

**Last Updated:** 2025-10-13
