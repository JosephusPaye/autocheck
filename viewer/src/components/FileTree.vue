<template>
  <div class="flex flex-col h-full">
    <div class="text-sm uppercase font-semibold px-4 py-4 leading-none" v-if="label">
      {{ label }}
    </div>

    <div class="h-full overflow-y-auto" style="max-height: 403px;">
      <FileTreeItem
        v-for="item in items"
        :key="item.index"
        :item="item"
        :level="1"
        :selectedItemIndex="selectedItemIndex"
        @select="$emit('select', $event)"
      />
    </div>

    <div v-if="items.length === 0" class="px-4 pb-4 text-gray-600">
      {{ labelEmpty || 'No tree items' }}
    </div>
  </div>
</template>

<script>
import FileTreeItem from './FileTreeItem.vue';

export default {
  components: { FileTreeItem },

  name: 'FileTree',

  props: {
    label: String,
    labelEmpty: String,
    items: Array,
    selectedItemIndex: Number,
  },
};
</script>
