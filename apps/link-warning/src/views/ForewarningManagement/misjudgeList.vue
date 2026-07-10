<script>
import { useInfiniteQuery, useQuery } from '@tanstack/vue-query'
import {
  computed,
  getCurrentInstance,
  reactive,
  ref,
  watch,
} from 'vue'
import { tenantControlList } from '@/http/manage-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { getUserListByRoleFn } from '@/http/safe-production/user-manage-api'
import { allWarningList } from '@/http/videoWarning/warning-api'
import {
  delStorageItem,
  getStorageItem,
  setStorageItem,
} from '@/utils/storage'
import BatchDeal from './components/batchDeal.vue'
import CheckGroup from './components/checkGroup.vue'
import List from './components/list.vue'
import SelectMachine from './components/selectMachine.vue'
import WarningInfo from './components/warningInfo.vue'
import { WarningListConfig } from './config'
import batchInfo from './store/batchInfo'

export default {
  name: 'misjudgeList',
  components: {
    WarningInfo,
    SelectMachine,
    List,
    BatchDeal,
    CheckGroup,
  },
  mixins: [batchInfo],
  beforeRouteLeave(to, from, next) {
    console.log('beforeRouteLeave', to, from)
    // 判断目标路由是否是详情页
    const isDetailPage = to.path.includes('/detail')
    const isCurrentPage = to.path.includes('misjudgeList')

    // 如果既不是详情页也不是当前页面，则清除缓存
    if (!isDetailPage && !isCurrentPage) {
      this.clearCache()
    }

    next() // 继续导航
  },
  setup() {
    const { proxy } = getCurrentInstance()
    // 清除缓存的函数
    const clearCache = () => {
      delStorageItem('misjudgeListFilter')
      delStorageItem('misjudgeListChecked')
      delStorageItem('misjudgeListStatus')
      delStorageItem('misjudgeListFilter')

      // 如果有定时器在运行，需要清除
      if (interval.value) {
        clearInterval(interval.value)
        interval.value = null
      }
    }
    // Try to get cached filter from localStorage
    const checked = ref(getStorageItem('misjudgeListChecked')?.isChecked || false)

    const form = ref(
      getStorageItem('misjudgeListFilter') || {
        pageNum: 1,
        pageSize: 12,
        customerStatus: ['3'],
      },
    )

    const showMore = ref(false)
    const total = ref(0)
    const tableData = ref([])
    const showDetail = ref(false)
    const detailInfo = ref({})

    const statusList = reactive([{ name: '待审核' }, { name: '误报' }, { name: '真实' }])
    const alarmLevelList = reactive([
      { name: '一级', value: '1' },
      { name: '二级', value: '2' },
      { name: '三级', value: '3' },
      { name: '四级', value: '4' },
    ])

    // Set initial value for internalDisposeUserName from cache if available
    const internalDisposeUserName = ref('')
    const alarmDate = ref([])
    const getPeopleList = async ({ pageParam = 1 }) => {
      const res = await getUserListByRoleFn({
        pageNum: pageParam,
        pageSize: 10,
        withoutChildrenDepartment: true,
        userStatusList: 1,
        withMyDepartmentTypeParent: false,
      })
      return res
    }

    const tenantList = ref([])
    const tenantListQuery = useQuery({
      queryKey: ['tenantList'],
      queryFn: () => tenantControlList(),
      onSuccess: (res) => {
        const { data } = res
        if (data.success) {
          tenantList.value = data.result || []
        }
      },
    })

    const {
      data,
      fetchNextPage,
      isFetchingNextPage,
      hasNextPage,
    } = useInfiniteQuery({
      queryKey: ['peopleList'],
      queryFn: getPeopleList,
      getNextPageParam: (lastPage) => {
        const { result } = lastPage.data || {}
        return result.pages > result.pageNum ? result.nextPage : null
      },
      initialPageParam: 1,
    })

    const handleScroll = (event) => {
      const {
        scrollTop,
        scrollHeight,
        clientHeight,
      } = event.target
      const isBottom = scrollHeight - scrollTop - clientHeight < 1
      if (isBottom && hasNextPage.value && !isFetchingNextPage.value) {
        fetchNextPage()
      }
    }

    // 合并所有分页数据
    const peopleData = computed(() => {
      return (
        data.value?.pages.flatMap(({ data }) => {
          return data.result.list
        }) || []
      )
    })
    // Update cache whenever form changes
    watch(
      form,
      (newValue) => {
        if (newValue.internalDisposeUserId) {
          internalDisposeUserName.value
            = peopleData.value.find(item => item.id === newValue.internalDisposeUserId)
              ?.fullName || ''
        }
        if (newValue.alarmDateStart && newValue.alarmDateEnd) {
          alarmDate.value = [
            new Date(newValue.alarmDateStart),
            new Date(newValue.alarmDateEnd),
          ]
        }
      },
      { immediate: true, deep: true },
    )

    watch(checked, (newValue) => {
      if (newValue) {
        interval.value = setInterval(() => {
          refetch()
        }, 30000)
      }

      if (interval.value && !newValue) {
        clearInterval(interval.value)
        interval.value = null
      }

      setStorageItem('misjudgeListChecked', {
        isChecked: newValue,
        showMore: showMore.value,
      })
      setStorageItem('misjudgeListStatus', interval.value)
    })

    const layout = ref('card')

    const InternalStatus = getStorageItem('misjudgeListStatus')
    const interval = ref(InternalStatus || null)

    const { refetch, isPending } = useQuery({
      queryKey: ['misjudgeList', form.value],
      queryFn: () => allWarningList(form.value),
      keepPreviousData: true,
      onSuccess: ({ data }) => {
        const { result } = data || {}
        if (data?.success) {
          tableData.value = result.list.map((item) => {
            return {
              ...item,
              auditStatus: item.internalStatus,
              auditUser: item.internalDisposeUserName,
              auditTime: item.internalDisposeTime,
            }
          })
          total.value = result.total
        }
      },
      cacheTime: 24 * 60 * 60 * 1000, // 缓存 24 小时
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

    const onChange = (key, value) => {
      if (value) {
        if (key === 'alarmDate') {
          form.value.alarmDateStart = proxy.$formatDate(value[0])
          form.value.alarmDateEnd = proxy.$formatDate(value[1])
        }
        else if (key === 'internalDisposeUserId') {
          internalDisposeUserName.value = value.fullName || ''
          form.value.internalDisposeUserId = value.id || ''
        }
        else if (key === 'machineId') {
          form.value.machineId = value.id || ''
        }
        else {
          form.value[key] = value
        }
      }
      else {
        if (key === 'internalDisposeUserId') {
          internalDisposeUserName.value = ''
        }
        else if (key === 'alarmDate') {
          delete form.value.alarmDateStart
          delete form.value.alarmDateEnd
          alarmDate.value = []
        }
        delete form.value[key]
      }
      setStorageItem('misjudgeListFilter', form.value)

      searchFn()
    }

    const searchFn = () => {
      refetch()
    }

    const resetFn = () => {
      form.value = {
        pageNum: 1,
        pageSize: 12,
        customerStatus: ['3'],
      }
      internalDisposeUserName.value = ''
      alarmDate.value = []

      // Clear cache when reset button is clicked
      delStorageItem('misjudgeListFilter')

      refetch()
    }

    // const pageSizeFn = (size) => {
    //   form.value.pageSize = size;
    //   searchFn();
    // };

    // const pageCurFn = (num) => {
    //   form.value.pageNum = num;
    //   searchFn();
    // };

    const checkItem = (item) => {
      // showDetail.value = true;
      // detailInfo.value = item;

      proxy.$router.push({
        path: `/detail/warningDetail`,
        query: {
          data: JSON.stringify(item),
        },
      })
    }

    const toggleMore = () => {
      showMore.value = !showMore.value
      setTimeout(() => {
        proxy.$refs.treeTable.setTableHeight()
      }, 200)
    }

    return {
      form,
      showDetail,
      layout,
      detailInfo,
      departmentList,
      alarmLevelList,
      statusList,
      WarningListConfig,
      departmentListQuery,
      peopleData,
      handleScroll,
      checked,
      internalDisposeUserName,
      tenantList,
      tenantListQuery,
      isPending,
      tableData,
      toggleMore,
      showMore,
      onChange,
      searchFn,
      resetFn,
      // pageSizeFn,
      // pageCurFn,
      alarmDate,
      total,
      interval,
      clearCache,
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
            v-model="form.alarmDate"
            type="datetimerange"
            align="right"
            unlink-panels
            :default-time="['00:00:00', '23:59:59']"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
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
          <el-input
            v-model="form.alarmType"
            placeholder="请输入预警类型"
            style="width: 100%"
            clearable
            @change="onChange('alarmType', $event)"
          />
        </el-form-item>

        <el-form-item v-if="showMore" label="所属租户：">
          <el-select
            v-model="form.tCode"
            placeholder="所属租户"
            style="width: 100%"
            clearable
            multiple
            collapse-tags
            @change="onChange('tCode', $event)"
          >
            <el-option
              v-for="item in tenantList"
              :key="item.tenantCode"
              :label="item.tenantName"
              :value="item.tenantCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="showMore" label="审核状态：">
          <el-select
            v-model="form.internalStatus"
            placeholder="审核状态"
            multiple
            collapse-tags
            style="width: 100%"
            clearable
            @change="onChange('internalStatus', $event)"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('InternalStatus')"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="showMore" label="责任部门：">
          <el-select
            v-model="form.departmentId"
            clearable
            placeholder="责任部门"
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

        <el-form-item v-if="showMore" label="所属一体机：">
          <SelectMachine
            :value="form.machineId"
            type="all"
            @change="onChange('machineId', $event)"
          />
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

        <el-form-item v-if="showMore" label="审核人：">
          <el-dropdown
            trigger="click"
            @command="onChange('internalDisposeUserId', $event)"
          >
            <span class="el-dropdown-link">
              <span
                class="box-border flex justify-between items-center pr-2 pl-4 w-36 h-7 text-xs leading-7 rounded-md border border-gray-300"
              >
                <span
                  class="flex-1 text-black"
                  :class="{ 'text-gray-300': !internalDisposeUserName }"
                >
                  {{ internalDisposeUserName || "请选择审核人" }}
                </span>
                <i v-if="!internalDisposeUserName" class="pl-3 el-icon-arrow-down" />
                <i
                  v-else
                  class="el-icon-circle-close"
                  @click.stop="onChange('internalDisposeUserId', '')"
                />
              </span>
            </span>

            <el-dropdown-menu slot="dropdown">
              <div
                ref="peopleDropdown"
                class="overflow-y-auto w-36 h-40"
                style="scrollbar-width: none"
                @scroll="handleScroll($event)"
              >
                <el-dropdown-item
                  v-for="item in peopleData"
                  :key="item.id"
                  :command="item"
                >
                  {{ item.fullName }}
                </el-dropdown-item>
              </div>
            </el-dropdown-menu>
          </el-dropdown>
        </el-form-item>

        <el-form-item v-if="showMore" label="客户处理状态：">
          <el-select
            v-model="form.customerStatus"
            placeholder="客户处理状态"
            style="width: 100%"
            clearable
            disabled
            multiple
            collapse-tags
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

        <el-form-item v-if="showMore" label="AI复判结果：">
          <el-select
            v-model="form.aiJudge"
            placeholder="AI复判结果"
            style="width: 100%"
            clearable
            @change="onChange('aiJudge', $event)"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('AiJudge')"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="mini" @click="handleBatchProcess">
            {{ isBatch ? "取消批量处理" : "批量处理" }}
          </el-button>
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button type="text">
            <el-checkbox v-model="checked">
              是否自动刷新
            </el-checkbox>
          </el-button>
          <el-button type="primary" icon="el-icon-search" @click="searchFn">
            查询
          </el-button>
          <el-button icon="el-icon-refresh-right" class="ml-2" @click="resetFn">
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
        :list="tableData"
        userType="InternalStatus"
        @checkAllChange="handleCheckAllChange($event, tableData)"
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
          type="InternalStatus"
          allType
          @check="handleChecked($event, tableData)"
          @success="handleSuccess"
        />

        <template v-else>
          <WarningInfo
            v-for="item in tableData"
            :key="item.id"
            type="InternalStatus"
            allType
            :form="form"
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
        :loading="isPending"
        type="InternalStatus"
        :selection="isBatch"
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

<style lang="scss" scoped>
.warning-checkbox-wrapper {
  width: calc((100% - 36px) / 3);
  // height: calc((67vh - 30px) / 4);
  margin: 0 6px;
  margin-top: 10px;

  &:nth-child(-n + 3) {
    margin-top: 0;
  }

  .el-checkbox {
    display: block;
    width: 100%;
    height: 100%;

    ::v-deep .el-checkbox__label {
      width: 100%;
      padding: 0;
    }

    ::v-deep .el-checkbox__input {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 10;
    }
  }
}

::v-deep.el-checkbox.is-bordered.el-checkbox--mini {
  height: auto;
  padding: 0;
  border-radius: 6px;
}
</style>
