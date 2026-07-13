<script>
import { getDevProtocolMeta, saveDevProtocolMeta } from '@/http/dev/protocol-api'

export default {
  props: ['dt'],
  data: () => ({
    did: '', // 设备id
    pid: '', // 协议id
    metas: [], // 接口数据
    loading: false,
    form: {},
    rules: {},
    submitLoading: false,
  }),
  created() {
    const v = this.dt
    this.did = v.id
    this.pid = v.protocolId
    // 获取数据
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.form = {}
      getDevProtocolMeta(this.did, this.pid).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.fixDataFn(resD.result || [])
        }
      })
    },
    // 保存设备协议参数
    saveMetas(did, params) {
      saveDevProtocolMeta(did, params)
        .then((res) => {
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success('保存成功')
            this.getDataList()
          }
          else {
            this.$message.error(msg || '保存失败')
          }
        })
        .catch((e) => {
          this.$message.error('保存失败')
        })
    },
    // 处理数据 (1. 生成rules; 2. 如果类型为boolean， 则在表单中添加默认值)
    fixDataFn(metas) {
      this.rules = {}
      let rule
      metas.forEach((item) => {
        // 如果不是boolean类型
        if (item.valueType != 4) {
          // 一、生成规则
          rule = []
          if (item.required) {
            rule.push({ required: true, message: '不能为空', trigger: 'blur' })
          }
          if (item.valueLength) {
            rule.push({
              validator: (rule, value, callback) =>
                this.$checkLen(rule, value, callback, +item.valueLength),
              trigger: 'blur',
            })
          }
          if (item.valueMin) {
            rule.push({
              validator: (rule, value, callback) =>
                this.$checkMin(rule, value, callback, +item.valueMin),
              trigger: 'blur',
            })
          }
          if (item.valueMax) {
            rule.push({
              validator: (rule, value, callback) =>
                this.$checkMax(rule, value, callback, +item.valueMax),
              trigger: 'blur',
            })
          }
          if (item.valueRegular) {
            rule.push({
              validator: (rule, value, callback) =>
                this.$checkReg(rule, value, callback, item.valueRegular),
              trigger: 'blur',
            })
          }

          this.rules[item.propertyCode] = rule

          // 二、生成form默认值
          this.$set(this.form, item.propertyCode, item.propertyValue)
        }
        // 如果是boolean类型, 给默认值false
        else {
          let bVal = false
          if (item.propertyValue === 'true') {
            bVal = true
          }
          this.$set(this.form, item.propertyCode, bVal)
        }
      })

      this.metas = metas
    },

    // 保存按钮
    saveFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return

        const params = []
        let temp
        Object.entries(this.form).forEach((item) => {
          temp = {
            propertyCode: item[0],
            propertyValue: item[1],
          }
          params.push(temp)
        })

        // 调用接口
        this.saveMetas(this.did, params)
      })
    },

    // 校验长度
    $checkLen(rule, value, callback, len) {
      // 如果为空，则跳出校验，直接通过
      if (!value) {
        callback()
        return
      }
      if (value.length !== len) {
        callback(new Error(`长度必须为${len}`))
        return
      }

      callback()
    },
    // 校验最小值
    $checkMin(rule, value, callback, min) {
      // 如果为空，则跳出校验，直接通过
      if (!value) {
        callback()
        return
      }

      if (value < min) {
        callback(new Error(`不能小于${min}`))
        return
      }
      callback()
    },
    // 校验最大值
    $checkMax(rule, value, callback, max) {
      // 如果为空，则跳出校验，直接通过
      if (!value) {
        callback()
        return
      }

      if (value > max) {
        callback(new Error(`不能大于${max}`))
        return
      }
      callback()
    },
    // 校验正则
    $checkReg(rule, value, callback, reg) {
      // 如果是正则表达式
      if (this.$isReg(reg)) {
        reg = new RegExp(reg)
        if (!reg.test(value)) {
          callback(new Error(`不符合正则规则: ${reg}`))
          return
        }
        callback()
      }
      // 不是正则， 则不校验
      else {
        callback()
      }
    },
    // 校验字符串是否是 正则表达式
    $isReg(reg) {
      reg = `/${reg}/`
      let flag
      try {
        flag = eval(reg) instanceof RegExp
      }
      catch (e) {
        flag = false
      }
      return flag
    },
  },
}
</script>

<template>
  <div class="protocolPr-template">
    <el-form
      ref="form"
      v-loading="loading"
      class="base-form"
      :model="form"
      :rules="rules"
      size="mini"
      label-width="200px"
    >
      <el-form-item
        v-for="item in metas"
        :key="item.id"
        :label="item.propertyName"
        :prop="item.propertyCode"
      >
        <el-input
          v-if="item.valueType != 4"
          v-model="form[item.propertyCode]"
          placeholder="请输入"
        />
        <el-switch
          v-else
          v-model="form[item.propertyCode]"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="saveFn"
        >
          保存
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.protocolPr-template {
  .base-form {
    margin: 0 auto;
    width: 50%;
    .ex-item {
      .ex-info {
        position: absolute;
        top: 0;
        left: 100%;
        width: 100px;
        margin-left: 10px;
      }
    }
  }
}
</style>
