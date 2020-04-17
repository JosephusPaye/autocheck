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

/*
const a = `
2-S 3-S 4-S 5-S 6-S 7-S 8-S 9-S 10-S J-S Q-S K-S A-S 2-H 3-H 4-H 5-H 6-H 7-H 8-H 0-H 10-H J-H Q-H K-H A-H 2-C 3-C 4-C 5-C 6-C 7-C 8-C 9-C 10-C J-C Q-C K-C A-C 2-D 3-D 4-D 5-D 6-D 7-D 8-D 9-D 10-D J-D Q-D K-D A-D
8-S 3-C 2-D A-D 2-C 7-H K-S 6-S J-H A-H 4-S 4-H 10-H Q-S 9-C 10-S 2-H 6-C 5-S D-D J-S 4-C 10-D A-D K-H 3-S 8-H 5-H 10-C 9-D Q-H 8-D 6-H 3-H J-D 7-S 7-D 5-C Q-C 7-C 3-D K-C J-C 9-J 9-S A-S 8-C 4-D 5-D 6-D K-D 2-S
11 15 38 23
52
-1 -1 36 21
50
`.trim();

const b = `
2-S 3-S 4-S 5-S 6-S 7-S 8-S 9-S 10-S J-S Q-S K-S A-S 2-H 3-H 4-H 5-H 6-H 7-H 8-H 0-H 10-H J-H Q-H K-H A-H 2-C 3-C 4-C 5-C 6-C 7-C 8-C 9-C 10-C J-C Q-C K-C A-C 2-D 3-D 4-D 5-D 6-D 7-D 8-D 9-D 10-D J-D Q-D K-D A-D
    8-S 3-C 2-D A-D 2-C 7-H K-S 6-S J-H A-H 4-S 4-H 10-H Q-S 9-C 10-S 2-H 6-C 5-S D-D J-S 4-C 10-D A-D K-H 3-S 8-H 5-H 10-C 9-D Q-H 8-D 6-H 3-H J-D 7-S 7-D 5-C Q-C 7-C 3-D K-C J-C 9-J 9-S A-S 8-C 4-D 5-D 6-D K-D 2-S
11 15 38 23
52
-1 -1 36 21
99
`.trim();
*/

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
