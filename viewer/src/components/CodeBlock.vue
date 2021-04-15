<template>
  <Prism :code="code" :language="extensionToLanguage[fileExtension]"></Prism>
</template>

<script>
import Prism from './Prism';

export default {
  name: 'CodeBlock',

  components: {
    Prism,
  },

  props: {
    fileExtension: String,
    code: String,
  },

  data() {
    return {
      extensionToLanguage: {
        txt: 'none', // no highlighting
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
