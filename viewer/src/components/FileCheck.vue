<template>
  <CheckResult
    :label="check.config.label"
    :status="check.status"
    :error="check.error"
    :sidebarExpanded="sidebarExpanded"
  >
    <CheckDetails
      slot="meta"
      :type="check.config.type"
      :details="details"
      :error="check.status === 'failed' ? check.error : undefined"
      :expanded.sync="sidebarExpanded"
    >
      <FileTree
        label="Matching files"
        :items="results"
        :labelEmpty="check.error"
        :selectedItemIndex="pagination.current - 1"
        @select="onResultSelect"
      />
    </CheckDetails>
    <CheckPagination
      v-if="check.results.length > 1"
      slot="actions"
      :total="pagination.total"
      :current.sync="pagination.current"
    />
    <div v-if="check.results.length > 0" slot="preview">
      <div v-if="isImage(file.type)" class="overflow-auto w-full" style="height: 800px;">
        <img :src="file.url" />
      </div>
      <Prism
        v-else-if="isText(file.type)"
        style="height: 800px; overflow-x: auto"
        :fileExtension="file.type"
        :code="getFileContent(file.relativePath)"
      />
      <embed
        v-else-if="file.type === 'pdf'"
        scale="tofit"
        width="100%"
        height="800px"
        :src="file.url"
      />
      <div
        v-else
        class="flex flex-col w-full border rounded justify-center items-center"
        style="height: 800px;"
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
          class="text-gray-600"
        >
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
        <span class="mt-3 text-lg text-gray-700">This file can't be embedded.</span>
      </div>
    </div>
  </CheckResult>
</template>

<script>
import Prism from './Prism.vue';
import CheckResult from './CheckResult.vue';
import CheckPagination from './CheckPagination.vue';
import CheckDetails from './CheckDetails.vue';
import FileTree from './FileTree.vue';

export default {
  name: 'FileCheck',

  components: {
    CheckResult,
    CheckPagination,
    CheckDetails,
    FileTree,
    Prism,
  },

  props: {
    check: Object,
  },

  data() {
    return {
      sidebarExpanded: true,
      pagination: {
        current: 1,
        total: this.check.results.length,
      },
    };
  },

  computed: {
    file() {
      return this.check.results[this.pagination.current - 1];
    },

    details() {
      return [
        {
          label: 'Patterns',
          values: this.check.config.patterns,
        },
      ];
    },

    results() {
      return this.check.results.map((result, i) => {
        return { value: result.relativePath, index: i };
      });
    },
  },

  methods: {
    onResultSelect(index) {
      this.pagination.current = index + 1;
    },

    isImage(extension) {
      return ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension);
    },

    isText(extension) {
      return [
        'txt',
        'md',
        'c',
        'cpp',
        'cs',
        'h',
        'hpp',
        'makefile',
        'java',
        'py',
        'html',
        'css',
        'js',
        'json',
        'xml',
        'svg',
      ].includes(extension);
    },

    getFileContent(relativePath) {
      return window.autocheckReport.fileContents[relativePath] || '';
    },
  },
};
</script>
