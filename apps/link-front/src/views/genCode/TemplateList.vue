<script>
import {
  copyTemplateFn,
  delTemplateFn,
  getTemplateListFn,
} from '@/http/safe-production/genCode/template-list-api'
import TemplateForm from './TemplateForm'

export default {
  name: 'TemplateList',
  components: {
    TemplateForm,
  },
  data() {
    return {
      dataList: [],
    }
  },
  mounted() {
    this.refreshList()
  },
  methods: {
    // 获取数据列表
    refreshList() {
      this.loading = true
      const params = {
        pageNo: -1,
        pageSize: -1,
      }
      getTemplateListFn(params).then(({ data }) => {
        if (data && data.success) {
          this.dataList = data.page.list
          this.loading = false
        }
      })
    },
    // 新增
    add() {
      this.$refs.templateForm.init('add', '')
    },
    // 修改
    edit(item) {
      this.$refs.templateForm.init('edit', item.id)
    },
    // 复制
    copy(item) {
      this.$confirm('\u786E\u8BA4\u8981\u590D\u5236\u5417?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        copyTemplateFn(item.id).then(({ data }) => {
          if (data && data.success) {
            this.$message.success({
              dangerouslyUseHTMLString: true,
              message: data.message,
            })
            this.refreshList()
          }
          else {
            this.$message.error(data.message)
          }
        })
      })
    },
    // 删除
    del(item) {
      if (item.isSystem === '1') {
        this.$message.error('系统预设模板禁止删除!')
        return
      }
      this.$confirm('\u786E\u8BA4\u8981\u5220\u9664\u8BE5\u6A21\u677F\u5417?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        delTemplateFn(item.id).then(({ data }) => {
          if (data && data.success) {
            this.$message.success({
              dangerouslyUseHTMLString: true,
              message: data.message,
            })
            this.refreshList()
          }
          else {
            this.$message.error(data.message)
          }
        })
      })
    },
  },
}
</script>

<template>
  <div>
    <div>
      <el-row :gutter="0">
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
          <el-card
            style="margin: 10px"
            shadow="hover"
          >
            <div class="jp-card jp-card-bordered">
              <div class="add-border">
                <a
                  id="add"
                  @click="add()"
                >
                  <i
                    class="el-icon-plus"
                    style="font-size: 100px"
                  />
                </a>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col
          v-for="item in dataList"
          :key="item.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
          <el-card
            style="margin: 10px"
            shadow="hover"
            class="card"
          >
            <div class="jp-card-cover1">
              <div style="padding: 15px">
                <i
                  class="el-icon-document"
                  style="font-size: 64px"
                />
                <font style="font-weight: 700">
                  {{ item.name }}
                </font>
              </div>
              <div style="padding-left: 25px; font-size: 14px">
                {{ item.remarks }}
              </div>
              <el-row style="text-align: center; background: #f5f8fa">
                <el-col :span="8">
                  <el-button
                    type="text"
                    icon="el-icon-edit-outline"
                    @click="edit(item)"
                  />
                </el-col>
                <el-col :span="8">
                  <el-button
                    type="text"
                    icon="el-icon-document-copy"
                    @click="copy(item)"
                  />
                </el-col>
                <el-col :span="8">
                  <el-button
                    type="text"
                    icon="el-icon-delete"
                    @click="del(item)"
                  />
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <template-form
      ref="templateForm"
      @refreshDataList="refreshList()"
    />
  </div>
</template>

<style lang="scss" scoped>
.card {
  .el-card__body {
    height: 180px;
    padding: 0;
    box-sizing: border-box;
  }
}
.jp-card {
  height: 140px;
}
.add-border {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #65a5f9;
}
.jp-card-cover1 {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
