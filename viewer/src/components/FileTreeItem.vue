<template>
  <div>
    <button
      @click="$emit('select', item.index)"
      class="tree-item px-4 w-full truncate text-left py-2 leading-none hover:bg-gray-200"
      :class="{ 'is-selected': item.index === selectedItemIndex }"
      :style="{ 'padding-left': `${level * 16}px` }"
      :title="item.value"
      v-if="!hasChildren"
    >
      <span v-if="item.context"
        >{{ item.context[0] }}<mark>{{ item.value }}</mark
        >{{ item.context[1] }}</span
      >
      <span v-else>{{ item.value }}</span>
    </button>

    <template v-else>
      <button
        @click="expanded = !expanded"
        class="tree-item px-4 w-full truncate text-left py-2 leading-none hover:bg-gray-200 flex items-center"
        :style="{ 'padding-left': `${level * 16}px` }"
        :title="item.value"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-chevron-right flex-shrink-0 mr-1 -ml-1"
          :style="{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)' }"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        <span class="w-full truncate" style="padding-top: 2px; padding-bottom: 2px">
          <span v-if="item.context"
            >{{ item.context[0] }}<mark>{{ item.value }}</mark
            >{{ item.context[1] }}</span
          >
          <span v-else>{{ item.value }}</span>
        </span>
      </button>

      <template v-if="expanded">
        <FileTreeItem
          v-for="child in item.children"
          :key="child.index"
          :item="child"
          :selectedItemIndex="selectedItemIndex"
          :level="level + 1"
          @select="$emit('select', $event)"
        />
      </template>
    </template>
  </div>
</template>

<script>
export default {
  name: 'FileTreeItem',

  props: {
    item: Object,
    level: Number,
    selectedItemIndex: Number,
  },

  data() {
    return {
      expanded: false,
    };
  },

  computed: {
    hasChildren() {
      return this.item.children && this.item.children.length > 0;
    },
  },
};
</script>

<style lang="scss" scoped>
.tree-item {
  @apply border-b;

  &.is-selected {
    @apply bg-blue-200;

    &,
    & + .result-item {
      @apply border-transparent;
    }
  }
}
</style>
