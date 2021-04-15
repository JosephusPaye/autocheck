<template>
  <div id="app" style="padding-top: 60px;">
    <div class="bg-gray-900 text-white w-full fixed top-0">
      <div class="container mx-auto px-4 py-3 text-2xl">{{ report.title }} – Autocheck report</div>
    </div>
    <component
      :is="checkToComponent[check.config.type]"
      :key="i"
      :check="check"
      v-for="(check, i) in report.checks"
    />
  </div>
</template>

<script>
import FileCheck from './components/FileCheck.vue';
import CommandCheck from './components/CommandCheck.vue';
import MatchCheck from './components/MatchCheck.vue';

export default {
  name: 'App',

  components: {
    FileCheck,
    CommandCheck,
    MatchCheck,
  },

  data() {
    const report = window.autocheckReport || {
      title: 'Untitled',
      checks: [],
    };
    return {
      report: {
        title: report.title,
        checks: report.checks,
      },
      checkToComponent: {
        file: 'FileCheck',
        command: 'CommandCheck',
        match: 'MatchCheck',
      },
    };
  },
};
</script>

<style lang="scss">
@import './assets/tailwind.css';
@import './assets/prism-okaidia.css';
@import './assets/prism-line-numbers.css';
@import './assets/prism-line-highlight.css';
@import './assets/diff2html.css';

body {
  color: rgba(0, 0, 0, 0.87);
}

.js-focus-visible :focus:not(.focus-visible) {
  outline: none;
}
</style>
