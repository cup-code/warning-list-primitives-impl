<script>
import RightMenu from '@/components/RightMenu'
import Logo from './Logo'
import TbMenu from './TbMenu'

export default {
  components: {
    Logo,
    TbMenu,
    RightMenu,
  },
}
</script>

<template>
  <div class="navbar">
    <logo />
    <tb-menu />
    <right-menu />
  </div>
</template>
