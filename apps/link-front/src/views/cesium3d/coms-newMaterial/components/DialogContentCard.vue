<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import RichEditor from '@/views/common-ui/RichEditor.vue'

export default {
  components: {
    TreeSelect,
    RichEditor,
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
    // 公司列表
    companyList: {
      type: Array,
      default() {
        return []
      },
    },
    // 部门列表
    depList: {
      type: Array,
      default() {
        return []
      },
    },
    // 岗位列表
    postList: {
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
    // 人员列表
    personList: {
      type: Array,
      default() {
        return []
      },
    },

    // 富文本信息
    changeData: {
      type: Object,
      default() {
        return { richText: '' }
      },
    },
  },
  data() {
    return {
      // allDic: {}, // 字典信息
      // isLoading: false,
      // changeData: { richText: '' }
    }
  },
  created() {
    // this.getInfoData()
    // this.allDic = JSON.parse(sessionStorage.getItem('dictList') || '{}')
  },
  methods: {
    /* 获取详情数据 */
    /* getInfoData() {
        if (this.info.id) {
          // 获取列表传过来的数据
          this.changeData = { ...JSON.parse(JSON.stringify(this.info)), richText: '' }
          // 获取富文本
          //this.isLoading = true
          getHandleRuleCardRichText(this.changeData.id)
            .then((res) => {
              if (res.data.success) {
                this.changeData.richText = res.data.result
              } else {
                this.$message.warning(res.data.message || '获取富文本失败')
              }
            })
            .catch((err) => {
              this.$message.error('获取富文本出错', err)
            })
            .finally(() => {
              //this.isLoading = false
            })
        } else {
          const userData = JSON.parse(sessionStorage.getItem('user'))
          this.changeData.companyId = userData.companyId
          this.changeData.companyName = userData.companyName
        }
      }, */
  },
}
</script>

<template>
  <!-- v-loading="isLoading" -->
  <div style="height: 100%">
    <el-form
      ref="ruleForm"
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
        :rules="[{ required: true, message: '无数据', trigger: 'change' }]"
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
      <!-- 组织架构-部门树 -->
      <el-form-item
        label="部门车间"
        prop="responsibilityDepartment"
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
          placeholder="无数据"
          @getValue="
            value => {
              changeData.responsibilityDepartment = value
            }
          "
        />
      </el-form-item>
      <!-- 风险区域就是-安全装置 --方艺明、谢嘉鹏 -->
      <el-form-item
        label="风险区域"
        prop="riskRegion"
      >
        <el-select
          v-model="changeData.riskRegion"
          class="small-box"
          filterable
          placeholder="无数据"
        >
          <el-option
            v-for="item in areaList"
            :key="item.id"
            :value="item.id"
            :label="item.name"
          />
        </el-select>
      </el-form-item>
      <slot name="inputText">
        <el-form-item
          label="岗位"
          prop="post"
        >
          <el-select
            v-model="changeData.post"
            class="small-box"
            filterable
            placeholder="无数据"
          >
            <el-option
              v-for="item in postList"
              :key="item.id"
              :value="item.id"
              :label="item.postName"
            />
          </el-select>
        </el-form-item>
      </slot>
      <el-form-item label="制卡人">
        <el-select
          v-model="changeData.cardMaker"
          class="small-box"
          filterable
          placeholder="无数据"
        >
          <el-option
            v-for="item in personList"
            :key="item.id"
            :value="item.id"
            :label="item.fullName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="制卡时间">
        <el-date-picker
          v-model="changeData.cardMakingTime"
          class="small-box"
          type="date"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <slot name="textArea">
        <el-form-item label="主要内容">
          <el-input
            v-model="changeData.mainContent"
            class="large-box"
            type="textarea"
            :rows="4"
            resize="none"
          />
        </el-form-item>
      </slot>
      <el-form-item :label="changeData.richTextTitle">
        <RichEditor
          v-model="changeData.richText"
          width="770px"
          :editable="editable"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.small-box {
  width: 320px;
}
.large-box {
  width: 770px;
}
</style>
