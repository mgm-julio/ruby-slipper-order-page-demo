<template>
  <div
    class="h-100 d-flex align-center justify-md-space-between justify-center"
  >
    <!-- 👉 Footer: left content -->
    <span
      class="d-flex align-center d-inline-block text-body-1 text-medium-emphasis"
    >
      &copy;
      {{ new Date().getFullYear() }}
      AgenticFlo Customer Portal
    </span>
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <a href="#" target="noopener noreferrer">Privacy Policy</a>
      <a href="#" target="noopener noreferrer">Terms of Service</a>
      <a href="#" target="noopener noreferrer">Support</a>
      <a href="#" target="noopener noreferrer">Documentation</a>
    </span>
  </div>
</template>
