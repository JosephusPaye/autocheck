<template>
  <CheckResult
    :label="check.config.label"
    :status="check.results.length > 0 ? 'passed' : 'failed'"
  >
    <CheckDetails
      slot="meta"
      resultLabel="Matching files"
      resultLabelEmpty="No matching files found"
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
        v-else-if="isCode(file.type)"
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
    </div>
  </CheckResult>
</template>

<script>
import 'prismjs';
import 'prismjs/components/prism-makefile';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
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
        c: 'c',
        cpp: 'cpp',
        hpp: 'cpp',
        h: 'cpp',
        makefile: 'makefile',
        java: 'java',
        md: 'markdown',
        txt: 'markdown',
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

    isCode(extension) {
      return ['txt', 'md', 'c', 'cpp', 'h', 'hpp', 'makefile', 'java'].includes(
        extension
      );
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
