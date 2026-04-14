<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { editAlertRule, getRuleBaseInfo } from '@/http/rule/rule-api'

export default {
  components: {
    SelectTree,
  },
  props: {
    rid: String,
    departList: Array,
  },
  data: () => ({
    loading: false,
    submitLoading: false,
    form: {},
    rules: {
      priorityLevel: [{ required: true, message: '请选择', trigger: 'blur' }],
    },
    // 触发方式列表
    typeList: [
      { name: '任一满足', value: 'ANY' },
      { name: '全部满足', value: 'ALL' },
    ],
    // 优先级别列表
    priorityList: [
      { name: '一般', value: 'ORDINARY' },
      { name: '报警', value: 'WARN' },
      { name: '紧急', value: 'URGENT' },
    ],
  }),
  mounted() {
    this.$nextTick(() => {
      this.getDataList()
    })
  },
  methods: {
    getDataList() {
      this.loading = true
      getRuleBaseInfo(this.rid)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.form = resD.result || {}
          }
          else {
            this.$message.error(msg || '获取 规则基础信息 失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('获取 规则基础信息 失败')
        })
    },
    editFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        const {
          name,
          remarks,
          triggerType,
          id,
          generateRepair,
          priorityLevel,
          departmentId,
          monitorCategory,
        } = this.form
        const params = {
          name,
          remarks,
          triggerType,
          id,
          generateRepair,
          priorityLevel,
          departmentId,
          monitorCategory,
        }
        if (params.generateRepair) {
          params.generateRepair = true
        }
        else {
          params.generateRepair = false
          delete params.priorityLevel
        }

        editAlertRule(params)
          .then((res) => {
            this.submitLoading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              this.$message.success(msg || '修改成功')
              this.getDataList()
            }
            else {
              this.$message.error(msg || '修改失败')
            }
          })
          .catch((err) => {
            this.submitLoading = false
            this.$message.error('修改失败')
          })
      })
    },
  },
}
</script>

<template>
  <div class="baseInfo-ruleAnqi-template">
    <el-form
      ref="form"
      v-loading="loading"
      class="base-form"
      :model="form"
      :rules="rules"
      size="mini"
      label-width="85px"
    >
      <el-form-item
        label="规则名称"
        prop="name"
      >
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item
        label="监测分类"
        prop="monitorCategory"
      >
        <el-select
          v-model="form.monitorCategory"
          placeholder="请选择"
          size="mini"
          style="width: 100%"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('monitor_type')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="所属部门"
        prop="departmentId"
      >
        <!-- <SelectTree
                    :props="{
                        value: 'id',             // ID字段名
                        label: 'departmentName',         // 显示名称
                        children: 'children'    // 子级字段名
                    }"
                    :list="departList"
                    :value="form.departmentId"
                    :clearable="true"
                    :accordion="true"
                    @getValue="(value) => {form.departmentId=value}"
                /> -->
        <el-select
          v-model="form.departmentId"
          placeholder="请选择"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in departList"
            :key="item.id"
            :label="item.departmentName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="规则描述"
        prop="remarks"
      >
        <el-input
          v-model="form.remarks"
          type="textarea"
          :rows="10"
          placeholder="请输入规则描述"
        />
      </el-form-item>
      <el-form-item
        label="触发方式"
        prop="triggerType"
      >
        <el-select
          v-model="form.triggerType"
          placeholder="请选择"
          size="mini"
          style="width: 100%"
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          >
            <span>{{ item.name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="生成工单" prop="generateRepair">
                <el-switch v-model="form.generateRepair" />
                <span style="padding-left: 10px; color: #606266;">报警后是否生成维修工单</span>
            </el-form-item>
            <el-form-item label="工单优先级" prop="priorityLevel" v-if="form.generateRepair">
                <el-select v-model="form.priorityLevel" placeholder="请选择" size="mini" style="width: 100%;">
                    <el-option v-for="item in priorityList" :key="item.value" :label="item.name" :value="item.value">
                        <span>{{ item.name }}</span>
                    </el-option>
                </el-select>
            </el-form-item> -->

      <el-form-item>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="editFn"
        >
          修改
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.baseInfo-ruleAnqi-template {
  .base-form {
    width: 50%;
  }
}
</style>
