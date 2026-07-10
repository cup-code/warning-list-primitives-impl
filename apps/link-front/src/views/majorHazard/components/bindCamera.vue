<script>
import { getHkAlarmList } from '@/http/major-hazard/monitorBind-api.js'

export default {
  name: 'bindCamera',
  props: {
    /* 打开前已选的数据 */
    oldList: {
      type: Array,
      default() {
        return []
      },
    },
    companyId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isLoading: false,
      cameraList: [], // 摄像头信息列表
      pickList: [], // 选中的数据列表
      searchData: {
        // 搜索数据
        brand: '',
        cameraNameOrLoc: '',
        pageNum: 1,
        pageSize: 999,
        companyId: '',
      },
    }
  },
  computed: {
    /* 设置选中的类名 */
    setPickClass() {
      return function (id) {
        let isExsit = false
        for (const item of this.pickList) {
          if (item.cameraId === id) {
            isExsit = true
            break
          }
        }
        return isExsit
      }
    },
  },
  created() {
    this.searchData.companyId = this.companyId
    this.oldList.forEach((item) => {
      this.pickList.push({
        cameraId: item.cameraId,
        camName: item.camName,
        companyId: item.companyId,
        companyName: item.companyName,
      })
    })
  },
  methods: {
    /* 点击搜索 */
    searchClick() {
      this.getCameraList()
    },
    /* 获取摄像头信息列表 */
    getCameraList() {
      this.isLoading = true
      getHkAlarmList(this.searchData)
        .then((res) => {
          if (res.data.success && res.data.result) {
            this.cameraList = res.data.result.list || []
          }
        })
        .catch((err) => {
          this.$message.error('查询摄像头列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击选中回调 */
    pickClick(pickItem) {
      let isExsit = false
      let dataIndex = -1
      for (let i = 0; i < this.pickList.length; i++) {
        if (pickItem.id === this.pickList[i].cameraId) {
          isExsit = true
          dataIndex = i
          break
        }
      }
      if (isExsit) {
        this.pickList.splice(dataIndex, 1)
      }
      else {
        this.pickList.push({
          cameraId: pickItem.id,
          camName: pickItem.camName,
          companyId: pickItem.companyId,
          companyName: pickItem.companyName,
        })
      }
    },
    /* 移除回调 */
    delTagClick(index) {
      this.pickList.splice(index, 1)
    },
    /* 确认保存 */
    submitClick() {
      if (this.pickList.length > 0) {
        this.$emit('close', this.pickList)
      }
      else {
        this.$message.warning('绑定摄像头不能为空')
      }
    },
    /* 点击关闭 */
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
        <el-header style="text-align: left; font-size: 12px; height: 60px">
          <el-form
            size="small"
            inline
          >
            <el-form-item
              prop="productType"
              label="品牌"
            >
              <el-select
                v-model="searchData.brand"
                clearable
                placeholder="请选择"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('videoType')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              prop="ioCode"
              label="摄像头名称"
            >
              <el-input
                v-model="searchData.cameraNameOrLoc"
                size="small"
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
            :data="cameraList"
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
              label="公司"
              prop="companyName"
              align="center"
            />
            <el-table-column
              label="摄像头名称"
              prop="camName"
              align="center"
            />
            <el-table-column
              label="位置"
              prop="camLocation"
              align="center"
            />
            <el-table-column
              label="品牌"
              prop="brand"
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
              :key="item.cameraId"
              style="margin: 0 0 5px 0"
              closable
              @close="delTagClick(index)"
            >
              {{ item.camName }}
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
