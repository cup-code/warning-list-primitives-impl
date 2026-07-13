<script>
import { useMutation, useQuery } from '@tanstack/vue-query'
import { getCurrentInstance, ref } from 'vue'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { deleteMachine, machineList } from '@/http/videoWarning/warning-api'
import AddMachine from './components/addMachine.vue'
import { machineListConfig } from './config.js'

export default {
  name: 'MachineList',
  components: {
    AddMachine,
  },
  setup() {
    const { proxy } = getCurrentInstance()
    const searchForm = ref({
      pageNum: 1,
      pageSize: 10,
      isPage: true,
    })
    const tableData = ref([])
    const total = ref(0)
    const addMachineRef = ref(null)
    const info = ref({})
    const check = ref(false)
    const { refetch, isLoading } = useQuery({
      queryKey: ['machineList'],
      queryFn: () => machineList(searchForm.value),
      onSuccess: ({ data }) => {
        if (data.code === 200) {
          const { list, total: totalCount } = data.result
          tableData.value = list
          total.value = totalCount
        }
      },
      onError: (error) => {
        console.log(error)
      },
    })

    const getStatus = (status) => {
      const statusMap = {
        online: '在线',
        offline: '离线',
      }
      return statusMap[status] || '未知'
    }

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

    const deleteMachineMutate = useMutation({
      mutationFn: params => deleteMachine(params),
      onSuccess: ({ data }) => {
        if (data.code === 200) {
          proxy.$message.success('删除成功')
          refetch()
        }
      },
      onError: (error) => {
        console.log(error)
      },
    })

    const onChange = (key, value) => {
      if (value) {
        searchForm.value[key] = value
      }
      else {
        delete searchForm.value[key]
      }

      searchFn()
    }

    const searchFn = () => {
      refetch()
    }

    const onDelete = (info) => {
      proxy
        .$confirm('确定删除该一体机吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(() => {
          deleteMachineMutate.mutate({ id: info.id })
        })
    }

    const onAddMachine = () => {
      addMachineRef.value?.onOpen()
    }

    const onEdit = (rowInfo) => {
      info.value = rowInfo
      addMachineRef.value?.onOpen()
    }

    const onView = (rowInfo) => {
      info.value = rowInfo
      check.value = true
      addMachineRef.value?.onOpen()
    }

    const resetFn = () => {
      searchForm.value = {
        pageNum: 1,
        pageSize: 12,
      }
      refetch()
    }

    const pageSizeFn = (size) => {
      searchForm.value.pageSize = size
      refetch()
    }

    const pageCurFn = (cur) => {
      searchForm.value.pageNum = cur
      refetch()
    }
    return {
      addMachineRef,
      check,
      info,
      onAddMachine,
      searchForm,
      onChange,
      onDelete,
      onEdit,
      onView,
      machineListConfig,
      tableData,
      isLoading,
      total,
      departmentList,
      departmentListQuery,
      getStatus,
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
        <el-form-item label="一体机名称：">
          <el-input
            v-model="searchForm.machineName"
            placeholder="请输入一体机名称"
            @change="onChange('machineName', $event)"
          />
        </el-form-item>

        <el-form-item label="一体机code：">
          <el-input
            v-model="searchForm.machineCode"
            placeholder="请输入一体机code"
            @change="onChange('machineCode', $event)"
          />
        </el-form-item>

        <el-form-item label="所属部门：">
          <el-select
            v-model="searchForm.departmentId"
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

        <el-form-item label="两山智联盒SN：">
          <el-input
            v-model="searchForm.oraySn"
            clearable
            placeholder="请输入两山智联盒SN"
            @change="onChange('oraySn', $event)"
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
    <ECard slot="table">
      <div class="card-cell">
        <EButton
          type="primary"
          icon="add"
          @click="onAddMachine"
        >
          新增一体机
        </EButton>
      </div>

      <CTable
        :list="machineListConfig"
        height="92%"
        :tableData="tableData"
        :loading="isLoading"
      >
        <!-- <template #status="{ info }">
          <el-tag :type="info.status === 'online' ? 'success' : 'danger'">
            {{ getStatus(info.status) }}
          </el-tag>
        </template> -->
        <template #operation="{ info }">
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
            @click="onEdit(info)"
          >
            修改
          </EButton>
          <EButton
            type="text"
            icon="delete"
            @click="onDelete(info)"
          >
            删除
          </EButton>
        </template>
      </CTable>
    </ECard>

    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page="searchForm.pageNum"
        :page-sizes="[12, 24, 48]"
        :page-size="searchForm.pageSize"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        :background="true"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>

    <div slot="dialog">
      <AddMachine
        ref="addMachineRef"
        :info.sync="info"
        :check.sync="check"
      />
    </div>
  </KyTreeTable>
</template>
