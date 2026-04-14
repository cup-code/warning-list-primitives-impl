<script>
import testPng from '@/assets/test.jpg'

export default {
  data: () => ({
    testPng,
    sForm: {
      pageNo: 1,
      pageSize: 12,
    },
    data: [
      {
        status: 1,
        title: '温湿度探测器默认名',
        name: '温湿度探测器',
        code: '988172sadad83123',
        group: '园区',
      },
      {
        status: 2,
        title: '园区温湿度探测器-02',
        name: '温湿度探测器1',
        code: '988172sadad83123',
        group: '园区1',
      },
      {
        status: 3,
        title: '园区温湿度探测器-03',
        name: '温湿度探测器2',
        code: '988172sadad83123',
        group: '园区2',
      },
      {
        status: 2,
        title: '园区温湿度探测器-04',
        name: '温湿度探测器3',
        code: '988172sadad83123',
        group: '园区3',
      },
      {
        status: 3,
        title: '温湿度探测器默认名01',
        name: '温湿度探测器',
        code: '988172sadad83123',
        group: '园区',
      },
      {
        status: 1,
        title: '园区温湿度探测器-05',
        name: '温湿度探测器1',
        code: '988172sadad83123',
        group: '园区1',
      },
      {
        status: 3,
        title: '园区温湿度探测器-06',
        name: '温湿度探测器2',
        code: '988172sadad83123',
        group: '园区2',
      },
      {
        status: 1,
        title: '园区温湿度探测器-07',
        name: '温湿度探测器3',
        code: '988172sadad83123',
        group: '园区3',
      },
      {
        status: 2,
        title: '温湿度探测器默认名02',
        name: '温湿度探测器',
        code: '988172sadad83123',
        group: '园区',
      },
      {
        status: 3,
        title: '园区温湿度探测器-08',
        name: '温湿度探测器1',
        code: '988172sadad83123',
        group: '园区1',
      },
      {
        status: 2,
        title: '园区温湿度探测器-09',
        name: '温湿度探测器2',
        code: '988172sadad83123',
        group: '园区2',
      },
      {
        status: 2,
        title: '园区温湿度探测器-10',
        name: '温湿度探测器3',
        code: '988172sadad83123',
        group: '园区3',
      },
    ],
    pageFlag: true,
    total: 0,
    drawer_sh: false,
  }),
  methods: {
    getDataList() {},
    pageCurFn(v) {
      this.sForm.pageNo = v
      this.getDataList()
    },
    // 查询产品 按钮
    searchFn() {
      this.drawer_sh = true
    },
    // 查询 按钮
    searchDoFn() {
      this.drawer_sh = false
    },
    // 跳转到详情
    toDetail(idx) {
      this.$router.push({
        path: `/detail/product/${idx}`,
      })
    },
  },
}
</script>

<template>
  <div class="publish-dev">
    <!-- 头部 -->
    <el-row>
      <el-col :span="14">
        <el-button
          icon="el-icon-upload"
          size="mini"
          type="primary"
        >
          快速导入
        </el-button>
        <el-button
          icon="el-icon-download"
          size="mini"
          type="success"
        >
          下载模板
        </el-button>
      </el-col>
      <el-col
        :span="10"
        style="text-align: right"
      >
        <el-button
          size="mini"
          type="primary"
          @click="searchFn"
        >
          查询设备
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 -->
    <el-row
      :gutter="10"
      class="mid-con"
    >
      <el-col
        v-for="(item, idx) in data"
        :key="idx"
        :span="6"
      >
        <el-card>
          <el-row class="base-info">
            <el-col :span="5">
              <img
                :src="testPng"
                style="width: 100%"
              >
            </el-col>
            <el-col :span="14">
              <div style="font-size: 13px">
                {{ item.title }}
              </div>
            </el-col>
            <el-col
              :span="5"
              class="third-col"
              style="text-align: right"
            >
              <el-tag
                v-if="item.status === 1"
                effect="plain"
                type="warning"
              >
                未激活
              </el-tag>
              <el-tag
                v-if="item.status === 2"
                effect="plain"
                type="danger"
              >
                离线
              </el-tag>
              <el-tag
                v-if="item.status === 3"
                effect="plain"
                type="success"
              >
                在线
              </el-tag>
            </el-col>
          </el-row>
          <el-row class="more-info">
            <el-col :span="21">
              <div>
                <span>产品名称: </span>
                <span>{{ item.name }}</span>
              </div>
              <div>
                <span>设备编码: </span>
                <span>{{ item.code }}</span>
              </div>
              <div>
                <span>设备分组: </span>
                <span>{{ item.group }}</span>
              </div>
            </el-col>
            <el-col
              v-if="item.status === 1"
              :span="3"
              class="tool"
            >
              <el-tag effect="plain">
                <i class="el-icon-s-tools" />
              </el-tag>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 页码 -->
    <el-row>
      <el-pagination
        v-if="pageFlag"
        style="text-align: right"
        :current-page="sForm.pageNo"
        :page-size="sForm.pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="pageCurFn"
      />
    </el-row>

    <!-- 查询 抽屉 -->
    <el-drawer
      :visible.sync="drawer_sh"
      :with-header="false"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        查询条件
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="sForm"
          :model="sForm"
          label-width="85px"
          size="mini"
        >
          <el-form-item
            label="设备名称"
            prop="a"
          >
            <el-input v-model="sForm.a" />
          </el-form-item>
          <el-form-item
            label="设备编码"
            prop="b"
          >
            <el-input v-model="sForm.b" />
          </el-form-item>
          <el-form-item
            label="产品名称"
            prop="c"
          >
            <el-select
              v-model="sForm.c"
              placeholder="请选择产品"
              clearable
              style="width: 100%"
            >
              <el-option
                label="产品1"
                value="1"
              />
              <el-option
                label="产品2"
                value="2"
              />
              <el-option
                label="产品3"
                value="3"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="设备状态"
            prop="d"
          >
            <el-select
              v-model="sForm.d"
              placeholder="请选择设备状态"
              clearable
              style="width: 100%"
            >
              <el-option
                label="全部"
                value="1"
              />
              <el-option
                label="已激活"
                value="2"
              />
              <el-option
                label="未激活"
                value="3"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="设备分组"
            prop="e"
          >
            <el-select
              v-model="sForm.e"
              placeholder="请选择设备分组"
              clearable
              style="width: 100%"
            >
              <el-option
                label="分组1"
                value="1"
              />
              <el-option
                label="分组2"
                value="2"
              />
              <el-option
                label="分组3"
                value="3"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="设备协议"
            prop="f"
          >
            <el-select
              v-model="sForm.f"
              placeholder="请选择设备协议"
              clearable
              style="width: 100%"
            >
              <el-option
                label="MQTT"
                value="1"
              />
              <el-option
                label="Mod Bus"
                value="2"
              />
              <el-option
                label="TCP"
                value="3"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            @click="searchDoFn"
          >
            查询
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.publish-dev {
  position: relative;
  padding: 10px;
  .top-card {
    .el-card__body {
      padding: 18px;
      padding-bottom: 0;
    }
  }
  .mid-con {
    padding: 2vh 0;
    & > .el-col {
      margin-bottom: 2vh;
      .el-card__body {
        position: relative;
        padding: 10px;

        .base-info {
          display: flex;
          align-items: center;
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
          margin-top: 10px;
          position: relative;
          .el-col {
            display: flex;
            flex-direction: column;
            justify-content: center;
            & > div:nth-child(2) {
              padding: 12px 0;
            }
          }
          .tool {
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            & > .el-tag {
              border: none;
              padding: 0;
              background: none;
              font-size: 20px;
              text-align: center;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
}
</style>
