<template>
  <div
    class="flex flex-col h-full overflow-y-auto"
    :style="{ width: !expanded ? '32px' : undefined, 'max-height': '800px' }"
  >
    <div
      class="flex bg-gray-300 px-4 py-2 font-semibold rounded-t"
      :class="{ 'h-full rounded-b': !expanded }"
    >
      <div v-show="expanded">
        <span class="capitalize">{{ type }}</span> check
      </div>
      <button
        :class="[expanded ? 'ml-auto -mr-2' : '-ml-3']"
        :title="expanded ? 'Collapse' : 'Expand'"
        @click="toggle"
      >
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
          class="feather feather-chevron-left"
          :style="{ transform: expanded ? 'rotate(0)' : 'rotate(180deg)' }"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    </div>

    <div v-if="error" v-show="expanded" class="px-4 pt-3 border-l border-r border-gray-300">
      <div class="bg-red-300 rounded px-4 py-3 text-sm font-semibold">⚠ Failed: {{ error }}</div>
    </div>

    <div class="border border-gray-300 border-t-0 rounded-b h-full flex flex-col" v-show="expanded">
      <div v-if="details" class="p-4 border-b border-gray-300">
        <div v-for="(detail, i) in details" :key="i" class="grid gap-3 detail leading-none">
          <div class="text-sm uppercase tracking-wider text-gray-700 truncate">
            {{ detail.label }}
          </div>
          <div class="grid gap-2 grid-cols-1">
            <div
              v-for="(value, j) in detail.values"
              :key="j"
              class="font-mono truncate"
              :title="value"
            >
              {{ value }}
            </div>
          </div>
        </div>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CheckDetails',

  props: {
    type: String,
    error: String,
    details: Array,
    expanded: Boolean,
  },

  methods: {
    toggle() {
      this.$emit('update:expanded', !this.expanded);
    },
  },
};
</script>

<style lang="scss" scoped>
.detail {
  grid-template-columns: 108px 1fr;

  &:not(:last-child) {
    @apply border-b mb-2 pb-2;
  }
}
</style>
