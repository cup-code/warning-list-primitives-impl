<script>
import BaseInfo from '@/components/Detail/Product/BaseInfo'
import Command from '@/components/Detail/Product/Command'
import Extend from '@/components/Detail/Product/Extend'
import Point from '@/components/Detail/Product/Point'
import { editProductState, getInfoById } from '@/http/dev/product-api'

export default {
  components: {
    BaseInfo,
    Point,
    Command,
    Extend,
  },
  data: () => ({
    isLoading: false,
    productId: '', // 由路由传递进来的产品id
    baseInfo: {}, // 接口获得的基础信息
  }),
  created() {
    this.productId = this.$route.params.id
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.isLoading = true
      getInfoById(this.productId)
        .then((res) => {
          if (res.data.success)
            this.baseInfo = res.data.result || {}
          else this.$message.error(res.data.message || '获取 基础信息 失败')
        })
        .catch((err) => {
          this.$message.error('获取 基础信息 出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    ableFn(v) {
      this.loading = true
      editProductState(this.productId, v)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || '修改成功')
            this.getDataList()
          }
          else {
            this.$message.error(msg || '修改失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('修改失败')
        })
    },
    changeFn() {
      this.getDataList()
    },
    backFn() {
      this.$router.back(-1)
    },
  },
}
</script>

<template>
  <div class="product-detail">
    <ECard>
      <!-- 返回按钮 -->
      <EButton
        class="button-back"
        type="text"
        size="mini"
        btnIcon="el-icon-arrow-left"
        @click="backFn"
      >
        返回
      </EButton>
      <div class="mb-3 mt-2 pl-3">
        <div class="pb-1 text-sm font-medium">
          基础信息
        </div>
        <div class="card-con flex items-center px-3">
          <span>产品 :</span>
          <span class="pro-name">{{ baseInfo.name }}</span>
          <div class="pl-3">
            <EButton
              v-if="baseInfo.state === -1 || (!baseInfo.state && baseInfo.state !== 0)"
              type="warning"
              :loading="isLoading"
              @click="ableFn(1)"
            >
              未发布
            </EButton>
            <EButton
              v-if="baseInfo.state === 0"
              type="success"
              :loading="isLoading"
              @click="ableFn(1)"
            >
              点击启用
            </EButton>
            <EButton
              v-if="baseInfo.state === 1"
              type="danger"
              :loading="isLoading"
              @click="ableFn(0)"
            >
              点击停用
            </EButton>
          </div>
        </div>
      </div>
    </ECard>

    <ECard customStyle="padding:8px 16px 10px">
      <el-tabs>
        <el-tab-pane label="基础属性">
          <base-info
            :pid="productId"
            :baseInfo="baseInfo"
            @change="changeFn"
          />
        </el-tab-pane>
        <el-tab-pane label="测点属性">
          <point :pid="productId" />
        </el-tab-pane>
        <!-- <el-tab-pane label="命令属性">
                <command :pid="productId" />
            </el-tab-pane> -->
        <el-tab-pane label="扩展属性">
          <extend :pid="productId" />
        </el-tab-pane>
        <!-- <el-tab-pane label="连接属性">
                正在开发中...
            </el-tab-pane> -->
      </el-tabs>
    </ECard>
  </div>
</template>

<style lang="scss" scoped>
.product-detail {
  padding: 10px;
  position: relative;
  .top-card {
    margin-bottom: 2vh;
    .el-card__body {
      padding: 0;
      .card-title {
        background: #f5f7fa;
        padding: 10px;
        font-size: 14px;
        font-weight: 500;
      }
      .card-con {
        position: relative;

        padding: 20px;
        .pro-name {
          padding-left: 6px;
          padding-right: 12px;
        }
        .back-btn {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }
  }
}
</style>
