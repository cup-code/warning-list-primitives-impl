<script>
// import EButton from '@/components/EButton'
// import ECard from '@/components/ECard'
// import EMorEButton from '@/components/EMorEButton'
// import ETabs from '@/components/ETabs'
export default {
  name: 'uiPage',
  components: {
    // EButton,
    // ECard,
    // ETabs,
    // EMorEButton
  },
  data() {
    return {
      tabs: [
        {
          title: 'Tab 1',
          name: '1',
          content: 'Tab 1 content',
        },
        {
          title: 'Tab 2',
          name: '2',
          content: 'Tab 2 content',
        },
      ],
      sForm: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        assetDeviceName: '',
        model: '',
        assetState: '',
        assetTypeId: '',
      },
      moreEButton: [
        {
          type: 'text',
          icon: 'edit',
          size: 'mini',
          text: '设置',
          disabled: false,
        },
        {
          type: 'text',
          icon: 'delete',
          size: 'mini',
          text: '删除',
          disabled: false,
        },
        {
          type: 'text',
          icon: 'shelve',
          size: 'mini',
          text: '上架',
          disabled: false,
        },
        {
          type: 'text',
          icon: 'unShelve',
          size: 'mini',
          text: '下架',
          disabled: false,
        },
        {
          type: 'text',
          icon: 'share',
          size: 'mini',
          text: '分享',
          disabled: false,
        },
        {
          type: 'text',
          icon: 'add',
          size: 'mini',
          text: '添加下级',
          disabled: false,
        },
      ],
      tableData: [
        {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路',
          status: '成功、完成 — success',
          type: 'success',
        },
        {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路',
          status: '成功、完成 — success',
          type: 'success',
        },
        {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路',
          type: 'warning',
          status: '提醒、通知、警告 - warning',
        },
        {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路',
          type: 'warning',
          status: '提醒、通知、警告 - warning',
        },

        {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路',
          type: 'warning',
          status: '提醒、通知、警告 - warning',
        },

        {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路',
          type: 'warning',
          status: '提醒、通知、警告 - warning',
        },
        {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路',
          type: 'danger',
          status: '失败、删除',
        },
        {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路',
          type: 'danger',
          status: '失败、删除',
        },

        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路',
          type: '',
          status: '正常、高亮',
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路',
          type: '',
          status: '正常、高亮',
        },
      ],
      data: [
        {
          label: '一级 1',
          children: [
            {
              label: '二级 1-1',
            },
            {
              label: '二级 1-1',
            },
            {
              label: '二级 1-1',
            },
            {
              label: '二级 1-1',
            },
          ],
        },
      ],
      defaultProps: {
        children: 'children',
        label: 'label',
      },
    }
  },
  computed: {
    // getHeaderStyle() {
    //   return
    // }
  },
  methods: {
    handleNodeClick(data) {
      console.log(data)
    },
  },
}
</script>

<template>
  <div class="page-container-sidebar">
    <ECard type="sidebar">
      <div class="title">
        组织结构
      </div>
      <el-tree
        :data="data"
        :props="defaultProps"
        @node-click="handleNodeClick"
      />
    </ECard>

    <div class="content">
      <ECard type="search">
        <div>
          <el-form
            slot="search"
            ref="sForm"
            :inline="true"
            :model="sForm"
            size="mini"
            class="sForm"
          >
            <el-form-item
              prop="assetDeviceName"
              label="名称"
            >
              <el-input
                v-model="sForm.assetDeviceName"
                placeholder="设备名称"
                clearable
              />
            </el-form-item>
            <el-form-item
              prop="assetDeviceName"
              label="地址"
            >
              <el-input
                v-model="sForm.assetDeviceName"
                placeholder="请输入地址"
                clearable
              />
            </el-form-item>
            <el-form-item
              prop="assetDeviceName"
              label="状态"
            >
              <el-input
                v-model="sForm.assetDeviceName"
                placeholder="请输入状态"
                clearable
              />
            </el-form-item>
            <el-form-item
              prop="model"
              label="型号"
            >
              <el-input
                v-model="sForm.model"
                placeholder="规格型号"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                icon="el-icon-search"
              >
                查询
              </el-button>
            </el-form-item>
            <el-form-item>
              <el-button
                class="reset"
                icon="el-icon-refresh-right"
              >
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </ECard>

      <ECard customStyle="padding:10px 20px 20px">
        <ETabs :tabsList="tabs" />
      </ECard>

      <ECard>
        <div>
          <div class="card-cell">
            <span>按钮风格1：</span>
            <EButton
              btnIcon="el-icon-plus"
              type="primary"
            >
              新增
            </EButton>
            <EButton
              icon="search"
              type="primary"
            >
              查询
            </EButton>
            <EButton
              icon="edit"
              type="warning"
            >
              修改
            </EButton>
            <EButton
              icon="delete"
              type="danger"
            >
              删除
            </EButton>
            <EButton
              btnIcon="el-icon-download"
              type="success"
            >
              导入、下载
            </EButton>
            <EButton btnIcon="el-icon-upload2">
              导出
            </EButton>
          </div>
        </div>
        <div class="card-cell">
          <span>按钮风格2：</span>
          <EButton
            plain
            btnIcon="el-icon-plus"
            type="primary"
          >
            新增
          </EButton>
          <EButton
            plain
            btnIcon="el-icon-refresh"
          >
            重置
          </EButton>
          <EButton
            plain
            icon="edit"
            type="warning"
          >
            修改
          </EButton>
          <EButton
            plain
            icon="delete"
            type="danger"
          >
            删除
          </EButton>
          <EButton
            plain
            btnIcon="el-icon-download"
            type="success"
          >
            导入、下载
          </EButton>
          <EButton
            plain
            btnIcon="el-icon-upload2"
          >
            导出
          </EButton>
        </div>

        <el-table
          :data="tableData"
          size="medium"
          style="width: 100%"
          max-height="540"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
          :default-sort="{ prop: 'date', order: 'descending' }"
        >
          <el-table-column
            prop="date"
            label="日期"
            width="180"
          />
          <el-table-column
            align="center"
            prop="name"
            label="姓名"
            width="180"
          />
          <el-table-column
            align="center"
            prop="status"
            label="状态"
            width="180"
          >
            <template slot-scope="scope">
              <el-tag
                size="medium"
                plain
                :type="scope.row.type"
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            align="left"
            width="200"
            prop="address"
            label="地址"
            :formatter="formatter"
          />
          <el-table-column
            align="left"
            width="200"
            prop="address"
            label="地址"
            :formatter="formatter"
          />
          <el-table-column
            align="left"
            width="200"
            prop="address"
            label="地址"
            :formatter="formatter"
          />
          <el-table-column
            align="left"
            width="200"
            prop="address"
            label="地址"
            :formatter="formatter"
          />
          <el-table-column
            align="left"
            width="200"
            prop="address"
            label="地址"
            :formatter="formatter"
          />
          <el-table-column
            fixed="right"
            width="160"
            align="right"
            label="操作"
          >
            <div class="oparete">
              <EButton
                type="text"
                icon="check"
              >
                查看
              </EButton>
              <EButton
                type="text"
                icon="running"
              >
                运行
              </EButton>
              <EMoreButton
                icon="more"
                text="更多"
                :list="moreEButton"
                @click="onClick"
              />
            </div>
          </el-table-column>
        </el-table>
      </ECard>

      <ECard type="footer">
        <!-- 页码 -->
        <el-pagination
          :page-sizes="[10, 20, 30, 50]"
          :current-page="1"
          :page-size="10"
          layout="total, prev, pager, next, jumper"
          :total="10"
        />
      </ECard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-container-sidebar {
  .title {
    margin-bottom: 16px;
  }

  .page-list {
    border-radius: 6px;
    padding: 20px 10px;
    background: #ffffff;
    width: 220px;
    height: 100%;
    margin-right: 16px;

    font-size: 14px;
    font-weight: 600;
  }

  .content {
    width: calc(100% - 200px);

    .layout {
      display: flex;
      justify-content: space-between;
    }

    .row-cell {
      margin-bottom: 8px;
    }

    .table {
      border: 1px solid var(--ky-border-color);
      border-bottom: none;
      border-radius: 6px;
    }
  }

  .oparete {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  // }
}
</style>
