<script>
import ImageSelect from '@/components/ImageSelect'
import { editProduct } from '@/http/dev/product-api'
import { getAllProtocol } from '@/http/dev/protocol-api'
import { upLoadImg } from '@/http/manage-api'
import { $checkNum } from '@/utils/validate'

export default {
  components: {
    ImageSelect,
  },
  props: ['pid', 'baseInfo'],
  data: () => ({
    loading: false,
    rules: {
      token: [{ required: true, message: '不能为空', trigger: 'blur' }],
      serialCode: [{ required: true, message: '不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '不能为空', trigger: 'blur' }],
      type: [{ required: true, message: '请选择', trigger: 'blur' }],
      protocolId: [{ required: true, message: '请选择', trigger: 'blur' }],
      detectionCycle: [{ required: true, trigger: 'blur', validator: $checkNum }],
    },
    submitLoading: false,
    allDic: {}, // 数据字典
    protoList: [], // 消息协议列表
  }),
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getProtoList()
    this.getPrefix()
  },
  methods: {
    editClick() {
      this.$refs.ruleForm.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        this.baseInfo.productId = this.pid
        editProduct(this.baseInfo)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('修改成功')
              this.$emit('change')
            }
            else {
              this.$message.error(res.data.message || '修改失败')
            }
          })
          .catch((err) => {
            this.$message.error('修改出错', err)
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },
    /* 图片选择回调 */
    fileChangeEvt(file) {
      if (file) {
        upLoadImg(file, 'PRODUCT_ICON').then(({ data }) => {
          if (data.success) {
            this.baseInfo.imageUrl = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.baseInfo.imageUrl = ''
      }
    },
    // 获取消息协议列表
    getProtoList() {
      this.protoList = []
      getAllProtocol().then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.protoList = resD.result || []
        }
      })
    },
  },
}
</script>

<template>
  <div class="baseInfo-template">
    <el-form
      ref="ruleForm"
      v-loading="loading"
      class="base-form"
      :model="baseInfo"
      :rules="rules"
      size="mini"
      label-width="80px"
    >
      <el-form-item
        label="产品型号"
        prop="token"
      >
        <el-input v-model="baseInfo.token" />
      </el-form-item>
      <el-form-item
        label="产品编码"
        prop="serialCode"
      >
        <el-input v-model="baseInfo.serialCode" />
      </el-form-item>
      <el-form-item
        label="产品名称"
        prop="name"
      >
        <el-input v-model="baseInfo.name" />
      </el-form-item>
      <el-form-item
        label="产品类型"
        prop="type"
      >
        <el-select
          v-model="baseInfo.type"
          placeholder="请选择产品类型"
          style="width: 100%"
        >
          <el-option
            v-for="item in allDic.product_type"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="掉线延时"
        prop="detectionCycle"
      >
        <el-input v-model="baseInfo.detectionCycle">
          <template slot="append">
            秒
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="产品图标">
        <ImageSelect
          :signUrl="filePrefix + baseInfo.imageUrl"
          width="100px"
          height="100px"
          @fileChange="fileChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="消息协议"
        prop="protocolId"
      >
        <el-select
          v-model="baseInfo.protocolId"
          placeholder="请选择消息协议"
          style="width: 100%"
        >
          <el-option
            v-for="item in protoList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <span>{{ item.name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品描述">
        <el-input v-model="baseInfo.remarks" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="editClick"
        >
          修改
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.baseInfo-template {
  .base-form {
    margin: 0 auto;
    width: 50%;
  }
}
</style>
