<script>
import ImageSelect from '@/components/ImageSelect'
import {
  addIo,
  deleteIo,
  editIo,
  getIoById,
  getIoIcon,
} from '@/http/dev/product-api'
import { upLoadImg } from '@/http/manage-api'

export default {
  components: {
    ImageSelect,
  },
  props: ['pid'],
  data: () => ({
    allDic: {}, // 字典数据
    loading: false, // 主体loading
    tableList: [], // 表格数据
    editDrawer: false, // 添加/编辑抽屉开关
    drawerTitle: '',
    editForm: {
      id: '',
      code: '',
      name: '',
      type: '',
      varType: '',
      writable: false,
      icon: '',
      remarks: '',
      sortOrder: 0,
      unit: '',
    }, // 添加/编辑数据
    submitLoading: false,
    imgWay: 1, // 图片类型 1选择图片 2上传图片
    imgWayList: [
      // 图片类型 下拉列表
      { name: '选择图片', value: 1 },
      { name: '上传图片', value: 2 },
    ],
    imgList: [], // 选择图片下拉列表
  }),
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getDataList()
    this.getPrefix()
  },
  methods: {
    /* 获取测点表格信息 */
    getDataList() {
      this.loading = true
      getIoById(this.pid)
        .then((res) => {
          if (res.data.success)
            this.tableList = res.data.result || []
          else this.$message.error(res.data.message || '获取 测点属性 失败')
        })
        .catch((err) => {
          this.$message.error('获取 测点属性 出错', err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    /* 获取测点图片列表 */
    getImgList() {
      getIoIcon().then((res) => {
        if (res.data.success) {
          this.imgList = res.data.result || []
        }
      })
    },
    /* 添加测点 */
    addClick() {
      this.getImgList()
      this.editForm = {
        id: '',
        code: '',
        name: '',
        type: '',
        varType: '',
        writable: false,
        icon: '',
        remarks: '',
        sortOrder: 0,
        unit: '',
      }
      this.imgWay = 1
      this.drawerTitle = '添加'
      this.editDrawer = true
      this.$nextTick(() => {
        this.$refs.inputForm.clearValidate()
      })
    },
    /* 修改测点 */
    editClick(data) {
      this.getImgList()
      this.editForm = this.recover(this.editForm, data)
      this.imgWay = 1
      this.drawerTitle = '编辑'
      this.editDrawer = true
    },
    /* 删除表格行 */
    delClick(data) {
      this.$confirm(`您确认要删除：${data.name} 吗？`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteIo(data.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(res.data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除出错!', err)
            })
            .finally(() => {
              this.loading = false
            })
        })
        .catch(() => {})
    },
    /* 提交新增或修改数据 */
    submitClick() {
      this.$refs.inputForm.validate((valid) => {
        if (!valid)
          return
        this.editForm.productId = this.pid
        let submitFunc = addIo
        if (this.drawerTitle === '编辑')
          submitFunc = editIo
        this.submitLoading = true
        submitFunc(this.editForm)
          .then((res) => {
            if (res.data.success) {
              this.$message.success(res.data.message || '提交成功')
              this.getDataList()
              this.editDrawer = false
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
    // 改变图片方式时，清空之前选择
    imgWayChange() {
      this.editForm.icon = ''
    },
    /* 图片上传回调 */
    fileChangeEvt(file) {
      if (file) {
        upLoadImg(file, 'IO_ICON').then(({ data }) => {
          if (data.success) {
            this.editForm.icon = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.editForm.icon = ''
      }
    },
  },
}
</script>

<template>
  <div class="point-template">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="24">
        <el-button
          type="primary"
          size="mini"
          @click="addClick"
        >
          添加测点
        </el-button>
      </el-col>
    </el-row>
    <!-- 表格内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loading"
          class="point-table"
          :data="tableList"
          border
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
                <el-popover
                  placement="right"
                  trigger="hover"
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
            label="排序值"
            prop="sortOrder"
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
            label="输出类型"
            align="center"
          >
            <template slot-scope="scope">
              {{ $dictUtils.getDictLabel('output_type', scope.row.type) }}
            </template>
          </el-table-column>
          <el-table-column
            label="测点值输出类型"
            align="center"
          >
            <template slot-scope="scope">
              {{ $dictUtils.getDictLabel('value_type', scope.row.varType) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
          >
            <template slot-scope="scope">
              <EButton
                plain
                size="mini"
                type="primary"
                @click="editClick(scope.row)"
              >
                编辑
              </EButton>
              <EButton
                plain
                size="mini"
                type="danger"
                @click="delClick(scope.row)"
              >
                删除
              </EButton>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      :visible.sync="editDrawer"
      :with-header="false"
    >
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>
      <el-divider />
      <div class="drawer-con">
        <el-form
          ref="inputForm"
          :model="editForm"
          label-width="120px"
          size="mini"
        >
          <el-form-item
            label="测点类型"
            prop="type"
            :rules="{
              required: true,
              message: '请选择测点类型',
              trigger: 'change',
            }"
          >
            <el-select
              v-model="editForm.type"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in allDic.output_type"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="测点编码"
            prop="code"
            :rules="{
              required: true,
              message: '请输入测点编码',
              trigger: 'blur',
            }"
          >
            <el-input v-model="editForm.code" />
          </el-form-item>
          <el-form-item
            label="测点名称"
            prop="name"
            :rules="{
              required: true,
              message: '请输入测点名称',
              trigger: 'blur',
            }"
          >
            <el-input v-model="editForm.name" />
          </el-form-item>
          <el-form-item
            label="测点值单位"
            prop="unit"
          >
            <el-input v-model="editForm.unit" />
          </el-form-item>
          <el-form-item
            label="测点值输出类型"
            prop="varType"
            :rules="{
              required: true,
              message: '请选择测点输出类型',
              trigger: 'change',
            }"
          >
            <el-select
              v-model="editForm.varType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in allDic.value_type"
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
            <el-switch v-model="editForm.writable" />
          </el-form-item>
          <el-form-item
            label="排序值"
            prop="sortOrder"
          >
            <el-input-number
              v-model="editForm.sortOrder"
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
              @change="imgWayChange"
            >
              <el-option
                v-for="item in imgWayList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="imgWay === 1"
            label="选择图片"
          >
            <el-select
              v-model="editForm.icon"
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
            @click="submitClick"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.point-template {
  .mid-con {
    padding: 15px 0;
    .point-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
