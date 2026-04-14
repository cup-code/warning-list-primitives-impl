<script>
import Sortable from 'sortablejs'
import { addMountingsFn, getMountingsFn } from '@/http/dev_new/manage-api'

export default {
  name: 'StartupParams',
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
      getMountingsFn(this.did).then(({ data }) => {
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
        spareName: '',
        model: '',
        count: 0,
      })
    },
    // 删除参数
    deleteParam(index) {
      this.paramList.splice(index, 1)
    },
    // 行拖拽
    rowDrop() {
      const tbody = document.querySelectorAll('.el-table__body-wrapper > table > tbody')[1]
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
      const isAllHas = this.paramList.every(
        row => row.spareName && (row.count || row.count == 0) && row.model,
      )
      if (!isAllHas) {
        this.$message.error('输入项不能为空')
        return
      }
      this.loading = true
      addMountingsFn(this.did, this.paramList).then(({ data }) => {
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
  <div class="mountings-param">
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
      <el-table-column
        prop="spareName"
        align="center"
        label="辅机配件名称"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.spareName"
            :disabled="method === 'view'"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="model"
        align="center"
        label="型号"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.model"
            :disabled="method === 'view'"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="count"
        align="center"
        label="数量"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.count"
            controls-position="right"
            :min="0"
            :disabled="method === 'view'"
          />
        </template>
      </el-table-column>
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
.mountings-param ::v-deep {
  .el-input-number--mini {
    width: 100%;
  }
}
.mountings-param {
  padding: 0 20px;
}
.btnArea {
  display: flex;
  justify-content: flex-end;
}
.handle {
  cursor: pointer;
}
</style>
