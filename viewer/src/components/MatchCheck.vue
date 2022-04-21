<template>
  <CheckResult :check="check" :sidebarExpanded="sidebarExpanded">
    <CheckDetails
      slot="meta"
      :type="check.config.type"
      :details="details"
      :error="check.status === 'failed' ? check.error : undefined"
      :expanded.sync="sidebarExpanded"
    />
    <div slot="preview" v-if="check.actual">
      <Diff
        v-if="check.status === 'failed'"
        :textA="check.expected"
        :textB="check.actual"
        :context="10"
      />
      <div v-else class="flex flex-col">
        <div class="mb-2">✅ Actual matches expected</div>
        <pre
          class="overflow-auto w-full language-plain"
          style="min-height: 400px; max-height: 800px; margin: 0"
          v-html="check.actual"
        ></pre>
      </div>
    </div>
  </CheckResult>
</template>

<script>
import CheckResult from './CheckResult.vue';
import CheckDetails from './CheckDetails.vue';
import Diff from './Diff.vue';

export default {
  name: 'MatchCheck',

  components: {
    CheckResult,
    CheckDetails,
    Diff,
  },

  props: {
    check: Object,
  },

  data() {
    return {
      sidebarExpanded: true,
    };
  },

  computed: {
    details() {
      return [
        {
          label: 'Expected',
          values: [this.check.config.expected],
        },
        {
          label: 'Actual',
          values: [this.check.config.actual],
        },
        {
          label: 'Matches',
          values: [this.check.status === 'passed'],
        },
      ];
    },
  },
};
</script>

<style lang="scss">
.d2h-info {
  height: 8px !important;
  line-height: 0 !important;
  visibility: hidden;
}

.d2h-file-wrapper {
  margin: 0 !important;
}
</style>
