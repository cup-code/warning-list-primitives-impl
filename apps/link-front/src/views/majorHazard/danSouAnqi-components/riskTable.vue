<script>
import { getCriticalityByNameByPage, getGasByPage } from '@/http/major-hazard/Anpi-chemical'
import { getDropList, riskTableRowDel } from '@/http/major-hazard/dangerSourceAnqi-api'

export default {
  name: 'riskTable',
  props: {
    method: {
      type: String,
      default: '',
    },
    riskInfosList: {
      type: Array,
      default: () => {
        return []
      },
    },
    addList: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      isLoading: false,
      chemistrySelect: '',
      chemistrySelectList: [],
      gasSelect: '',
      gasSelectList: [],
    }
  },
  watch: {
    chemistrySelect(newValue) {
      // this.riskInfosList.chemistryName = ''
      this.chemistrySelectList = []
      this.getChemistrySelectList(newValue)
    },
    gasSelect(newValue) {
      this.gasSelectList = []
      this.getGasSelectList(newValue)
    },
  },
  created() {},
  methods: {
    // 表格编辑
    changeFn(row) {
      row.iseditor = true
      const idx = this.riskInfosList.indexOf(row)
      this.$set(this.riskInfosList, idx, row)
    },
    save(row) {
      row.iseditor = false
      const idx = this.riskInfosList.indexOf(row)
      this.$set(this.riskInfosList, idx, row)
    },
    addLine(type) {
      // 添加行数
      switch (type) {
        case 'riskInfosList':
          const temp = {
            qvalue: undefined,
            qvalueType: '',
            iseditor: false,
            checkCoefficient: undefined,
            chemistryName: '',
            chemistryQuantity: undefined,
            toxicityName: '',
            casCharacter: '',
          }
          // 添加新的行数
          this.riskInfosList.push(temp)
          this.addList.push(temp)
          break
      }
    },
    delFn(index) {
      // 删除弹窗中列表数据
      this.riskInfosList.splice(this.riskInfosList.indexOf(index), 1)
      this.addList.splice(this.addList.indexOf(index), 1)

      if (index.id) {
        riskTableRowDel(index.id)
          .then(({ data }) => {
            if (!data.success) {
              this.$message.error(data.message || '删除失败')
            }
          })
          .catch((err) => {
            this.$message.error('删除失败', err)
          })
      }
    },
    // 请求相关数据
    async getGasSelectList(value) {
      const params = {
        isPage: false,
        businessCategory: 1,
        pageNum: 1,
        pageSize: 0,
      }
      params.businessCategory = value == 'name' ? 1 : 2
      const getGas = await getGasByPage(params)
      if (getGas.data.success) {
        getGas.data.result.list.forEach((data) => {
          this.gasSelectList.push({
            id: data.id,
            label: data.toxicityName,
            checkCoefficient: data.checkCoefficient,
          })
        })
      }
      else {
        this.$message.warning(getGas.data.message || '查询毒性气体下拉失败')
      }
    },
    async getChemistrySelectList(value) {
      if (value == 'type') {
        // 危化品类别
        const getChemistryType = await getDropList()
        if (getChemistryType.data.success) {
          getChemistryType.data.result.forEach((data) => {
            this.chemistrySelectList.push({
              id: data.id,
              label: data.harmCategory,
              quantity: data.quantity,
              casCharacter: data.harmCharacter,
            })
          })
        }
        else {
          this.$message.warning(getChemistryType.data.message || '查询危化品下拉失败')
        }
      }
      else {
        // 危化品名称
        const params = {
          isPage: false,
          isQuantity: true,
          pageNum: 1,
          pageSize: 0,
        }
        const getChemistryName = await getCriticalityByNameByPage(params)
        if (getChemistryName.data.success) {
          getChemistryName.data.result.list.forEach((data) => {
            this.chemistrySelectList.push({
              id: data.id,
              label: data.chemistryName,
              quantity: data.quantity,
              casCharacter: data.cas,
            })
          })
        }
        else {
          this.$message.warning(getChemistryName.data.message || '查询危化品下拉失败')
        }
      }
    },
    chemFn(v, row) {
      const tar = this.chemistrySelectList.find(item => item.label == v)
      row.casCharacter = tar.casCharacter
      row.chemistryQuantity = tar.quantity
    },
    gasFn(v, row) {
      const tar = this.gasSelectList.find(item => item.label == v)
      row.checkCoefficient = tar.checkCoefficient
    },
  },
}
</script>

<template>
  <div style="margin: 20px 0">
    <div style="margin: 10px 0">
      <el-button
        type="primary"
        plain
        size="mini"
        icon="el-icon-plus"
        @click="addLine('riskInfosList')"
      >
        添加
      </el-button>
    </div>

    <el-table
      slot="table"
      class="hahhaha"
      :data="riskInfosList"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="200"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column
        label="危化品名称或类别"
        align="center"
        prop="chemistryName"
        width="240"
      >
        <template slot-scope="scope">
          <div
            v-show="scope.row.iseditor"
            style="display: flex"
          >
            <el-select
              v-model="chemistrySelect"
              placeholder="请选择"
            >
              <el-option
                label="危化品名称"
                value="name"
              />
              <el-option
                label="危化品类别"
                value="type"
              />
            </el-select>
            <el-select
              v-model="scope.row.chemistryName"
              placeholder="请选择"
              @change="chemFn($event, scope.row)"
            >
              <el-option
                v-for="item in chemistrySelectList"
                :key="item.id"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </div>
          <span v-show="!scope.row.iseditor">{{ scope.row.chemistryName }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="临界值/t" align="center" prop="chemistryQuantity" width="80">
                <template slot-scope="scope">
                    <input
                        type="text"
                        v-model="scope.row.chemistryQuantity"
                        v-show="scope.row.iseditor"
                        style="width: 95%;"
                    />
                    <span v-show="!scope.row.iseditor">{{ scope.row.chemistryQuantity }}</span>
                </template>
            </el-table-column> -->
      <el-table-column
        label="临界值/t"
        align="center"
        prop="chemistryQuantity"
        width="80"
      />

      <el-table-column
        label="q值类别"
        align="center"
        prop="qvalue"
        width="120"
      >
        <template slot-scope="scope">
          <el-select
            v-show="scope.row.iseditor"
            v-model="scope.row.qvalueType"
            placeholder="请选择"
          >
            <el-option
              label="实际量/t (q)"
              value="实际量"
            />
            <el-option
              label="设计量/t (q)"
              value="设计量"
            />
          </el-select>
          <span v-show="!scope.row.iseditor">{{ scope.row.qvalueType }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="q值"
        align="center"
        prop="qvalue"
        width="80"
      >
        <template slot-scope="scope">
          <input
            v-show="scope.row.iseditor"
            v-model="scope.row.qvalue"
            type="text"
            style="width: 95%"
          >
          <span v-show="!scope.row.iseditor">{{ scope.row.qvalue }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="毒性气体或类别"
        align="center"
        prop="toxicityName"
        width="240"
      >
        <template slot-scope="scope">
          <div
            v-show="scope.row.iseditor"
            style="display: flex"
          >
            <el-select
              v-model="gasSelect"
              placeholder="请选择"
            >
              <el-option
                label="毒性气体名称"
                value="name"
              />
              <el-option
                label="毒性气体类别"
                value="type"
              />
            </el-select>
            <el-select
              v-model="scope.row.toxicityName"
              placeholder="请选择"
              @change="gasFn($event, scope.row)"
            >
              <el-option
                v-for="item in gasSelectList"
                :key="item.id"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </div>
          <span v-show="!scope.row.iseditor">{{ scope.row.toxicityName }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="校正系数()" align="center" prop="checkCoefficient" width="80">
                <template slot-scope="scope">
                    <input
                        type="text"
                        v-model="scope.row.checkCoefficient"
                        v-show="scope.row.iseditor"
                        style="width: 95%;"
                    />
                    <span v-show="!scope.row.iseditor">{{ scope.row.checkCoefficient }}</span>
                </template>
            </el-table-column> -->
      <el-table-column
        label="校正系数()"
        align="center"
        prop="checkCoefficient"
        width="80"
      />

      <el-table-column
        v-if="method !== 'view'"
        label="操作"
        min-width="160"
        align="center"
        fixed="right"
      >
        <template
          v-if="method !== 'view'"
          slot-scope="scope"
        >
          <el-button
            type="text"
            style="color: var(--ky-warning)"
            @click="changeFn(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="text"
            @click="save(scope.row)"
          >
            保存
          </el-button>
          <el-button
            type="text"
            style="color: var(--ky-danger)"
            @click="delFn(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
::v-deep.el-table__header {
  width: 100% !important;
  background: #f00;
}
</style>
