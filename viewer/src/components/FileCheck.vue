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
    <div
      v-if="check.results.length > 0"
      slot="preview"
      class="overflow-auto"
      style="height: 720px;"
    >
      <img v-if="isImage(file.type)" :src="file.url" />
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
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/components/prism-makefile';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-clike';
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
        c: 'clike',
        cpp: 'clike',
        hpp: 'clike',
        h: 'clike',
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

/*
 * purgecss keeps removing (some!) prism styles, even when ignored 😡.
 * So the following two blocks repeat the ones we actually use.
 */
.token.keyword,
.token.property,
.token.selector,
.token.constant,
.token.symbol,
.token.builtin {
  color: hsl(53, 89%, 79%);
}

.token.attr-name,
.token.attr-value,
.token.string,
.token.char,
.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string,
.token.variable,
.token.inserted {
  color: hsl(76, 21%, 52%);
}
</style>
