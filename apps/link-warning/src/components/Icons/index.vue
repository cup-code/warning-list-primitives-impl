<script>
import elementIcons from './element-icons'
import svgIcons from './svg-icons'

export default {
  name: 'Icons',
  data() {
    return {
      svgIcons,
      elementIcons,
    }
  },
  methods: {
    generateIconCode(symbol) {
      return symbol
    },
    generateElementIconCode(symbol) {
      return `el-icon-${symbol}`
    },
    choose(text) {
      this.$emit('choose', text)
    },
  },
}
</script>

<template>
  <div class="icons-container">
    <el-tabs>
      <el-tab-pane label="Element-UI Icons">
        <div class="grid">
          <div
            v-for="item of elementIcons"
            :key="item"
            @click="choose(generateElementIconCode(item))"
          >
            <div class="icon-item">
              <i :class="`el-icon-${item}`" />
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Icons">
        <div class="grid">
          <div
            v-for="item of svgIcons"
            :key="item"
            @click="choose(generateIconCode(item))"
          >
            <div class="icon-item">
              <svg-icon
                :icon-class="item"
                class-name="disabled"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.icons-container {
  overflow: hidden;

  .grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  }

  .icon-item {
    height: 50px;
    text-align: center;
    float: left;
    font-size: 30px;
    color: #24292e;
    cursor: pointer;
  }

  span {
    display: block;
    font-size: 16px;
    margin-top: 10px;
  }

  .disabled {
    pointer-events: none;
  }
}
</style>
