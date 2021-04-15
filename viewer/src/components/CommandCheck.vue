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
      :expanded.sync="sidebarExpanded"
    />
    <div v-if="check.result" slot="preview">
      <pre
        class="overflow-auto w-full language-plain"
        style="min-height: 400px; max-height: 720px; margin: 0"
        v-html="output"
      ></pre>
    </div>
  </CheckResult>
</template>

<script>
import CheckResult from './CheckResult.vue';
import CheckDetails from './CheckDetails.vue';

export default {
  name: 'CommandCheck',

  components: {
    CheckResult,
    CheckDetails,
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
    successful() {
      return this.check.result && this.check.result.exitCode === 0;
    },

    details() {
      const details = [
        {
          label: 'Command',
          values: [this.check.config.command],
        },
        {
          label: 'Directory',
          values: [this.check.config.directory || '.'],
        },
        {
          label: 'Input File',
          values: [this.check.config.input || '(none)'],
        },
      ];

      if (this.check.config.runInCygwin) {
        details.unshift({
          label: 'Cygwin',
          values: ['true'],
        });
      }

      if (this.check.result) {
        details.push({
          label: 'Exit code',
          values: [this.check.result.exitCode],
        });
      }

      return details;
    },

    output() {
      if (!this.check.result) {
        return '';
      }

      const { result, output: outputText, config } = this.check;

      const directoryIndicator = `<span class="token string">${result.directory}</span>`;
      const prompt = `<span class="token keyword">&gt;</span> ${
        config.command
      } ${config.input ? '< ' + config.input : ''}`;
      const output = `<span class="token ${
        this.successful ? '' : 'deleted'
      }">${outputText}</span>`;
      return directoryIndicator + '\n' + prompt + '\n' + output;
    },
  },
};
</script>
