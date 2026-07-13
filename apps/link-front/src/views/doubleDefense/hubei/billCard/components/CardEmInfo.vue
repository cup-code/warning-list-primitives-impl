<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { emCardSave, getEmCardRichText } from '@/http/defense/hubei/billCard-api'
import { getPostByDepartmentId } from '@/http/safe-production/post-manage-api'
import PickPeople from '@/views/common-ui/PickPeople'
import RichEditor from '@/views/common-ui/RichEditor.vue'

export default {
  components: {
    TreeSelect,
    RichEditor,
    PickPeople,
  },
  props: {
    // 详情数据
    info: {
      type: Object,
      default() {
        return {}
      },
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false,
    },
    // 部门列表
    depList: {
      type: Array,
      default() {
        return []
      },
    },
    // 风险区域
    areaList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      isLoading: false,
      changeData: { richText: '', responsibilityDepartment: '', post: [] },
      companyList: [],
      postList: [], // 岗位列表
      showPeopleDialog: false,
      peopleProp: {}, // 选择人员组件传递信息
    }
  },
  created() {
    this.getInfoData()
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      if (this.info.id) {
        this.companyList = [{ id: this.info.companyId, companyName: this.info.companyName }]
        // 获取岗位列表
        this.getPostList(this.info.responsibilityDepartment)
        // 获取列表传过来的数据
        // 获取富文本
        this.isLoading = true
        getEmCardRichText(this.info.id)
          .then((res) => {
            if (res.data.success) {
              this.changeData = {
                ...JSON.parse(JSON.stringify(this.info)),
                richText: res.data.result,
              }
            }
            else {
              this.$message.warning(res.data.message || '获取富文本失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取富文本出错', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      }
      else {
        const userData = JSON.parse(sessionStorage.getItem('user'))
        this.companyList = [{ id: userData.companyId, companyName: userData.companyName }]
        this.changeData.companyId = userData.companyId
        this.changeData.companyName = userData.companyName
      }
    },
    /* 关闭弹窗 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 提交编辑内容 */
    submitClick() {
      this.$refs.emForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          emCardSave(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success(res.data.message || '提交成功')
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.data.message || '提交失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
    // 选择制卡人
    choosePeople() {
      this.peopleProp.oldPickData = {
        id: this.changeData.cardMaker || '',
        fullName: this.changeData.cardMakerName || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'role'
      this.showPeopleDialog = true
    },
    // 选择制卡人之后的回调
    closePeopleEvt(params) {
      if (params) {
        this.changeData.cardMaker = params.data.id
        this.changeData.cardMakerName = params.data.fullName
      }
      this.showPeopleDialog = false
    },
    // 选择的风险区域变化时，设置责任组织，并获取责任组织下的岗位
    riskRegionChange(val) {
      const responsibilityDeptId = (
        this.areaList.find((item) => {
          return item.id === val
        }) || {}
      ).responsibilityDeptId
      this.changeData.responsibilityDepartment = responsibilityDeptId
      this.getPostList(responsibilityDeptId)
    },
    getPostList(id) {
      getPostByDepartmentId(id, true).then(({ data }) => {
        this.postList = data.result || []
      })
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    style="height: 100%"
  >
    <el-form
      ref="emForm"
      class="dialog-info"
      inline
      :model="changeData"
      label-width="120px"
      style="wdith: 950px"
      :disabled="!editable"
    >
      <el-form-item
        label="公司"
        prop="companyId"
        :rules="[{ required: true, message: '请选择公司', trigger: 'change' }]"
      >
        <el-select
          v-model="changeData.companyId"
          class="small-box"
          disabled
          filterable
        >
          <el-option
            v-for="item in companyList"
            :key="item.id"
            :value="item.id"
            :label="item.companyName"
          />
        </el-select>
      </el-form-item>
      <!-- 风险区域就是-安全装置 --方艺明、谢嘉鹏 -->
      <el-form-item
        label="风险区域"
        prop="riskRegion"
        :rules="[{ required: true, message: '请选择风险区域', trigger: 'change' }]"
      >
        <el-select
          v-model="changeData.riskRegion"
          class="small-box"
          filterable
          @change="riskRegionChange"
        >
          <el-option
            v-for="item in areaList"
            :key="item.id"
            :value="item.id"
            :label="item.name"
          />
        </el-select>
      </el-form-item>
      <!-- 组织架构-部门树 -->
      <el-form-item
        label="责任组织"
        prop="responsibilityDepartment"
        :rules="[{ required: true, message: '请选择责任组织', trigger: 'change' }]"
      >
        <TreeSelect
          :props="{
            value: 'id', // ID字段名
            label: 'departmentName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :list="depList"
          :value="changeData.responsibilityDepartment"
          :clearable="true"
          :accordion="true"
          class="small-box"
          placeholder="请选择风险区域"
          disabled
          @getValue="
            value => {
              changeData.responsibilityDepartment = value
            }
          "
        />
      </el-form-item>
      <el-form-item
        label="岗位"
        prop="post"
        :rules="[{ required: true, message: '请选择岗位', trigger: 'change' }]"
      >
        <el-select
          v-model="changeData.post"
          class="small-box"
          filterable
          multiple
        >
          <el-option
            v-for="item in postList"
            :key="item.id"
            :value="item.id"
            :label="item.postName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="制卡人">
        <el-input
          v-model="changeData.cardMakerName"
          class="small-box"
          readonly
          @focus="choosePeople"
        />
      </el-form-item>
      <el-form-item label="制卡时间">
        <el-date-picker
          v-model="changeData.cardMakingTime"
          class="small-box"
          type="date"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item label="事件名称">
        <el-input
          v-model="changeData.eventName"
          class="large-box"
          type="textarea"
          :rows="4"
          resize="none"
        />
      </el-form-item>
      <el-form-item label="应急处置卡">
        <RichEditor
          v-model="changeData.richText"
          width="770px"
          :editable="editable"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        @click="cancelClick"
      >
        取 消
      </el-button>
      <el-button
        v-if="editable"
        v-noMoreClick
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确 定
      </el-button>
    </div>
    <el-dialog
      class="fixed-dialog"
      title="选择制卡人"
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
.small-box {
  width: 320px !important;
}
.large-box {
  width: 770px !important;
}
</style>
