<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { getByCompanyId } from '@/http/GeneralQuery'
import { addDutyTeam } from '@/http/pipeRack/Ontodu/team-api'
import FileUpload from '@/views/common-ui/FileUpload.vue'

export default {
  components: {
    TreeSelect,
    FileUpload,
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
      isLoading: false,
      // 编辑的数据
      changeData: {},
      searchData: {
        pageSize: 9999,
        pageNum: 1,
        companyId: '',
      },
      showContractorName: [], // 存储指定公司下的所有用户
    }
  },
  mounted() {},
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getInfoData()
  },
  methods: {
    /* 下拉列表选择回调 */
    depChangeEvt(id, name) {
      this.changeData.companyId = id || ''
      this.changeData.companyName = name || ''
      this.$refs.treeSelect.closeSelect()
      this.searchData.companyId = id
      getByCompanyId(this.searchData.companyId)
        .then((res) => {
          if (res.data.success) {
            this.showContractorName = res.data.result
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
    },
    /* 获取详情数据 */
    getInfoData() {
      console.log(this.info)
      // 查看或修改
      if (this.info.id) {
        this.changeData = this.info
      }
      // 新增
      else {
        this.changeData = {
          companyId: '',
          companyName: '',
        }
      }
    },

    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.areaForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          addDutyTeam(this.changeData)
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
  },
}
</script>

<template>
  <div v-loading="isLoading">
    <el-form
      ref="areaForm"
      :model="changeData"
      label-width="120px"
      style="width: 800px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="公司"
        prop="companyId"
        :rules="[{ required: true, message: '请选择承包商', trigger: 'blur' }]"
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
          @getValue="depChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="小组名称"
        prop="teamName"
        :rules="[{ required: true, message: '请填写', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.teamName"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="组长"
        prop="teamLeaderId"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-select
          v-model="changeData.teamLeaderId"
          clearable
          style="width: 250px"
        >
          <el-option
            v-for="item in showContractorName"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="组员"
        prop="teamMemberIdList"
        :rules="[{ required: true, message: '请填写', trigger: 'change,blur' }]"
      >
        <el-select
          v-model="changeData.teamMemberIdList"
          multiple
          placeholder="请选择"
          style="width: 630px"
        >
          <el-option
            v-for="item in showContractorName"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
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
    </el-form>
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
.collapse-icon {
  height: 20px;
  width: 6px;
  background: rgb(26, 26, 245);
}
.report-radio {
  .el-radio__label {
    font-size: 14px !important;
    padding-left: 5px !important;
  }
}
</style>
