<script>
export default {
  name: 'Second',
  computed: {
    key() {
      return this.$route.path
    },
  },
}
</script>

<template>
  <section class="app-main">
    <transition
      name="fade-transform"
      mode="out-in"
    >
      <router-view :key="key" />
    </transition>
  </section>
</template>
