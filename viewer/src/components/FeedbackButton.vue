<template>
  <Button :color="color" @click="$emit('click', $event)">
    {{ currentLabel }}
  </Button>
</template>

<script>
import Button from './Button.vue';

export default {
  name: 'FeedbackButton',

  components: {
    Button,
  },

  props: {
    color: String,
    label: String,
  },

  data() {
    return {
      currentLabel: this.label,
    };
  },

  beforeDestroy() {
    if (this.labelTimeout) {
      clearTimeout(this.labelTimeout);
      this.labelTimeout = undefined;
    }
  },

  methods: {
    setLabel(label) {
      this.currentLabel = label;

      if (this.labelTimeout) {
        clearTimeout(this.labelTimeout);
        this.labelTimeout = undefined;
      }

      this.labelTimeout = setTimeout(() => {
        this.currentLabel = this.label;
        this.labelTimeout = undefined;
      }, 2000);
    },
  },
};
</script>
