<script>
import { cloneDeep } from 'lodash'
import { getTenantCompany } from '@/http/safe-production/menu-config-api'
import MenuConfig from './form/MenuConfig'

export default {
  components: {
    MenuConfig,
  },
  data() {
    return {
      searchForm: {
        name: '',
      },
      dataList: [],
      loading: false,
    }
  },
  mounted() {
    // this.refreshList()
    this.loading = true
    getTenantCompany().then(({ data }) => {
      this.loading = false
      if (data.success) {
        this.dataList = data.result || []
        this.cloneDataList = cloneDeep(this.dataList)
      }
      else {
        this.$message.error(data.message || '查询失败')
      }
    })
  },
  methods: {
    edit(id) {
      this.$refs.menuConfig.init(id)
    },
    handleSearch() {
      this.dataList = this.cloneDataList.filter((item) => {
        return item.companyName.includes(this.searchForm.name)
      })
    },
  },
}
</script>

<template>
  <TreeTable :isShowLeft="false">
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        ref="searchForm"
        size="mini"
        :inline="true"
        :model="searchForm"
        @keyup.enter.native="handleSearch()"
        @submit.native.prevent
      >
        <el-form-item prop="name">
          <el-input
            v-model="searchForm.name"
            size="mini"
            placeholder="公司名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <EButton
            type="primary"
            btnIcon="el-icon-search"
            @click="handleSearch"
          >
            查询
          </EButton>
        </el-form-item>
      </el-form>
    </ECard>
    <ECard slot="table">
      <el-table
        v-loading="loading"
        :data="dataList"
        size="small"
        height="100%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        class="table"
      >
        <el-table-column
          align="center"
          type="index"
          label="序号"
          width="50"
        />
        <el-table-column
          prop="companyName"
          min-width="200px"
          label="名称"
        />
        <el-table-column
          align="center"
          prop="contacts"
          min-width="120px"
          label="联系人"
        />
        <el-table-column
          align="center"
          prop="contactsPhone"
          min-width="120px"
          label="联系电话"
        />
        <el-table-column
          align="center"
          prop="standardMenu"
          label="类型"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.standardMenu ? 'success' : 'danger'">
              {{ scope.row.standardMenu ? "标准" : "定制" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :key="Math.random()"
          fixed="right"
          header-align="center"
          align="center"
          width="270"
          label="操作"
        >
          <template slot-scope="scope">
            <el-button
              icon="el-icon-edit"
              type="text"
              size="mini"
              @click="edit(scope.row.tenantId)"
            >
              配置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <menu-config slot="dialog" ref="menuConfig" />
  </TreeTable>
</template>
