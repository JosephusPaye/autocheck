<template>
  <pre
    :class="preClass"
    :data-line="highlightLines"
  ><code ref="code" :class="codeClass"></code><slot></slot></pre>
</template>

<script>
const Prism = require('prismjs');
require('prismjs/components/prism-markdown');
require('prismjs/components/prism-c');
require('prismjs/components/prism-cpp');
require('prismjs/components/prism-csharp');
require('prismjs/components/prism-makefile');
require('prismjs/components/prism-java');
require('prismjs/components/prism-python');
require('prismjs/components/prism-markup');
require('prismjs/components/prism-css');
require('prismjs/components/prism-javascript');
require('prismjs/components/prism-json');

require('prismjs/plugins/line-numbers/prism-line-numbers');
require('prismjs/plugins/line-highlight/prism-line-highlight');

export default {
  props: {
    language: {
      type: String,
      default: 'javascript',
    },
    code: {
      type: String,
      default: '',
    },
    showLineNumbers: {
      type: Boolean,
      default: true,
    },
    highlightLines: {
      type: String,
      default: undefined,
    },
  },

  computed: {
    preClass() {
      return {
        'line-numbers': this.showLineNumbers,
      };
    },

    codeClass() {
      return {
        [`language-${this.language}`]: true,
      };
    },
  },

  methods: {
    render() {
      this.$nextTick(() => {
        this.$refs.code.textContent = this.code;
        Prism.highlightElement(this.$refs.code);
      });
    },
  },

  mounted() {
    this.render();
  },

  watch: {
    code() {
      this.render();
    },

    language() {
      this.render();
    },

    showLineNumbers() {
      this.render();
    },

    highlightLines() {
      this.render();
    },
  },
};
</script>
