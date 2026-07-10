<script>
import gridSelect from '../../../../components/gridSelect'
import treeSelect from '../../../../components/treeSelect/treeSelect'
import userSelect from '../../../../components/userSelect'

export default {
  components: {
    GridSelect: gridSelect,
    UserSelect: userSelect,
    SelectTree: treeSelect,
  },
  data() {
    return {
      visible: false,
      oldRow: null,
      form: {
        type: 'user',
        value: '发起人',
        condition: '',
        operationType: 'and',
        sort: 0,
      },
      tableData: [],
    }
  },
  methods: {
    add() {
      this.oldRow = null
      const sort = this.tableData.length * 10
      this.tableData.push({
        type: '',
        value: '',
        condition: '0',
        operationType: '0',
        sort,
      })
    },
    sortTableData() {
      return this.sortByKey(this.tableData, 'sort')
    },
    sort() {
      const tableData = this.sortTableData()
      this.tableData = JSON.parse(JSON.stringify(tableData))
    },
    clear(row) {
      row.value = ''
    },
    // 数组对象排序
    sortByKey(array, key) {
      return array.sort((a, b) => {
        const x = Number.parseInt(a[key])
        const y = Number.parseInt(b[key])
        return x < y ? -1 : x > y ? 1 : 0
      })
    },
    init(tableDataStr) {
      this.tableData = JSON.parse(tableDataStr)
      this.visible = true
    },
    del(row) {
      this.tableData.forEach((item, index) => {
        if (item === row) {
          this.tableData.splice(index, 1)
        }
      })
    },
    doSubmit() {
      const datas = this.tableData.filter((item) => {
        return (
          (item.type && item.value)
          || item.type === 'applyUserId'
          || item.type === 'previousExecutor'
          || item.type === 'currentUserId'
        )
      })
      this.$emit('selectUsers', JSON.stringify(datas))
      this.visible = false
    },
  },
}
</script>

<template>
  <el-dialog

    title="节点人员设置"
    append-to-body
    width="1000px"
    :visible.sync="visible"
    class="dialog-selfBpmn"
  >
    <el-button
      type="primary"
      size="mini"
      style="margin: 5px"
      @click="add"
    >
      添加
    </el-button>

    <el-table
      :data="tableData"
      height="500px"
      size="mini"
    >
      <el-table-column
        prop="type"
        label="用户类型"
      >
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.type"
            size="mini"
            placeholder="请选择"
            @change="clear(scope.row)"
          >
            <el-option
              label="用户"
              value="user"
            />
            <!-- <el-option label="岗位" value="post"></el-option> -->
            <!-- <el-option label="公司" value="company"></el-option> -->
            <el-option
              label="部门"
              value="depart"
            />
            <el-option
              label="角色"
              value="role"
            />
            <el-option
              label="发起人"
              value="applyUserId"
            />
            <el-option
              label="上一步执行人"
              value="previousExecutor"
            />
            <el-option
              label="当前登录用户"
              value="currentUserId"
            />
            <!-- <el-option label="sql脚本" value="sql"></el-option> -->
            <!-- <el-option label="自定义条件" value="custom"></el-option> -->
          </el-select>
        </template>
      </el-table-column>

      <el-table-column
        prop="value"
        label="用户来自"
      >
        <template slot-scope="scope">
          <UserSelect
            v-if="scope.row.type === 'user'"
            :value="scope.row.value"
            @getValue="
              value => {
                scope.row.value = value
              }
            "
          />

          <gridSelect
            v-if="scope.row.type === 'role'"
            title="选择角色"
            labelName="roleName"
            labelValue="id"
            :value="scope.row.value"
            :columns="[
              { prop: 'roleName', label: '名字' },
              { prop: 'roleCode', label: '编码' },
            ]"
            :searchs="[
              { prop: 'roleName', label: '名字' },
              { prop: 'roleCode', label: '编码' },
            ]"
            dataListUrl="/sys/role/list"
            entityBeanName="role"
            queryEntityUrl="/sys/role/queryById"
            @getValue="
              value => {
                scope.row.value = value
              }
            "
          />

          <!-- <gridSelect
                        v-if="scope.row.type === 'post'"
                        title="选择岗位"
                        labelName="name"
                        labelValue="id"
                        :value="scope.row.value"
                        :columns="[{prop: 'name', label: '岗位名称'}, {prop: 'code', label: '岗位编码'}]"
                        :searchs="[{prop: 'name', label: '岗位名称'}, {prop: 'code', label: '岗位编码'}]"
                        dataListUrl="/sys/post/list"
                        entityBeanName="post"
                        queryEntityUrl="/sys/post/queryById"
                        @getValue="value => {scope.row.value = value}"
                    /> -->

          <!-- <SelectTree
                        v-if="scope.row.type === 'company'"
                        size="mini"
                        :props="{value: 'id', label: 'name', children: 'children'}"
                        url="/sys/office/treeData?type=1"
                        :value="scope.row.value"
                        :clearable="true"
                        :accordion="true"
                        @getValue="value => {scope.row.value = value}"
                    /> -->

          <SelectTree
            v-if="scope.row.type === 'depart'"
            size="mini"
            :props="{
              value: 'id',
              label: 'departmentName',
              children: 'childrenDepartment',
            }"
            url="/sys/office/treeData?type=2"
            :value="scope.row.value"
            :clearable="true"
            :accordion="true"
            @getValue="
              value => {
                scope.row.value = value
              }
            "
          />

          <label v-if="scope.row.type === 'applyUserId'">发起人 </label>

          <label v-if="scope.row.type === 'previousExecutor'">上一步执行人 </label>

          <label v-if="scope.row.type === 'currentUserId'">当前登录用户 </label>

          <el-input
            v-if="scope.row.type === 'sql'"
            v-model="scope.row.value"
            type="textarea"
            placeholder="请输入自定义sql获取审核人员信息"
          />

          <el-input
            v-if="scope.row.type === 'custom'"
            v-model="scope.row.value"
            type="textarea"
            placeholder="请输入自定义扩展标记值，你可以根据该标记，在Java中解析你需要的审核人员信息"
          />
        </template>
      </el-table-column>

      <el-table-column
        prop="sort"
        label="排序"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.sort"
            size="mini"
            type="number"
            controls-position="right"
            min="0"
            @change="sort"
          />
        </template>
      </el-table-column>

      <el-table-column
        :key="Math.random()"
        fixed="right"
        header-align="center"
        align="center"
        width="100"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="del(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="mini"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-noMoreClick
        size="mini"
        type="primary"
        @click="doSubmit"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
