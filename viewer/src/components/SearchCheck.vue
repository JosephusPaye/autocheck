<template>
  <CheckResult
    :label="check.config.label"
    :status="check.status"
    :sidebarExpanded="sidebarExpanded"
  >
    <CheckDetails
      slot="meta"
      :type="check.config.type"
      :details="details"
      :expanded.sync="sidebarExpanded"
    >
      <FileTree
        :label="`Search results (${results.list.length})`"
        :items="results.tree"
        labelEmpty="No matches found"
        :selectedItemIndex="pagination.current - 1"
        @select="onResultSelect"
      />
    </CheckDetails>
    <CheckPagination
      v-if="results.list.length > 1"
      slot="actions"
      :total="results.list.length"
      :current.sync="pagination.current"
    />
    <div v-if="results.list.length > 0" slot="preview">
      <div v-if="isImage(file.type)" class="overflow-auto w-full" style="height: 800px;">
        <img :src="file.url" />
      </div>
      <Prism
        v-else-if="isText(file.type)"
        style="height: 800px; overflow-x: auto"
        :fileExtension="file.type"
        :code="getFileContent(file.relativePath)"
        :highlightLines="fileHighlights"
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
    <div
      v-else
      slot="preview"
      class="flex flex-col w-full border rounded justify-center items-center p-5 h-full"
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
        class="text-green-500"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span class="mt-3 text-lg text-gray-700"
        >{{ passWhenFound ? 'Patterns found' : 'Patterns not found' }}
      </span>
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
  name: 'SearchCheck',

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
      },
    };
  },

  computed: {
    results() {
      const list = [];

      let index = 0;
      const tree = this.check.results.map((result, resultIndex) => {
        return {
          value: result.relativePath + ` (${result.matches.length})`,
          children: result.matches.map(match => {
            const child = {
              value: match.text,
              context: match.context,
              line: match.line,
              lineSpan: match.lineSpan,
              offset: match.offset,
              result,
              resultIndex,
              index: index++,
            };

            list.push(child);

            return child;
          }),
        };
      });

      return { list, tree };
    },

    file() {
      return this.results.list[this.pagination.current - 1]?.result;
    },

    fileHighlights() {
      const result = this.results.list[this.pagination.current - 1];

      if (result) {
        const firstLine = result.line;

        return result.lineSpan > 1
          ? `${firstLine}-${firstLine + result.lineSpan - 1}`
          : String(firstLine);
      }

      return '';
    },

    details() {
      const details = [
        {
          label: 'Patterns',
          values: this.check.config.patterns,
        },
        {
          label: 'File patterns',
          values: this.check.config.filePatterns,
        },
        {
          label: 'Match case',
          values: [String(this.check.config.matchCase ?? false)],
        },
        {
          label: 'Match regex',
          values: [String(this.check.config.matchAsRegex ?? false)],
        },
        {
          label: 'Pass when',
          values: [this.check.config.passWhen ?? 'found'],
        },
      ];

      if (this.check.error) {
        details.push({
          label: 'Error',
          values: [this.check.error],
        });
      }

      return details;
    },

    passWhenFound() {
      return (this.check.config.passWhen ?? 'found') === 'found';
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
