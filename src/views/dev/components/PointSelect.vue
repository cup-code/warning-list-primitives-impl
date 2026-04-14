<script>
import { getDeviceListByPid, getRealDataById } from '@/http/dev/manage-api'
import { getAllProduct } from '@/http/dev/product-api'

export default {
  props: {
    /* 打开前已选的数据 */
    oldList: {
      type: Array,
      default() {
        return []
      },
    },
    /* 选择数量上限 */
    limit: {
      type: Number,
      default: 999999,
    },
  },
  data() {
    return {
      isLoading: false,
      productList: [], // 产品类型列表
      deviceList: [], // 产品列表
      pointList: [], // 测点列表
      pickList: [], // 选中的数据列表
      deviceCode: '', // 存储deviceCode值
      // 搜索数据
      searchData: {
        productType: '',
        deviceId: '',
        ioName: '',
        ioCode: '',
      },
      params: {
        page: 1,
        pageSize: 20,
      },
      total: 0,
    }
  },
  computed: {
    /* 设置选中的类名 */
    setPickClass() {
      return function (id) {
        let isExsit = false
        for (const item of this.pickList) {
          if (item.ioId === id) {
            isExsit = true
            break
          }
        }
        return isExsit
      }
    },
    /* 设置数据过滤 */
    showDataList() {
      const dataList = this.pointList.filter((item) => {
        let isReturn = true
        if (!item.code || !item.name) {
          isReturn = false
        }
        else if (!item.code.includes(this.searchData.ioCode)) {
          isReturn = false
        }
        else if (!item.name.includes(this.searchData.ioName)) {
          isReturn = false
        }
        return isReturn
      })
      return dataList
    },
  },
  created() {
    this.pickList = JSON.parse(JSON.stringify(this.oldList))
    getAllProduct()
      .then((res) => {
        if (res.data.success) {
          this.productList = res.data.result || []
        }
      })
      .catch((err) => {
        console.log(err)
      })
  },
  methods: {
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      this.deviceList.forEach((item) => {
        if (item.id === this.searchData.deviceId) {
          this.deviceCode = item.code
        }
      })
      getRealDataById(this.searchData.productType, this.searchData.deviceId, this.params)
        .then((res) => {
          if (res.data.success && res.data.result) {
            this.pointList = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '查询测点失败')
          }
        })
        .catch((err) => {
          this.$message.error('查询测点出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击选中回调 */
    pickClick(pickItem) {
      console.log(pickItem)
      let isExsit = false
      let dataIndex = -1
      for (let i = 0; i < this.pickList.length; i++) {
        if (pickItem.id === this.pickList[i].ioId) {
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
          deviceCode: this.deviceCode,
          ioId: pickItem.id,
          ioName: pickItem.name,
          ioCode: pickItem.code,
          varType: pickItem.varType,
        })
      }
    },
    /* 根据类型获取设备列表 */
    getDeviceList() {
      if (!this.searchData.productType) {
        return
      }
      getDeviceListByPid(this.searchData.productType)
        .then((res) => {
          this.deviceList = res.data.result || []
        })
        .catch((err) => {
          console.log(err)
        })
    },
    /* 移除回调 */
    delTagClick(index) {
      this.pickList.splice(index, 1)
    },
    /* 确认保存 */
    submitClick() {
      if (this.limit < this.pickList.length) {
        this.$message.error(`你最多只能选择${this.limit}个测点`)
        return
      }
      this.$emit('close', this.pickList)
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
    <el-container style="height: 500px">
      <el-container>
        <el-header style="text-align: left; font-size: 12px; height: 80px">
          <el-form
            size="small"
            inline
          >
            <el-form-item
              prop="productType"
              label="产品类型"
            >
              <el-select
                v-model="searchData.productType"
                placeholder="请选择"
                style="width: 100%"
                filterable
                @change="getDeviceList"
              >
                <el-option
                  v-for="item in productList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              prop="deviceId"
              label="终端名称"
            >
              <el-select
                v-model="searchData.deviceId"
                placeholder="请选择"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="item in deviceList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              prop="ioName"
              label="测点名称"
            >
              <el-input
                v-model="searchData.ioName"
                size="small"
                placeholder="测点名称"
                clearable
              />
            </el-form-item>
            <el-form-item
              prop="ioCode"
              label="测点编码"
            >
              <el-input
                v-model="searchData.ioCode"
                size="small"
                placeholder="测点编码"
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
        <el-main>
          <el-table
            v-loading="isLoading"
            :data="showDataList"
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
              label="测点名称"
              prop="name"
              align="center"
            />
            <el-table-column
              label="测点编号"
              prop="code"
              align="center"
            />
            <el-table-column
              label="测点值输出类型"
              prop="varType"
              align="center"
              width="150"
            >
              <template slot-scope="props">
                <span v-if="props.row.varType === 1">整型(Int)</span>
                <span v-if="props.row.varType === 2">浮点型(Double)</span>
                <span v-if="props.row.varType === 3">字符串(String)</span>
                <span v-if="props.row.varType === 4">布尔型(Boolean)</span>
              </template>
            </el-table-column>
          </el-table>
        </el-main>
      </el-container>
      <el-aside width="200px">
        <!-- 已选择 -->
        <div class="pick-list">
          <div class="pick-list-title">
            已选择
          </div>
          <div>
            <el-tag
              v-for="(item, index) in pickList"
              :key="item.id"
              style="margin: 0 4px 6px 0"
              closable
              @close="delTagClick(index)"
            >
              {{ item.ioName }}
            </el-tag>
          </div>
        </div>
      </el-aside>
    </el-container>

    <el-pagination
      style="text-align: left"
      :current-page.sync="params.page"
      :page-size.sync="params.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      background
      @current-change="searchClick"
      @size-change="searchClick"
    />
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
  &-title {
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
