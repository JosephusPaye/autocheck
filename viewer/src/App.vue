<template>
  <div id="app">
    <component
      :is="checkToComponent[check.type]"
      :key="i"
      :check="check"
      v-for="(check, i) in report.checks"
    />
  </div>
</template>

<script>
import EmbedCheck from './components/EmbedCheck.vue';

export default {
  name: 'App',

  components: {
    EmbedCheck,
  },

  data() {
    return {
      report: window.autocheckReport,
      checkToComponent: {
        embed: 'EmbedCheck',
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
