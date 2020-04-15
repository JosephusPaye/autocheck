<template>
  <div class="ml-auto border border-gray-600 rounded flex items-center h-10">
    <button class="h-10 px-1 hover:bg-gray-600 hover:text-white" @click="previous">
      <IconChevron type="left" />
    </button>
    <div class="h-10 border-l border-gray-600 px-4 flex items-center">{{ current }} of {{ total }}</div>
    <button
      class="h-10 border-l border-gray-600 px-1 hover:bg-gray-600 hover:text-white"
      @click="next"
    >
      <IconChevron type="right" />
    </button>
  </div>
</template>

<script>
import IconChevron from './IconChevron.vue';

export default {
  name: 'CheckPagination',

  components: {
    IconChevron,
  },

  props: {
    current: Number,
    total: Number,
  },

  methods: {
    next() {
      const next = Math.min(this.current + 1, this.total);
      this.$emit('update:current', next);
    },

    previous() {
      const previous = Math.max(this.current - 1, 1);
      this.$emit('update:current', previous);
    },
  },
};
</script>
