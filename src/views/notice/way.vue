<script>
export default {
  data: () => ({
    loading: false,
    tableData: [
      { a: '微信通知测试', b: '微信', c: 'demo' },
      { a: '短信通知测试', b: '短信', c: 'XXX设备低温告警' },
      { a: '邮件通知测试', b: '邮件', c: 'ZZZ设备低电压告警' },
    ],
    pageFlag: true,
    sForm: {
      page: 1,
      pageSize: 12,
    },
    total: 0,
    drawer: false,
    drawerType: 0,
    drawerTitle: '',
    form: {},
    rules: {},
    submitLoading: false,
    wayList: [
      { id: 1, name: '微信', value: 1 },
      { id: 2, name: '短信', value: 2 },
      { id: 3, name: '邮件', value: 3 },
      { id: 4, name: '语音', value: 4 },
      { id: 5, name: '钉钉', value: 5 },
    ],
    drawer_sh: false,
  }),
  created() {
    this.getDataList()
  },
  methods: {
    getDataList() {},
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    // 查询配置 按钮
    searchFn() {
      this.drawer_sh = true
    },
    // 查询 按钮
    searchDoFn() {},
    // 新建 配置
    addFn() {
      this.form = {}
      this.drawerTitle = '新建配置'
      this.drawerType = 0
      this.drawer = true
    },
    // 编辑 配置
    editFn(v) {
      this.form = JSON.parse(JSON.stringify(v))
      this.drawerTitle = '编辑配置'
      this.drawerType = 1
      this.drawer = true
    },
    // 使用记录
    seeFn(v) {},
    // 删除 配置
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.a}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {})
        .catch(() => {})
    },
    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        // 添加
        if (this.drawerType === 0) {
        }
        // 编辑
        else {
        }
      })
    },
  },
}
</script>

<template>
  <div class="way-notice">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="14">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="addFn"
        >
          新建配置
        </el-button>
        <!-- <el-button icon="el-icon-upload" size="mini" type="warning">导入配置</el-button> -->
        <!-- <el-button icon="el-icon-download" size="mini" type="success">下载模板</el-button> -->
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
          查询配置
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loading"
          class="group-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
        >
          <el-table-column
            label="通知模板名称"
            prop="a"
            align="center"
          />
          <el-table-column
            label="通知方式"
            prop="b"
            align="center"
          />
          <el-table-column
            label="通知正文"
            prop="c"
            align="center"
          />
          <el-table-column
            label="操作"
            width="200"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="editFn(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="warning"
                @click="seeFn(scope.row)"
              >
                使用记录
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
      <el-pagination
        v-if="pageFlag"
        style="text-align: right"
        :current-page="sForm.page"
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
            label="通知模板名称"
            prop="a"
          >
            <el-input v-model="sForm.a" />
          </el-form-item>
          <el-form-item
            label="通知方式"
            prop="b"
          >
            <el-select
              v-model="sForm.b"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in wayList"
                :key="item.id"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="通知正文"
            prop="c"
          >
            <el-input
              v-model="sForm.c"
              type="textarea"
              :rows="6"
            />
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
            label="通知模板名称"
            prop="groupName"
          >
            <el-input v-model="form.a" />
          </el-form-item>
          <el-form-item
            label="通知方式"
            prop="b"
          >
            <el-select
              v-model="form.b"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in wayList"
                :key="item.id"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="通知正文"
            prop="remarks"
          >
            <el-input
              v-model="form.c"
              type="textarea"
              :rows="6"
            />
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
  </div>
</template>

<style lang="scss" scoped>
.way-notice {
  position: relative;
  padding: 10px;
  .mid-con {
    padding: 2vh 0;
    .group-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
