<script>
import {
  addIo,
  deleteIo,
  editIo,
  getIoById,
} from '@/http/dev/manage-api'
import { getIoIcon } from '@/http/dev/product-api'
import { upLoadImg } from '@/http/manage-api'

export default {
  props: ['did'],
  data: () => ({
    loading: false,
    tableData: [],
    drawer: false,
    drawerTitle: '',
    imgWay: 1,
    form: {
      code: '',
      deviceId: '',
      fromProduct: true,
      icon: '',
      id: '',
      ioEnumList: [],
      name: '',
      remarks: '',
      sortOrder: 0,
      type: '',
      unit: '',
      varType: '',
      writable: false,
    },
    rules: {},
    submitLoading: false,
    imgWayList: [
      { name: '选择图片', value: 1 },
      { name: '上传图片', value: 2 },
    ],
    imgList: [],
    sForm: {
      page: 1,
      pageSize: 12,
    },
    total: 0,
  }),
  created() {
    this.getDataList()
    this.getPrefix()
  },
  methods: {
    getDataList() {
      this.loading = true
      getIoById(this.did, this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.tableData = resD.result.list || []
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '获取 测点属性 失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('获取 测点属性 失败')
        })
    },
    // 获取测点图片列表
    getImgList() {
      getIoIcon().then((res) => {
        const resD = res.data
        if (resD.success) {
          this.imgList = resD.result || []
        }
      })
    },
    addFn() {
      this.getImgList()
      ;(this.form = {
        code: '',
        deviceId: '',
        icon: '',
        id: '',
        ioEnumList: [],
        name: '',
        remarks: '',
        sortOrder: 0,
        type: '',
        unit: '',
        varType: '',
        writable: false,
      }),
      (this.imgWay = 1)
      this.drawerTitle = '添加'
      this.drawer = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    editFn(v) {
      this.getImgList()
      this.form = this.recover(this.form, v)
      this.form.ioEnumList = this.form.ioEnumList || []
      this.imgWay = 1
      this.drawerTitle = '编辑'
      this.drawer = true
    },
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteIo(v.id)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              if (resD.success === true) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败!')
            })
        })
        .catch(() => {})
    },
    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.form.deviceId = this.did
        let submitFunc = addIo
        if (this.drawerTitle === '编辑')
          submitFunc = editIo
        this.submitLoading = true
        submitFunc(this.form)
          .then((res) => {
            if (res.data.success) {
              this.$message.success(res.data.message || '提交成功')
              this.getDataList()
              this.drawer = false
            }
            else {
              this.$message.error(res.data.message || '提交失败')
            }
          })
          .catch((err) => {
            this.$message.error('提交出错', err)
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },
    imgWayFn() {
      this.form.icon = ''
    },
    pageSizeFn(v) {
      this.sForm.page = 1
      this.sForm.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    searchFn() {
      this.sForm.page = 1
      this.getDataList()
    },
    addEnumOption() {
      this.form.ioEnumList.push({
        ioValue: '',
        ioValueDesc: '',
      })
    },
    delEnumOption(index) {
      this.form.ioEnumList.splice(index, 1)
    },
    /* 图片上传回调 */
    fileChangeEvt(file) {
      if (file) {
        upLoadImg(file, 'IO_ICON').then(({ data }) => {
          if (data.success) {
            this.form.icon = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.form.icon = ''
      }
    },
  },
}
</script>

<template>
  <div class="pointEdit-template">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="18">
        <el-form
          ref="searchForm"
          size="small"
          :inline="true"
          :model="sForm"
          @keyup.enter.native="searchFn()"
          @submit.native.prevent
        >
          <el-form-item prop="ioName">
            <el-input
              v-model="sForm.ioName"
              size="small"
              placeholder="测点名称"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-search"
              @click="searchFn()"
            >
              查询
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col
        :span="6"
        style="text-align: right"
      >
        <el-button
          type="primary"
          size="mini"
          @click="addFn"
        >
          添加测点
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loading"
          class="point-table"
          :data="tableData"
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
        >
          <el-table-column
            label="测点图片"
            prop="logo"
            align="center"
          >
            <template slot-scope="props">
              <div style="display: flex; align-items: center; justify-content: center">
                <!-- <img v-if="props.row.icon" :src="props.row.icon" style="height: 30px;"> -->
                <el-popover
                  placement="right"
                  trigger="click"
                >
                  <img
                    :src="filePrefix + props.row.icon"
                    style="height: 150px"
                  >
                  <img
                    v-if="props.row.icon"
                    slot="reference"
                    :src="filePrefix + props.row.icon"
                    style="height: 30px; vertical-align: bottom"
                  >
                </el-popover>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="测点编码"
            prop="code"
            align="center"
          />
          <el-table-column
            label="测点名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="测点值单位"
            prop="unit"
            align="center"
          />
          <el-table-column
            label="测点输出类型"
            prop="type"
            align="center"
          >
            <template slot-scope="scope">
              {{ $dictUtils && $dictUtils.getDictLabel('output_type', scope.row.type) }}
            </template>
          </el-table-column>
          <el-table-column
            label="测点值输出类型"
            prop="varType"
            align="center"
          >
            <template slot-scope="scope">
              {{ $dictUtils && $dictUtils.getDictLabel('value_type', scope.row.varType) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="editFn(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="delFn(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!-- 页码 -->
    <el-row>
      <el-pagination
        background
        style="text-align: right"
        :current-page="sForm.page"
        :page-sizes="[12, 24, 60]"
        :page-size="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </el-row>

    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="form"
          label-width="120px"
          :rules="rules"
          size="mini"
        >
          <el-form-item
            label="测点编码"
            prop="code"
          >
            <el-input v-model="form.code" />
          </el-form-item>
          <el-form-item
            label="测点名称"
            prop="name"
          >
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item
            label="测点值单位"
            prop="unit"
          >
            <el-input v-model="form.unit" />
          </el-form-item>
          <el-form-item
            class="option-item"
            label="测点值枚举"
          >
            <div>
              <el-button
                type="primary"
                icon="el-icon-plus"
                circle
                @click="addEnumOption"
              />
            </div>
            <div class="input-con">
              <el-row
                v-for="(item, key) in form.ioEnumList"
                :key="key"
              >
                <el-col :span="9">
                  <el-input
                    v-model="item.ioValue"
                    placeholder="测点值"
                  />
                </el-col>
                <el-col :span="10">
                  <el-input
                    v-model="item.ioValueDesc"
                    placeholder="测点值描述"
                  />
                </el-col>
                <el-col
                  :offset="1"
                  :span="4"
                >
                  <el-button
                    type="danger"
                    icon="el-icon-minus"
                    circle
                    @click="delEnumOption(key)"
                  />
                </el-col>
              </el-row>
            </div>
          </el-form-item>
          <el-form-item
            label="测点输出类型"
            prop="type"
          >
            <el-select
              v-model="form.type"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('output_type')"
                :key="item.id"
                :label="item.dictName"
                :value="+item.dictCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="测点值输出类型"
            prop="varType"
          >
            <el-select
              v-model="form.varType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('value_type')"
                :key="item.id"
                :label="item.dictName"
                :value="+item.dictCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="是否可写入值"
            prop="writable"
          >
            <el-switch v-model="form.writable" />
          </el-form-item>
          <el-form-item
            label="排序值"
            prop="sortOrder"
          >
            <el-input-number
              v-model="form.sortOrder"
              controls-position="right"
              :min="0"
              :max="1000"
            />
            <span style="margin-left: 5px; font-size: 12px; color: #606266">值越小越靠前</span>
          </el-form-item>
          <el-form-item label="图片方式">
            <el-select
              v-model="imgWay"
              placeholder="请选择"
              style="width: 100%"
              @change="imgWayFn"
            >
              <el-option
                v-for="item in imgWayList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="imgWay === 1"
            label="选择图片"
          >
            <el-select
              v-model="form.icon"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in imgList"
                :key="item"
                :label="item"
                :value="item"
              >
                <img
                  :src="filePrefix + item"
                  style="width: 30px; height: 30px"
                >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="imgWay === 2"
            label="上传图标"
          >
            <ImageSelect
              width="100px"
              height="100px"
              @fileChange="fileChangeEvt"
            />
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
  </div>
</template>

<style lang="scss" scoped>
.pointEdit-template {
  .mid-con {
    // padding: 15px 0;
    .point-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
