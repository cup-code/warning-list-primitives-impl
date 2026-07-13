<script>
export default {
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
      },
      loading: false,
      data: [
        { name: 'aaa', state: 1, code: 1874 },
        { name: 'aaa', state: 1, code: 1874 },
        { name: 'aaa', state: 1, code: 1874 },
        { name: 'aaa', state: 1, code: 1874 },
        { name: 'aaa', state: 1, code: 1874 },
        { name: 'aaa', state: 1, code: 1874 },
        { name: 'aaa', state: 1, code: 1874 },
        { name: 'aaa', state: 1, code: 1874 },
        { name: 'aaa', state: 1, code: 1874 },
        { name: 'aaa', state: 1, code: 1874 },
        { name: 'aaa', state: 1, code: 1874 },
        { name: 'aaa', state: 1, code: 1874 },
      ],
      total: 0,

      editForm: {},
      editRules: {},
      title: '新增规则',
      dialog: false,
      editLoading: false,
      editable: true,
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    async getDataList() {
      // this.loading = true;
      // const { data } = await getHkCameraList(this.form);
      // this.loading = false;
      // if(data.code == 200) {
      //     this.data = data.result.list || [];
      //     this.total = data.result.total;
      // }else {
      //     this.$message.error(data.message || '查询失败');
      //     this.data = [];
      //     this.total = 0;
      // }
    },
    pageSizeFn(v) {
      this.form.pageNum = 1
      this.form.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.form.pageNum = v
      this.getDataList()
    },
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
        companyId: this.form.companyId || '',
      }
      this.getDataList()
    },
    addFn() {
      this.editable = true
      this.editForm = {}
      this.title = '新增规则'
      this.dialog = true
    },
    delFn(row) {
      this.$confirm(`您确认要删除 ${row.camName}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {})
        .catch(() => {})
    },
    // 保存
    saveFn() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true
      })
    },
  },
}
</script>

<template>
  <div class="dev-fireControl">
    <div class="rightCon">
      <!-- 查询条件 -->
      <div class="top-fun">
        <div>
          <el-button
            type="primary"
            icon="el-icon-plus"
            plain
            @click="addFn"
          >
            添加终端
          </el-button>
        </div>
        <div>
          <el-button
            type="primary"
            icon="el-icon-search"
          >
            查询终端
          </el-button>
        </div>
      </div>

      <div class="main-box">
        <el-row :gutter="10">
          <el-col
            v-if="data.length === 0"
            class="empty"
            :span="24"
            style="text-align: center; font-size: 16px"
          >
            暂无终端...
          </el-col>

          <template v-else>
            <el-col
              v-for="(item, idx) in data"
              :key="idx"
              :span="8"
            >
              <el-card>
                <el-row
                  class="base-info"
                  :gutter="10"
                >
                  <el-col :span="7">
                    <el-popover
                      placement="right"
                      trigger="click"
                    >
                      <img
                        :src="item.imageUrl ? filePrefix + item.imageUrl : ''"
                        style="height: 150px"
                      >
                      <img
                        slot="reference"
                        :src="item.imageUrl ? filePrefix + item.imageUrl : ''"
                        style="height: 40px; min-height: 40px; max-width: 100%"
                      >
                    </el-popover>
                  </el-col>
                  <el-col :span="12">
                    <div style="font-size: 13px; white-space: nowrap">
                      {{ item.name }}
                    </div>
                  </el-col>
                  <el-col
                    :span="5"
                    class="third-col"
                    style="text-align: right"
                  >
                    <el-tag
                      v-if="item.state === -1 || (!item.state && item.state !== 0)"
                      effect="plain"
                      type="warning"
                    >
                      未发布
                    </el-tag>
                    <el-tag
                      v-if="item.state === 0"
                      effect="plain"
                      type="warning"
                    >
                      未激活
                    </el-tag>
                    <el-tag
                      v-if="item.state === 1"
                      effect="plain"
                      type="danger"
                    >
                      离线
                    </el-tag>
                    <el-tag
                      v-if="item.state === 2"
                      effect="plain"
                      type="success"
                    >
                      在线
                    </el-tag>
                    <el-tag
                      v-if="item.state === 3"
                      effect="plain"
                      type="warning"
                    >
                      报警
                    </el-tag>
                  </el-col>
                </el-row>
                <el-row class="more-info">
                  <el-col :span="21">
                    <div class="moreInfo-row">
                      <span>产品型号: </span>
                      <span class="row-con">{{ item.a }}</span>
                    </div>
                    <div class="moreInfo-row">
                      <span>终端编码: </span>
                      <span class="row-con">{{ item.code }}</span>
                    </div>
                    <div class="moreInfo-row">
                      <span>终端分组: </span>
                      <span class="row-con">{{ item.b }}</span>
                    </div>
                  </el-col>
                </el-row>
                <el-button-group class="btns">
                  <el-button
                    size="mini"
                    @click="toDetail(item.productId, item.id, item.code)"
                  >
                    <i
                      class="el-icon-s-tools"
                      style="font-weight: 400"
                    />
                  </el-button>
                  <el-button
                    size="mini"
                    @click="delFn(item)"
                  >
                    <i
                      class="el-icon-delete"
                      style="color: #f56c6c"
                    />
                  </el-button>
                </el-button-group>
              </el-card>
            </el-col>
          </template>
        </el-row>

        <!-- 分页 -->
        <el-pagination
          :current-page.sync="form.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="form.pageSize"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
        />
      </div>
    </div>

    <el-dialog
      class="normal-dialog edit-dialog"
      :title="title"
      :visible.sync="dialog"
      width="70%"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="85px"
        size="mini"
        :disabled="!editable"
      />

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog = false">
          {{ editable ? '取消' : '关闭' }}
        </el-button>
        <el-button
          v-show="editable"
          type="primary"
          :loading="editLoading"
          @click="saveFn"
        >
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.dev-fireControl {
  height: calc(100vh - 50px);
  padding: 10px;
  background: #f3f7f9;
  display: flex;
  .leftCon {
    width: 200px;
    height: 100%;
    .leftTree .el-card {
      display: flex;
      flex-direction: column;
    }
  }
  .rightCon {
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    .top-fun {
      height: 64px;
      padding: 0 10px;
      background: #fff;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .main-box {
      background: #fff;
      flex: 1;
      overflow: hidden;
      padding: 10px;
      display: flex;
      flex-direction: column;
      .el-row {
        flex: 1;
        overflow: auto;
        .empty {
          position: absolute;
          top: 50%;
        }
        & > .el-col {
          margin-bottom: 2vh;
          .el-card__body {
            position: relative;
            padding: 10px;
            padding-bottom: 40px;
            height: 170px;

            .base-info {
              display: flex;
              align-items: center;
              .third-col {
                .el-tag {
                  padding: 0;
                  border: none;
                  height: 0;
                  line-height: 0;
                  font-size: 13px;
                  font-weight: bold;
                }
              }
            }

            .more-info {
              margin-top: 10px;
              .el-col {
                display: flex;
                flex-direction: column;
                justify-content: center;
                & > div:nth-child(2) {
                  padding: 12px 0;
                }
              }
              .moreInfo-row {
                display: flex;
                .row-con {
                  flex: 1;
                  // overflow: auto;
                  white-space: nowrap;
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

      .el-pagination {
        text-align: right;
        padding: 0;
        padding-top: 10px;
        border-top: 1px solid #ebeef5;
        .el-pagination__sizes {
          margin-right: 0;
          .el-input {
            margin-right: 0;
          }
        }
      }
    }
  }
}

.normal-dialog.edit-dialog {
  .el-dialog__header {
    min-height: 46px;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
      }
    }
  }
  .el-dialog__footer {
    padding: 8px 20px;
    border-top: 1px solid #e8e8e8;
    .dialog-footer {
      height: 30px;
    }
  }
}
</style>
