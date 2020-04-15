<template>
  <div id="app" style="padding-top: 60px;">
    <div class="bg-gray-900 text-white w-full fixed top-0">
      <div class="container mx-auto px-4 py-3 text-2xl">
        {{ report.title }} – Autocheck report
      </div>
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

export default {
  name: 'App',

  components: {
    FileCheck,
  },

  data() {
    return {
      report: window.autocheckReport || {
        title: 'Untitled',
        checks: [],
      },
      checkToComponent: {
        file: 'FileCheck',
      },
    };
  },
};
</script>

<style lang="scss">
@import './assets/tailwind.css';

body {
  color: rgba(0, 0, 0, 0.87);
}

.js-focus-visible :focus:not(.focus-visible) {
  outline: none;
}
</style>
