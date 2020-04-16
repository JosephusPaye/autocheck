<template>
  <CheckResult
    :label="check.config.label"
    :status="successful ? 'passed' : 'failed'"
  >
    <CheckDetails slot="meta" :type="check.config.type" :details="details" />
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
        {
          label: 'Exit code',
          values: [this.check.result.exitCode],
        },
      ];
      if (this.check.config.runInCygwin) {
        details.unshift({
          label: 'Cygwin',
          values: ['true'],
        });
      }
      return details;
    },

    output() {
      const directoryIndicator = `<span class="token string">${this.check.result.directory}</span>`;
      const prompt = `<span class="token keyword">&gt;</span> ${
        this.check.config.command
      } ${this.check.config.input ? '< ' + this.check.config.input : ''}`;
      const output = `<span class="token ${this.successful ? '' : 'deleted'}">${
        this.check.result.output
      }</span>`;
      return directoryIndicator + '\n' + prompt + '\n' + output;
    },
  },
};
</script>
