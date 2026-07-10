<script>
export default {
  name: 'SearchItem',
  props: {
    isBoxSearch: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ip: '',
      name: '',
      mpName: '',
    }
  },
  methods: {
    onChange(id, e) {
      if (id === 'name') {
        this.name = e
      }

      if (id === 'ip') {
        this.ip = e
      }

      if (id === 'mpName') {
        this.mpName = e
      }
    },

    onReset() {
      this.name = ''
      this.ip = ''
      this.mpName = ''
      this.onSearch()
    },

    onSearch() {
      this.param = this.isBoxSearch ? { name: this.name, ip: this.ip } : { name: this.mpName }
      this.$emit('search', this.param)
    },
  },
}
</script>

<template>
  <div class="search">
    <div class="search_block">
      <template v-if="isBoxSearch">
        <div class="search-cell_items">
          <div class="items-label">
            盒子名称：
          </div>
          <el-input
            :value="name"
            clearable
            placeholder="请输入盒子名称"
            @input="onChange('name', $event)"
          />
        </div>
        <div class="search-cell_items">
          <div class="items-label">
            盒子ip：
          </div>
          <el-input
            :value="ip"
            clearable
            placeholder="请输入盒子ip"
            @input="onChange('ip', $event)"
          />
        </div>
      </template>
      <template v-else>
        <div class="search-cell_items">
          <div class="items-label">
            模型名称：
          </div>
          <el-input
            :value="mpName"
            clearable
            placeholder="请输入模型名称"
            @input="onChange('mpName', $event)"
          />
        </div>
      </template>
    </div>
    <div class="search_button--block">
      <el-button
        type="primary"
        icon="el-icon-search"
        size="mini"
        @click="onSearch"
      >
        查询
      </el-button>
      <el-button
        type="plain"
        size="mini"
        icon="el-icon-refresh-right"
        @click="onReset"
      >
        重置
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search {
  display: flex;
  align-items: center;

  &_block {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-right: 20px;
    min-width: 200px;

    .search-cell_items {
      display: flex;
      align-items: center;
      padding: 4px 0;
      margin-right: 6px;

      .items-label {
        width: 90px;
        color: #606266;
        text-align: right;
      }
    }
  }

  &_button--block {
    margin-left: 10px;
    display: flex;
  }
}
</style>
