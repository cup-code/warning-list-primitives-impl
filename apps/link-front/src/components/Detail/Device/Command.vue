<script>
import { mapGetters } from 'vuex'
import { getCommandById } from '@/http/dev/product-api'

export default {
  props: ['pid'],
  data: () => ({
    loading: false,
    tableData: [],
    valTypeList: [],
    cur_expand_id: '', // 需要展开的行
  }),
  computed: {
    ...mapGetters(['dic']),
  },
  watch: {
    // 刷新操作走这里, 这样会保证 数据字典有值的情况下 生成 列表数据
    dic() {
      this.genDic()
    },
  },
  created() {
    // 根据数据字典生成 列表数据
    this.genDic()
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.loading = true
      getCommandById(this.pid)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            const oData = resD.result || []
            this.fixDataFn(oData)
          }
          else {
            this.$message.error(msg || '获取 命令属性 失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('获取 命令属性 失败')
        })
    },
    fixDataFn(dt) {
      this.tableData = dt.map((item) => {
        // 处理命令参数
        item.uDProductCmdParamList.forEach((p) => {
          if (p.required) {
            p.requiredStr = '是'
          }
          else {
            p.requiredStr = '否'
          }

          this.valTypeList.forEach((v) => {
            if (v.value == p.type) {
              p.typeStr = v.name
            }
          })
        })

        // 默认展开行 (el-table必须设置row-key属性, 才能生效)
        if (item.id === this.cur_expand_id) {
          this.$refs.table.toggleRowExpansion(item, true)
        }

        return item
      })
    },
    // 根据store中的数据字典 生成 列表数据
    genDic() {
      if (this.dic.length === 0)
        return
      this.dic.forEach((item) => {
        if (item.code === 'valueType') {
          // 参数类型
          this.valTypeList = item.uSDictionaryItemDTOList
        }
      })

      // 这里的判断说明: 刷新时 数据字典的数据 比 getDataList数据 晚， 所以造成后台数据无法转化为数据字典对应的name
      if (this.tableData.length !== 0) {
        this.fixDataFn(this.tableData)
      }
    },
    // 发送命令
    sendFn(v) {},
  },
}
</script>

<template>
  <div class="command-template">
    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          ref="table"
          v-loading="loading"
          class="command-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
          row-key="id"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-table
                :data="props.row.uDProductCmdParamList"
                size="mini"
                border
                :header-cell-style="{ background: '#f5f5f5' }"
              >
                <el-table-column
                  label="参数编码"
                  prop="code"
                  align="center"
                />
                <el-table-column
                  label="参数名"
                  prop="name"
                  align="center"
                />
                <el-table-column
                  label="参数类型"
                  prop="typeStr"
                  align="center"
                />
                <el-table-column
                  label="是否必填"
                  prop="requiredStr"
                  align="center"
                />
                <el-table-column
                  label="操作"
                  width="150"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      type="primary"
                      @click=""
                    >
                      查看结果
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column
            label="命令名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="命令key"
            prop="code"
            align="center"
          />
          <el-table-column
            label="命令描述"
            prop="remarks"
            align="center"
          />
          <el-table-column
            label="操作"
            width="200"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="warning"
                @click="sendFn(scope.row)"
              >
                发送命令
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.command-template {
  .mid-con {
    padding: 15px 0;
    .command-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
