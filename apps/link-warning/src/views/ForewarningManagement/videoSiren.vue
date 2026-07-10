<script>
import { useQuery } from '@tanstack/vue-query'
import {
  getCurrentInstance,
  onMounted,
  ref,
} from 'vue'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { deleteVideoSiren, queryVideoSiren } from '@/http/videoWarning/warning-api'
import VideoSirenDialog from './components/VideoSirenDialog.vue'

export default {
  name: 'VideoSiren',
  components: {
    VideoSirenDialog,
  },
  setup() {
    const { proxy } = getCurrentInstance()

    // 表格数据
    const tableData = ref([])
    const loading = ref(false)
    const total = ref(0)
    const selectedRows = ref([])
    const formRef = ref(null)
    const columns = [
      { prop: 'deviceName', label: '声光报警器名称', minWidth: 120 },
      { prop: 'deviceModel', label: '设备型号', minWidth: 100 },
      { prop: 'deviceNum', label: '设备序列号', minWidth: 120 },
      { prop: 'ipAddr', label: 'IP地址', minWidth: 120 },
      { prop: 'portNum', label: '端口号', minWidth: 80 },
      { prop: 'repeatTimes', label: '重复播报次数', minWidth: 80 },
      { prop: 'enableState', label: '启用状态', width: 80, slot: 'enableState' },
      {
        label: '操作',
        fixed: 'right',
        prop: 'operation',
        align: 'right',
        width: 200,
        slot: 'operation',
      },
    ]

    // 搜索表单数据
    const searchForm = ref({
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      deviceName: '',
      deviceNum: '',
    })

    // 弹窗控制
    const dialogVisible = ref(false)
    const dialogType = ref('add') // add or edit
    const formData = ref({})
    const showMore = ref(false)
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

    // 获取表格数据
    const fetchData = async () => {
      loading.value = true
      try {
        const res = await queryVideoSiren(searchForm.value)
        if (res.data && res.data.success) {
          tableData.value = res.data.result.list || []
          total.value = res.data.result.total || 0
        }
        else {
          proxy.$message.error(res.data?.message || '获取数据失败')
        }
      }
      catch (error) {
        console.error('获取声光报警器列表失败:', error)
        proxy.$message.error('获取声光报警器列表失败')
      }
      finally {
        loading.value = false
      }
    }

    // 搜索条件变化
    const onChange = (key, value) => {
      if (value) {
        searchForm.value[key] = value
      }
      else {
        delete searchForm.value[key]
      }
    }

    // 搜索
    const searchFn = () => {
      searchForm.value.pageNum = 1
      fetchData()
    }

    // 重置
    const resetFn = () => {
      formRef.value.resetFields()
      searchForm.value.pageNum = 1
      searchForm.value.pageSize = 10
      searchForm.value.departmentId = ''
      searchForm.value.deviceName = ''
      searchForm.value.deviceNum = ''
      fetchData()
    }

    // 切换更多搜索条件
    const toggleMore = () => {
      showMore.value = !showMore.value
    }

    // 分页大小变化
    const handleSizeChange = (size) => {
      searchForm.value.pageSize = size
      fetchData()
    }

    // 分页页码变化
    const handleCurrentChange = (current) => {
      searchForm.value.pageNum = current
      fetchData()
    }

    // 新增
    const handleAdd = () => {
      dialogType.value = 'add'
      formData.value = {
        enableState: '1', // 默认启用
      }
      dialogVisible.value = true
    }

    // 查看
    const handleView = (row) => {
      dialogType.value = 'view'
      formData.value = JSON.parse(JSON.stringify(row))
      dialogVisible.value = true
    }

    // 编辑
    const handleEdit = (row) => {
      dialogType.value = 'edit'
      formData.value = JSON.parse(JSON.stringify(row))
      dialogVisible.value = true
    }

    // 删除
    const handleDelete = async ({ id }) => {
      try {
        await proxy.$confirm('确定要删除该声光报警器吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })

        const res = await deleteVideoSiren({ id })
        if (res.data && res.data.success) {
          proxy.$message.success('删除成功')
          fetchData()
        }
        else {
          proxy.$message.error(res.data?.message || '删除失败')
        }
      }
      catch (error) {
        if (error !== 'cancel') {
          console.error('删除声光报警器失败:', error)
          proxy.$message.error('删除声光报警器失败')
        }
      }
    }

    onMounted(() => {
      fetchData()
    })

    return {
      searchForm,
      tableData,
      loading,
      columns,
      total,
      departmentListQuery,
      departmentList,
      dialogVisible,
      dialogType,
      formData,
      selectedRows,
      showMore,
      formRef,
      fetchData,
      handleView,
      searchFn,
      resetFn,
      onChange,
      toggleMore,
      handleSizeChange,
      handleCurrentChange,
      handleAdd,
      handleEdit,
      handleDelete,
    }
  },
}
</script>

<template>
  <KyTreeTable :isShowLeft="false">
    <!-- 搜索区域 -->
    <ECard slot="search" type="search" noneBottom>
      <el-form ref="formRef" :model="searchForm" size="mini" inline>
        <el-form-item label="声光报警器名称">
          <el-input
            v-model="searchForm.deviceName"
            placeholder="请输入声光报警器名称"
            clearable
            s
            @change="onChange('deviceName', $event)"
          />
        </el-form-item>
        <el-form-item v-if="showMore" label="设备序列号">
          <el-input
            v-model="searchForm.deviceNum"
            placeholder="请输入设备序列号"
            clearable
            @change="onChange('deviceNum', $event)"
          />
        </el-form-item>
        <el-form-item label="所属部门：">
          <el-select
            v-model="searchForm.departmentId"
            placeholder="请选择部门"
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
        <!-- 按钮 -->
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="searchFn">
            查询
          </el-button>
          <el-button icon="el-icon-refresh-right" @click="resetFn">
            重置
          </el-button>
          <el-button type="text" style="margin-left: 8px" @click="toggleMore">
            {{ showMore ? "收起" : "高级筛选" }}
            <i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 表格区域 -->
    <ECard slot="table">
      <div class="mb-4">
        <EButton type="primary" icon="add" class="mr-2" @click="handleAdd">
          新增
        </EButton>
      </div>
      <CTable :tableData="tableData" :loading="loading" :list="columns" height="92%">
        <template #enableState="{ info }">
          <el-tag :type="info.enableState === 1 ? 'success' : 'info'">
            {{ info.enableState === 1 ? "已启用" : "已禁用" }}
          </el-tag>
        </template>
        <template #operation="{ info }">
          <EButton
            type="text"
            btnIcon="el-icon-view"
            class="mr-1"
            @click="handleView(info)"
          >
            查看
          </EButton>
          <EButton type="text" icon="edit" class="mr-1" @click="handleEdit(info)">
            编辑
          </EButton>
          <EButton type="text" icon="delete" class="mr-1" @click="handleDelete(info)">
            删除
          </EButton>
        </template>
      </CTable>
    </ECard>

    <!-- 分页区域 -->
    <ECard slot="page" type="footer">
      <el-pagination
        :current-page="searchForm.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="searchForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </ECard>

    <!-- 弹窗组件 -->
    <VideoSirenDialog
      slot="dialog"
      :visible.sync="dialogVisible"
      :dialogType="dialogType"
      :formData="formData"
      @success="fetchData"
    />
  </KyTreeTable>
</template>

<style scoped>
.mr-1 {
  margin-right: 5px;
}
.mr-2 {
  margin-right: 10px;
}
.mb-4 {
  margin-bottom: 15px;
}
.p-4 {
  padding: 15px;
}
</style>
