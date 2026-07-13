<script>
import ImageSelect from '@/components/ImageSelect'
import {
  addProduct,
  deleteProduct,
  getProductList,
} from '@/http/dev/product-api'
import { getAllProtocol } from '@/http/dev/protocol-api'
import { upLoadImg } from '@/http/manage-api'
import { $checkNum } from '@/utils/validate'
import ProductItem from './components/ProductItem'

export default {
  components: {
    ProductItem,
    ImageSelect,
  },
  data: () => ({
    dicData: {}, // 数据字典
    loadingBody: false, // 主体内容loading
    searchData: {
      // 搜索条件
      pageNum: 1,
      pageSize: 12,
      name: '',
      protocolId: '',
      state: '',
      token: '',
      type: '',
    },
    productList: [], // 产品列表信息
    total: 0, // 数据总数
    showDrawerDialog: false, // 是否显示查询弹窗
    drawerAddDialog: false, // 是否显示添加弹窗
    addForm: {}, // 添加表单数据
    addFormRules: {
      // 表单验证
      token: [{ required: true, message: '不能为空', trigger: 'blur' }],
      serialCode: [{ required: true, message: '不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '不能为空', trigger: 'blur' }],
      type: [{ required: true, message: '请选择', trigger: 'blur' }],
      protocolId: [{ required: true, message: '请选择', trigger: 'blur' }],
      detectionCycle: [{ required: true, trigger: 'blur', validator: $checkNum }],
    },
    submitLoading: false, // 提交loading
    // 产品状态列表
    stateList: [
      { name: '未发布', value: '-1' },
      { name: '停用', value: '0' },
      { name: '启用', value: '1' },
    ],
    searchTagList: [], // 查询条件tag
    protoList: [], // 消息协议列表
  }),
  computed: {
    /* 搜索条件tag列表 */
    tagList() {
      const tagArr = []
      for (const key in this.searchData) {
        if (this.searchData[key] === '')
          continue
        const param = { key, name: '' }
        switch (key) {
          case 'name':
            param.name = '产品名称'
            tagArr.push(param)
            break
          case 'state':
            param.name = '产品状态'
            tagArr.push(param)
            break
          case 'type':
            param.name = '产品类型'
            tagArr.push(param)
            break
          case 'protocolId':
            param.name = '消息协议'
            tagArr.push(param)
            break
          default:
        }
      }
      return tagArr
    },
  },
  created() {
    this.dicData = JSON.parse(sessionStorage.getItem('dictList'))
    this.getPrefix()
    this.getDataList()
    this.getProtoList()
  },
  methods: {
    /* 请求产品列表 */
    getDataList() {
      this.loadingBody = true
      getProductList(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.productList = res.data.result.list || []
            this.total = res.data.result.total
          }
          else {
            this.$message.error(res.data.message || '获取产品失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取产品出错', err)
        })
        .finally(() => {
          this.loadingBody = false
        })
    },
    /* 显示添加产品弹窗 */
    showAddClick() {
      this.addForm = {}
      this.drawerAddDialog = true
    },
    /* 添加产品提交 */
    addClick() {
      this.$refs.addForm.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        addProduct(this.addForm)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('添加成功')
              this.getDataList()
              this.drawerAddDialog = false
            }
            else {
              this.$message.error(res.data.message || '添加失败')
            }
          })
          .catch((err) => {
            this.$message.error('添加产品出错', err)
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },
    /* 删除产品 */
    delClick(data) {
      this.$confirm(`您确认要删除 ${data.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loadingBody = true
          deleteProduct(data.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(res.data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除出错!', err)
            })
            .finally(() => {
              this.loadingBody = false
            })
        })
        .catch(() => {})
    },
    /* 显示查询产品弹窗 */
    showSearchClick() {
      this.showDrawerDialog = true
    },
    /* 查询确定按钮 */
    searchClick() {
      this.showDrawerDialog = false
      this.getDataList()
    },
    /* 跳转到详情 */
    toDetailClick(id) {
      this.$router.push({
        path: `/detail/product/${id}`,
      })
    },
    /* 移除筛选条件 */
    removeTagClick(item) {
      this.searchData[item.key] = ''
      this.getDataList()
    },
    /* 图片选择回调 */
    fileChangeEvt(file) {
      if (file) {
        upLoadImg(file, 'PRODUCT_ICON').then(({ data }) => {
          if (data.success) {
            this.addForm.imageUrl = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.addForm.imageUrl = ''
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
  <div class="product-dev">
    <!-- <ECard customStyle="padding:14px 20px"> </ECard> -->
    <!-- 头部 -->
    <!-- <el-row class="header">
      <el-col :span="12"> -->
    <!-- <el-button icon="el-icon-upload" size="mini" type="warning">快速导入</el-button> -->
    <!-- <el-button icon="el-icon-download" size="mini" type="success">下载模板</el-button> -->
    <!-- </el-col>
      <el-col :span="12" class="cdns-con"> </el-col>
    </el-row> -->

    <ECard customStyle="overflow-y: auto;height:84vh;box-sizing:border-box;padding: 14px">
      <div class="mb-3 flex items-center">
        <el-button
          style="margin-right: 8px"
          icon="el-icon-plus"
          type="primary"
          plain
          size="mini"
          @click="showAddClick"
        >
          添加产品
        </el-button>
        <div
          v-if="tagList.length > 0"
          class="flex items-center pr-2"
        >
          <transition-group name="toUp">
            <el-tag
              v-for="item in tagList"
              :key="item.key"
              type="danger"
              size="small"
              closable
              @close="removeTagClick(item)"
            >
              {{ item.name }}
            </el-tag>
          </transition-group>
        </div>
        <el-button
          size="mini"
          type="primary"
          @click="showSearchClick"
        >
          查询产品
        </el-button>
      </div>
      <div class="product-list">
        <ProductItem
          v-for="(item, idx) in productList"
          :key="idx"
          :filePrefix="filePrefix"
          :items="item"
          @detail="toDetailClick"
          @delete="delClick"
        />
      </div>
    </ECard>

    <!-- 产品列表 -->
    <!-- <el-row :gutter="10" class="mid-con" style="margin: 10px 0 0 0" v-loading="loadingBody">
      <el-col :span="24" v-if="productList.length == 0" style="text-align: center; font-size: 16px">暂无产品...</el-col>
      <template v-else>
        <el-col :span="6" v-for="(item, idx) in productList" :key="idx">
          <el-card style="border: none">
            <el-row class="base-info" type="flex" align="middle" :gutter="10">
              <el-col :span="10">
                <el-popover placement="right" trigger="click">
                  <img :src="filePrefix + item.imageUrl + '?t=' + Math.random()" style="height: 150px" />
                  <img slot="reference" :src="filePrefix + item.imageUrl + '?t=' + Math.random()" style="height: 60px; min-height: 60px; max-width: 100%" />
                </el-popover>
              </el-col>
              <el-col :span="14" class="sec-col">
                <div>{{ item.name }}</div>
                <div>{{ item.token }}</div>
              </el-col>
            </el-row>
            <el-row class="more-info">
              <el-col :span="8">
                <div>设备数量</div>
                <el-tag size="mini">{{ item.deviceCount }}</el-tag>
              </el-col>
              <el-col :span="8">
                <div>发布状态</div>
                <el-tag v-if="item.state == -1" size="mini">未发布</el-tag>
                <el-tag v-if="item.state == 0" size="mini" type="danger">停用</el-tag>
                <el-tag v-if="item.state == 1" size="mini" type="success">启用</el-tag>
              </el-col>
              <el-col :span="8">
                <div>产品类型</div>
                <el-tag size="mini">{{ $dictUtils.getDictLabel('product_type', item.type) }}</el-tag>
              </el-col>
            </el-row>
            <el-button-group class="btns">
              <el-button size="mini" @click="toDetailClick(item.id)">
                <i class="el-icon-s-tools" style="font-weight: 400" />
              </el-button>
              <el-button size="mini">
                <i class="el-icon-download" style="color: #67c23a" />
              </el-button>
              <el-button size="mini" @click="delClick(item)">
                <i class="el-icon-delete" style="color: #f56c6c" />
              </el-button>
            </el-button-group>
          </el-card>
        </el-col>
      </template>
    </el-row> -->

    <ECard
      type="footer"
      customStyle="padding: 6px 10px"
    >
      <el-pagination
        style="text-align: right"
        background
        :current-page="searchData.page"
        :page-sizes="[12, 24, 60]"
        :page-size="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getDataList"
        @current-change="getDataList"
      />
    </ECard>

    <!-- 页码 -->
    <el-row />

    <!-- 查询 抽屉 -->
    <el-drawer
      :visible.sync="showDrawerDialog"
      :with-header="false"
    >
      <div class="drawer-title">
        查询条件
      </div>
      <el-divider />
      <div class="drawer-con">
        <el-form
          ref="sForm"
          :model="searchData"
          label-width="85px"
          size="mini"
        >
          <el-form-item label="产品名称">
            <el-input v-model="searchData.name" />
          </el-form-item>
          <el-form-item label="产品状态">
            <el-select
              v-model="searchData.state"
              placeholder="请选择产品状态"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in stateList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产品类型">
            <el-select
              v-model="searchData.type"
              placeholder="请选择产品类型"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in dicData.product_type"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="消息协议">
            <el-select
              v-model="searchData.protocolId"
              placeholder="请选择消息协议"
              clearable
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
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            @click="searchClick"
          >
            查询
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 添加产品 抽屉 -->
    <el-drawer
      :visible.sync="drawerAddDialog"
      :with-header="false"
    >
      <div class="drawer-title">
        添加产品
      </div>
      <el-divider />
      <div
        v-if="drawerAddDialog"
        class="drawer-con"
      >
        <el-form
          ref="addForm"
          :model="addForm"
          :rules="addFormRules"
          label-width="85px"
          size="mini"
        >
          <el-form-item
            label="产品型号"
            prop="token"
          >
            <el-input
              v-model="addForm.token"
              placeholder="请输入产品型号"
            />
          </el-form-item>
          <el-form-item
            label="产品编码"
            prop="serialCode"
          >
            <el-input
              v-model="addForm.serialCode"
              placeholder="请输入产品编码"
            />
          </el-form-item>
          <el-form-item
            label="产品名称"
            prop="name"
          >
            <el-input
              v-model="addForm.name"
              placeholder="请输入产品名称"
            />
          </el-form-item>
          <el-form-item
            label="产品类型"
            prop="type"
          >
            <el-select
              v-model="addForm.type"
              placeholder="请选择产品类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in dicData.product_type"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="消息协议"
            prop="protocolId"
          >
            <el-select
              v-model="addForm.protocolId"
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
          <el-form-item
            label="掉线延时"
            prop="detectionCycle"
          >
            <el-input
              v-model="addForm.detectionCycle"
              type="number"
              placeholder="设备是否在线检测周期（秒）"
            />
          </el-form-item>
          <el-form-item
            label="产品描述"
            prop="remarks"
          >
            <el-input
              v-model="addForm.remarks"
              placeholder="请输入产品描述"
            />
          </el-form-item>
          <el-form-item
            label="产品图标"
            prop="imageUrl"
          >
            <ImageSelect
              width="100px"
              height="100px"
              @fileChange="fileChangeEvt"
            />
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="addClick"
          >
            确认
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.product-dev {
  position: relative;
  display: block;
  padding: 10px;
  background: #f3f7f9;

  .product-list {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    min-width: 800px;
    max-height: 75vh;
    overflow-y: scroll;
    overflow-x: hidden;
    scrollbar-width: none;
    -webkit-scrollbar: none;
  }

  .card-cell {
    display: flex;
    align-items: center;
    margin: 0 !important;
  }
  .header {
    background: #ffffff;
    padding: 10px;
  }
  .cdns-con {
    display: flex;
    justify-content: flex-end;
    .cdns {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .el-tag {
        margin-right: 6px;
      }
    }
  }
  .mid-con {
    height: 550px;
    overflow: auto;
    padding: 2vh 10px;
    background: #ffffff;
    & > .el-col {
      margin-bottom: 2vh;
      .el-card__body {
        position: relative;
        padding: 10px;
        padding-bottom: 40px;

        .base-info {
          .sec-col {
            & > div {
              margin-bottom: 4px;
            }
          }
        }

        .more-info {
          padding-top: 10px;
          .el-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            & > div:first-child {
              margin-bottom: 4px;
            }
          }
        }

        .btns {
          position: absolute;
          left: 0;
          bottom: 0;
          display: flex;
          width: 100%;
          .el-button {
            flex: 1;
            i {
              font-weight: bold;
            }
          }
        }
      }
    }
  }
}
</style>
