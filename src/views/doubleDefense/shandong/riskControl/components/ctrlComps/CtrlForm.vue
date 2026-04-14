<script>
import { levelCtrlSave } from '@/http/defense/shandong/riskControl-api.js'
import { CtrlCycleArr } from '@/views/doubleDefense/shandong/config/constant'
import CtrlData from '../../classData/ctrlData.js'
import CtrlDes from './CtrlDes.vue'

export default {
  components: {
    CtrlDes,
  },
  props: {
    // 风险事件id
    eventId: {
      type: [Number, String],
      default: '',
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false,
    },
    // 序号
    taskIndex: {
      type: Number,
      default: 0,
    },
    // 管控层级信息列表
    taskData: {
      type: Object,
      default() {
        return {}
      },
    },
    // 公司信息
    deptList: {
      type: Array,
      default() {
        return []
      },
    },
    controlHierarchy: String,
  },
  data() {
    return {
      changeData: {
        controlResponsible: [],
      },
      CtrlCycleArr, // 管控周期下拉列表
      isLoading: false,
      showPeopleDialog: false, // 选择管控责任人弹框
      peopleProp: {},
      checkedPeople: [],
    }
  },
  created() {
    this.changeData = new CtrlData(JSON.parse(JSON.stringify(this.taskData)))
    if (this.changeData.controlResponsible && this.changeData.controlResponsible.length) {
      this.checkedPeople = this.changeData.controlResponsible
    }
  },
  methods: {
    // 选择管控责任人
    pickPeopleClick() {
      this.peopleProp.oldPickList = this.checkedPeople
      this.peopleProp.listType = 'company'
      this.showPeopleDialog = true
    },
    // 移除管控责任人
    removePeople(index) {
      this.checkedPeople.splice(index, 1)
    },
    // 选择人员后回调
    closePeopleEvt(params) {
      if (params) {
        this.checkedPeople = params.data.map((item) => {
          return {
            id: item.id,
            fullName: item.fullName,
          }
        })
      }
      this.showPeopleDialog = false
    },
    /* 保存管控数据 */
    saveClick() {
      this.changeData.controlResponsible = this.checkedPeople.map((item) => {
        return item.id
      })
      this.$refs.taskForm.validate((valid) => {
        if (valid) {
          this.changeData.controlHierarchy = this.controlHierarchy
          const params = this.changeData.setReqData(this.eventId)
          this.isLoading = true
          levelCtrlSave(params)
            .then((res) => {
              if (res.data.success) {
                this.$message.success(res.data.message || '提交成功')
              }
              else {
                this.$message.warning(res.data.message || '提交失败')
              }
            })
            .catch((err) => {
              this.$message.warning('提交出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <div v-loading="isLoading">
    <div style="text-align: right">
      <el-button
        class="add-btn"
        type="primary"
        :disabled="!editable"
        @click="saveClick"
      >
        保存
      </el-button>
    </div>
    <CtrlDes
      :taskIndex="taskIndex"
      :taskData="taskData"
    />
    <div>
      <el-form
        ref="taskForm"
        class="form-box"
        inline
        :model="changeData"
        label-width="120px"
        :disabled="!editable"
      >
        <el-form-item
          label="风险管控部门"
          prop="controlDept"
          :rules="[
            {
              required: editable,
              message: '请选择风险管控部门',
              trigger: 'change',
            },
          ]"
          style="width: 100%"
        >
          <el-select
            v-model="changeData.controlDept"
            style="min-width: 400px"
            multiple
            clearable
            filterable
          >
            <el-option
              v-for="item in deptList"
              :key="item.id"
              :label="item.departmentName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="管控责任人"
          prop="controlResponsible"
          :rules="[
            {
              required: editable,
              message: '请选择管控责任人',
              trigger: 'change',
            },
          ]"
          style="width: 100%"
        >
          <el-button
            type="primary"
            @click="pickPeopleClick()"
          >
            选择人员
          </el-button>
          <el-tag
            v-for="(item, index) in checkedPeople"
            :key="item.id"
            class="pick-box-tag"
            :closable="editable"
            @close="removePeople(index)"
          >
            {{ item.fullName }}
          </el-tag>
        </el-form-item>
        <el-form-item
          label="管控周期"
          prop="controlCycle"
          :rules="[
            {
              required: editable,
              message: '请选择周期类型',
              trigger: 'change',
            },
          ]"
        >
          <el-input-number
            v-model="changeData.controlCycle"
            controls-position="right"
            :min="1"
          />
          <el-select
            v-model="changeData.controlCycleUnit"
            clearable
            style="margin: 0 5px 0 10px; width: 100px"
          >
            <el-option
              v-for="item in CtrlCycleArr"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span style="margin: 0 5px 0 10px">巡查</span>
          <el-input-number
            v-model="changeData.controlFrequency"
            controls-position="right"
            :min="1"
          />
          <span style="margin: 0 5px 0 10px">次</span>
        </el-form-item>
      </el-form>
    </div>
    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <KyPickPeople
        v-if="showPeopleDialog"
        v-bind="peopleProp"
        @close="closePeopleEvt"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.add-btn {
  margin: 20px 10px 0 0;
}

.form-box {
  margin: 20px 0 0 0;
  width: 100%;
  .form-header {
    height: 40px;
    background: #f4f4f5;
    border-radius: 2px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 0 0 20px 0;
    .form-title {
      margin: 0 20px 0 20px;
    }
  }
}
</style>
