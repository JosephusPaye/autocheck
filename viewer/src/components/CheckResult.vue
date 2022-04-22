<template>
  <div class="relative" :data-check="check.config.label">
    <a class="check-anchor" :name="check.id">{{ check.config.label }}</a>
    <div class="border-t border-gray-600 bg-gray-800 text-white">
      <div class="container px-4 py-3 leading-none mx-auto flex items-center">
        <div :title="tooltips[check.status] || 'Check result partial or unknown'" class="mr-3">
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
            v-if="check.status === 'passed'"
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
            v-else-if="check.status === 'failed'"
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
            class="text-gray-400"
            v-else-if="check.status === 'skipped'"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="12" x2="16" y2="12" />
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
        <div class="text-xl">{{ check.config.label }}</div>
        <div class="flex-grow"></div>
        <slot name="actions"></slot>
        <button
          class="ml-3 border border-gray-600 rounded h-10 px-1 hover:bg-gray-600 hover:text-white"
          :title="check.expanded ? 'Collapse' : 'Expand'"
          @click="check.expanded = !check.expanded"
        >
          <IconChevron :type="check.expanded ? 'up' : 'down'" />
        </button>
      </div>
    </div>
    <div class="container px-4 pt-4 pb-8 mx-auto flex" v-show="check.expanded">
      <div :class="[sidebarExpanded ? 'w-1/3 pr-6' : 'pr-3']" v-if="$slots.meta">
        <slot name="meta"></slot>
      </div>
      <div :class="[sidebarExpanded ? 'w-2/3' : 'w-full min-w-0']">
        <!-- Search checks show their error in the sidebar -->
        <div
          v-if="check.config.type !== 'search' && check.error"
          class="flex flex-col h-full w-full border rounded justify-center items-center p-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-red-500"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span class="mt-3 text-lg text-gray-700 text-center">{{ check.error }}</span>
        </div>
        <template v-else-if="$slots.preview">
          <slot name="preview"></slot>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import IconChevron from './IconChevron.vue';

export default {
  name: 'CheckResult',

  components: {
    IconChevron,
  },

  props: {
    check: Object,
    sidebarExpanded: Boolean,
  },

  data() {
    return {
      tooltips: {
        passed: 'Check passed',
        failed: 'Check failed',
        skipped: 'Check skipped',
      },
    };
  },
};
</script>

<style lang="scss" scoped>
.check-anchor {
  @apply absolute invisible;
  top: -56px; // Pull the anchor up so when we jump to it, the check's label is not covered by the main header
}
</style>
