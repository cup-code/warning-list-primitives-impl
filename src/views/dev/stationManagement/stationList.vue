<script>
import {
  getCurrentInstance,
  reactive,
  ref,
} from 'vue'
import { getInspectionStandardListByPageFn } from '@/http/dev_new/inspection-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import {
  moreButtonConfig,
  tableButtonConfig,
  tableConfig,
} from './config'
import SubSystemConfig from './subSystemConfig.vue'

export default {
  name: 'StationList',
  components: {
    OwnDeparmentTree,
    SubSystemConfig,
  },
  setup() {
    const { proxy } = getCurrentInstance()
    const searchForm = reactive({})
    const subSystemConfig = ref(null)
    const tableData = reactive([
      {
        wwww: '民安片区',
        // meshName: "南池村-1",
        stationName: '丹务-1',
        emissionStandard: '省标二',
        designWater: '40m³/d',
        equipmentValue: '5',
        personInCharge: '林晓璇',
      },
    ])

    const searchData = ref({
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      deviceId: '',
      deviceName: '',
      positionName: '',
    })

    const total = ref(0)

    const onSubmit = () => {
      console.log(searchForm)
    }

    const onReset = () => {
      console.log('重置')
    }

    const onView = () => {
      proxy.$router.push({
        path: '/dev/stationManagement/stationInfo',
        query: {
          type: 'view',
          station: '丹务1',
        },
      })
    }

    const onEdit = () => {
      proxy.$router.push({
        path: '/dev/stationManagement/stationInfo',
        query: {
          type: 'edit',
          station: '丹务1',
        },
      })
    }

    const onAdd = () => {
      proxy.$router.push({
        path: '/dev/stationManagement/stationInfo',
      })
    }

    const onListClick = () => {
      console.log('Excel导入')
    }

    const onSubSystemConfig = () => {
      subSystemConfig.value.dialogVisible = true
    }

    // 获取表格数据
    const getTableData = () => {
      this.isLoading = true
      getInspectionStandardListByPageFn(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total || 0
            this.$nextTick(() => {
              this.setExpandRows() // 设置当前展开行
            })
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    }

    return {
      searchForm,
      tableData,
      onSubmit,
      onReset,
      onView,
      onEdit,
      onAdd,
      onListClick,
      subSystemConfig,
      onSubSystemConfig,
      searchData,
      total,
      getTableData,
    }
  },
  data() {
    return {
      loading: false,
      tableConfig,
      moreButtonConfig,
      tableButtonConfig,
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.nodeType === 'device') {
        this.searchData.deviceId = data.id
        this.searchData.departmentId = ''
        this.searchData.deviceName = '' // 如果点击了左侧树的设备。则搜索条件中的设备名称置空
        this.deviceName = data.name
      }
      else {
        this.searchData.departmentId = data.id
        this.searchData.deviceId = ''
        this.deviceName = ''
      }
      this.getTableData()
    },
    onDelete(v) {
      console.log('删除')
    },
    onProductionSchedule(v) {},
  },
}
</script>

<template>
  <div>
    <TreeTable>
      <OwnDeparmentTree
        slot="tree"
        @treeNodeTap="treeNodeTap"
      />
      <ECard
        slot="search"
        type="search"
        noneBottom
      >
        <el-form
          :inline="true"
          :model="searchForm"
          size="mini"
          class="demo-form-inline"
        >
          <el-form-item label="设备名称">
            <el-input
              v-model="searchForm.user"
              placeholder="审批人"
            />
          </el-form-item>
          <el-form-item label="排放标准">
            <el-select
              v-model="searchForm.region"
              placeholder="活动区域"
            >
              <el-option
                label="区域一"
                value="shanghai"
              />
              <el-option
                label="区域二"
                value="beijing"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="运维负责人">
            <el-select
              v-model="searchForm.region"
              placeholder="活动区域"
            >
              <el-option
                label="区域一"
                value="shanghai"
              />
              <el-option
                label="区域二"
                value="beijing"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <EButton
              type="primary"
              btnIcon="el-icon-search"
              @click="onSubmit"
            >
              查询
            </EButton>
            <EButton
              type="default"
              btnIcon="el-icon-refresh"
              @click="onReset"
            >
              重置
            </EButton>
          </el-form-item>
        </el-form>
      </ECard>
      <ECard slot="table">
        <div class="card-cell">
          <EButton
            v-for="item in tableButtonConfig"
            :key="item.props"
            :type="item.type"
            :plain="item.plain"
            :icon="item.icon"
            @click="onListClick(item.props)"
          >
            {{ item.text }}
          </EButton>
        </div>
        <CTable
          height="92%"
          :list="tableConfig"
          :tableData="tableData"
        >
          <template #name="{ info }">
            <span class="text-blue-500">{{ info.meshName }}</span>
          </template>

          <template #action="{ info }">
            <EButton
              type="text"
              icon="check"
              @click="onView(info)"
            >
              查看
            </EButton>
            <EButton
              type="text"
              icon="edit"
              @click="onEdit"
            >
              修改
            </EButton>
            <EMoreButton
              type="text"
              :list="moreButtonConfig"
              @delete="onDelete"
              @productionSchedule="onProductionSchedule"
              @subSystemConfig="onSubSystemConfig"
            />
          </template>
        </CTable>
      </ECard>
      <ECard
        slot="page"
        type="footer"
      >
        <el-pagination
          style="text-align: right"
          :current-page.sync="searchData.pageNum"
          :page-sizes="[10, 20, 50]"
          background
          :page-size.sync="searchData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="getTableData"
          @current-change="getTableData"
        />
      </ECard>
    </TreeTable>

    <SubSystemConfig ref="subSystemConfig" />
  </div>
</template>

<style lang="scss" scoped>
.station-list {
  width: 100%;
  height: 100%;
}
</style>
