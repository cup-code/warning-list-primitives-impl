<script>
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import { getCurrentInstance, ref } from 'vue'
import { deleteViewPoint, getViewPointList } from '@/http/map/manage-api'

import addViewDialog from './addViewDialog'
import config from './config'

export default {
  name: 'ThreeDViewPoint',
  components: { AddViewDialog: addViewDialog },

  setup() {
    const vm = getCurrentInstance().proxy
    const queryClient = useQueryClient()
    const form = ref({
      pageNum: 1,
      pageSize: 10,
      viewName: '',
    })
    const totalItems = ref(0)
    const tableData = ref([])
    const { isFetching, refetch } = useQuery({
      queryKey: ['viewPointList', form.value],
      queryFn: () => getViewPointList(form.value),
      keepPreviousData: true,
      onSuccess: ({ data }) => {
        const { list, total } = data.result
        if (data.success) {
          tableData.value = list
          totalItems.value = total
        }
      },
    })

    const { mutate: deleteView } = useMutation({
      mutationFn: deleteViewPoint,
      onSuccess: () => {
        vm.$message.success('删除成功')
        queryClient.invalidateQueries({
          queryKey: ['viewPointList', form.value],
          refetchType: 'all',
        })
      },
    })

    const onDelete = (info) => {
      vm.$confirm('此操作将删除标注类型，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        deleteView(info.id)
      })
    }

    const onSearch = () => {
      refetch()
    }

    const onReset = () => {
      form.value = {
        pageNum: 1,
        pageSize: 10,
      }
      onSearch()
    }

    const handleSizeChange = (val) => {
      if (form.value.pageSize !== val) {
        form.value.pageSize = val
        refetch()
      }
    }

    const handleCurrentChange = (val) => {
      if (form.value.pageNum !== val) {
        form.value.pageNum = val
        refetch()
      }
    }
    return {
      form,
      onSearch,
      onReset,
      isFetching,
      tableData,
      totalItems,
      onDelete,
      handleSizeChange,
      handleCurrentChange,
    }
  },
  data() {
    return {
      showAddViewDialog: false,
      rowInfo: {},
      isCheck: false,
      isEdit: false,
      tableLoading: false,
      list: config.viewPoint_table_config,
    }
  },
  methods: {
    onClose() {
      this.showAddViewDialog = false
      this.$refs.viewDialog.closeMap()
    },
    newAddView() {
      this.showAddViewDialog = true
    },
    onCheck(info) {
      this.showAddViewDialog = true
      this.isCheck = true
      this.rowInfo = info
    },

    onEdit(info) {
      this.showAddViewDialog = true
      this.rowInfo = info
      this.isEdit = true
    },
  },
}
</script>

<template>
  <KyTreeTable :isShowLeft="false">
    <ECard
      slot="search"
      :noneBottom="true"
      type="search"
    >
      <el-form
        size="mini"
        :model="form"
        :inline="true"
      >
        <el-form-item label="视角名称:">
          <el-input
            v-model="form.viewName"
            clearable
            placeholder="请输入视角名称"
          />
        </el-form-item>
        <el-form-item>
          <EButton
            type="primary"
            icon="search"
            @click="onSearch"
          >
            查询
          </EButton>
          <EButton
            type="default"
            btnIcon="el-icon-refresh-right"
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
          type="primary"
          plain
          btnIcon="el-icon-plus"
          @click="newAddView"
        >
          新增视角
        </EButton>
      </div>
      <CTable
        height="94%"
        :tableData="tableData"
        :list="list"
        :loading="tableLoading"
      >
        <template #x="props">
          {{ props.info.longitude || "-" }}
        </template>
        <template #y="props">
          {{ props.info.latitude || "-" }}
        </template>
        <template #z="props">
          {{ props.info.height || "-" }}
        </template>
        <template #default="props">
          <EButton
            type="text"
            icon="check"
            @click="onCheck(props.info)"
          >
            查看
          </EButton>
          <EButton
            type="text"
            icon="edit"
            @click="onEdit(props.info)"
          >
            编辑
          </EButton>
          <EButton
            type="text"
            icon="delete"
            @click="onDelete(props.info)"
          >
            删除
          </EButton>
        </template>
        <template #tagBlock="props">
          <el-tag :type="props.info.isDefault ? 'success' : 'info'">
            {{ props.info.isDefault ? "是" : "否" }}
          </el-tag>
        </template>
      </CTable>
    </ECard>

    <ECard slot="page" type="footer">
      <el-pagination
        :current-page="form.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="form.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </ECard>

    <template slot="dialog">
      <AddViewDialog
        ref="viewDialog"
        :isEdit.sync="isEdit"
        :info.sync="rowInfo"
        :isCheck.sync="isCheck"
        :visible.sync="showAddViewDialog"
        @close="onClose"
      />
    </template>
  </KyTreeTable>
</template>
