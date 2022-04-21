<template>
  <button
    @click="$emit('click', $event)"
    class="px-4 py-1 text-base"
    :class="[
      color === 'primary'
        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700'
        : color === 'dark'
        ? 'bg-gray-800 text-white hover:bg-gray-700 focus:bg-gray-700'
        : 'bg-gray-300 text-black hover:bg-gray-400 focus:bg-gray-400',
    ]"
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
