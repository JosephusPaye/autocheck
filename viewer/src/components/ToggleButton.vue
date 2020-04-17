<template>
  <button
    class="px-4 py-1 ml-px"
    :class="[value === id ? 'bg-blue-600 text-white' : 'bg-gray-300']"
    @click="$emit('update:value', id)"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'ToggleButton',
  props: {
    id: null,
    value: null,
  },
};
</script>
