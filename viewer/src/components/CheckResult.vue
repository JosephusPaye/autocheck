<template>
  <div>
    <div class="border-t border-gray-600 bg-gray-800 text-white">
      <div class="container px-4 py-3 leading-none mx-auto flex items-center">
        <div :title="tooltips[status] || 'Check result partial or unknown'" class="mr-3">
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
            class="text-green-500"
            v-if="status === 'passed'"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
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
            class="text-red-500"
            v-else-if="status === 'failed'"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
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
            class="text-yellow-500"
            v-else
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div class="text-xl">{{ label }}</div>
        <div class="flex-grow"></div>
        <slot name="actions"></slot>
        <button
          class="ml-3 border border-gray-600 rounded h-10 px-1 hover:bg-gray-600 hover:text-white"
          :title="expanded ? 'Collapse' : 'Expand'"
          @click="expanded = !expanded"
        >
          <IconChevron :type="expanded ? 'up' : 'down'" />
        </button>
      </div>
    </div>
    <div class="container px-4 py-3 mx-auto flex" v-show="expanded">
      <div class="w-1/3 pr-6" v-if="$slots.meta">
        <slot name="meta"></slot>
      </div>
      <div class="w-2/3" v-if="$slots.preview">
        <slot name="preview"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import IconChevron from './IconChevron.vue';

export default {
  name: 'CheckPane',

  components: {
    IconChevron,
  },

  props: {
    label: String,
    status: String,
  },

  data() {
    return {
      expanded: true,
      tooltips: {
        passed: 'Check passed',
        failed: 'Check failed',
      },
    };
  },
};
</script>
