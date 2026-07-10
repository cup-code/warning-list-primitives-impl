<script>
import { useMutation, useQuery } from '@tanstack/vue-query'
import {
  getCurrentInstance,
  onMounted,
  ref,
} from 'vue'
import { aiAuditSkillList, deleteAiAuditSkill } from '@/http/videoWarning/warning-api'
import AddSkill from './components/addSkill.vue'

export default {
  name: 'AiAuditSkill',
  components: {
    AddSkill,
  },
  setup() {
    const { proxy } = getCurrentInstance()

    // 弹窗控制
    const dialogVisible = ref(false)
    const currentInfo = ref({})
    // 表格数据
    const tableData = ref([])
    const loading = ref(false)
    const columns = ref([
      { prop: 'machineName', label: '一体机名称', align: 'left' },
      { prop: 'companyName', label: '公司', align: 'center' },
      { prop: 'departmentName', label: '部门', align: 'center' },
      { prop: 'skills', label: '已配置技能', align: 'left' },
      {
        prop: 'enableState',
        label: '启用状态',
        align: 'center',
        slot: 'enableState',
      },
      {
        label: '操作',
        fixed: 'right',
        align: 'right',
        prop: 'operation',
        width: 150,
        slot: 'operation',
      },
    ])

    // 搜索表单数据
    const searchForm = ref({})

    // 查询列表数据
    const { refetch } = useQuery({
      queryKey: ['aiAuditSkillList', searchForm.value],
      queryFn: async () => await aiAuditSkillList(searchForm.value),
      onSuccess: (response) => {
        const { data } = response
        if (data?.success) {
          tableData.value = data.result || []
        }
        else {
          proxy.$message.error(data?.message || '获取列表失败')
        }
        loading.value = false
      },
      onError: (error) => {
        proxy.$message.error(error.message || '获取列表失败')
      },
    })

    // 删除操作
    const deleteSkill = useMutation({
      mutationFn: id => deleteAiAuditSkill({ id }),
      onSuccess: (response) => {
        const { data } = response
        if (data?.success) {
          proxy.$message.success('删除成功')
          refetch()
        }
        else {
          proxy.$message.error(data?.message || '删除失败')
        }
      },
      onError: (error) => {
        proxy.$message.error('删除失败')
      },
    })

    // 新增
    const handleAdd = () => {
      currentInfo.value = {}
      dialogVisible.value = true
    }

    // 编辑
    const handleEdit = (row) => {
      currentInfo.value = { ...row }
      dialogVisible.value = true
    }

    // 删除
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
        .catch(() => {
          // 取消删除
        })
    }

    // 生命周期
    onMounted(() => {
      loading.value = true
      refetch()
    })

    return {
      searchForm,
      tableData,
      loading,
      columns,
      dialogVisible,
      currentInfo,
      handleAdd,
      handleEdit,
      handleDelete,
      refetch,
    }
  },
}
</script>

<template>
  <KyTreeTable :isShowLeft="false">
    <!-- 表格区域 -->
    <ECard slot="table">
      <div class="mb-4">
        <EButton btnIcon="el-icon-plus" type="primary" class="mr-2" @click="handleAdd">
          新增
        </EButton>
      </div>
      <CTable :tableData="tableData" :loading="loading" height="92%" :list="columns">
        <template #enableState="{ info }">
          <el-tag plain :type="info.enableState ? 'success' : 'danger'" size="mini">
            {{ info.enableState ? "启用" : "禁用" }}
          </el-tag>
        </template>
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

    <!-- 弹窗 -->
    <AddSkill slot="dialog" :visible.sync="dialogVisible" :editInfo="currentInfo" />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
// 如有需要添加特定样式
</style>
