<script>
import {
  addAssetType,
  deleteAssetType,
  editAssetType,
  getAllAssetType,
} from '@/http/eam-api'

export default {
  data: () => ({
    loading: false,
    treeData: [],
    defaultProps: {
      children: 'children',
      label: 'assetTypeName',
    },
    form: {},
    rules: {},
    drawer: false, // 添加 抽屉
    drawerTitle: '', // 抽屉标题
    addForm: {},
    editLoading: false,
    addLoading: false,
    delLoading: false,

    docLoading: false,
    drawer_doc: false, // 电子文档 抽屉
    tableData_doc: [],
  }),
  mounted() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.loading = true
      getAllAssetType()
        .then((res) => {
          const resD = res.data
          const msg = resD.message
          this.loading = false
          if (resD.success === true) {
            this.treeData = this.setTreeData(resD.result || [])
          }
          else {
            this.$message.error(msg || '查询分类失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询分类失败')
        })
    },
    // 获取指定资产类别的 电子文档数据
    // getDocData(id) {
    //     this.tableData_doc = [];
    //     this.docLoading = true;
    //     getAssetTypeDoc(id).then(res => {
    //         this.docLoading = false;
    //         let resD = res.data;
    //         if(resD.success === true) {
    //             this.tableData_doc = (resD.result || []).map(item => ({file: item}));
    //         }
    //     }).catch(err => {
    //         this.docLoading = false;
    //     });
    //
    // },
    // 添加子分类
    addType() {
      if (!this.form.id) {
        this.$message.warning('请先选择分类')
        return
      }

      this.drawerTitle = '添加子分类'
      this.addForm = {
        parentId: this.form.id, // 记录父节点
      }
      this.drawer = true
    },
    // 添加一级分类
    addRootType() {
      this.drawerTitle = '添加一级分类'
      this.addForm = {}
      this.drawer = true
    },
    // 删除 分类
    delFn() {
      const v = this.form
      if (!v.id) {
        this.$message.warning('请先选择分类')
        return
      }

      this.$confirm(`您确认要删除 ${v.assetTypeName}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.delLoading = true
          deleteAssetType(v.id)
            .then((res) => {
              this.delLoading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success === true) {
                this.$message.success(msg || '删除成功')
                this.cancelEdit() // 取消选中态 && 清除表单数据
                this.getDataList() // 重新请求数据
              }
              else {
                this.$message.error(msg || '删除失败!')
              }
            })
            .catch((err) => {
              this.delLoading = false
              this.$message.error('删除失败!')
            })
        })
        .catch(() => {})
    },
    // 点击树的item
    treeNodeTap(v) {
      this.form = JSON.parse(JSON.stringify(v))
    },
    // 取消选择树
    cancelEdit() {
      this.form = {}
      this.$refs.tree.setCurrentKey(null)
    },
    // 电子文档按钮
    // docFn() {
    //     let id = this.form.id;
    //     if (!id) {
    //         this.$message.warning("请先选择分类");
    //         return;
    //     }
    //     this.getDocData(id); // 查询指定资产类型下的 电子文档数据
    //     this.drawer_doc = true;
    // },
    // 电子文档 上传按钮
    // upBeforeFn(file) {
    //     this.docLoading = true;
    //
    //     let params = {
    //         id: this.form.id,
    //         files: [file]
    //     }
    //
    //     addAssetTypeDoc(params).then(res => {
    //         this.docLoading = false;
    //         let resD = res.data, msg = resD.message;
    //         if(resD.success) {
    //             this.getDocData(this.form.id);
    //         }else {
    //             this.$message.error(msg || '上传失败');
    //         }
    //
    //     }).catch(err => {
    //         this.docLoading = false;
    //         this.$message.error('上传失败');
    //     })
    //
    //
    //     return false;
    // },

    // 修改 按钮
    submitEdit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.form.id) {
            this.$message.warning('请先选择分类')
            return
          }
          this.editLoading = true

          const {
            assetTypeCode,
            assetTypeName,
            remarks,
            id,
            parentId,
          } = this.form
          const params = { assetTypeCode, assetTypeName, remarks, id, parentId }

          editAssetType(params)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              this.editLoading = false
              if (resD.success === true) {
                this.$message.success('修改成功')
                this.cancelEdit() // 取消选中态 && 清除表单数据
                this.getDataList() // 重新请求数据
              }
              else {
                this.$message.error(msg || '修改失败')
              }
            })
            .catch((err) => {
              this.editLoading = false
              this.$message.error('修改失败')
            })
        }
      })
    },
    // 添加抽屉的 提交按钮
    submitAdd() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.addLoading = true

          addAssetType(this.addForm)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              this.addLoading = false
              if (resD.success === true) {
                this.$message.success('添加成功')
                this.cancelEdit() // 取消选中态 && 清除表单数据
                this.getDataList() // 重新请求数据
                this.drawer = false
              }
              else {
                this.$message.error(msg || '添加失败')
              }
            })
            .catch((err) => {
              this.addLoading = false
              this.$message.error('添加失败')
            })
        }
      })
    },
  },
}
</script>

<template>
  <div class="page-container">
    <ECard customStyle="margin-bottom:0px;height:calc(100vh - 73px);">
      <div class="card-cell">
        <!-- 按钮头部 -->
        <el-button
          size="mini"
          type="primary"
          @click="addRootType"
        >
          添加一级分类
        </el-button>
        <el-button
          size="mini"
          type="warning"
          @click="addType"
        >
          添加子分类
        </el-button>
        <el-button
          size="mini"
          type="danger"
          :loading="delLoading"
          @click="delFn"
        >
          删除
        </el-button>
      </div>

      <!-- 主要内容 -->
      <div
        class="page-container-sidebar"
        style="height: calc(100vh - 100px)"
      >
        <!-- 左侧 -->
        <div style="width: 220px">
          <el-alert
            style="margin-bottom: 10px"
            show-icon
            :closable="false"
          >
            <div slot="title">
              当前选择编辑：
              <span class="select-title">{{ form.name }}</span>
              <a
                v-if="form.id"
                class="select-clear"
                @click="cancelEdit"
              >取消选择</a>
            </div>
          </el-alert>
          <div class="tree-bar">
            <el-tree
              ref="tree"
              v-loading="loading"
              :data="treeData"
              :props="defaultProps"
              highlight-current
              :expand-on-click-node="false"
              node-key="id"
              @node-click="treeNodeTap"
            />
          </div>
        </div>
        <!-- 右侧 -->
        <div class="page-mian">
          <el-form
            ref="form"
            class="form"
            :model="form"
            label-width="100px"
            :rules="rules"
            size="mini"
          >
            <el-form-item
              label="编码"
              prop="assetTypeCode"
            >
              <el-input v-model="form.assetTypeCode" />
            </el-form-item>
            <el-form-item
              label="名称"
              prop="assetTypeName"
            >
              <el-input v-model="form.assetTypeName" />
            </el-form-item>
            <!--                    <el-form-item label="描述" prop="remarks"> -->
            <!--                        <el-input v-model="form.remarks" type="textarea" rows="6"></el-input> -->
            <!--                    </el-form-item> -->

            <el-form-item>
              <el-button
                size="mini"
                type="primary"
                :loading="editLoading"
                @click="submitEdit"
              >
                修改
              </el-button>
              <!--                        <el-button @click="docFn" size="mini" type="success">电子文档</el-button> -->
            </el-form-item>
          </el-form>
        </div>
      </div>
    </ECard>

    <!-- 添加抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
      class="type-manage-drawer"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="addForm"
          :model="addForm"
          label-width="40px"
          :rules="rules"
          size="mini"
        >
          <el-form-item
            label="编码"
            prop="assetTypeCode"
          >
            <el-input v-model="addForm.assetTypeCode" />
          </el-form-item>
          <el-form-item
            label="名称"
            prop="assetTypeName"
          >
            <el-input v-model="addForm.assetTypeName" />
          </el-form-item>
          <!--                    <el-form-item label="描述" prop="remarks"> -->
          <!--                        <el-input v-model="addForm.remarks" type="textarea" rows="6"></el-input> -->
          <!--                    </el-form-item> -->
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="addLoading"
            @click="submitAdd"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 电子文档 抽屉 -->
    <!--        <el-drawer :visible.sync="drawer_doc" :with-header="false"> -->
    <!--            <div v-loading="docLoading" style="display: flex; flex-direction: column; overflow: hidden;"> -->
    <!--                &lt;!&ndash; 标题 &ndash;&gt; -->
    <!--                <div class="drawer-title">电子文档</div> -->

    <!--                &lt;!&ndash; 分割线 &ndash;&gt; -->
    <!--                <el-divider /> -->

    <!--                &lt;!&ndash; 内容 &ndash;&gt; -->
    <!--                <div class="drawer-con"> -->
    <!--                    <div style="margin-bottom: 2vh;"> -->
    <!--                        <el-upload action="" :before-upload="upBeforeFn"> -->
    <!--                            <el-button type="primary" icon="el-icon-upload2" size="mini">上传</el-button> -->
    <!--                        </el-upload> -->
    <!--                    </div> -->

    <!--                    <el-table -->
    <!--                        :data="tableData_doc" -->
    <!--                        border -->
    <!--                        size="mini" -->
    <!--                        style="width: 100%" -->
    <!--                        :header-cell-style="{background: '#f5f5f5'}" -->
    <!--                    > -->
    <!--                        <el-table-column label="文件" prop="file" align='center'> -->
    <!--                            <template slot-scope="props"> -->
    <!--                                <a :href="props.row.file">{{props.row.file}}</a> -->
    <!--                            </template> -->
    <!--                        </el-table-column> -->
    <!--                    </el-table> -->
    <!--                </div> -->
    <!--            </div> -->

    <!--        </el-drawer> -->
  </div>
</template>

<style lang="scss" scoped>
.assetType-eam {
  width: 100%;
  position: relative;
  padding: 10px;
  .top {
    margin-bottom: 2vh;
  }

  .bot {
    .select-clear {
      margin-left: 10px;
      color: #409eff;
    }
    .tree-bar {
      margin-top: 10px;
    }
  }
}
</style>
