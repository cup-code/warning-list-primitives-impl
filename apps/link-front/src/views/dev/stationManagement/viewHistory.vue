<script>
import {
  getCurrentInstance,
  reactive,
  ref,
} from 'vue'
import {
  moreButtonConfig,
  tableButtonConfig,
  tableConfig,
  v30MessageList,
} from './config'

export default {
  name: 'ViewHistory',
  setup() {
    const { proxy } = getCurrentInstance()
    const searchForm = reactive({})
    const dialogVisible = ref(false)
    const params = ref({
      dateRange: '',
    })
    const tableData = reactive([
      { step: 1,
name: '丹寮下村2-1',
sv5Img:
          'https://img0.baidu.com/it/u=1531050584,1118964180&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1740070800&t=8807887ace3c460420e1820977729b21',
sv5Value: '50%',
sv5Time: '2025-2-19 00:00:00',
sv30Img:
          'https://img0.baidu.com/it/u=1531050584,1118964180&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1740070800&t=8807887ace3c460420e1820977729b21',
sv30Value: '20%',
sv30Time: '2025-2-16 00:00:00',
sludgeNum: '1' },
      {
        step: 1,
        name: '丹寮下村2-1',
        sv5Img:
          'https://img0.baidu.com/it/u=1531050584,1118964180&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1740070800&t=8807887ace3c460420e1820977729b21',
        sv5Value: '50%',
        sv5Time: '2025-2-19 00:00:00',
        sv30Img:
          'https://img0.baidu.com/it/u=1531050584,1118964180&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1740070800&t=8807887ace3c460420e1820977729b21',
        sv30Value: '20%',
        sv30Time: '2025-2-16 00:00:00',
        sludgeNum: '1',
      },
    ])
    const exportPDF = () => {
      console.log('下载pdf')
    }

    const exportExcel = () => {
      console.log('exportExcel')
    }

    const onCancel = () => {
      dialogVisible.value = false
    }

    const onConfirm = () => {
      console.log(from)
      dialogVisible.value = false
    }

    return {
      searchForm,
      tableData,
      onCancel,
      onConfirm,
      dialogVisible,
      params,
      exportPDF,
      exportExcel,
    }
  },
  data() {
    return {
      loading: false,
      tableConfig,
      moreButtonConfig,
      tableButtonConfig,
      v30MessageList,
    }
  },
  methods: {
    treeNodeTap(v) {
      console.log(v)
    },
  },
}
</script>

<template>
  <el-dialog
    title="查看历史"
    class="normal-dialog"
    :visible.sync="dialogVisible"
    width="80%"
    @close="onCancel"
  >
    <div style="height: 60vh">
      <div class="p-2">
        <div class="flex items-center justify-between">
          <div class="font-bold">
            sv30测量记录
          </div>
          <div class="flex">
            <div class="mr-2 flex items-center">
              <span class="mr-2">选择时间:</span>
              <el-date-picker
                v-model="params.dateRange"
                type="daterange"
                range-separator="→"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="['00:00:00', '23:59:59']"
                value-format="yyyy-MM-dd"
              />
            </div>
            <div class="flex space-x-2">
              <el-button
                type="danger"
                size="small"
                @click="exportPDF"
              >
                下载pdf
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="exportExcel"
              >
                下载excel
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="my-2 border-b border-gray-200" />
      <div>
        <CTable
          height="92%"
          :list="v30MessageList"
          :tableData="tableData"
        >
          <template #sv5Img="{ info }">
            <img
              :src="info.sv5Img"
              alt="加载失败"
              class="h-[20px] w-[30px]"
            >
          </template>
          <template #sv30Img="{ info }">
            <img
              :src="info.sv30Img"
              alt="加载失败"
              class="h-[20px] w-[30px]"
            >
          </template>
        </CTable>
      </div>
    </div>
  </el-dialog>
</template>
