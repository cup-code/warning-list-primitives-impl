<script>
import {
  addTemplate,
  deleteTemplate,
  editTemplate,
  editTemplateState,
  getAllTemplate,
} from '@/http/hmi/manage-api'
import { upLoadImg } from '@/http/manage-api'

export default {
  data: () => ({
    loading: false,
    tableData: [],
    pageFlag: true,
    drawer: false,
    drawerType: 0,
    drawerTitle: '',
    form: {},
    rules: {},
    submitLoading: false,
    tempList: [],
  }),
  created() {
    this.getPrefix()
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.loading = true
      getAllTemplate()
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success === true) {
            if (resD.result.length) {
              resD.result.forEach((item) => {
                if (item.thumbnailUrl) {
                  item.showThumbnailUrl = this.filePrefix + item.thumbnailUrl
                }
              })
            }
            this.tableData = resD.result || []
          }
          else {
            this.$message.error(msg || '查询模板失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询模板失败')
        })
    },
    // 新建 模板
    addFn() {
      this.drawerTitle = '新建模板'
      this.drawerType = 0
      this.drawer = true
      this.form = {}
    },
    // 编辑 模板
    editFn(v) {
      this.form = JSON.parse(JSON.stringify(v))
      this.drawerTitle = '编辑模板'
      this.drawerType = 1
      this.drawer = true
    },
    // 删除 模板
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteTemplate(v.id)
            .then((res) => {
              this.loading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success === true) {
                this.$message.success(msg || '删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败!')
              }
            })
            .catch((err) => {
              this.loading = false
              this.$message.error('删除失败!')
            })
        })
        .catch(() => {})
    },
    // 上下架 模板
    ableFn(v, state) {
      this.loading = true

      let str = ''
      if (state === 1) {
        str = '下架'
      }
      else {
        str = '上架'
      }
      const params = {
        id: v.id,
        state,
      }

      editTemplateState(params)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || `${str}成功`)
            this.getDataList()
          }
          else {
            this.$message.error(msg || `${str}失败`)
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error(`${str}失败`)
        })
    },
    // 预览、编辑 模板画面
    previewFn(v, isEditor) {
      let hmiUrl = v.hmiIndex
      if (isEditor) {
        hmiUrl += '&mode=editor&type=template'
      }
      window.open(hmiUrl)
    },
    // 下载
    downFn(v) {
      window.open(v.archiveUrl)
    },

    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        const {
          name,
          remarks,
          thumbnailUrl,
        } = this.form
        const params = { name, remarks, thumbnailUrl }

        // 添加
        if (this.drawerType === 0) {
          addTemplate(params)
            .then((res) => {
              this.submitLoading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success) {
                this.$message.success(msg || '添加成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '添加失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('添加失败')
            })
        }
        // 编辑
        else {
          params.id = this.form.id
          editTemplate(params)
            .then((res) => {
              this.submitLoading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success) {
                this.$message.success(msg || '编辑成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '编辑失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('编辑失败')
            })
        }
      })
    },
    // 上传封面图片
    upBeforeFn(file) {
      // 调用接口
      upLoadImg(file, 'HMI_TEMPALTE')
        .then((res) => {
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || '上传成功')
            this.$set(this.form, 'thumbnailUrl', resD.result)
          }
          else {
            this.$message.error(msg || '上传失败')
          }
        })
        .catch((err) => {
          this.$message.error('上传失败')
        })

      return false
    },
  },
}
</script>

<template>
  <div class="page-container-fixed">
    <!-- 按钮 -->
    <ECard>
      <div class="card-cell">
        <EButton
          btnIcon="el-icon-plus"
          plain
          type="primary"
          size="mini"
          @click="addFn"
        >
          新建模板
        </EButton>
      </div>
      <el-table
        v-loading="loading"
        class="group-table"
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="图片"
          prop="thumbnailUrl"
          align="center"
        >
          <template slot-scope="props">
            <div style="display: flex; align-items: center; justify-content: center">
              <img
                v-if="props.row.thumbnailUrl"
                :src="props.row.showThumbnailUrl"
                style="height: 30px"
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="名称"
          prop="name"
          align="center"
        />
        <!-- <el-table-column label="ID" prop="id" align='center'></el-table-column> -->
        <el-table-column
          label="状态"
          prop="status"
          align="center"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.status === 0"
              size="mini"
              type="success"
            >
              上架
            </el-tag>
            <el-tag
              v-if="props.row.status === 1"
              size="mini"
              type="danger"
            >
              下架
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column label="所属分组" prop="groupName" align='center'></el-table-column> -->
        <el-table-column
          label="描述"
          prop="remarks"
          align="center"
        />
        <el-table-column
          label="操作"
          width="300"
          align="right"
        >
          <template slot-scope="scope">
            <!-- <div> -->
            <EButton
              size="mini"
              type="text"
              @click="editFn(scope.row)"
            >
              设置
            </EButton>
            <!-- <EButton@click="previewFn(scope.row, true)" size="mini" type="success">编辑</EButton>
                                <EButtonsize="mini" type="warning" @click="previewFn(scope.row)">运行</EButton> -->
            <EButton size="mini" type="text">
              <router-link
                tag="a"
                target="_blank"
                :to="{
                  name: 'editor',
                  query: {
                    mode: 'editor',
                    id: scope.row.encryptHmiId || scope.row.code,
                    type: 'template',
                  },
                }"
              >
                编辑
              </router-link>
            </EButton>
            <EButton size="mini" type="text">
              <router-link
                tag="a"
                target="_blank"
                :to="{
                  name: 'editor',
                  query: {
                    id: scope.row.encryptHmiId || scope.row.code,
                    type: 'template',
                  },
                }"
              >
                运行
              </router-link>
            </EButton>
            <!-- </div>
                            <div style="margin-top: 4px;"> -->
            <EButton
              v-if="scope.row.status === 0"
              size="mini"
              type="text"
              @click="ableFn(scope.row, 1)"
            >
              下架
            </EButton>
            <EButton
              v-if="scope.row.status === 1"
              size="mini"
              type="text"
              @click="ableFn(scope.row, 0)"
            >
              上架
            </EButton>
            <!-- <EButtonsize="mini" type="success" @click="downFn(scope.row)">下载</EButton> -->
            <EButton
              size="mini"
              type="text"
              :disabled="scope.row.status === 0"
              @click="delFn(scope.row)"
            >
              删除
            </EButton>
            <!-- </div> -->
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <el-drawer :visible.sync="drawer" :with-header="false">
      <!-- 标题 -->
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="form"
          label-width="85px"
          :rules="rules"
          size="mini"
        >
          <el-form-item label="模板名称" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="模板描述" prop="remarks">
            <el-input v-model="form.remarks" />
          </el-form-item>
          <el-form-item label="模板封面" class="ex-item">
            <el-input v-model="form.thumbnailUrl" disabled />
            <div class="ex-info">
              <el-upload action="" :before-upload="upBeforeFn">
                <el-button type="success">
                  上传图片
                </el-button>
              </el-upload>
            </div>
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitFn"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  position: relative;
  padding: 10px;
  .mid-con {
    padding: 2vh 0;
    .group-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
  .hmi-dialog .el-dialog {
    display: flex;
    flex-direction: column;
    .el-dialog__header {
      .el-dialog__headerbtn {
        top: 10px;
        right: 10px;
        .el-dialog__close {
          font-size: 20px;
          font-weight: bold;
        }
      }
    }
    .el-dialog__body {
      flex: 1;
      padding: 0;
      padding-top: 10px;
    }
  }
  .ex-item {
    .el-form-item__content {
      display: flex;
      .ex-info {
        margin-left: 10px;
      }
    }
  }
}
</style>
