<script>
import { getHmi } from '@/http/hmi/manage-api'

export default {
  props: {
    // 打开前已选的数据
    oldList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      isLoading: false,
      hmiList: [],
      pickList: [], // 选中的数据列表
      // 搜索数据
      searchData: {
        name: '',
        page: 1,
        pageSize: 1000,
      },
      total: '',
    }
  },
  computed: {
    // 设置选中的类名
    setPickClass() {
      return function (id) {
        let isExsit = false
        for (const item of this.pickList) {
          if (item.hmiId === id) {
            isExsit = true
            break
          }
        }
        return isExsit
      }
    },
  },
  created() {
    this.pickList = JSON.parse(JSON.stringify(this.oldList))
  },
  methods: {
    // 点击搜索
    searchClick() {
      this.isLoading = true
      getHmi(this.searchData)
        .then(({ data }) => {
          if (data.success && data.result) {
            this.hmiList = data.result.list
            this.total = data.result.total
          }
          else {
            this.$message.warning(data.message || '查询组态失败')
          }
        })
        .catch((err) => {
          this.$message.error('查询组态出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 点击选中回调
    pickClick(pickItem) {
      let isExsit = false
      let dataIndex = -1
      for (let i = 0; i < this.pickList.length; i++) {
        if (pickItem.id === this.pickList[i].hmiId) {
          isExsit = true
          dataIndex = i
          break
        }
      }
      if (isExsit) {
        this.pickList.splice(dataIndex, 1)
      }
      else {
        pickItem.hmiId = pickItem.id
        this.pickList.push(pickItem)
      }
    },
    // 移除回调
    delTagClick(index) {
      this.pickList.splice(index, 1)
    },
    // 确认保存
    submitClick() {
      if (this.pickList.length > 0) {
        this.$emit('close', this.pickList)
      }
      else {
        this.$message.warning('绑定组态不能为空')
      }
    },
    // 点击关闭
    closeClick() {
      this.$emit('close', null)
    },
  },
}
</script>

<template>
  <div>
    <div style="height: 500px">
      <el-container>
        <el-header style="text-align: left; font-size: 12px">
          <el-form
            size="small"
            inline
          >
            <el-form-item label="组态名称">
              <el-input
                v-model="searchData.name"
                size="small"
                placeholder="组态名称"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="small"
                icon="el-icon-search"
                @click="searchClick"
              >
                查询
              </el-button>
            </el-form-item>
          </el-form>
        </el-header>

        <el-main style="width: 650px; height: 350px">
          <el-table
            v-loading="isLoading"
            :data="hmiList"
            size="small"
            height="100%"
            style="width: 100%"
          >
            <el-table-column width="55">
              <template slot-scope="scope">
                <i
                  :class="setPickClass(scope.row.id) ? 'el-icon-circle-check activeRadio' : ''"
                  class="radio-normal"
                  @click="pickClick(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              type="index"
              label="序号"
              width="50"
            />
            <el-table-column
              label="组态名称"
              prop="name"
              align="center"
            />
            <el-table-column
              label="所属分组"
              prop="groupName"
              align="center"
            />
          </el-table>
        </el-main>
      </el-container>

      <el-aside width="600px">
        <!-- 已选择 -->
        <div class="pick-list">
          <div class="pick-list-title">
            已选择
          </div>
          <div>
            <el-tag
              v-for="(item, index) in pickList"
              :key="item.id"
              style="margin: 0 0 5px 0"
              closable
              @close="delTagClick(index)"
            >
              {{ item.name || item.hmiName }}
            </el-tag>
          </div>
        </div>
      </el-aside>
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="closeClick"
      >取消</el-button>
      <el-button
        size="small"
        type="primary"
        @click="submitClick"
      >确认保存</el-button>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.pick-list {
  min-height: 60px;
  padding: 5px;
  .pick-title {
    margin: 0 0 10px 0;
    font-weight: bold;
  }
}
.radio-normal {
  display: block;
  width: 20px;
  height: 20px;
  border: 1px solid lightgray;
  border-radius: 50%;
  font-size: 20px;
  line-height: 20px;
  user-select: none;
  cursor: pointer;
}
.activeRadio {
  color: #409eff;
  border: none;
}
</style>
