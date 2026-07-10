<script>
import {
  addPic,
  deletePic,
  getPicListFn,
} from '@/http/hmi/manage-api'

export default {
  data: () => ({
    loading: false,
    picList: [],
    pageFlag: false,
    sForm: {
      page: 1,
      pageSize: 12,
    },
    total: 0,
    drawer_add: false,
    addForm: {},
    addFormRules: {
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    },
    hideUpload: false,
    fileList: [], // 记录所选图片
    submitLoading: false,
  }),
  created() {
    this.getPrefix()
  },
  mounted() {
    this.getPicList()
  },
  methods: {
    getPicList() {
      this.loading = true
      getPicListFn(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            resD.result.list.forEach((item) => {
              item.path = this.filePrefix + item.path
            })
            this.picList = resD.result.list || []
            this.total = resD.result.total
            this.pageFlag = this.total > 0
          }
          else {
            this.$message.error(msg || '获取图库失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('获取图库失败')
        })
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getPicList()
    },
    pageSizeFn(v) {
      this.sForm.page = 1
      this.sForm.pageSize = v
      this.getPicList()
    },
    // 添加图片 按钮
    addFn() {
      this.addForm = {}
      this.drawer_add = true
    },
    // 上传组件的 change事件（移除时不会触发）
    fileChangeFn(file, fileList) {
      this.fileList = fileList
      this.addForm.icons = this.fileList
      this.hideUpload = fileList.length >= 1
    },
    // 移除图片
    fileRemoveFn(file) {
      const idx = this.fileList.indexOf(file)
      this.fileList.splice(idx, 1)
      this.addForm.icons = this.fileList
      this.hideUpload = this.fileList.length >= 1
    },
    // 添加图片提交按钮
    addDoFn() {
      if (this.fileList.length < 1) {
        this.$message.error('请上传图片！')
        return
      }
      this.$refs.addForm.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        addPic(this.addForm)
          .then((res) => {
            this.submitLoading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              this.$message.success(msg || '添加成功')
              this.getPicList()
              this.drawer_add = false
            }
            else {
              this.$message.error(msg || '添加失败')
            }
          })
          .catch((err) => {
            this.submitLoading = false
            this.$message.error('添加失败')
          })
      })
    },
    // 删除图片
    delFn(id, name) {
      this.$confirm(`您确认要删除图片： ${name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deletePic(id)
            .then((res) => {
              this.loading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success === true) {
                this.$message.success(msg || '删除成功')
                this.getPicList()
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
  },
}
</script>

<template>
  <div class="page-container">
    <ECard>
      <!-- 头部 -->
      <div class="card-cell">
        <EButton
          btnIcon="el-icon-plus"
          type="primary"
          plain
          @click="addFn"
        >
          添加图片
        </EButton>
      </div>
      <!-- 内容 -->
      <el-row
        v-loading="loading"
        :gutter="10"
        class="mid-con"
      >
        <el-col
          v-if="picList.length === 0"
          :span="24"
          style="text-align: center; font-size: 16px"
        >
          暂无图库...
        </el-col>
        <template v-else>
          <el-col
            v-for="item in picList"
            :key="item.id"
            :span="6"
          >
            <el-card
              shadow="never"
              style="border: 1px solid var(--ky-border-color); text-align: center; margin-top: 8px"
            >
              <img
                :src="item.path"
                style="height: 150px"
              >
              <div class="des">
                <div>名称: {{ item.name }}</div>
                <el-button-group class="btns">
                  <i
                    class="el-icon-delete"
                    style="color: #f56c6c; font-weight: 700"
                    @click="delFn(item.id, item.name)"
                  />
                </el-button-group>
              </div>
            </el-card>
          </el-col>
        </template>
      </el-row>
    </ECard>

    <!-- 页码 -->
    <ECard type="footer">
      <el-pagination
        v-if="pageFlag"
        style="text-align: right"
        :current-page="sForm.page"
        :page-sizes="[12, 24, 36]"
        background
        :page-size="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>
    <!-- 添加图片 抽屉 -->
    <el-drawer
      :visible.sync="drawer_add"
      :with-header="false"
      class="drawer-add"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        添加图片
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="addForm"
          :model="addForm"
          :rules="addFormRules"
          label-width="85px"
          size="mini"
        >
          <el-form-item
            label="图片名称"
            prop="name"
          >
            <el-input
              v-model="addForm.name"
              placeholder="请输入"
            />
          </el-form-item>
          <el-form-item label="上传图片">
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-change="fileChangeFn"
              :file-list="fileList"
              :limit="1"
              :class="{ hide: hideUpload }"
            >
              >
              <template #default>
                <i class="el-icon-plus" />
              </template>
              <template #file="{ file }">
                <div>
                  <img
                    class="el-upload-list__item-thumbnail"
                    :src="file.url"
                    alt=""
                  >
                  <span class="el-upload-list__item-actions">
                    <span
                      class="el-upload-list__item-delete"
                      @click="fileRemoveFn(file)"
                    >
                      <i class="el-icon-delete" />
                    </span>
                  </span>
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="addDoFn"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.manage-pic {
  padding: 10px;
}
.manage-pic .hide .el-upload--picture-card {
  display: none;
}
.des {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-top: 8px;
}
.btns:hover {
  cursor: pointer;
}
</style>
