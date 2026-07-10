/* * @Author: xiaorui 文件管理标签的弹框 * @Date: 2023-01-05 15:28:05 * @Last Modified by: xiaorui *
@Last Modified time: 2023-01-05 16:42:53 */
<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import { saveDocTagFn } from '@/http/file-manager/fileTag-api'

export default {
  components: {
    SelectTree,
  },
  props: {
    treeData: Array,
  },
  data() {
    return {
      visible: false,
      loading: false,
      method: '',
      inputForm: {
        id: '',
        parentId: '', // 上级
        tagName: '', // 标签名称
        tagDescribe: '', // 描述
        sort: 0,
      },
      externalPlatFormList: [], // 外部平台数据列表
      dataRule: {
        parentId: [{ required: true, message: '上级标签不能为空', trigger: 'change' }],
        tagName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
      },
    }
  },
  methods: {
    init(method, obj) {
      this.method = method
      this.inputForm.id = obj.id
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'addChild') {
          this.inputForm.parentId = obj.parent.id
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          saveDocTagFn(this.inputForm)
            .then(({ data }) => {
              if (data && data.success) {
                this.$message.success(data.message || '保存成功')
                this.visible = false
                this.$emit('refreshDataList')
              }
              else {
                this.$message.warning(data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存失败')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    closeFn() {
      this.$refs.inputForm.resetFields()
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      title="新增文档管理标签"
      :close-on-click-modal="false"

      :visible.sync="visible"
      class="normal-dialog"
      @close="closeFn"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        size="small"
        :model="inputForm"
        :rules="dataRule"
        label-width="100px"
        @submit.native.prevent
      >
        <el-form-item
          v-if="method === 'addChild'"
          label="上级标签"
          prop="parentId"
        >
          <SelectTree
            ref="officeTree"
            :props="{
              value: 'id', // ID字段名
              label: 'tagName', // 显示名称
              children: 'children', // 子级字段名
            }"
            :data="treeData"
            :value="inputForm.parentId"
            :clearable="true"
            :accordion="true"
            @getValue="
              value => {
                inputForm.parentId = value
              }
            "
          />
        </el-form-item>
        <el-form-item
          label="标签名称"
          prop="tagName"
        >
          <el-input v-model="inputForm.tagName" />
        </el-form-item>
        <el-form-item
          label="标签描述"
          prop="tagDescribe"
        >
          <el-input
            v-model="inputForm.tagDescribe"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </el-form-item>
        <el-form-item
          label="排序号"
          prop="sort"
        >
          <el-input-number
            v-model="inputForm.sort"
            :step="1"
            controls-position="right"
            :min="0"
            :max="1000"
          />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="small"
          @click="visible = false"
        >关闭</el-button>
        <el-button
          v-if="method != 'view'"
          v-noMoreClick
          size="small"
          type="primary"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
