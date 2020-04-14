<template>
  <div>
    <div>{{ check.label }}</div>
    <pre>{{ JSON.stringify(check) }}</pre>
  </div>
</template>

<script>
export default {
  name: 'EmbedCheck',

  props: {
    check: Object,
  },
};
</script>
