/* * @Author: xiaorui 设备详情里的技术参数部分 * @Date: 2022-04-26 10:49:03 * @Last Modified by:
xiaorui * @Last Modified time: 2022-08-17 14:29:32 */
<script>
import Sortable from 'sortablejs'
import { addTechnicalParamFn, getTechnicalParamFn } from '@/http/dev_new/manage-api'

export default {
  props: {
    did: String,
    method: String,
  },
  data: () => ({
    loading: false,
    paramList: [],
  }),
  created() {
    // 如果有设备id，先获取设备的技术参数
    if (this.did !== 'null') {
      this.loading = true
      getTechnicalParamFn(this.did).then(({ data }) => {
        this.loading = false
        this.paramList = data.result || []
      })
    }
  },
  mounted() {
    setTimeout(() => {
      this.rowDrop()
    }, 1000)
  },
  methods: {
    // 添加参数
    addParam() {
      if (this.did === 'null') {
        this.$message.error('请先保存设备信息')
        return
      }
      this.paramList.push({
        sortOrder: '',
        item: '1',
        value: '',
        unit: '1',
      })
    },
    // 删除参数
    deleteParam(index) {
      this.paramList.splice(index, 1)
    },
    // 行拖拽
    rowDrop() {
      const tbody = document.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      Sortable.create(tbody, {
        handle: '.handle',
        animation: 150,
        onEnd: (_ref) => {
          const newIndex = _ref.newIndex
          const oldIndex = _ref.oldIndex
          const currRow = this.paramList.splice(oldIndex, 1)[0]
          this.paramList.splice(newIndex, 0, currRow)
        },
      })
    },
    // 保存参数
    doSubmit() {
      // 先判断每行的输入框不为空
      const isAllHas = this.paramList.every(row => row.item && row.value && row.unit)
      if (!isAllHas) {
        this.$message.error('输入项不能为空')
        return
      }
      this.loading = true
      addTechnicalParamFn(this.did, this.paramList).then(({ data }) => {
        this.loading = false
        if (data.success) {
          this.$message.success(data.message || '保存成功')
        }
        else {
          this.$message.error(data.message || '保存失败')
        }
      })
    },
    backFn() {
      this.$router.back(-1)
    },
  },
}
</script>

<template>
  <div class="technical-param">
    <el-row>
      <el-col :span="6">
        <el-button
          type="primary"
          :disabled="method === 'view'"
          @click="addParam"
        >
          添加
        </el-button>
      </el-col>
      <el-col
        :span="18"
        class="btnArea"
      >
        <el-button
          type="primary"
          :loading="loading"
          :disabled="method === 'view'"
          @click="doSubmit"
        >
          保存
        </el-button>
        <el-button @click="backFn">
          返回
        </el-button>
      </el-col>
    </el-row>
    <el-table
      v-loading="loading"
      :data="paramList"
      row-key="sortOrder"
    >
      <el-table-column
        prop="sortOrder"
        label="序号"
        width="50"
      >
        <template slot-scope="scope">
          {{ (scope.row.sortOrder = scope.$index) }}
        </template>
      </el-table-column>
      <el-table-column
        width="50"
        align="center"
        label="拖动"
      >
        <i class="el-icon-rank handle" />
      </el-table-column>
      <!-- <el-table-column
        prop="item"
        align="center"
        label="项">
        <template slot-scope="scope">
          <el-input v-model="scope.row.item" :disabled="method==='view'"></el-input>
        </template>
      </el-table-column> -->
      <el-table-column
        prop="value"
        align="center"
        label="技术参数描述"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.value"
            type="textarea"
            :rows="3"
            :disabled="method === 'view'"
          />
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="unit"
        align="center"
        label="单位">
        <template slot-scope="scope">
          <el-input v-model="scope.row.unit" :disabled="method==='view'"></el-input>
        </template>
      </el-table-column> -->
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            style="color: var(--ky-danger)"
            type="text"
            :disabled="method === 'view'"
            @click="deleteParam(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.technical-param {
  padding: 0 20px;
  // padding-left: 32px;
}
.btnArea {
  display: flex;
  justify-content: flex-end;
}
.handle {
  cursor: pointer;
}
</style>
