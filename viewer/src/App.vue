<template>
  <div id="app" style="padding-top: 60px;">
    <div class="bg-gray-900 text-white w-full fixed top-0 z-10">
      <div class="container mx-auto px-4 py-3 text-2xl flex justify-between">
        <div>{{ report.title }} – Autocheck report</div>
        <div class="relative">
          <Button color="dark" @click="expandAll">Expand all</Button>
          <Button color="dark" class="ml-1" @click="collapseAll">Collapse all</Button>
          <Button color="dark" class="ml-1" @click="toggleJumpMenu" ref="jumpMenuToggle"
            >Jump to…</Button
          >
          <div
            v-show="showJumpMenu"
            class="jump-menu"
            tabindex="-1"
            ref="jumpMenu"
            @click="showJumpMenu = false"
            @keydown.esc="toggleJumpMenu"
          >
            <a
              v-for="item in tableOfContents"
              :key="item.id"
              :href="'#' + item.id"
              @click="expand(item)"
            >
              <span
                :class="{
                  'bg-red-500': item.status === 'failed',
                  'bg-green-500': item.status === 'passed',
                  'bg-gray-400': item.status === 'skipped',
                }"
              ></span>
              <span class="">{{ item.label }}</span></a
            >
          </div>
        </div>
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
import Button from './components/Button.vue';
import FileCheck from './components/FileCheck.vue';
import CommandCheck from './components/CommandCheck.vue';
import MatchCheck from './components/MatchCheck.vue';
import SearchCheck from './components/SearchCheck.vue';

export default {
  name: 'App',

  components: {
    Button,
    FileCheck,
    CommandCheck,
    MatchCheck,
    SearchCheck,
  },

  data() {
    const report = window.autocheckReport || {
      title: 'Untitled',
      checks: [],
    };
    return {
      report: {
        title: report.title,
        checks: report.checks.map((check, index) => {
          return {
            ...check,
            id: 'check-' + String(index + 1).padStart(2, '0'),
            expanded: index === 0, // expand the first check by default
          };
        }),
      },
      checkToComponent: {
        file: 'FileCheck',
        command: 'CommandCheck',
        match: 'MatchCheck',
        search: 'SearchCheck',
      },
      showJumpMenu: false,
    };
  },

  computed: {
    tableOfContents() {
      return this.report.checks.map((check, index) => {
        return {
          id: check.id,
          index: index,
          label: check.config.label,
          status: check.status,
        };
      });
    },
  },

  methods: {
    toggleJumpMenu() {
      this.showJumpMenu = !this.showJumpMenu;

      if (this.showJumpMenu) {
        this.$nextTick(() => {
          this.$refs.jumpMenu.focus();
        });
      } else {
        this.$refs.jumpMenuToggle.$el.focus();
      }
    },

    expand(item) {
      if (this.report.checks[item.index]) {
        this.report.checks[item.index].expanded = true;
      }
    },

    expandAll() {
      for (const check of this.report.checks) {
        check.expanded = true;
      }
    },

    collapseAll() {
      for (const check of this.report.checks) {
        check.expanded = false;
      }
    },
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

.jump-menu {
  @apply bg-white shadow-md rounded overflow-hidden absolute right-0 max-h-screen overflow-y-auto;
  top: 100%;
  width: 18rem;
  max-height: calc(100vh - 49px); // 49px = jump menu offset from top of the viewport

  a {
    @apply flex items-center w-full overflow-hidden truncate py-1 px-3 text-black text-base;

    &:hover,
    &:focus {
      @apply bg-blue-600 text-white;
    }

    span:first-child {
      @apply inline-block w-3 h-3 rounded-full flex-shrink-0 mr-3;
    }

    span:last-child {
      @apply flex-grow truncate;
    }
  }
}
</style>
