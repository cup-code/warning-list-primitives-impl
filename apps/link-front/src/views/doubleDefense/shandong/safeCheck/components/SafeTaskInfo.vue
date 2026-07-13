<script>
import { getSafeCheckTaskSubTaskByPage } from '@/http/defense/shandong/safeCheck-api.js'
import { CheckStatusList, TroubleResult } from '@/views/doubleDefense/shandong/config/constant.js'

export default {
  props: {
    taskInfo: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      memberList: [], // 人员下拉列表
      lvList: [], // 隐患等级下拉列表
      TroubleResult, // 结果下拉列表
      CheckStatusList, // 检查状态列表
      isLoading: false,
      tableData: [],
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
    }
  },
  computed: {
    /* 翻译结果文字 */
    setStateDes() {
      return function (result) {
        let params = {}
        for (const item of this.CheckStatusList) {
          if (Number.parseInt(result) == item.value) {
            params = {
              label: item.label,
              tag: item.tag,
            }
            break
          }
        }
        return params
      }
    },
    setResultDes() {
      return function (result) {
        let params = {}
        for (const item of this.TroubleResult) {
          if (Number.parseInt(result) == item.value) {
            params = {
              label: item.label,
              tag: item.tag,
            }
            break
          }
        }
        return params
      }
    },
  },
  created() {
    this.getPrefix()
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.lvList = dicList.hiddenDangerLevel
    if (this.taskInfo.id) {
      this.searchData.checkTaskId = this.taskInfo.id
    }
    // 提取人员下拉列表数据
    const nameList = this.taskInfo ? this.taskInfo.checkUserFullName.split(',') : []
    this.memberList = []
    for (const item of nameList) {
      const param = {
        label: item,
        value: item,
      }
      this.memberList.push(param)
    }
    // 获取图片前缀
    this.getPrefix()
    this.searchClick()
  },
  methods: {
    searchClick() {
      this.isLoading = true
      getSafeCheckTaskSubTaskByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '获取表格数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取表格数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 关闭弹窗 */
    closeClick() {
      this.$emit('close')
    },
  },
}
</script>

<template>
  <div class="dialog-info">
    <div class="card-box">
      <div class="card-left">
        <div class="card-item">
          <span>计划名称：</span>
          {{ taskInfo.checkTaskName }}
        </div>
        <div class="card-item">
          <span>备注：</span>
          {{ taskInfo.remark }}
        </div>
        <div class="card-item">
          <span>执行频率：</span>
          {{ taskInfo.frequencyType == 1 ? '临时' : '周期' }}
        </div>
        <div class="card-item">
          <span>异常通知人员：</span>
          {{ taskInfo.remindUserFullName }}
        </div>
        <div class="card-item">
          <span>检查人员：</span>
          {{ taskInfo.checkUserFullName }}
        </div>
      </div>
      <div class="card-center">
        <div class="card-item">
          <span>计划类型：</span>
          {{ $dictUtils.getDictLabelById('safeCheck_type', taskInfo.checkPlanType, '--') }}
        </div>
        <div class="card-item">
          <span>周期：</span>
          {{ taskInfo.frequencyDesc }}
        </div>
      </div>
      <div class="card-right">
        <div class="card-item">
          <span>检查地点：</span>
          {{ taskInfo.checkLocation }}
        </div>
        <!-- <div class="card-item">
          <span>下次检查时间：</span>
          暂时米有这个数据 TODO
          --
        </div> -->
      </div>
    </div>
    <div
      v-loading="isLoading"
      style="height: calc(100% - 200px)"
    >
      <SearchTable height="100%">
        <!-- 搜索栏 -->
        <el-form
          slot="search"
          inline
        >
          <el-form-item label="关键字">
            <el-input
              v-model="searchData.fuzzyQuery"
              placeholder="内容/依据/位置/描述"
            />
          </el-form-item>
          <el-form-item label="检查人">
            <el-select
              v-model="searchData.checkUserFullName"
              clearable
              placeholder="全部"
            >
              <el-option
                v-for="(item, index) in memberList"
                :key="item.value + index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="隐患等级">
            <el-select
              v-model="searchData.troubleLevel"
              clearable
              placeholder="全部"
            >
              <el-option
                v-for="item in lvList"
                :key="item.id"
                :label="item.dictName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchData.taskStatus"
              clearable
              placeholder="全部"
            >
              <el-option
                v-for="item in CheckStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="结果">
            <el-select
              v-model="searchData.troubleResult"
              clearable
              placeholder="全部"
            >
              <el-option
                v-for="item in TroubleResult"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-search"
              @click="searchClick"
            >
              查询
            </el-button>
            <!-- <el-button type="success" size="mini" icon="el-icon-printer">打印</el-button> -->
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-arrow-left"
              @click="closeClick"
            >
              返回
            </el-button>
          </el-form-item>
        </el-form>
        <!-- 表格 -->
        <el-table
          slot="table"
          height="100%"
          :data="tableData"
          :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
          align="center"
        >
          <el-table-column
            label="序号"
            align="center"
            type="index"
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
            label="检查人"
            align="center"
            prop="checkUserFullName"
          />
          <el-table-column
            label="隐患位置"
            align="center"
            prop="troubleLocation"
          />
          <el-table-column
            label="隐患等级"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{
                $dictUtils.getDictLabelById('hiddenDangerLevel', scope.row.troubleLevel, '--')
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="隐患描述"
            align="center"
            prop="troubleDesc"
          />
          <el-table-column
            label="状态"
            align="center"
            prop="taskStatus"
          >
            <template slot-scope="scope">
              <el-tag :type="setStateDes(scope.row.taskStatus).tag">
                {{
                  setStateDes(scope.row.taskStatus).label
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="结果"
            align="center"
            prop="troubleResult"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.taskStatus === 0"
                type="warning"
              >
                --
              </el-tag>
              <el-tag
                v-else
                :type="setResultDes(scope.row.troubleResult).tag"
              >
                {{ setResultDes(scope.row.troubleResult).label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="附件"
            align="center"
          >
            <template slot-scope="scope">
              <el-image
                v-if="scope.row.troubleFile"
                :src="filePrefix + scope.row.troubleFile"
                :preview-src-list="[filePrefix + scope.row.troubleFile]"
                style="width: 50px; height: 50px"
              />
              <span v-else>无附件</span>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          slot="page"
          :disabled="isLoading"
          style="margin: 0 20px 0 0"
          :current-page.sync="searchData.pageNum"
          :page-size.sync="searchData.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          @current-change="searchClick"
          @size-change="searchClick"
        />
      </SearchTable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dialog-info {
  width: 100%;
  height: 100%;
  .card-box {
    border-radius: 5px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.3);
    margin: 5px 15px;
    padding: 10px;
    width: calc(100% - 30px);
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .card-left,
    .card-center,
    .card-right {
      height: 100%;
      display: flex;
      flex-direction: column;
      span {
        font-weight: bold;
      }
    }
    .card-left {
      width: 49%;
      .card-item {
        height: 30px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .card-center,
    .card-right {
      width: 24%;
      .card-item {
        height: 75px;
      }
    }
  }
}
</style>
