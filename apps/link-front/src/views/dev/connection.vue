<script>
export default {
  data: () => ({
    loading: false,
    tableData: [
      {
        name: '园区网关设备关联',
        dev: '园区网关-01',
        type: 'LORA组网',
        devs: [
          {
            devName: '温湿度探测器-01',
            productType: '温湿度探测器',
            devCode: 'dev001',
          },
          {
            devName: '温湿度探测器-02',
            productType: '温湿度探测器',
            devCode: 'dev002',
          },
          {
            devName: '温湿度探测器-03',
            productType: '温湿度探测器',
            devCode: 'dev003',
          },
          {
            devName: '温湿度探测器-04',
            productType: '温湿度探测器',
            devCode: 'dev004',
          },
          {
            devName: '温湿度探测器-05',
            productType: '温湿度探测器',
            devCode: 'dev005',
          },
        ],
      },
      {
        name: '园区关联',
        dev: '网关-02',
        type: '网关',
        devs: [
          {
            devName: '温湿度探测器-01',
            productType: '温湿度探测器',
            devCode: 'dev001',
          },
          {
            devName: '温湿度探测器-02',
            productType: '温湿度探测器',
            devCode: 'dev002',
          },
          {
            devName: '温湿度探测器-03',
            productType: '温湿度探测器',
            devCode: 'dev003',
          },
          {
            devName: '温湿度探测器-04',
            productType: '温湿度探测器',
            devCode: 'dev004',
          },
          {
            devName: '温湿度探测器-05',
            productType: '温湿度探测器',
            devCode: 'dev005',
          },
        ],
      },
    ],
    pageFlag: true,
    total: 0,
    sForm: {
      page: 1,
      pageSize: 10,
    },
    drawer: false,
    drawerTitle: '',
    form: {},
    rules: {},
    submitLoading: false,
    drawer_sh: false,
    // 网关设备列表
    gateList: [
      { name: '网关设备1', id: 'gw01' },
      { name: '网关设备2', id: 'gw02' },
      { name: '网关设备3', id: 'gw03' },
    ],
    // 关联类型列表
    typeList: [
      { name: 'LORA组网', id: 'lora' },
      { name: '网关协议', id: 'gateway' },
    ],
  }),
  methods: {
    pageSizeFn(v) {
      this.sForm.page = 1
      this.sForm.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    // 搜索
    searchFn() {
      this.drawer_sh = true
    },
    searchDoFn() {
      // this.submitLoading = true;
      this.drawer_sh = false
    },
    // 新建协议
    addFn() {
      this.drawerTitle = '新建关联'
      this.form = {}
      this.drawer = true
    },
    // 添加设备
    addDevFn() {},
    // 下发配置
    sendFn() {},
    // 删除
    delFn(v) {},
    // 删除设备
    delDev(v) {},
    submitFn() {
      this.drawer = false
      // this.submitLoading = true;
    },

    getDataList() {},
  },
}
</script>

<template>
  <div class="connection-dev">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="12">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="addFn"
        >
          新建关联
        </el-button>
      </el-col>
      <el-col
        :span="12"
        style="text-align: right"
      >
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="searchFn"
        >
          查询
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loading"
          class="connection-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-table
                :data="props.row.devs"
                size="mini"
                border
                :header-cell-style="{ background: '#f5f5f5' }"
              >
                <el-table-column
                  label="设备名称"
                  prop="devName"
                  align="center"
                />
                <el-table-column
                  label="产品类型"
                  prop="productType"
                  align="center"
                />
                <el-table-column
                  label="设备编码"
                  prop="devCode"
                  align="center"
                />
                <el-table-column
                  label="操作"
                  width="150"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      type="danger"
                      @click="delDev(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column
            label="关联名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="网关设备"
            prop="dev"
            align="center"
          />
          <el-table-column
            label="关联类型"
            prop="type"
            align="center"
          />
          <el-table-column
            label="操作"
            width="250"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="addDevFn(scope.row)"
              >
                添加设备
              </el-button>
              <el-button
                size="mini"
                type="warning"
                @click="sendFn(scope.row)"
              >
                下发配置
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="delFn(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 页码 -->
    <el-row>
      <el-col :span="24">
        <el-pagination
          v-if="pageFlag"
          style="text-align: right"
          :current-page="sForm.page"
          :page-sizes="[10, 20, 50]"
          :page-size="sForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
        />
      </el-col>
    </el-row>

    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="form"
          label-width="85px"
          :rules="rules"
          size="mini"
        >
          <el-form-item
            label="关联名称"
            prop="name"
          >
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item
            label="网关设备"
            prop="dev"
          >
            <el-select
              v-model="form.dev"
              style="width: 100%"
            >
              <el-option
                v-for="item in gateList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="关联类型"
            prop="type"
          >
            <el-select
              v-model="form.type"
              style="width: 100%"
            >
              <el-option
                v-for="item in typeList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitFn"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 查询 抽屉 -->
    <el-drawer
      :visible.sync="drawer_sh"
      :with-header="false"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        查询
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="sForm"
          label-width="85px"
          size="mini"
        >
          <el-form-item
            label="关联名称"
            prop="name"
          >
            <el-input v-model="sForm.name" />
          </el-form-item>
          <el-form-item
            label="选择网关"
            prop="dev"
          >
            <el-select
              v-model="sForm.dev"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in gateList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
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
.connection-dev {
  position: relative;
  padding: 10px;
  .mid-con {
    padding: 2vh 0;
    .connection-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
