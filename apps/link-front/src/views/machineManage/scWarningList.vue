<script>
import { useQuery } from '@tanstack/vue-query'
import {
  computed,
  getCurrentInstance,
  ref,
} from 'vue'
import { alarmInfoList } from '@/http/machineManage/index'
import { alarmInfoListConfig } from './config.js'

export default {
  name: 'ScWarningList',
  setup() {
    const { proxy } = getCurrentInstance()

    // 搜索表单
    const searchForm = ref({
      pageNum: 1,
      pageSize: 10,
    })

    // 报警时间范围
    const alarmTimeRange = ref([])

    // 表格数据
    const tableData = ref([])
    const total = ref(0)

    // 过滤掉操作列（仅查询展示，不需要操作）
    const tableConfig = computed(() => {
      return alarmInfoListConfig.filter(item => item.prop !== 'operation')
    })

    // 查询报警信息列表
    const { refetch, isLoading } = useQuery({
      queryKey: ['alarmInfoList'],
      queryFn: () => alarmInfoList(searchForm.value),
      onSuccess: ({ data }) => {
        if (data.code === 200) {
          const { list, total: totalCount } = data.result || {}
          tableData.value = list || []
          total.value = totalCount || 0
        }
        else {
          proxy.$message.error(data.message || '获取报警信息列表失败')
        }
      },
      onError: (error) => {
        console.error('获取报警信息列表失败:', error)
        proxy.$message.error('获取报警信息列表失败')
      },
    })

    // 报警时间变化
    const onTimeChange = (value) => {
      if (value && value.length === 2) {
        searchForm.value.alarmTimeStart = value[0]
        searchForm.value.alarmTimeEnd = value[1]
      }
      else {
        delete searchForm.value.alarmTimeStart
        delete searchForm.value.alarmTimeEnd
      }
    }

    // 查询
    const searchFn = () => {
      searchForm.value.pageNum = 1
      refetch()
    }

    // 重置
    const resetFn = () => {
      searchForm.value = {
        pageNum: 1,
        pageSize: 10,
      }
      alarmTimeRange.value = []
      refetch()
    }

    // 分页大小变化
    const pageSizeFn = (size) => {
      searchForm.value.pageSize = size
      refetch()
    }

    // 当前页变化
    const pageCurFn = (cur) => {
      searchForm.value.pageNum = cur
      refetch()
    }

    return {
      searchForm,
      alarmTimeRange,
      tableConfig,
      tableData,
      total,
      isLoading,
      onTimeChange,
      searchFn,
      resetFn,
      pageSizeFn,
      pageCurFn,
    }
  },
}
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false">
    <!-- 搜索区域 -->
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        :model="searchForm"
        size="mini"
        inline
      >
        <el-form-item label="设备名称：">
          <el-input
            v-model="searchForm.deviceName"
            placeholder="请输入设备名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="报警时间：">
          <el-date-picker
            v-model="alarmTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 380px"
            @change="onTimeChange"
          />
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <EButton
            type="primary"
            size="mini"
            icon="search"
            @click="searchFn"
          >
            查询
          </EButton>
          <EButton
            btnIcon="el-icon-refresh-right"
            size="mini"
            @click="resetFn"
          >
            重置
          </EButton>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 表格区域 -->
    <ECard slot="table">
      <CTable
        :list="tableConfig"
        height="100%"
        :tableData="tableData"
        :loading="isLoading"
      />
    </ECard>

    <!-- 分页区域 -->
    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page="searchForm.pageNum"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="searchForm.pageSize"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        :background="true"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>
  </KyTreeTable>
</template>
