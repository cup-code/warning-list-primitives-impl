<script>
import { certSafeManageByPage } from '@/http/base-module/certificateManager-api.js'
import { showFileWindow } from '@/utils/checkFile.js'

export default {
  props: {
    id: String,
  },
  data() {
    return {
      loading: false,
      minWidth: 120,
      tableData: [],
      searchData: {
        isPage: false,
        userId: '',
      },
    }
  },
  created() {
    // console.log('cer', this.id)
    this.getDataList()
  },
  methods: {
    showFileWindow,
    getDataList() {
      this.loading = true
      this.searchData.userId = this.id
      certSafeManageByPage(this.searchData).then(({ data }) => {
        this.loading = false
        this.tableData = data.result.list || []
      })
    },
  },
}
</script>

<template>
  <el-table
    v-loading="loading"
    height="400"
    :data="tableData"
    :header-cell-style="{ background: 'var(--ky-head-color)' }"
    align="center"
    class="customer-table"
  >
    <el-table-column
      type="index"
      width="50"
      align="center"
      label="序号"
      fixed="left"
    />
    <el-table-column
      label="证照类型"
      prop="licenceTypeName"
      align="center"
      :min-width="minWidth"
    />
    <el-table-column
      label="证照名称"
      prop="licenceCateGoryName"
      align="center"
      :min-width="minWidth"
    />
    <el-table-column
      label="颁证单位"
      prop="mechanism"
      align="center"
      :min-width="minWidth"
    />
    <el-table-column
      label="取证日期"
      prop="startTime"
      align="center"
      :min-width="minWidth"
    />
    <el-table-column
      label="证照号码"
      align="center"
      prop="licenceNumber"
    />
    <el-table-column
      label="下次复审日期"
      align="center"
      prop="nextReview"
      :min-width="minWidth"
    />
    <el-table-column
      label="剩余天数"
      align="center"
      prop="remainingDays"
    />
    <el-table-column
      label="电子证照"
      align="center"
    >
      <template slot-scope="scope">
        <el-button
          v-if="scope.row.enclosure"
          type="text"
          @click="showFileWindow(scope.row.enclosure)"
        >
          查看
        </el-button>
        <span v-else>无</span>
      </template>
    </el-table-column>
    <el-table-column
      label="人员状态"
      align="center"
      prop="userState"
    >
      <template slot-scope="scope">
        <el-tag
          v-if="scope.row.userState === '0'"
          type="danger"
        >
          禁用
        </el-tag>
        <el-tag
          v-if="scope.row.userState === '1'"
          type="success"
        >
          在职
        </el-tag>
        <el-tag
          v-if="scope.row.userState === '2'"
          type="warning"
        >
          借调
        </el-tag>
        <el-tag
          v-if="scope.row.userState === '3'"
          type="danger"
        >
          离职
        </el-tag>
        <el-tag
          v-if="scope.row.userState === '4'"
          type="danger"
        >
          退休
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      label="证照状态"
      align="center"
      prop="state"
    >
      <template slot-scope="scope">
        {{ $dictUtils.getDictLabel('zzzt', scope.row.state) }}
      </template>
    </el-table-column>
  </el-table>
</template>
