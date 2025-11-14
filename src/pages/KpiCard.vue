<template>
  <div class="bg-white p-4 rounded-lg shadow border-l-4" :class="borderClass">
    <h3 class="text-sm font-medium text-gray-500 mb-1">{{ title }}</h3>
    <div class="text-2xl font-bold" :class="textColor">
      {{ formattedValue }}{{ suffix }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: [Number, String],
  variant: {
    type: String,
    default: 'default'
  },
  suffix: {
    type: String,
    default: ''
  }
})

const borderClasses = {
  default: 'border-l-gray-400',
  success: 'border-l-green-500',
  danger: 'border-l-red-500',
  info: 'border-l-blue-500',
  primary: 'border-l-purple-500'
}

const textColors = {
  default: 'text-gray-800',
  success: 'text-green-600',
  danger: 'text-red-600',
  info: 'text-blue-600',
  primary: 'text-purple-600'
}

const borderClass = computed(() => borderClasses[props.variant] || borderClasses.default)
const textColor = computed(() => textColors[props.variant] || textColors.default)

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  return props.value || '0'
})
</script>