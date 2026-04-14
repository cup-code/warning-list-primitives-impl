<script>
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import { getCurrentInstance, ref } from 'vue'
import {
  addHmiGroup,
  deleteHmiGroup,
  getHmiGroup,
} from '@/http/hmi/group-api'

export default {
  setup() {
    const vm = getCurrentInstance().proxy
    const queryCache = useQueryClient()

    const forms = ref({ page: 1, pageSize: 10 })
    const formData = ref({ groupName: '', remarks: '' })
    const addForm = ref()
    const tableData = ref([])
    const total = ref(0)
    const drawer = ref(false)
    const drawerTitle = ref('')

    const { isFetching } = useQuery({
      queryKey: ['hmiGroup', forms.value],
      queryFn: () => getHmiGroup(forms.value),
      keepPreviousData: true,
      onSuccess: (response) => {
        if (response?.data?.success) {
          tableData.value = response.data.result.list || []
          total.value = response.data.result.total || 0
        }
        else {
          vm.$message.error(response?.data?.message || '查询分组失败')
        }
      },
      onError: (error) => {
        console.error('Query error:', error)
        vm.$message.error('查询分组失败')
      },
    })

    const { mutate: addHmiGroupMutate } = useMutation({
      mutationFn: params => addHmiGroup(params),
      onSuccess: () => {
        vm.$message.success('添加分组成功')
        drawer.value = false
        queryCache.invalidateQueries({
          queryKey: ['hmiGroup'],
          refetchType: 'all',
        })
      },
    })

    const { mutate: deleteHmiGroupMutate } = useMutation({
      mutationFn: params => deleteHmiGroup(params),
      onSuccess: () => {
        vm.$message.success('删除成功')
        queryCache.invalidateQueries({
          queryKey: ['hmiGroup'],
          refetchType: 'all',
        })
      },
    })

    const delFn = (v) => {
      vm.$confirm(`您确认要删除 ${v?.groupName}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        deleteHmiGroupMutate(v.id)
      })
    }

    function submitFn() {
      addForm.value.validate((valid) => {
        if (!valid)
          return

        addHmiGroupMutate(formData.value)
      })
    }

    const onChangePage = (page) => {
      forms.value = {
        ...forms.value,
        page,
      }
      queryCache.invalidateQueries({
        queryKey: ['hmiGroup'],
        refetchType: 'all',
      })
    }

    const addFn = () => {
      formData.value = { groupName: '', remarks: '' }
      drawerTitle.value = '新建组态分组'
      drawer.value = true
    }

    const editFn = (row) => {
      formData.value = { ...row }
      console.log('object', row)
      drawerTitle.value = '编辑组态分组'
      drawer.value = true
    }

    return {
      tableData,
      isFetching,
      forms,
      delFn,
      formData,
      drawer,
      addForm,
      submitFn,
      onChangePage,
      total,
      drawerTitle,
      addFn,
      editFn,
    }
  },
  data: () => ({
    loading: false,
    pageFlag: true,
    sForm: {
      page: 1,
      pageSize: 12,
    },
    drawerType: 0,
    form: { groupName: '', remarks: '' },
    rules: {},
    submitLoading: false,
  }),
  created() {
    // this.getDataList()
  },
  methods: {
    getDataList() {
      this.loading = true
      getHmiGroup(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.tableData = resD.result.list
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '查询分组失败')
          }
        })
        .catch((err) => {
          this.loading = false
          console.log(err)
          this.$message.error('查询分组失败')
        })
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
  },
}
</script>

<template>
  <KyTreeTable :isShowLeft="false">
    <ECard
      slot="table"
      customStyle="height:80vh"
    >
      <!-- 按钮 -->
      <div class="card-cell">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="addFn"
        >
          新建分组
        </el-button>
      </div>

      <!-- 内容 -->
      <el-table
        v-loading="isFetching"
        class="group-table"
        :data="tableData"
        border
        size="mini"
        style="width: 100%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="分组名称"
          prop="groupName"
          align="center"
        />
        <el-table-column
          label="分组描述"
          prop="remarks"
          align="center"
        />
        <el-table-column
          label="操作"
          width="200"
          align="center"
        >
          <template slot-scope="scope">
            <EButton
              icon="edit"
              size="mini"
              type="text"
              @click="editFn(scope.row)"
            >
              编辑
            </EButton>
            <EButton
              icon="delete"
              size="mini"
              type="text"
              @click="delFn(scope.row)"
            >
              删除
            </EButton>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <!-- 页码 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        v-if="pageFlag"
        style="text-align: right; background: #ffffff"
        :current-page="forms.page"
        :page-size="forms.pageSize"
        background
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="onChangePage"
      />
    </ECard>

    <!-- 添加/编辑 抽屉 -->
    <template slot="dialog">
      <el-drawer
        :visible.sync="drawer"
        :title="drawerTitle"
        :with-header="false"
      >
        <!-- 内容 -->
        <div class="drawer-con">
          <el-form
            ref="addForm"
            :model="formData"
            label-width="85px"
            :rules="rules"
            size="mini"
          >
            <el-form-item
              label="分组名称"
              prop="groupName"
            >
              <el-input v-model="formData.groupName" />
            </el-form-item>
            <el-form-item
              label="分组描述"
              prop="remarks"
            >
              <el-input v-model="formData.remarks" />
            </el-form-item>
          </el-form>

          <div class="drawer-con-btns">
            <el-button
              size="mini"
              type="primary"
              :loading="submitLoading"
              @click="submitFn"
            >
              提交
            </el-button>
          </div>
        </div>
      </el-drawer>
    </template>
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.group-hmi {
  position: relative;
  padding: 10px;
  background: #f3f7f9;
  .mid-con {
    padding: 1vh 10px;
    background: #ffffff;
    margin-top: 10px;
    .group-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
  .row-button {
    background: #ffffff;
    padding: 10px;
  }
}
</style>
