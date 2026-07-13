<script>
import TreeSelect from '@/components/treeSelect/treeSelect'
import { analyseUnitSave } from '@/http/defense/shandong/riskControl-api.js'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import PickPeople from '@/views/common-ui/PickPeople'

export default {
  components: {
    TreeSelect,
    PickPeople,
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
    // 风险区域下拉列表
    riskAreaList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      isLoading: false,
      allDic: {}, // 字典信息
      departList: [], // 部门列表
      changeData: {}, // 编辑的数据
      showPeopleDialog: false, // 选择责任人弹框是否显示
      peopleProp: {}, // 选择人员组件传递信息
    }
  },
  created() {
    this.getInfoData()
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    Promise.all([getDepartListSimple()])
      .then((res) => {
        this.departList = res[0].data.result || []
      })
      .catch((err) => {
        this.$message.error('获取列表失败')
      })
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      // 查看或修改
      if (this.info.id) {
        this.changeData = this.info
      }
      // 新增
      else {
        this.changeData = {
          important: 0,
          responsibilityDeptId: '',
          responsibilityDeptName: '',
          discernDate: this.moment(new Date()).format('YYYY-MM-DD'),
          source: '安全事故',
        }
      }
    },
    /* 部门下拉列表选择回调 */
    depChangeEvt(id, name) {
      this.changeData.responsibilityDeptId = id || ''
      this.changeData.responsibilityDeptName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
    // 选择责任人
    choosePeople() {
      this.peopleProp.oldPickData = {
        id: this.changeData.responsibilityUserId || '',
        fullName: this.changeData.responsibilityUserName || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'role'
      this.showPeopleDialog = true
    },
    // 选择责任人之后的回调
    closePeopleEvt(params) {
      if (params) {
        this.changeData.responsibilityUserId = params.data.id
        this.changeData.responsibilityUserName = params.data.fullName
      }
      this.showPeopleDialog = false
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.unitForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          analyseUnitSave(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('getDataFX', this.changeData.unitName)
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
  },
}
</script>

<template>
  <!-- 分析单元详情 -->
  <div v-loading="isLoading">
    <el-form
      ref="unitForm"
      :model="changeData"
      label-width="100px"
      style="width: 750px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="责任组织"
        prop="responsibilityDeptId"
        :rules="[{ required: true, message: '请选择责任组织', trigger: 'change' }]"
      >
        <TreeSelect
          ref="treeSelect"
          style="width: 250px"
          :list="departList"
          :props="{
            value: 'id',
            label: 'departmentName',
            children: 'children',
          }"
          :value="changeData.responsibilityDeptId"
          :label="changeData.responsibilityDeptName"
          @getValue="depChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="区域"
        prop="postName"
      >
        <el-input
          v-model="changeData.postName"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="责任人"
        prop="responsibilityUserName"
      >
        <el-input
          v-model="changeData.responsibilityUserName"
          style="width: 250px"
          readonly
          @focus="choosePeople"
        />
      </el-form-item>
      <el-form-item
        label="名称"
        prop="unitName"
        :rules="{ required: true, message: '请填写名称', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.unitName"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="类型"
        prop="unitType"
        :rules="{ required: true, message: '请选择类型', trigger: 'change' }"
      >
        <el-select
          v-model="changeData.unitType"
          filterable
          style="width: 250px"
        >
          <el-option
            v-for="item in allDic.analysis_type"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="风险区域"
        prop="regionId"
      >
        <el-select
          v-model="changeData.regionId"
          filterable
          style="width: 250px"
        >
          <el-option
            v-for="item in riskAreaList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="来源"
        prop="source"
        :rules="{ required: true, message: '请选择来源', trigger: 'change' }"
      >
        <el-select
          v-model="changeData.source"
          filterable
          style="width: 250px"
        >
          <el-option
            v-for="item in allDic.analysis_source"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="识别日期"
        prop="discernDate"
        :rules="{ required: true, message: '请选择时间', trigger: 'change' }"
      >
        <el-date-picker
          v-model="changeData.discernDate"
          style="width: 250px"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          type="date"
          placeholder="选择识别日期"
        />
      </el-form-item>
      <el-form-item
        label="是否重要"
        prop="important"
        :rules="{
          required: true,
          message: '请选择是否重要',
          trigger: 'change',
        }"
      >
        <el-radio-group
          v-model="changeData.important"
          style="width: 250px"
        >
          <el-radio :label="0">
            否
          </el-radio>
          <el-radio :label="1">
            重大
          </el-radio>
          <el-radio :label="2">
            重要
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="changeData.remark"
          type="textarea"
          :rows="4"
          resize="none"
          style="width: 610px"
        />
      </el-form-item>
    </el-form>
    <!-- 提示内容 -->
    <!-- <div class="tips-box">
      <i class="el-icon-warning" />
      <span>提示：「对象编码」即危险化学品登记信息管理系统中的「危险源编码」，供对接政府平台上传数据使用</span>
    </div> -->
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 10px 0 0"
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
    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickPeople
        v-if="showPeopleDialog"
        v-bind="peopleProp"
        @close="closePeopleEvt"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.tips-box {
  width: 710px;
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
  border: 1px solid #e6a23c;
  border-radius: 5px;
  padding: 5px;
  font-size: 14px;
  i {
    margin: 0 10px 0 0;
  }
}
</style>
