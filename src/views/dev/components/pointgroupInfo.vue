<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { deviceIoGroupSave, getAllIoByGroup } from '@/http/dev/pointGroup-api.js'
import PointSelect from './PointSelect.vue'

export default {
  components: {
    TreeSelect,
    PointSelect,
  },
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true,
    },
    // 详情数据
    info: {
      type: Object,
      default() {
        return {}
      },
    },
    // 所属公司树数据
    companyData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      showDialog: false,
      isLoading: false,
      // 编辑的数据
      changeData: { pointsList: [] },
      showInfoDialog: false, // 是否显示编辑弹窗
    }
  },
  created() {
    this.getInfoData()
  },
  methods: {
    // 添加测点
    addDeviceIoList() {
      this.showDialog = true
    },
    /* 获取详情数据 */
    getInfoData() {
      // 查看或修改
      if (this.info.id) {
        getAllIoByGroup(this.info.id)
          .then((res) => {
            if (res.data.success) {
              this.changeData = { pointsList: res.data.result, ...this.info }
            }
            else {
              this.$message.warning(res.data.message || '获取列表失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取列表出错', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      }
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.pointForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          deviceIoGroupSave(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
    /* 点击删除 */
    delClick(item) {
      this.changeData.pointsList.splice(item.$index, 1)
    },
    /* 关闭弹窗事件 */
    closeDialogEvt(dataList) {
      this.showDialog = false
      if (dataList) {
        this.changeData.pointsList = dataList
        for (const i in dataList) {
          this.changeData.pointsList[i].sort = Number.parseInt(i)
        }
      }
    },
    /* 下拉列表选择回调 */
    companyChangeEvt(id, name) {
      this.changeData.companyId = id || ''
      this.changeData.companyName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
  },
}
</script>

<template>
  <div v-loading="isLoading">
    <el-form
      ref="pointForm"
      :model="changeData"
      label-width="120px"
      style="width: 800px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="公司"
        prop="companyName"
        :rules="[{ required: true, message: '请选择公司', trigger: 'change,blur' }]"
      >
        <TreeSelect
          ref="treeSelect"
          style="width: 250px"
          :data="companyData"
          :props="{
            value: 'id',
            label: 'companyName',
            children: 'childrenCompany',
          }"
          :value="changeData.companyId"
          :label="changeData.companyName"
          @getValue="companyChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="测点组名称"
        prop="groupName"
        :rules="[{ required: true, message: '请输入测点组名称', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.groupName"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remarks"
      >
        <el-input
          v-model="changeData.remarks"
          type="textarea"
          resize="none"
          :rows="4"
          style="width: 630px"
        />
      </el-form-item>
      <el-form-item
        label="序号"
        prop="sort"
      >
        <el-input
          v-model="changeData.sort"
          style="width: 250px"
        />
      </el-form-item><br>
      <el-form-item
        v-if="editable"
        label="包含测点"
      >
        <el-button
          size="medium"
          type="primary"
          @click="addDeviceIoList"
        >
          从测点表添加
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      height="300px"
      :data="changeData.pointsList"
      align="center"
    >
      <el-table-column
        prop="deviceName"
        label="终端名称"
        align="center"
      />
      <el-table-column
        prop="ioCode"
        label="测点编码"
        align="center"
      />
      <el-table-column
        prop="ioName"
        label="测点名称"
        align="center"
      />
      <el-table-column
        label="测点值输出类型"
        align="center"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.varType === 1">整型(Int)</span>
          <span v-if="scope.row.varType === 2">浮点型(Double)</span>
          <span v-if="scope.row.varType === 3">字符串(String)</span>
          <span v-if="scope.row.varType === 4">布尔型(Boolean)</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="editable"
        label="操作"
        align="center"
        width="250"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            style="color: var(--ky-danger)"
            @click="delClick(scope)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
        type="primary"
        plain
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        title="测点选择"
        width="1000px"
        :close-on-click-modal="false"
        :append-to-body="true"
        class="normal-dialog"
        :visible.sync="showDialog"
      >
        <PointSelect
          v-if="showDialog"
          :oldList="changeData.pointsList"
          width="850px"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </div>
</template>
