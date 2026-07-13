<script>
import { useQuery } from '@tanstack/vue-query'
import {
  getCurrentInstance,
  reactive,
  ref,
} from 'vue'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { clientWarningList, getWarningTypeList } from '@/http/videoWarning/warning-api'
import BatchDeal from './components/batchDeal.vue'
import CheckGroup from './components/checkGroup.vue'
import List from './components/list.vue'
import WarningInfo from './components/warningInfo.vue'
import { WarningListConfig } from './config'
import batchInfo from './store/batchInfo'

export default {
  name: 'AttentionList',
  components: {
    WarningInfo,
    List,
    BatchDeal,
    CheckGroup,
  },
  mixins: [batchInfo],
  setup() {
    const { proxy } = getCurrentInstance()
    const layout = ref('card')
    const form = ref({
      pageNum: 1,
      pageSize: 12,
      isAttention: 1,
    })
    const customerStatus = ref('1')
    const showMore = ref(false)
    const detailInfo = ref({})
    const total = ref(0)
    const tableData = ref([])
    const alarmDate = ref([])
    const statusList = reactive([{ name: '待处理' }, { name: '误报' }, { name: '真实' }])
    const alarmLevelList = reactive([
      { name: '一级', value: '1' },
      { name: '二级', value: '2' },
      { name: '三级', value: '3' },
      { name: '四级', value: '4' },
    ])

    const { refetch, isLoading } = useQuery({
      queryKey: ['clientWarningList', form.value],
      queryFn: () => clientWarningList({ ...form.value }),
      onSuccess: ({ data }) => {
        const { result } = data || {}
        if (data?.success) {
          tableData.value = result.list.map((item) => {
            return {
              ...item,
              auditStatus: item.customerStatus,
              auditUser: item.customerDisposeUserName,
              auditTime: item.customerDisposeTime,
            }
          })
          total.value = result.total
        }
      },
    })
    const warningTypeList = ref([])
    const warningTypeListQuery = useQuery({
      queryKey: ['warningTypeList'],
      queryFn: () => getWarningTypeList(),
      onSuccess: ({ data }) => {
        if (data.success) {
          warningTypeList.value = data.result || []
        }
      },
    })
    const departmentList = ref([])
    const departmentListQuery = useQuery({
      queryKey: ['departmentList'],
      queryFn: () => getDepartListSimple(),
      onSuccess: ({ data }) => {
        if (data.success) {
          departmentList.value = data.result.filter(item => !item.onlyTreeUse) || []
        }
      },
    })

    const searchFn = () => {
      refetch()
    }

    const onChange = (key, value) => {
      if (value) {
        if (key === 'alarmDate') {
          form.value.alarmDateStart = value ? proxy.$formatDate(value[0]) : ''
          form.value.alarmDateEnd = value ? proxy.$formatDate(value[1]) : ''
        }
        else {
          form.value[key] = value
        }
      }
      else {
        delete form.value[key]
      }

      refetch()
    }

    const checkItem = (item) => {
      proxy.$router.push({
        path: `/detail/warningDetail`,
        query: {
          data: JSON.stringify(item),
        },
      })
    }

    const resetFn = async () => {
      form.value = {
        pageNum: 1,
        pageSize: 12,
        isAttention: 1,
      }
      alarmDate.value = []

      refetch()
    }

    // const pageSizeFn = (size) => {
    //   form.value.pageSize = size;
    //   refetch();
    // };

    // const pageCurFn = (num) => {
    //   form.value.pageNum = num;
    //   refetch();
    // };

    const toggleMore = () => {
      showMore.value = !showMore.value
      setTimeout(() => {
        proxy.$refs.treeTable.setTableHeight()
      }, 200)
    }

    return {
      form,
      layout,
      departmentList,
      alarmLevelList,
      detailInfo,
      statusList,
      WarningListConfig,
      departmentListQuery,
      warningTypeList,
      warningTypeListQuery,
      alarmDate,
      customerStatus,
      isLoading,
      tableData,
      toggleMore,
      showMore,
      onChange,
      searchFn,
      resetFn,
      // pageSizeFn,
      // pageCurFn,
      total,
      checkItem,
      refetch,
    }
  },
  watch: {
    layout: {
      handler(newVal) {
        if (newVal === 'table') {
          this.$nextTick(() => {
            this.$refs.tableRef.setSelections(this.selected)
          })
        }
      },
      immediate: true,
    },
    tableData: {
      handler(newVal) {
        if (this.isBatch && this.checkboxGroup.length > 0) {
          this.handleChecked(this.checkboxGroup, newVal)
        }

        if (this.isBatch && this.checkboxGroup.length > 0 && this.layout === 'table') {
          this.onSelected(this.selected, newVal)
          this.$refs.tableRef.setSelections(this.selected)
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleBatchProcess() {
      // 从store中获取当前批量处理状态
      // 切换批量处理状态
      this.isBatch = !this.isBatch
      if (!this.isBatch) {
        // 如果关闭批量处理，清空选择
        this.cancelBatch()
        this.$refs.tableRef.setSelections([])
      }
    },
    handleSuccess() {
      this.isBatch = !this.isBatch
      this.cancelBatch()
      this.refetch()
    },
    pageSizeFn(size) {
      this.form.pageSize = size
      this.searchFn()
    },

    pageCurFn(num) {
      this.form.pageNum = num
      this.cancelBatch()
      this.searchFn()
    },
  },
}
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false">
    <!-- 查询条件 -->
    <ECard slot="search" noneBottom type="search">
      <el-form :model="form" size="mini" inline>
        <el-form-item label="布局方式:">
          <el-radio-group v-model="layout" size="mini">
            <el-radio-button label="table">
              表格
            </el-radio-button>
            <el-radio-button label="card">
              卡片
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="预警日期：">
          <el-date-picker
            v-model="alarmDate"
            type="datetimerange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
            @change="onChange('alarmDate', $event)"
          />
        </el-form-item>

        <el-form-item label="预警等级：" prop="alarmLevel">
          <el-select
            v-model="form.alarmLevel"
            placeholder="预警等级"
            style="width: 100%"
            clearable
            @change="onChange('alarmLevel', $event)"
          >
            <el-option
              v-for="item in alarmLevelList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="预警类型：" prop="alarmType">
          <el-select
            v-model="form.alarmType"
            placeholder="预警类型"
            style="width: 100%"
            @change="onChange('alarmType', $event)"
          >
            <el-option
              v-for="item in warningTypeList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="showMore" label="处理状态：">
          <el-select
            v-model="form.customerStatus"
            placeholder="处理状态"
            style="width: 100%"
            multiple
            collapse-tags
            clearable
            @change="onChange('customerStatus', $event)"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('CustomerStatus')"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="showMore" label="责任部门：">
          <el-select
            v-model="form.departmentId"
            placeholder="责任部门"
            clearable
            style="width: 100%"
            @change="onChange('departmentId', $event)"
          >
            <el-option
              v-for="item in departmentList"
              :key="item.id"
              :label="item.departmentName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="showMore" label="摄像头名称：">
          <el-input
            v-model="form.cameraName"
            placeholder="摄像头名称"
            style="width: 100%"
            clearable
            @change="onChange('cameraName', $event)"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="mini" @click="handleBatchProcess">
            {{ isBatch ? "取消批量处理" : "批量处理" }}
          </el-button>
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="searchFn">
            查询
          </el-button>
          <el-button icon="el-icon-refresh-right" @click="resetFn">
            重置
          </el-button>
          <el-button type="text" style="margin-left: 8px" @click="toggleMore">
            {{ showMore == true ? "收起" : "高级筛选" }}
            <i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 内容 -->
    <ECard slot="table" customStyle="box-sizing: border-box;overflow: hidden;">
      <BatchDeal
        v-if="isBatch"
        :layout="layout"
        :checkAll="checkAll"
        :isIndeterminate="isIndeterminate"
        :checkboxGroup="checkboxGroup"
        :selected="selected"
        userType="CustomerStatus"
        @checkAllChange="handleCheckAllChange($event, tableData)"
        @success="handleSuccess"
      />
      <div
        v-if="layout === 'card'"
        class="flex overflow-y-auto flex-wrap content-start h-full"
        :style="`height:${
          isBatch ? '92%' : '100%'
        };scrollbar-width: auto; -ms-overflow-style: auto`"
      >
        <CheckGroup
          v-if="isBatch"
          :tableData="tableData"
          :form="form"
          :isBatch="isBatch"
          :checkboxGroup="checkboxGroup"
          type="CustomerStatus"
          @check="handleChecked($event, tableData)"
        />

        <template v-else>
          <WarningInfo
            v-for="item in tableData"
            :key="item.id"
            type="CustomerStatus"
            :form="form"
            :pageNum="form.pageNum"
            :item="item"
            @itemTap="checkItem"
          />
        </template>
        <div
          v-if="tableData.length === 0"
          class="flex justify-center items-center w-full h-full text-gray-400"
        >
          暂无数据...
        </div>
      </div>
      <List
        v-else
        ref="tableRef"
        :tableData="tableData"
        :form="form"
        :loading="isLoading"
        :selection="isBatch"
        type="CustomerStatus"
        :height="isBatch ? '92%' : '100%'"
        @selection="onSelected($event, tableData)"
      />
    </ECard>
    <!-- 分页 -->
    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page.sync="form.pageNum"
        :page-sizes="[12, 24, 48, 96]"
        :page-size.sync="form.pageSize"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        :background="true"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>
  </KyTreeTable>
</template>
