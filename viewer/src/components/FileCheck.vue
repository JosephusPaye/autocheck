<template>
  <CheckResult
    :label="check.config.label"
    :status="check.status"
    :error="check.error"
  >
    <CheckDetails
      slot="meta"
      resultLabel="Matching files"
      :resultLabelEmpty="check.error"
      :type="check.config.type"
      :details="details"
      :results="results"
      :selectedResultIndex="pagination.current - 1"
      @select="onResultSelect"
    />
    <CheckPagination
      v-if="check.results.length > 1"
      slot="actions"
      :total="pagination.total"
      :current.sync="pagination.current"
    />
    <div v-if="check.results.length > 0" slot="preview">
      <div
        v-if="isImage(file.type)"
        class="overflow-auto w-full"
        style="height: 720px;"
      >
        <img :src="file.url" />
      </div>
      <Prism
        v-else-if="isText(file.type)"
        style="height: 720px; overflow-x: auto"
        :language="extensionToLanguage[file.type]"
        >{{ getFileContent(file.relativePath) }}</Prism
      >
      <embed
        v-else-if="file.type === 'pdf'"
        scale="tofit"
        width="100%"
        height="720px"
        :src="file.url"
      />
      <div
        v-else
        class="flex flex-col w-full border rounded justify-center items-center"
        style="height: 720px;"
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
          <path
            d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
          />
          <polyline points="13 2 13 9 20 9" />
        </svg>
        <span class="mt-3 text-lg text-gray-700"
          >This file can't be embedded.</span
        >
      </div>
    </div>
  </CheckResult>
</template>

<script>
import 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-makefile';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import Prism from 'vue-prism-component';

import CheckResult from './CheckResult.vue';
import CheckPagination from './CheckPagination.vue';
import CheckDetails from './CheckDetails.vue';

export default {
  name: 'FileCheck',

  components: {
    CheckResult,
    CheckPagination,
    CheckDetails,
    Prism,
  },

  props: {
    check: Object,
  },

  data() {
    return {
      pagination: {
        current: 1,
        total: this.check.results.length,
      },
      extensionToLanguage: {
        txt: 'none',
        md: 'markdown',
        c: 'c',
        cpp: 'cpp',
        cs: 'csharp',
        h: 'cpp',
        hpp: 'cpp',
        makefile: 'makefile',
        java: 'java',
        py: 'python',
        html: 'markup',
        css: 'css',
        js: 'javascript',
        json: 'json',
        xml: 'markup',
        svg: 'markup',
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
      return this.check.results.map(result => {
        return result.relativePath;
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

<style lang="scss">
pre[class*='language-'] {
  border-radius: 0;
  box-shadow: none;
  border: 2px solid hsl(0, 0%, 10%);
  margin: 0;
}

pre[class*='language-'],
code[class*='language-'] {
  @apply font-mono;
  font-size: 14px;

  @screen md {
    font-size: 1em;
  }
}
</style>
