<script>
export default {
  name: 'DevItem',
  props: {
    items: {
      type: Object,
      default: () => {},
    },
    productList: {
      type: Array,
      default: () => [],
    },
    groupList: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    /* 翻译分组名称 */
    getGroupName(id) {
      return function (id) {
        let name = ''
        for (const item of this.groupList) {
          if (item.id == id) {
            name = item.groupName
            break
          }
        }
        return name
      }
    },
    /* 翻译产品属性 */
    getProductDes(type, id) {
      return function (type, id) {
        let des = ''
        for (const item of this.productList) {
          if (item.id == id) {
            switch (type) {
              case 'token':
                des = item.token
                break
              case 'name':
                des = item.name
                break
              case 'img':
                des = this.filePrefix + item.imageUrl
                break
              default:
            }
            break
          }
        }
        return des
      }
    },
  },
  created() {
    this.getPrefix()
  },
  methods: {
    toDetail(productId, id, code) {
      this.$emit('detail', { productId, id, code })
    },
    delFn(item) {
      this.$emit('delete', item)
    },
  },
}
</script>

<template>
  <div class="dev-item">
    <div class="btns">
      <el-tag
        size="mini"
        plain
        type="primary"
        @click="toDetail(items.productId, items.id, items.code)"
      >
        <i class="el-icon-s-tools" style="font-weight: 400" />
      </el-tag>
      <el-tag
        plain
        size="mini"
        type="primary"
        @click="delFn(items)"
      >
        <i class="el-icon-delete" />
      </el-tag>
    </div>
    <div class="base-info">
      <el-col :span="7">
        <!-- <img :src="item.imageUrl" style="height: 40px; min-height: 40px; max-width: 100%;"> -->
        <el-popover placement="right" trigger="click">
          <img
            :src="
              items.imageUrl
                ? filePrefix + items.imageUrl
                : getProductDes('img', items.productId)
            "
            style="height: 150px"
          >
          <img
            slot="reference"
            :src="
              items.imageUrl
                ? filePrefix + items.imageUrl
                : getProductDes('img', items.productId)
            "
            style="height: 40px; min-height: 40px; max-width: 100%"
          >
        </el-popover>
      </el-col>
      <el-col :span="12">
        <div style="font-size: 13px; white-space: nowrap">
          {{ items.name }}
        </div>
      </el-col>
      <el-col
        :span="5"
        class="third-col"
        style="text-align: right"
      >
        <el-tag
          v-if="items.state === -1 || (!items.state && items.state !== 0)"
          effect="plain"
          type="warning"
        >
          未发布
        </el-tag>
        <el-tag
          v-if="items.state === 0"
          effect="plain"
          type="warning"
        >
          未激活
        </el-tag>
        <el-tag
          v-if="items.state === 1"
          effect="plain"
          type="danger"
        >
          离线
        </el-tag>
        <el-tag
          v-if="items.state === 2"
          effect="plain"
          type="success"
        >
          在线
        </el-tag>
        <el-tag
          v-if="items.state === 3"
          effect="plain"
          type="warning"
        >
          报警
        </el-tag>
      </el-col>
    </div>
    <div class="more-info">
      <div class="moreInfo-row">
        <span class="row-con">产品型号: {{ getProductDes("token", items.productId) }}</span>
      </div>
      <div class="moreInfo-row">
        <span class="row-con">终端编码: {{ items.code }}</span>
      </div>
      <div class="moreInfo-row">
        <span class="row-con">终端分组: {{ getGroupName(items.groupId) }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scpoed>
.dev-item {
  margin: 0 6px;
  width: calc((100% - 48px) / 4);
  height: 182px;
  box-sizing: border-box;
  border: 1px solid var(--ky-border-color);
  border-radius: 6px;
  padding: 10px;
  margin-top: 10px;
  background: #fff;
  overflow: hidden;

  &:nth-child(-n + 4) {
    margin-top: 0;
  }

  .base-info {
    display: flex;
    align-items: center;
    padding-top: 10px;
    .third-col {
      .el-tag {
        padding: 0;
        border: none;
        height: 0;
        line-height: 0;
        font-size: 13px;
        font-weight: bold;
      }
    }
  }

  .more-info {
    margin-top: 12px;

    & > div:nth-child(2) {
      padding: 10px 0;
    }
    .moreInfo-row {
      display: flex;
      .row-con {
        flex: 1;
        white-space: nowrap;
        max-width: 100px;
        text-overflow: ellipsis;
      }
    }
  }

  .btns {
    position: relative;
    display: flex;
    justify-content: flex-start;
    width: 100%;
    padding-bottom: 6px;
    &::before {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      height: 1px;
      width: 100%;
      background-color: var(--ky-border-color);
    }

    .el-tag {
      margin-right: 8px;
      i {
        font-weight: bold;
      }
    }
  }
}
</style>
