<template>
  <div class="flex flex-col">
    <div class="flex mb-2">
      <div>
        <FeedbackButton ref="copyExpectedButton" @click="copyExpected" label="Copy expected" />
        <FeedbackButton
          class="ml-1"
          ref="copyActualButton"
          @click="copyActual"
          label="Copy actual"
        />
      </div>
      <div class="ml-auto">
        <ToggleButton id="line-by-line" :value.sync="display">Unified</ToggleButton>
        <ToggleButton id="side-by-side" :value.sync="display">Split</ToggleButton>
      </div>
    </div>
    <div v-html="diff"></div>
  </div>
</template>

<script>
import { createPatch } from 'diff';
import { parse as parseDiff, html as generateHtml } from 'diff2html';
import FeedbackButton from './FeedbackButton.vue';
import ToggleButton from './ToggleButton.vue';

export default {
  name: 'Diff',

  components: {
    FeedbackButton,
    ToggleButton,
  },

  props: {
    textA: String,
    textB: String,
    context: {
      type: Number,
      default: 5,
    },
    level: {
      type: String,
      default: 'word',
    },
  },

  data() {
    return {
      display: 'line-by-line',
    };
  },

  computed: {
    diff() {
      const patch = createPatch('', this.textA, this.textB, '', '', {
        context: this.context,
      });
      const parsed = parseDiff(patch);
      return generateHtml(parsed, {
        outputFormat: this.display,
        diffStyle: this.level,
        drawFileList: false,
      });
    },
  },

  methods: {
    copyExpected() {
      this.copy(this.textA)
        .then(() => {
          this.$refs.copyExpectedButton?.setLabel('Copied!');
        })
        .catch(e => {
          this.$refs.copyExpectedButton?.setLabel('Copy failed');
          console.error(e);
        });
    },

    copyActual() {
      this.copy(this.textB)
        .then(() => {
          this.$refs.copyActualButton?.setLabel('Copied!');
        })
        .catch(e => {
          this.$refs.copyActualButton?.setLabel('Copy failed');
          console.error(e);
        });
    },

    copy(text) {
      return navigator.clipboard.writeText(text);
    },
  },
};
</script>

<style lang="scss">
.d2h-file-header {
  display: none;
}

.d2h-file-wrapper {
  border-radius: 0 !important;
}

.d2h-code-linenumber {
  border-left: none !important;
}
</style>
