<script>
import {
  addOrEditMarker,
  deleteMarker,
  getMarkerList,
} from '@/http/map/manage-api'
import addMarkerDialog from './addMarkerDialog'
import config from './config'

export default {
  name: 'BeaconManagement',
  components: {
    AddMarkerDialog: addMarkerDialog,
  },
  data() {
    return {
      pointType: [
        {
          label: '信标',
          code: 'beacon',
        },
      ],
      isEditor: false,
      form: {
        pageNum: 1,
        pageSize: 10,
        markName: '',
        markType: '',
      },
      drawTypeList: {
        POINT: '点',
        POLYLINE: '线',
        POLYGON: '面',
        ICONTEXT: '文本+图标',
      },
      isCheck: false,
      showAddMarkerDialog: false,
      tableData: [],
      list: config.beaconManagement_table_config,
      tableLoading: false,
      totalItems: 10,
      initData: {},
    }
  },
  mounted() {
    this.getMarkerList()
  },
  methods: {
    async getMarkerList() {
      this.tableLoading = true
      console.log(typeof this.form.markType, 999)
      getMarkerList(this.form)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list
            this.totalItems = data.result.total

            this.tableLoading = false
          }
        })
        .catch(() => {
          this.tableLoading = false
        })
    },
    onAdd() {
      this.showAddMarkerDialog = true
    },
    onReset() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
        markName: '',
        markType: '',
      }
      this.getMarkerList()
    },
    onClose() {
      this.$refs.addMarkerDialog.closeMap()
    },
    onCheck(info) {
      this.isCheck = true
      this.showAddMarkerDialog = true
      this.initData = info
    },
    onDelete(info) {
      console.log(info)
      deleteMarker(info.id)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success('删除成功！')
            this.getMarkerList()
          }
        })
        .catch(() => {})
    },
    onEdit(info) {
      this.isEditor = true
      this.initData = info
      this.showAddMarkerDialog = true
    },
    onSubmit(data) {
      console.log(data)
      addOrEditMarker(data).then(({ data }) => {
        if (data.success) {
          this.$message.success('保存成功！')
          this.$refs.addMarkerDialog.onClose()
          this.getMarkerList()
        }
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
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
        <el-form-item label="标注名称">
          <el-input
            v-model="form.markName"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="标注种类">
          <el-select
            v-model="form.markType"
            :clearable="true"
            placeholder="请选择"
          >
            <el-option
              v-for="item in pointType"
              :key="item.code"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <EButton
            type="primary"
            icon="search"
            @click="getMarkerList"
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
          @click="onAdd"
        >
          新增
        </EButton>
      </div>
      <CTable
        :tableData="tableData"
        height="92%"
        :list="list"
        :loading="tableLoading"
      >
        <template #drawType="props">
          {{ drawTypeList[props.info.drawType] }}
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
        <template #icon="props">
          <img
            :src="props.info.icon"
            alt=""
          >
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
      <addMarkerDialog
        ref="addMarkerDialog"
        :isCheck.sync="isCheck"
        :isEditor.sync="isEditor"
        :initData="initData"
        :visible.sync="showAddMarkerDialog"
        @close="onClose"
        @submit="onSubmit"
      />
    </template>
  </KyTreeTable>
</template>
