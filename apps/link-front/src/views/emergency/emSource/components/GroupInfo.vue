<script>
import {
  emTeamAdd,
  emTeamDelFile,
  emTeamGetById,
  emTeamMemberDel,
  emTeamMemberGetList,
  emTeamUpdate,
} from '@/http/emergency/emsource-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'
import GroupAdd from './GroupAdd.vue'

export default {
  components: {
    FileUpload,
    GroupAdd,
  },
  props: {
    // 所属公司树数据
    companyData: {
      type: Array,
      default() {
        return []
      },
    },
    companyId: {
      type: String,
      default: '',
    },
    companyName: {
      type: String,
      default: '',
    },
    // 是否新创建
    isNew: {
      type: Boolean,
      default: true,
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false,
    },
    // 详情id
    infoId: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      showAddDialog: false, // 是否显示添加成员弹窗
      fileProp: {
        fileLimit: 9,
        oldFileList: [],
        multiple: true,
        delFunc: emTeamDelFile,
      },
      loadingDialog: false,
      // 修改/新增的数据
      changeData: {
        companyId: '',
        companyName: '',
        files: [],
      },
      teamTypeList: [],
      tableData: [],
      delId: '',
    }
  },
  created() {
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.teamTypeList = dicList.team_type
    this.getInfoData()
  },
  methods: {
    /* 所属公司下拉列表点击 */
    companyTreeNodeTap(data) {
      this.changeData.companyId = data.id
      this.changeData.companyName = data.companyName
      this.$refs.tableTypeSelect.blur()
    },
    /* 点击清空公司下拉列表 */
    clearClick() {
      this.changeData.companyName = ''
      this.changeData.companyId = ''
    },
    /* 初始化信息 */
    getInfoData() {
      // 新增
      if (this.isNew) {
        this.changeData.files = []
        this.fileProp.oldFileList = []
        this.changeData.companyId = this.companyId
        this.changeData.companyName = this.companyName
      }
      // 修改或查看
      else {
        this.loadingDialog = true
        emTeamGetById(this.infoId)
          .then((res) => {
            if (res.data.success) {
              const {
                companyId,
                companyName,
                headName,
                headPhone,
                id,
                name,
                teamType,
                viceHeadName,
                viceHeadPhone,
              } = res.data.result
              this.changeData = {
                companyId,
                companyName,
                headName,
                headPhone,
                id,
                name,
                teamType,
                viceHeadName,
                viceHeadPhone,
                files: [],
              }
              this.fileProp.oldFileList = res.data.result.accessorys
            }
            else {
              this.$message.warning(res.data.message || '请求详情失败')
            }
            this.getMemberList()
          })
          .catch((err) => {
            this.$message.error('请求详情出错！', err)
          })
          .finally(() => {
            this.loadingDialog = false
          })
      }
    },
    /* 请求成员列表 */
    getMemberList() {
      this.loadingDialog = true
      emTeamMemberGetList(this.changeData.id)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '请求成员表失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求成员表出错！', err)
        })
        .finally(() => {
          this.loadingDialog = false
        })
    },
    /* 文件上传回调 */
    uploadEvt(fileList) {
      this.changeData.files = fileList
    },
    /* 确认保存 */
    saveChangeClick() {
      this.$refs.groupForm.validate((valid) => {
        if (valid) {
          if (this.delId) {
            const params = { id: this.delId, teamId: this.infoId }
            emTeamMemberDel(params).then((res) => {
              if (res.data.success) {
                console.log('删除成功')
              }
            })
          }
          let saveFunc = emTeamUpdate
          if (this.isNew) {
            saveFunc = emTeamAdd
            this.changeData.teamPersonNum = this.tableData.length
            this.changeData.teamMembers = []
            this.tableData.forEach((item) => {
              this.changeData.teamMembers.push(item)
            })
          }
          this.loadingDialog = true
          saveFunc(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success(res.data.message || '保存成功！')
                this.closeClick(true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错！', err)
            })
            .finally(() => {
              this.loadingDialog = false
            })
        }
      })
    },
    /* 关闭弹窗 */
    closeClick(isRefresh = false) {
      this.$emit('succ', isRefresh)
    },
    /* 点击添加成员 */
    addMemberClick() {
      this.showAddDialog = true
    },
    /* 点击删除成员 */
    delMemberClick(item) {
      if (!item.row.id) {
        this.tableData.splice(item.$index, 1)
        return
      }
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].id === item.row.id) {
          this.delId = item.row.id
          this.tableData.splice(i, 1)
        }
      }
      // this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // })
      //   .then(() => {
      //     this.isLoading = true
      //     const params = { id: item.row.id, teamId: this.infoId }
      //     emTeamMemberDel(params)
      //       .then((res) => {
      //         if (res.data.success) {
      //           this.$message.success('删除成功！')
      //           for (let i = 0; i < this.tableData.length; i++) {
      //             if (this.tableData[i].id === item.row.id) {
      //               this.tableData.splice(i, 1)
      //             }
      //           }
      //         } else {
      //           this.$message.warning(res.data.message || '删除失败')
      //         }
      //       })
      //       .finally(() => {
      //         this.isLoading = false
      //       })
      //   })
      //   .catch(() => {
      //     this.$message.info( '取消删除')
      //   })
    },
    /* 添加成员成功回调 */
    addSuccEvt(params) {
      this.showAddDialog = false
      // undefined时，仅关闭弹窗，不做其他操作
      if (params === undefined) {
        return
      }
      this.tableData.push(params)
      if (!this.isNew) {
        this.getMemberList()
      }
    },
  },
}
</script>

<template>
  <div
    v-loading="loadingDialog"
    class="group-info"
  >
    <el-form
      ref="groupForm"
      :model="changeData"
      label-width="110px"
      style="width: 750px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="所属公司"
        prop="companyId"
        :rules="{
          required: true,
          message: '请选择所属公司',
          trigger: 'change',
        }"
      >
        <el-select
          ref="tableTypeSelect"
          v-model="changeData.companyId"
          class="header-item-data"
          clearable
          style="width: 250px"
          @clear="clearClick"
        >
          <el-option
            :value="changeData.companyId"
            :label="changeData.companyName"
          >
            <el-tree
              :data="companyData"
              :props="{ children: 'childrenCompany', label: 'companyName' }"
              highlight-current
              :expand-on-click-node="false"
              node-key="id"
              check-strictly
              @node-click="companyTreeNodeTap"
            />
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="队伍类型"
        prop="teamType"
        :rules="{
          required: true,
          message: '请选择队伍类型',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="changeData.teamType"
          class="header-item-data"
          filterable
          clearable
          style="width: 250px"
        >
          <el-option
            v-for="item in teamTypeList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="队伍名称"
        prop="name"
        :rules="{ required: true, message: '请填写队伍名称', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.name"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="负责人姓名"
        prop="headName"
        :rules="{
          required: true,
          message: '请填写负责人姓名',
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="changeData.headName"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="负责人电话"
        prop="headPhone"
      >
        <el-input
          v-model="changeData.headPhone"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="分管负责人姓名">
        <el-input
          v-model="changeData.viceHeadName"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="分管负责人电话">
        <el-input
          v-model="changeData.viceHeadPhone"
          style="width: 250px; margin-right: 300px"
        />
      </el-form-item>
      <el-form-item label="协议文件">
        <FileUpload
          :editable="editable"
          v-bind="fileProp"
          @upload="uploadEvt"
        />
      </el-form-item>
      <el-form-item label="队伍成员">
        <el-button
          type="success"
          @click="addMemberClick"
        >
          添加队员
        </el-button>
        <!-- 队员表格 -->
        <el-table
          :data="tableData"
          :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
          align="center"
          class="group-table"
        >
          <el-table-column
            type="index"
            width="50"
            label="序号"
            align="center"
          />
          <el-table-column
            prop="fullName"
            label="队员姓名"
            align="center"
          />
          <el-table-column
            prop="phone"
            label="队员电话"
            align="center"
          />
          <el-table-column
            prop="remark"
            label="备注"
            align="center"
          />
          <el-table-column
            label="操作"
            align="center"
            width="50"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                size="mini"
                style="color: var(--ky-danger)"
                @click="delMemberClick(scope)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
        type="primary"
        plain
        @click="closeClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        :disabled="loadingDialog"
        @click="saveChangeClick"
      >
        确认保存
      </el-button>
    </div>
    <!-- 新增队员弹窗 -->
    <el-dialog
      class="normal-dialog"
      :visible.sync="showAddDialog"
      :close-on-click-modal="false"
      :append-to-body="true"
      width="600px"
      title="新增队员"
    >
      <GroupAdd
        v-if="showAddDialog"
        :isNew="isNew"
        :teamId="infoId"
        @addSucc="addSuccEvt"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.group-info {
  .file-upload {
    margin: 5px 0 0 0;
  }

  .filelist-box {
    display: flex;
    flex-direction: column;

    .filelist-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      height: 25px;

      &:hover {
        background: #f5f7fa;

        .filelist-item-right {
          display: block;
        }
      }

      .filelist-item-left {
        i {
          margin: 0 5px 0 5px;
        }
      }

      .filelist-item-right {
        display: none;
        margin-right: 10px;
        cursor: pointer;
        height: 25px;
        width: 25px;
        line-height: 25px;
        text-align: center;
        color: #409eff;
      }
    }
  }

  .group-table {
    width: 620px;
    margin: 10px 0 0 0;
  }
}
</style>
