<script>
import { addFactorTest } from '@/http/occupationalHealth/sanitation-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { getPostByDepartmentId } from '@/http/safe-production/post-manage-api'

export default {
  name: 'DetectionDialog',
  components: {},
  props: {
    Method: {
      type: String,
      default: '',
    },
    FromData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      isLoading: false,
      departmentList: [], // 所属部门list
      postList: [], // 岗位列表
      isOutList: [
        { value: 0, label: '否' },
        { value: 1, label: '是' },
      ],
      companyId: '',
      inputForm: {
        harmFactor: '',
        testingDate: '',
        departmentId: '',
        departmentName: '',
        testingPost: [],
        testingPostNames: [],
        testingRef: '',
        samplingInterval: '',
        isOut: 0,
        testingUnit: '',
        testingResult: '',
        outReason: '',
        handleMeasures: '',
        remark: '',
      },
    }
  },
  created() {
    this.companyId = this.$store.state.user.user.companyId
    // 获取所属部门部门list：当前人公司的所有组织架构
    this.getAllDepartByCompanyList(this.companyId)
    if (this.Method !== 'add') {
      Object.assign(this.inputForm, JSON.parse(JSON.stringify(this.FromData)))
      this.getAllPostByCompany(this.inputForm.departmentId)
      // if (this.inputForm.testingUnit.length > 0) {
      //   this.inputForm.dynamicItem = []
      //   for (let i = 0; i < this.inputForm.testingUnit.length; i++) {
      //     this.inputForm.dynamicItem.push({
      //       testingUnit: this.inputForm.testingUnit[i],
      //       testingResult: this.inputForm.testingResult[i]
      //     })
      //   }
      // }
    }
    else {
    }
  },
  methods: {
    // 查询指定部门下的岗位
    getAllPostByCompany(departmentId) {
      getPostByDepartmentId(departmentId).then(({ data }) => {
        if (data.success) {
          this.postList = data.result || []
        }
        else {
          this.$message.error('获取岗位列表失败' || data.message)
        }
      })
    },
    // 获取检测部门信息
    getDepartmentInfo(e) {
      if (e) {
        this.inputForm.departmentId = e
        this.departmentList.forEach((item) => {
          if (e == item.id) {
            this.inputForm.departmentName = item.departmentName
          }
        })
        this.inputForm.testingPost = []
        this.getAllPostByCompany(this.inputForm.departmentId)
      }
    },
    getAllDepartByCompanyList(id) {
      getAllDepartByCompanyFn(id).then(({ data }) => {
        this.departmentList = (data.result || []).filter((item) => {
          return item.departmentType === 'DEPARTMENT'
        })
      })
    },

    // 提交数据
    doSubmitPersonneDialog() {
      this.inputForm.testingPostNames = []
      for (const key of this.postList) {
        this.inputForm.testingPost.forEach((res) => {
          if (key.id == res) {
            this.inputForm.testingPostNames.push(key.postName)
          }
        })
      }
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          addFactorTest(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('提交成功')
                this.closeClick(true)
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch((err) => {
              this.$message.error('提交出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
    /* 关闭弹窗 */
    closeClick(isRefresh) {
      this.$emit('DialogClose', isRefresh)
    },
  },
}
</script>

<template>
  <div>
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :inline="true"
      :model="inputForm"
      label-width="100px"
      :class="Method === 'view' ? 'readonly' : ''"
      :disabled="Method === 'view'"
      @submit.native.prevent
    >
      <el-form-item
        label="接触职业病危害因素"
        prop="harmFactor"
        :rules="{
          required: true,
          message: '危害因素不能为空',
          trigger: 'blur',
        }"
      >
        <el-select
          v-model="inputForm.harmFactor"
          class="small-row"
          placeholder="请选择"
          clearable
          @change="$forceUpdate()"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('occupational_hazards')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="检测日期"
        prop="testingDate"
        :rules="{
          required: true,
          message: '检测日期不能为空',
          trigger: 'blur',
        }"
      >
        <el-date-picker
          v-model="inputForm.testingDate"
          style="width: 200px"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="检测部门"
        prop="departmentId"
      >
        <el-select
          v-model="inputForm.departmentId"
          placeholder="请选择"
          :filterable="true"
          class="small-row"
          @change="getDepartmentInfo"
        >
          <el-option
            v-for="item in departmentList"
            :key="item.id"
            :label="item.departmentName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="检测岗位"
        prop="testingPost"
      >
        <el-select
          v-model="inputForm.testingPost"
          multiple
          class="small-row"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in postList"
            :key="item.id"
            :label="item.postName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="检测编号"
        prop="testingRef"
      >
        <el-input
          v-model="inputForm.testingRef"
          class="small-row"
          placeholder="数据保存后，平台自动生成"
          clearable
          disabled
        />
      </el-form-item>
      <el-form-item
        label="采样时段"
        prop="samplingInterval"
      >
        <el-input
          v-model="inputForm.samplingInterval"
          placeholder="请输入"
          clearable
          class="small-row"
        />
      </el-form-item>
      <el-form-item
        label="是否超标"
        prop="isOut"
      >
        <el-radio-group
          v-model="inputForm.isOut"
          class="big-row"
        >
          <el-radio :label="0">
            否
          </el-radio>
          <el-radio :label="1">
            是
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="单位"
        class="form-style"
        prop="testingUnit"
        :rules="[{ required: true, message: '检测单位不能为空', trigger: 'blur' }]"
      >
        <el-input
          v-model="inputForm.testingUnit"
          size="small"
          class="small-row"
        />
      </el-form-item>
      <el-form-item
        label="检测结果"
        class="form-style"
        prop="testingResult"
        :rules="[{ required: true, message: '检测结果不能为空', trigger: 'blur' }]"
      >
        <el-input
          v-model="inputForm.testingResult"
          size="small"
          class="small-row"
        />
      </el-form-item>
      <el-form-item
        label="超标原因"
        prop="outReason"
      >
        <el-input
          v-model="inputForm.outReason"
          placeholder="请输入"
          type="textarea"
          :rows="3"
          clearable
          class="big-row"
        />
      </el-form-item>
      <el-form-item
        label="处置措施"
        prop="handleMeasures"
      >
        <el-input
          v-model="inputForm.handleMeasures"
          placeholder="请输入"
          type="textarea"
          :rows="3"
          clearable
          class="big-row"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="inputForm.remark"
          placeholder="请输入"
          type="textarea"
          :rows="3"
          clearable
          class="big-row"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-if="Method !== 'view'"
          v-noMoreClick
          type="primary"
          @click="doSubmitPersonneDialog()"
        >确定保存</el-button>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.small-row {
  width: 200px;
}
.big-row {
  width: 650px;
}
.form-style {
  margin-bottom: 10px;

  .input-style {
    width: 215px;
  }

  .special-style {
    width: 194px;
  }
}
</style>
