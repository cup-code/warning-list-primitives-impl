<script>
import {
  editDevRecord,
  enableDevRecord,
  getDevRecordList,
  getDevRecordTempFile,
  saveDevRecordFile,
} from '@/http/dev/product-api'
import { formatDate } from '@/utils'

export default {
  data: () => ({
    loadingTable: false, // 表格loading
    tableData: [], // 表格数据
    searchData: {
      // 搜索数据
      pageNum: 1,
      pageSize: 10,
      code: '',
      mac: '',
      sn: '',
      status: '',
      transferTo: '',
    },
    total: 0, // 数据总数
    drawerSearch: false, // 查询抽屉开关
    statusList: [
      { name: '已入库', value: 'STORED' },
      { name: '已划拨', value: 'ASSIGNED' },
      { name: '已绑定', value: 'BOUND' },
      { name: '离线', value: 'OFF_LINE' },
      { name: '在线', value: 'ON_LINE' },
      { name: '已解绑', value: 'UNBOUND' },
      { name: '已停用', value: 'DISABLED' },
    ],

    drawerEdit: false, // 添加/编辑抽屉开关
    drawerTitle: '编辑',
    editForm: {}, // 编辑表单数据
    submitLoading: false,
  }),
  computed: {
    /* 搜索条件tag列表 */
    tagList() {
      const tagArr = []
      for (const key in this.searchData) {
        if (this.searchData[key] === '')
          continue
        const param = { key, name: '' }
        switch (key) {
          case 'code':
            param.name = '机器授权码'
            tagArr.push(param)
            break
          case 'mac':
            param.name = 'MAC地址'
            tagArr.push(param)
            break
          case 'sn':
            param.name = '生产序列号'
            tagArr.push(param)
            break
          case 'status':
            param.name = '设备状态'
            tagArr.push(param)
            break
          case 'transferTo':
            param.name = '租户ID'
            tagArr.push(param)
            break
          default:
        }
      }
      return tagArr
    },
  },
  created() {
    this.getDataList()
    this.getPrefix()
  },
  methods: {
    formatDate,
    /* 请求表格数据 */
    getDataList() {
      this.loadingTable = true
      getDevRecordList(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = (data.result.list || []).map((item) => {
              item.ableLoading = false
              return item
            })
            this.total = data.result.total
          }
          else {
            this.$message.error(res.data.message || '查询失败')
          }
        })
        .catch((err) => {
          this.$message.error('查询出错', err)
        })
        .finally(() => {
          this.loadingTable = false
        })
    },
    /* 批量导入 */
    importClick(file) {
      saveDevRecordFile(file)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success(data.message || '导入成功')
            this.searchData = { pageNum: 1, pageSize: 10 }
            this.getDataList()
          }
          else {
            this.$message.error(data.message || '导入失败')
          }
        })
        .catch((err) => {
          this.$message.error('导入出错', err)
        })
      return false
    },
    /* 下载模板 */
    downClick() {
      getDevRecordTempFile()
        .then((res) => {
          if (res.data.success)
            window.open(this.filePrefix + res.data.result, '_self')
          else this.$message.error(res.data.message || '下载模板失败')
        })
        .catch((err) => {
          this.$message.error('下载模板出错', err)
        })
    },
    /* 打开编辑抽屉 */
    editClick(item) {
      this.editForm = JSON.parse(JSON.stringify(item))
      this.drawerTitle = '编辑'
      this.drawerEdit = true
    },
    /* 编辑提交 */
    submitClick() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        editDevRecord(this.editForm)
          .then((res) => {
            if (res.data.success) {
              this.$message.success(res.data.message || '编辑成功')
              this.getDataList()
              this.drawerEdit = false
            }
            else {
              this.$message.error(res.data.message || '编辑失败')
            }
          })
          .catch((err) => {
            this.$message.error('编辑出错', err)
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },
    /* 启用/停用按钮 */
    ableClick(item, flag) {
      item.ableLoading = true
      let msg = '设备停用'
      if (flag)
        msg = '设备启用'
      enableDevRecord(item.id, flag)
        .then((res) => {
          if (res.data.success) {
            this.$message.success(`${msg}成功`)
            this.getDataList()
          }
          else {
            this.$message.error(`${msg}失败`)
          }
        })
        .catch((err) => {
          this.$message.error(`${msg}出错`, err)
        })
        .finally(() => {
          item.ableLoading = false
        })
    },
    /* 打开查询抽屉 */
    showSearchClick() {
      this.drawerSearch = true
    },
    /* 查询提交搜索 */
    searchClick() {
      this.drawerSearch = false
      this.getDataList()
    },
    /* 移除筛选条件 */
    removeTagClick(item) {
      this.searchData[item.key] = ''
      this.getDataList()
    },
  },
}
</script>

<template>
  <KyTreeTable
    ref="treeTable"
    :isShowLeft="false"
    :isShowSearch="false"
  >
    <ECard slot="table">
      <div class="card-cell flex">
        <!-- 按钮 -->
        <el-upload action="" :before-upload="importClick">
          <el-button type="primary" size="mini">
            批量导入
          </el-button>
        </el-upload>
        <el-button
          type="success"
          size="mini"
          style="margin: 0 10px"
          @click="downClick"
        >
          下载模板
        </el-button>
        <div class="cdns">
          <transition-group name="toUp">
            <el-tag
              v-for="item in tagList"
              :key="item.key"
              type="danger"
              size="small"
              closable
              @close="removeTagClick(item)"
            >
              {{ item.name }}
            </el-tag>
          </transition-group>
        </div>
        <el-button
          size="mini"
          type="primary"
          @click="showSearchClick"
        >
          查询
        </el-button>
      </div>

      <!-- 表格 -->

      <el-table
        v-loading="loadingTable"
        :data="tableData"
        size="mini"
        height="92%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="生产序列号"
          prop="sn"
          align="center"
          width="160"
        />
        <el-table-column
          label="网卡mac地址"
          prop="mac"
          align="center"
          width="160"
        />
        <el-table-column
          label="机器授权码"
          prop="code"
          align="center"
          width="160"
        />
        <el-table-column
          label="运维码"
          prop="devOpsCode"
          align="center"
        />
        <el-table-column
          label="IMEI号"
          prop="imeiNo"
          align="center"
          width="160"
        />
        <el-table-column
          label="SIM卡号"
          prop="simNo"
          align="center"
          width="160"
        />
        <el-table-column
          label="设备状态"
          prop="state"
          align="center"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.state === 'STORED'"
              size="mini"
              type="primary"
            >
              已入库
            </el-tag>
            <el-tag
              v-if="props.row.state === 'ASSIGNED'"
              size="mini"
              type="primary"
            >
              已划拨
            </el-tag>
            <el-tag
              v-if="props.row.state === 'BOUND'"
              size="mini"
              type="primary"
            >
              已绑定
            </el-tag>
            <el-tag
              v-if="props.row.state === 'OFF_LINE'"
              size="mini"
              type="danger"
            >
              离线
            </el-tag>
            <el-tag
              v-if="props.row.state === 'ON_LINE'"
              size="mini"
              type="success"
            >
              在线
            </el-tag>
            <el-tag
              v-if="props.row.state === 'ALERT'"
              size="mini"
              type="warning"
            >
              报警
            </el-tag>
            <el-tag
              v-if="props.row.state === 'UNBOUND'"
              size="mini"
              type="success"
            >
              已解绑
            </el-tag>
            <el-tag
              v-if="props.row.state === 'DISABLED'"
              size="mini"
              type="danger"
            >
              已停用
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="当前租户"
          prop="transferToTenantName"
          align="center"
        />
        <el-table-column
          label="设备启用时间"
          prop="eventDate"
          align="center"
          width="150"
        >
          <template slot-scope="props">
            {{ formatDate(props.row.transferDate) }}
          </template>
        </el-table-column>
        <el-table-column
          label="入库时间"
          prop="transferDate"
          align="center"
          width="150"
        >
          <template slot-scope="props">
            {{ formatDate(props.row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          prop="remarks"
          align="center"
        />
        <el-table-column
          label="操作"
          width="200"
          align="right"
          fixed="right"
        >
          <template slot-scope="scope">
            <div class="flex justify-end">
              <el-button
                size="mini"
                type="primary"
                @click="editClick(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="scope.row.state === 'DISABLED'"
                size="mini"
                type="success"
                :loading="scope.row.ableLoading"
                @click="ableClick(scope.row, true)"
              >
                启用
              </el-button>
              <el-button
                v-else
                size="mini"
                type="danger"
                :loading="scope.row.ableLoading"
                @click="ableClick(scope.row, false)"
              >
                停用
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <ECard slot="page" type="footer">
      <!-- 页码 -->
      <el-pagination
        style="text-align: right"
        :current-page="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        :page-size="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        @size-change="getDataList"
        @current-change="getDataList"
      />
    </ECard>

    <div slot="dialog">
      <el-drawer :visible.sync="drawerSearch" :with-header="false">
        <div class="drawer-title">
          查询条件
        </div>
        <el-divider />
        <div class="drawer-con">
          <el-form
            ref="searchData"
            :model="searchData"
            label-width="85px"
            size="mini"
          >
            <el-form-item label="生产序列号">
              <el-input v-model="searchData.sn" />
            </el-form-item>
            <el-form-item label="网卡mac地址">
              <el-input v-model="searchData.mac" />
            </el-form-item>
            <el-form-item label="机器授权码">
              <el-input v-model="searchData.code" />
            </el-form-item>
            <el-form-item label="设备状态">
              <el-select
                v-model="searchData.status"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in statusList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="drawer-con-btns">
            <el-button
              size="mini"
              type="primary"
              @click="searchClick"
            >
              查询
            </el-button>
          </div>
        </div>
      </el-drawer>

      <!-- 添加/编辑 抽屉 -->
      <el-drawer :visible.sync="drawerEdit" :with-header="false">
        <div class="drawer-title">
          {{ drawerTitle }}
        </div>
        <el-divider />
        <div class="drawer-con">
          <el-form
            ref="editForm"
            :model="editForm"
            label-width="85px"
            size="mini"
          >
            <el-form-item
              label="生产序列号"
              prop="sn"
              :rules="{
                required: true,
                message: '请填写生产序列号',
                trigger: 'blur',
              }"
            >
              <el-input v-model="editForm.sn" />
            </el-form-item>
            <el-form-item
              label="mac地址"
              prop="mac"
              :rules="{
                required: true,
                message: '请填写网卡mac地址',
                trigger: 'blur',
              }"
            >
              <el-input v-model="editForm.mac" />
            </el-form-item>
            <el-form-item
              label="机器授权码"
              prop="code"
              :rules="{
                required: true,
                message: '请填写授权码',
                trigger: 'blur',
              }"
            >
              <el-input v-model="editForm.code" />
            </el-form-item>
            <el-form-item
              label="运维码"
              prop="devOpsCode"
              :rules="{
                required: true,
                message: '请填写运维码',
                trigger: 'blur',
              }"
            >
              <el-input v-model="editForm.devOpsCode" />
            </el-form-item>
            <el-form-item label="IMEI号" prop="imeiNo">
              <el-input v-model="editForm.imeiNo" />
            </el-form-item>
            <el-form-item label="SIM卡号" prop="simNo">
              <el-input v-model="editForm.simNo" />
            </el-form-item>
            <el-form-item
              label="备注"
              prop="remarks"
              :rules="{ required: true, message: '请填写备注', trigger: 'blur' }"
            >
              <el-input v-model="editForm.remarks" />
            </el-form-item>
          </el-form>

          <div class="drawer-con-btns">
            <el-button
              size="mini"
              type="primary"
              :loading="submitLoading"
              @click="submitClick"
            >
              提交
            </el-button>
          </div>
        </div>
      </el-drawer>
    </div>
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.instanceList-dev {
  position: relative;
  padding: 10px;
  .cdns-con {
    display: flex;
    justify-content: flex-end;
    .cdns {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .el-tag {
        margin-right: 6px;
      }
    }
  }
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
