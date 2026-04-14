<script>
export default {
  name: 'ProductItem',
  props: {
    items: {
      type: Object,
      default: () => {},
    },
  },
  created() {
    this.getPrefix()
  },
  methods: {
    toDetailClick(id) {
      this.$emit('detail', id)
    },

    delClick(item) {
      this.$emit('delete', item)
    },
  },
}
</script>

<template>
  <div class="product-item">
    <div class="btns">
      <el-tag
        size="mini"
        type="primary"
        @click="toDetailClick(items.id)"
      >
        <i class="el-icon-s-tools" style="font-weight: 400" />
      </el-tag>
      <el-tag
        plain
        type="primary"
        size="mini"
      >
        <i class="el-icon-download" style="font-weight: 400" />
      </el-tag>
      <el-tag
        plain
        type="danprimaryger"
        size="mini"
        @click="delClick(items)"
      >
        <i class="el-icon-delete" style="font-weight: 400" />
      </el-tag>
    </div>
    <div class="prodect-block">
      <div class="product-info">
        <el-popover placement="right" trigger="click">
          <el-image
            lazy
            :src="`${filePrefix + items.imageUrl}?t=${Math.random()}`"
            fit="fill"
            style="height: 150px"
          />
          <el-image
            slot="reference"
            class="image"
            lazy
            fit="contain"
            :src="`${filePrefix + items.imageUrl}?t=${Math.random()}`"
            style="height: 60px; min-height: 60px; max-width: 100%"
          >
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline" />
            </div>
          </el-image>
        </el-popover>
        <div class="product-name">
          <div class="text-name">
            {{ items.name }}
          </div>
          <div class="text-name">
            {{ items.token }}
          </div>
        </div>
      </div>

      <div class="more-info">
        <div class="more-info-item">
          <div>设备数量</div>
          <el-tag size="mini">
            {{ items.deviceCount }}
          </el-tag>
        </div>
        <div class="more-info-item">
          <div>发布状态</div>
          <el-tag v-if="items.state == -1" size="mini">
            未发布
          </el-tag>
          <el-tag
            v-if="items.state == 0"
            size="mini"
            type="danger"
          >
            停用
          </el-tag>
          <el-tag
            v-if="items.state == 1"
            size="mini"
            type="success"
          >
            启用
          </el-tag>
        </div>
        <div class="more-info-item">
          <div>产品类型</div>
          <el-tag size="mini">
            {{
              $dictUtils.getDictLabel("product_type", items.type)
            }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.product-item {
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
  .image-slot {
    background-color: var(--ky-themebg-hover);
    width: 100%;
    height: 100%;
  }
  .prodect-block {
    padding-top: 10px;

    .product-info {
      display: flex;
      align-items: flex-start;
      .image {
        width: 62px;
        height: 62px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
        border-radius: 4px;
      }

      // 模块阴影
      .base-info {
        .sec-col {
          & > div {
            margin-bottom: 4px;
          }
        }
      }

      .product-name {
        padding-top: 6px;
        .text-name {
          font-weight: 500;
          margin-bottom: 6px;
        }
      }
    }

    .more-info {
      padding-top: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;

        & > div:first-child {
          margin-bottom: 8px;
        }

        &:nth-child(-n + 2) {
          &::before {
            content: "";
            width: 1px;
            height: 100%;
            position: absolute;
            top: 50%;
            right: 0;
            z-index: 99;
            background: var(--ky-border-color);
            transform: translateY(-50%);
          }
        }
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
