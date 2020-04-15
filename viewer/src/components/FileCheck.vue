<template>
  <CheckResult :label="check.config.label" :status="check.results.length > 0 ? 'passed' : 'failed'">
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
      v-if="check.results.length > 0"
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
      <img v-if="file.type === 'image'" :src="file.url" />
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
import CheckResult from './CheckResult.vue';
import CheckPagination from './CheckPagination.vue';
import CheckDetails from './CheckDetails.vue';

export default {
  name: 'FileCheck',

  components: {
    CheckResult,
    CheckPagination,
    CheckDetails,
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
  },
};
</script>
