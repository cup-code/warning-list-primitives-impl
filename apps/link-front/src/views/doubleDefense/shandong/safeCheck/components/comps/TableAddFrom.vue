<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import {
  getSafeCheckModuleByPage,
  getSafeCheckModuleTypeTree,
} from '@/http/defense/shandong/safeCheck-api.js'

export default {
  components: {
    TreeSelect,
  },
  props: {
    // 部门列表
    departList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      moduleTree: [], // 检查内容类型树数据
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
      total: 0,
      tableData: [], // 获取到的数据
      pickData: [], // 已选择的数据
    }
  },
  created() {
    this.getTypeData()
    this.searchClick()
  },
  methods: {
    /* 树列表选择回调 */
    departTreeChangeEvt(id) {
      this.searchData.departmentId = id
      this.$refs.departTreeSelect.closeSelect()
    },
    moduleTreeChangeEvt(id) {
      this.searchData.checkContentType = id || ''
      this.$refs.moduleTreeSelect.closeSelect()
    },
    /* 获取类型树 */
    getTypeData() {
      getSafeCheckModuleTypeTree()
        .then((res) => {
          if (res.data.success) {
            this.moduleTree = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '请求类型树失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求类型树出错', err)
        })
    },
    /* 点击查询 */
    searchClick() {
      this.isLoading = true
      getSafeCheckModuleByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.total = res.data.result.total
            this.tableData = res.data.result.list
          }
          else {
            this.$message.warning(res.data.message || '请求表格数据失败')
          }
        })
        .catch((err) => {
          this.$message.warning('请求表格数据出错：', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击添加 */
    addClick(params) {
      let isExist = false
      for (const item of this.pickData) {
        if (item.id === params.id) {
          isExist = true
          break
        }
      }
      if (!isExist) {
        this.pickData.push(params)
      }
    },
    /* 点击删除 */
    delClick(item) {
      this.pickData.splice(item.$index, 1)
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', null)
    },
    /* 点击确认保存 */
    submitClick() {
      this.$emit('close', this.pickData)
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    class="addform-bg"
  >
    <div class="dialog-info">
      <!-- 左侧 -->
      <div class="body-left">
        <div class="body-title">
          检查内容库
        </div>
        <div class="left-search">
          <el-form
            :model="searchData"
            label-width="60px"
            inline
          >
            <el-form-item label="责任组织">
              <TreeSelect
                ref="departTreeSelect"
                :list="departList"
                :props="{
                  value: 'id',
                  label: 'departmentName',
                  children: 'children',
                }"
                @getValue="departTreeChangeEvt"
              />
            </el-form-item>
            <el-form-item label="类别">
              <TreeSelect
                ref="moduleTreeSelect"
                :data="moduleTree"
                :props="{
                  value: 'id',
                  label: 'name',
                  children: 'children',
                }"
                @getValue="moduleTreeChangeEvt"
              />
            </el-form-item>
            <el-form-item label="关键字">
              <el-input
                v-model="searchData.fuzzyQuery"
                style="width: 150px"
                placeholder="检查内容"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                icon="el-icon-search"
                @click="searchClick"
              >
                查询
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="left-table">
          <el-table
            :data="tableData"
            align="center"
            height="100%"
          >
            <el-table-column
              type="index"
              width="50"
              align="center"
              label="序号"
            />
            <el-table-column
              label="检查内容"
              align="center"
              prop="checkContent"
            />
            <el-table-column
              label="检查依据"
              align="center"
              prop="checkBasis"
            />
            <el-table-column
              label="建议等级"
              align="center"
            >
              <template slot-scope="scope">
                <span>{{
                  $dictUtils.getDictLabelById('suggest_level', scope.row.recommendedLevel, '--')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              width="100"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="mini"
                  @click="addClick(scope.row)"
                >
                  添加
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="left-page">
          <el-pagination
            :current-page.sync="searchData.pageNum"
            :page-size.sync="searchData.pageSize"
            :page-sizes="[5, 10, 20, 30]"
            layout="total, prev, pager, next, jumper, sizes"
            :total="total"
            @current-change="searchClick"
            @size-change="searchClick"
          />
        </div>
      </div>
      <!-- 右侧 -->
      <div class="body-right">
        <div class="body-title">
          已选择内容
        </div>
        <div class="right-table">
          <el-table
            :data="pickData"
            align="center"
            height="100%"
          >
            <el-table-column
              type="index"
              width="50"
              align="center"
              label="序号"
            />
            <el-table-column
              label="检查内容"
              align="center"
              prop="checkContent"
            />
            <el-table-column
              label="检查依据"
              align="center"
              prop="checkBasis"
            />
            <el-table-column
              label="建议等级"
              align="center"
            >
              <template slot-scope="scope">
                <span>{{
                  $dictUtils.getDictLabelById('suggest_level', scope.row.recommendedLevel, '--')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              width="100"
            >
              <template slot-scope="scope">
                <el-button
                  style="color: var(--ky-danger)"
                  type="text"
                  size="mini"
                  @click="delClick(scope)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <!-- 底部按钮 -->
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 10px 0 0"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.addform-bg {
  width: 100%;
  height: 100%;
  // height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .dialog-info {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .body-title {
      height: 30px;
      line-height: 30px;
      font-size: 20px;
      font-weight: bold;
    }
    .body-left {
      width: 49%;
      height: 100%;
      border: 1px solid lightgray;
      padding: 10px;
      .left-search {
        height: 100px;
      }
      .left-table {
        height: calc(100% - 180px);
      }
      .left-page {
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .body-right {
      width: 49%;
      height: 100%;
      border: 1px solid lightgray;
      padding: 10px;
      .right-table {
        height: calc(100% - 30px);
      }
    }
  }
}
</style>
