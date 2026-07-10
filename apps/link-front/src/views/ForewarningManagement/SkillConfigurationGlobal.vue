<script>
import { useMutation, useQuery } from '@tanstack/vue-query'
import { getCurrentInstance, onMounted, ref } from 'vue'
import {
  deleteVideoModelSkillGlobal,
  videoModelSkillGlobalQuery,
} from '@/http/videoWarning/warning-api'
import AddModelSkill from './components/AddModelSkill.vue'

export default {
  name: 'SkillConfigurationGlobal',
  components: {
    AddModelSkill,
  },
  setup() {
    const { proxy } = getCurrentInstance()

    // 表格数据
    const tableData = ref([])
    const loading = ref(false)
    const total = ref(0)

    const columns = ref([
      { prop: 'skillName', label: '技能名称', align: 'left' },
      { prop: 'skillPrompt', label: '技能提示词', align: 'left' },
      { prop: 'skillWords', label: '技能关键词', align: 'left' },
      {
        prop: 'operation',
        label: '操作',
        fixed: 'right',
        align: 'right',
        width: 150,
        slot: 'operation',
      },
    ])

    // 搜索表单（含分页参数）
    const searchForm = ref({
      pageNum: 1,
      pageSize: 10,
      skillName: '',
      skillPrompt: '',
      skillWords: '',
    })

    // 查询列表
    const { refetch } = useQuery({
      queryKey: ['modelSkillList', 'global', searchForm.value],
      queryFn: async () => await videoModelSkillGlobalQuery(searchForm.value),
      onSuccess: (response) => {
        const { data } = response
        if (data?.success) {
          // 分页接口：result = { list, total }
          tableData.value = data.result?.list || []
          total.value = data.result?.total || 0
        }
        else {
          proxy.$message.error(data?.message || '获取列表失败')
        }
        loading.value = false
      },
      onError: (error) => {
        proxy.$message.error(error?.message || '获取列表失败')
        loading.value = false
      },
    })

    // 查询（回到第 1 页）
    const searchFn = () => {
      searchForm.value.pageNum = 1
      loading.value = true
      refetch()
    }

    // 重置
    const resetFn = () => {
      searchForm.value = {
        pageNum: 1,
        pageSize: 10,
        skillName: '',
        skillPrompt: '',
        skillWords: '',
      }
      loading.value = true
      refetch()
    }

    // 分页：每页条数变化
    const handleSizeChange = (size) => {
      searchForm.value.pageSize = size
      searchForm.value.pageNum = 1
      loading.value = true
      refetch()
    }

    // 分页：页码变化
    const handleCurrentChange = (current) => {
      searchForm.value.pageNum = current
      loading.value = true
      refetch()
    }

    onMounted(() => {
      loading.value = true
      refetch()
    })

    // 新增弹窗（编辑/删除在 US3/US4 接入）
    const dialogVisible = ref(false)
    const currentInfo = ref({})

    const handleAdd = () => {
      currentInfo.value = {}
      dialogVisible.value = true
    }

    // 编辑（US3）
    const handleEdit = (row) => {
      currentInfo.value = { ...row }
      dialogVisible.value = true
    }

    // 删除（US4）
    const deleteSkill = useMutation({
      mutationFn: id => deleteVideoModelSkillGlobal({ id }),
      onSuccess: (response) => {
        const { data } = response
        if (data?.success) {
          proxy.$message.success('删除成功')
          // 当前页删空且非第 1 页 → 回退一页（FR-011）
          if (tableData.value.length <= 1 && searchForm.value.pageNum > 1) {
            searchForm.value.pageNum -= 1
          }
          refetch()
        }
        else {
          proxy.$message.error(data?.message || '删除失败')
        }
      },
      onError: () => {
        proxy.$message.error('删除失败')
      },
    })

    const handleDelete = (row) => {
      proxy
        .$confirm('确认删除该技能配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(() => {
          deleteSkill.mutate(row.id)
        })
        .catch(() => {})
    }

    return {
      tableData,
      loading,
      total,
      columns,
      searchForm,
      dialogVisible,
      currentInfo,
      handleAdd,
      handleEdit,
      handleDelete,
      searchFn,
      resetFn,
      handleSizeChange,
      handleCurrentChange,
    }
  },
}
</script>

<template>
  <KyTreeTable :isShowLeft="false">
    <!-- 搜索区 -->
    <ECard slot="search" type="search" noneBottom>
      <div>
        <el-form :model="searchForm" size="mini" inline>
          <el-form-item label="技能名称">
            <el-input
              v-model="searchForm.skillName"
              placeholder="请输入技能名称"
              clearable
              @keyup.enter.native="searchFn"
            />
          </el-form-item>
          <el-form-item label="技能提示词">
            <el-input
              v-model="searchForm.skillPrompt"
              placeholder="请输入技能提示词"
              clearable
              @keyup.enter.native="searchFn"
            />
          </el-form-item>
          <el-form-item label="技能关键词">
            <el-input
              v-model="searchForm.skillWords"
              placeholder="请输入技能关键词"
              clearable
              @keyup.enter.native="searchFn"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="searchFn">
              查询
            </el-button>
            <el-button icon="el-icon-refresh-right" @click="resetFn">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </ECard>

    <!-- 表格区 -->
    <ECard slot="table">
      <div class="mb-4">
        <EButton btnIcon="el-icon-plus" type="primary" class="mr-2" @click="handleAdd">
          新增
        </EButton>
      </div>
      <CTable :tableData="tableData" :loading="loading" height="92%" :list="columns">
        <template #operation="{ info }">
          <EButton btnIcon="el-icon-edit" type="text" @click="handleEdit(info)">
            修改
          </EButton>
          <EButton
            btnIcon="el-icon-delete"
            type="text"
            class="text-red-500"
            @click="handleDelete(info)"
          >
            删除
          </EButton>
        </template>
      </CTable>
    </ECard>

    <!-- 分页区 -->
    <ECard slot="page" type="footer">
      <el-pagination
        :current-page="searchForm.pageNum"
        :page-size="searchForm.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </ECard>

    <!-- 新增/编辑弹窗 -->
    <AddModelSkill
      slot="dialog"
      :visible.sync="dialogVisible"
      :editInfo="currentInfo"
      scope="global"
    />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
// 列表页样式（按需补充）
</style>
