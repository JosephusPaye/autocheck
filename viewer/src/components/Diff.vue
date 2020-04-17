<template>
  <div class="flex flex-col">
    <div class="ml-auto mb-2">
      <ToggleButton id="line-by-line" :value.sync="display"
        >Unified</ToggleButton
      >
      <ToggleButton id="side-by-side" :value.sync="display">Split</ToggleButton>
    </div>
    <div v-html="diff"></div>
  </div>
</template>

<script>
import { createPatch } from 'diff';
import { parse as parseDiff, html as generateHtml } from 'diff2html';
import ToggleButton from './ToggleButton.vue';

export default {
  name: 'Diff',

  components: {
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
};
</script>

<style lang="scss">
@import '~diff2html/bundles/css/diff2html.min.css';

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
