<template>
  <button
    @click="$emit('click', $event)"
    class="px-4 py-1"
    :class="[color === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-300']"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    color: String,
  },
};
</script>
