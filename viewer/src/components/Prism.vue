<template>
  <VuePrism :language="extensionToLanguage[fileExtension]">{{ code }}</VuePrism>
</template>

<script>
import 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-makefile';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import VuePrism from 'vue-prism-component';

export default {
  name: 'Prism',

  components: {
    VuePrism,
  },

  props: {
    fileExtension: String,
    code: String,
  },

  data() {
    return {
      extensionToLanguage: {
        txt: undefined, // no highlighting
        md: 'markdown',
        c: 'c',
        cpp: 'cpp',
        cs: 'csharp',
        h: 'cpp',
        hpp: 'cpp',
        makefile: 'makefile',
        java: 'java',
        py: 'python',
        html: 'markup',
        css: 'css',
        js: 'javascript',
        json: 'json',
        xml: 'markup',
        svg: 'markup',
      },
    };
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
  font-size: 14px !important;
}
</style>
