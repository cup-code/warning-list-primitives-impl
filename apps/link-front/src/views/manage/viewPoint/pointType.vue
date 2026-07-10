<script>
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import { getCurrentInstance, ref } from 'vue'

import { deleteMarkerType, getMarkerTypeList } from '@/http/map/manage-api'
import addPointTypeDialog from './addPointTypeDialog'
import config from './config'

export default {
  name: 'pointType',
  components: { AddPointTypeDialog: addPointTypeDialog },

  setup() {
    const vm = getCurrentInstance().proxy
    const queryClient = useQueryClient()
    const form = ref({
      typeName: '',
      pageNum: 1,
      pageSize: 10,
    })
    const totalItems = ref(0)
    const info = ref({})
    const visible = ref(false)
    const isCheck = ref(false)
    const tableData = ref([])

    const { isFetching, refetch } = useQuery({
      queryKey: ['markerTypeList', form.value],
      queryFn: () => getMarkerTypeList(form.value),
      keepPreviousData: true,
      onSuccess: ({ data }) => {
        if (data.success) {
          console.log(data)
          const { list, total } = data.result || {}
          tableData.value = list
          totalItems.value = total
        }
      },
    })

    const { mutate: deleteMarker } = useMutation({
      mutationFn: deleteMarkerType,
      onSuccess: () => {
        vm.$message.success('删除成功')
        queryClient.invalidateQueries({
          queryKey: ['markerTypeList', form.value],
          refetchType: 'all',
        })
      },
    })

    const newAddView = () => {
      visible.value = true
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

    const onInputBlur = (val) => {
      form.value.typeName = val
    }

    const onCheck = (item) => {
      visible.value = true
      isCheck.value = true
      info.value = item
    }

    const onDelete = (info) => {
      vm.$confirm('此操作将删除标注类型，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        deleteMarker(info.id)
      })
    }

    const onEdit = (item) => {
      visible.value = true
      isCheck.value = false
      info.value = item
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

    const onClose = () => {
      visible.value = false
    }

    return {
      form,
      isFetching,
      totalItems,
      info,
      isCheck,
      visible,
      tableData,
      newAddView,
      onSearch,
      onReset,
      onInputBlur,
      onCheck,
      onDelete,
      onEdit,
      handleSizeChange,
      handleCurrentChange,
      onClose,
    }
  },
  data() {
    return {
      // info: {},
      // visible: false,
      // tableData: [],
      list: config.pointType_table_config,
      // tableLoading: false,
      // totalItems: 0
    }
  },
  created() {
    this.getPrefix()
  },
}
</script>

<template>
  <KyTreeTable :isShowLeft="false">
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        size="mini"
        :model="form"
        :inline="true"
      >
        <el-form-item label="标注名称:">
          <el-input
            v-model="form.typeName"
            clearable
            @change="onInputBlur"
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
          新增标注类型
        </EButton>
      </div>
      <CTable
        :tableData="tableData"
        height="90%"
        :list="list"
        :loading="isFetching"
      >
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
        <template #icon="props">
          <div class="flex items-center justify-center">
            <img
              width="30"
              height="30"
              :src="filePrefix + props.info.icon"
              alt=""
            >
          </div>
        </template>
      </CTable>
    </ECard>

    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        background
        :current-page="form.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="form.pageSize"
        :total="totalItems"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </ECard>

    <template slot="dialog">
      <AddPointTypeDialog
        ref="pointType"
        :moduleValue.sync="visible"
        :isCheck.sync="isCheck"
        :info.sync="info"
        @close="onClose"
      />
    </template>
  </KyTreeTable>
</template>
