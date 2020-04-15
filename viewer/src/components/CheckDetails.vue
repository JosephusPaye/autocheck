<template>
  <div class="flex flex-col h-full overflow-y-auto">
    <div class="capitalize bg-gray-300 px-4 py-2 font-semibold rounded-t">
      {{ type }}
      <span class="lowercase">check</span>
    </div>
    <div class="border border-gray-300 border-t-0 rounded-b flex-grow">
      <div v-if="details" class="p-4 border-b border-gray-300">
        <div
          v-for="(detail, i) in details"
          :key="i"
          class="grid gap-3 detail leading-none"
        >
          <div class="text-sm uppercase tracking-wider text-gray-700 truncate">
            {{ detail.label }}
          </div>
          <div class="grid gap-2 grid-cols-1">
            <div v-for="(value, j) in detail.values" :key="j" class="font-mono">
              {{ value }}
            </div>
          </div>
        </div>
      </div>
      <template v-if="results">
        <div class="text-sm uppercase font-semibold px-4 py-4 leading-none">
          {{ resultLabel || 'Results' }}
        </div>
        <button
          v-for="(result, i) in results"
          :key="i"
          @click="$emit('select', i)"
          class="px-4 w-full truncate text-left py-2 leading-none result-item hover:bg-gray-200"
          :class="[i === selectedResultIndex ? 'is-selected' : '']"
        >
          {{ result }}
        </button>
        <div v-if="results.length === 0" class="px-4 pb-4 text-gray-600">
          {{ resultLabelEmpty || 'No results' }}
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CheckDetails',

  props: {
    type: String,
    details: Array,
    resultLabel: String,
    resultLabelEmpty: String,
    results: Array,
    selectedResultIndex: Number,
  },
};
</script>

<style lang="scss" scoped>
.detail {
  grid-template-columns: 120px 1fr;

  &:not(:last-child) {
    @apply border-b mb-2 pb-2;
  }
}

.result-item {
  & + & {
    @apply border-t;
  }

  &.is-selected {
    @apply bg-blue-200;

    &,
    & + .result-item {
      @apply border-transparent;
    }
  }
}
</style>
