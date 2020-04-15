<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :style="{ transform: `rotate(${rotation[type]})` }"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
</template>

<script>
export default {
  name: 'IconChevron',

  props: {
    type: String,
  },

  data() {
    return {
      rotation: {
        up: '180deg',
        down: '0deg',
        left: '90deg',
        right: '-90deg',
      },
    };
  },
};
</script>
