<script>
import {
  addProtocol,
  addProtocolMeta,
  deleteProtocol,
  deleteProtocolMeta,
  editProtocol,
  editProtocolMeta,
  editProtocolState,
  getMetaById,
  getProtocolList,
} from '@/http/dev/protocol-api'

export default {
  data: () => ({
    allDic: {}, // 字典数据
    loadingTable: false, // 表格loading
    tableData: [], // 表格数据
    total: 0, // 表格数据总条数
    searchData: {
      pageNum: 1,
      pageSize: 10,
      code: '', // 协议编码
      protocolId: '', // 协议ID
      protocolName: '', // 协议名称
      state: '', // 协议状态 已发布：PUBLISHED，未发布：UNPUBLISHED
      type: '', // 协议类型
    },
    drawerEdit: false, // 添加/编辑抽屉开关
    drawerTitle: '', // 抽屉标题
    protocolForm: {}, // 协议表单数据
    submitLoading: false, // 提交loading
    drawerItem: false, // 元数据抽屉开关 drawerItemTitle
    drawerItemTitle: '', // 元数据抽屉标题
    formItem: {}, // 元数据表单数据
    expandList: [], // 表格展开行数组
  }),
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getDataList()
  },
  methods: {
    /* 请求表格数据 */
    getDataList() {
      this.loadingTable = true
      getProtocolList(this.searchData)
        .then((res) => {
          if (res.data.success) {
            const listArr = res.data.result.list
            for (const item of listArr) {
              item.metaVOList = []
              this.allDic.msg_protocol.forEach((t) => {
                if (item.type == t.dictCode) {
                  item.typeStr = t.dictName
                }
              })
            }
            this.tableData = listArr
            this.total = res.data.result.total
            this.expandList = []
          }
          else {
            this.$message.error(res.data.message || '获取协议列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取协议列表出错', err)
        })
        .finally(() => {
          this.loadingTable = false
        })
    },
    /* 添加协议 */
    addClick() {
      this.protocolForm = {}
      this.drawerTitle = '添加协议'
      this.drawerEdit = true
    },
    /* 编辑协议 */
    editClick(item) {
      this.protocolForm = JSON.parse(JSON.stringify(item))
      this.drawerTitle = '编辑协议'
      this.drawerEdit = true
    },
    /* 删除协议 */
    delClick(item) {
      this.$confirm(`您确认要删除 ${item.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loadingTable = true
          deleteProtocol(item.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success(res.data.message || '删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(res.data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除出错!', err)
            })
            .finally(() => {
              this.loadingTable = false
            })
        })
        .catch(() => {})
    },
    /* 提交协议 */
    submitClick() {
      this.$refs.protocolForm.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        let submitFunc = editProtocol
        if (this.drawerTitle == '添加协议')
          submitFunc = addProtocol
        submitFunc(this.protocolForm)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('提交成功')
              this.getDataList()
              this.drawerEdit = false
            }
            else {
              this.$message.error('提交失败')
            }
          })
          .catch((err) => {
            this.$message.error('提交出错', err)
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },
    /* 发布/取消发布 */
    publishClick(item, flag) {
      const str = flag === 'PUBLISHED' ? '发布' : '取消发布'
      this.$confirm(`您确认要${str} ${item.name} ?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          editProtocolState(item.id, flag)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              if (resD.success) {
                this.$message.success(msg || `${str}成功`)
                this.getDataList()
              }
              else {
                this.$message.error(msg || `${str}失败`)
              }
            })
            .catch((err) => {
              this.$message.error(`${str}失败: ${err}`)
            })
        })
        .catch(() => {})
    },
    /* 按协议id获取元数据 */
    getMetaData(id) {
      this.loadingTable = true
      getMetaById(id)
        .then((res) => {
          if (res.data.success) {
            this.tableData.forEach((item) => {
              if (item.id == id)
                item.metaVOList = res.data.result
            })
          }
          else {
            this.$message.warning(res.data.message || '请求元数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求元数据出错', err)
        })
        .finally(() => {
          this.loadingTable = false
        })
    },
    /* 点击表格展开 */
    expandClick(item, rows) {
      // 判断是展开还是收起：flag不存在时 是 收起操作
      const flag = rows.find(row => row.id === item.id)
      if (!flag)
        return
      this.getMetaData(item.id)
    },
    /* 添加元数据 */
    addItemClick(item) {
      this.formItem = {
        protocolId: item.id,
        required: false,
      }
      this.drawerItemTitle = '添加元数据'
      this.drawerItem = true
    },
    /* 编辑元数据 */
    editItemClick(item) {
      this.formItem = JSON.parse(JSON.stringify(item))
      this.drawerItemTitle = '编辑元数据'
      this.drawerItem = true
    },
    /* 删除元数据 */
    delItemClick(item) {
      this.$confirm(`您确认要删除 ${item.propertyName} ?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteProtocolMeta(item.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功')
                this.getMetaData(item.protocolId)
              }
              else {
                this.$message.error(res.data.message || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除出错', err)
            })
        })
        .catch(() => {})
    },
    /* 提交元数据 */
    submitItemClick() {
      this.$refs.formItem.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        let submitFunc = editProtocolMeta
        if (this.drawerItemTitle == '添加元数据')
          submitFunc = addProtocolMeta
        submitFunc(this.formItem)
          .then((res) => {
            if (res.data.success) {
              this.$message.success(res.data.message || '提交成功')
              this.getMetaData(this.formItem.protocolId)
              this.drawerItem = false
            }
            else {
              this.$message.error(res.data.message || '提交失败')
            }
          })
          .catch((err) => {
            this.$message.error('提交出错', err)
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },
  },
}
</script>

<template>
  <div class="protocol-dev">
    <!-- 按钮 -->
    <el-row class="header">
      <el-col :span="12">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="addClick"
        >
          添加协议
        </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          ref="table"
          v-loading="loadingTable"
          class="protocol-table"
          :data="tableData"
          size="mini"
          style="width: 100%"
          height="75vh"
          :expand-row-keys="expandList"
          :header-cell-style="{ background: '#f5f5f5' }"
          row-key="id"
          @expand-change="expandClick"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-table
                :data="props.row.metaVOList"
                size="mini"
                border
                :header-cell-style="{ background: '#f5f5f5' }"
              >
                <el-table-column
                  label="名称"
                  prop="propertyName"
                  align="center"
                />
                <el-table-column
                  label="编码"
                  prop="propertyCode"
                  align="center"
                />
                <el-table-column
                  label="类型"
                  prop="valueType"
                  align="center"
                >
                  <template slot-scope="scope">
                    <span>{{ $dictUtils.getDictLabel('value_type', scope.row.valueType) }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="必填"
                  prop="required"
                  align="center"
                >
                  <template slot-scope="props">
                    <el-tag
                      v-if="props.row.required"
                      size="mini"
                      type="success"
                    >
                      是
                    </el-tag>
                    <el-tag
                      v-if="!props.row.required"
                      size="mini"
                      type="danger"
                    >
                      否
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  label="正则"
                  prop="valueRegular"
                  align="center"
                />
                <el-table-column
                  label="长度"
                  prop="valueLength"
                  align="center"
                />
                <el-table-column
                  label="上限"
                  prop="valueMax"
                  align="center"
                />
                <el-table-column
                  label="下限"
                  prop="valueMin"
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
                      type="primary"
                      @click="editItemClick(scope.row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      size="mini"
                      type="danger"
                      @click="delItemClick(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column
            label="协议名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="协议编码"
            prop="code"
            align="center"
          />
          <el-table-column
            label="协议类型"
            prop="typeStr"
            align="center"
          />
          <el-table-column
            label="协议状态"
            prop="state"
            align="center"
          >
            <template slot-scope="props">
              <el-tag
                v-if="props.row.state === 'PUBLISHED'"
                size="mini"
                type="success"
              >
                已发布
              </el-tag>
              <el-tag
                v-if="props.row.state === 'UNPUBLISHED'"
                size="mini"
                type="danger"
              >
                未发布
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="协议描述"
            prop="remarks"
            align="center"
          />
          <el-table-column
            label="操作"
            width="300"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="editClick(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="warning"
                @click="addItemClick(scope.row)"
              >
                添加元数据
              </el-button>
              <el-button
                v-if="scope.row.state === 'UNPUBLISHED'"
                size="mini"
                type="success"
                @click="publishClick(scope.row, 'PUBLISHED')"
              >
                发布
              </el-button>
              <el-button
                v-if="scope.row.state === 'PUBLISHED'"
                size="mini"
                type="danger"
                @click="publishClick(scope.row, 'UNPUBLISHED')"
              >
                取消发布
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="delClick(scope.row)"
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
          style="text-align: right; background: #ffffff; margin-top: 10px; padding: 5px 0"
          :current-page="searchData.pageNum"
          :page-sizes="[10, 20, 50]"
          background
          :page-size="searchData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="getDataList"
          @current-change="getDataList"
        />
      </el-col>
    </el-row>

    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      :visible.sync="drawerEdit"
      :with-header="false"
    >
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>
      <el-divider />
      <div class="drawer-con">
        <el-form
          ref="protocolForm"
          :model="protocolForm"
          label-width="85px"
          size="mini"
        >
          <el-form-item
            label="协议名称"
            prop="name"
            :rules="{
              required: true,
              message: '请填写协议名称',
              trigger: 'blur',
            }"
          >
            <el-input v-model="protocolForm.name" />
          </el-form-item>
          <el-form-item
            label="协议编码"
            prop="code"
            :rules="{
              required: true,
              message: '请填写协议编码',
              trigger: 'blur',
            }"
          >
            <el-input v-model="protocolForm.code" />
          </el-form-item>
          <el-form-item
            label="协议类型"
            prop="type"
            :rules="{
              required: true,
              message: '请选择协议类型',
              trigger: 'change',
            }"
          >
            <el-select
              v-model="protocolForm.type"
              placeholder="请选择协议类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in allDic.msg_protocol"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="协议描述"
            prop="remarks"
          >
            <el-input
              v-model="protocolForm.remarks"
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
            @click="submitClick"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 添加/编辑 元数据 抽屉 -->
    <el-drawer
      :visible.sync="drawerItem"
      :with-header="false"
    >
      <div class="drawer-title">
        {{ drawerItemTitle }}
      </div>
      <el-divider />
      <div class="drawer-con">
        <el-form
          ref="formItem"
          :model="formItem"
          label-width="85px"
          size="mini"
        >
          <el-form-item
            label="属性值名称"
            prop="propertyName"
            :rules="{
              required: true,
              message: '请填写属性值名称',
              trigger: 'blur',
            }"
          >
            <el-input v-model="formItem.propertyName" />
          </el-form-item>
          <el-form-item
            label="属性值编码"
            prop="propertyCode"
            :rules="{
              required: true,
              message: '请填写属性值编码',
              trigger: 'blur',
            }"
          >
            <el-input v-model="formItem.propertyCode" />
          </el-form-item>
          <el-form-item
            label="属性值类型"
            prop="valueType"
            :rules="{
              required: true,
              message: '请选择属性值类型',
              trigger: 'change',
            }"
          >
            <el-select
              v-model="formItem.valueType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in allDic.value_type"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="是否必填"
            prop="required"
          >
            <el-checkbox v-model="formItem.required" />
          </el-form-item>
          <el-form-item
            label="属性值正则"
            prop="valueRegular"
          >
            <el-input v-model="formItem.valueRegular" />
          </el-form-item>
          <el-form-item
            label="属性值长度"
            prop="valueLength"
          >
            <el-input
              v-model="formItem.valueLength"
              type="number"
            />
          </el-form-item>
          <el-form-item
            label="属性值上限"
            prop="valueMax"
          >
            <el-input v-model="formItem.valueMax" />
          </el-form-item>
          <el-form-item
            label="属性值下限"
            prop="valueMin"
          >
            <el-input v-model="formItem.valueMin" />
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitItemClick"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.protocol-dev {
  position: relative;
  padding: 10px;
  background: #f3f7f9;
  .header {
    background: #ffffff;
    padding: 10px;
  }
  .mid-con {
    padding: 1vh 10px;
    background: #ffffff;
    .protocol-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
  .el-radio-group {
    .el-radio {
      margin-right: 16px;
      .el-radio__label {
        padding-left: 6px;
      }
    }
  }
}
</style>
