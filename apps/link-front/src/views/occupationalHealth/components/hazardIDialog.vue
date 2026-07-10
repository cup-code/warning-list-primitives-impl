<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import UserSelectDia from '@/components/userSelect/UserSelectDialog'
import {
  addHygieneIdentification,
  getThreeReportList,
} from '@/http/occupationalHealth/sanitation-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import DrawMapArea from '@/views/common-ui/DrawMapArea'

export default {
  name: 'hazardIDialog',
  components: { SelectTree, UserSelectDia, DrawMapArea },
  props: {
    Method: {
      type: String,
      default: '',
    },
    FromData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      isLoading: false,
      threeReportList: [],
      departmentList: [],
      workSectionList: [],
      companyId: '',
      inputForm: {
        harmFactor: [],
        companyId: '',
        departmentId: '',
        workshopId: '',
        postName: '',
        identifyDate: '',
        identifyRef: '',
        postPersonTotal: '',
        postNature: '',
        threeReportId: '',
        dutyPerson: '',
        workArrange: '',
        workContent: '',
        contactPlaceTime: '',
        contactPerson: [],
        location: {},
      },
      dutyPersonName: '',
      dutyPersonList: [],
      // color: '#2DAFF9',
      color: '#ffbf0160', // 职业病因素分布图 统一使用橙色 #ffbf0160
    }
  },
  created() {
    this.getThreeReport()
    this.companyId = this.$store.state.user.user.companyId
    if (this.Method !== 'add') {
      Object.assign(this.inputForm, JSON.parse(JSON.stringify(this.FromData)))
      this.getAllDepartByCompanyList(this.inputForm.companyId)
      // 回显用户名以及用户数据
      const dutyPersonName = []
      this.inputForm.contactPerson.forEach((data) => {
        if (data.id) {
          dutyPersonName.push(data.fullName)
          this.dutyPersonList.push({
            id: data.id,
            fullName: data.fullName,
          })
        }
      })
      this.dutyPersonName = dutyPersonName.toString()
    }
    else {
    }
  },
  methods: {
    // 查询三同时下拉列表
    getThreeReport() {
      getThreeReportList()
        .then(({ data }) => {
          if (data.success) {
            this.threeReportList = data.result
          }
          else {
            this.$message.warning(data.message || '获取三同时报告失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取三同时报告出错', err)
        })
    },
    // 打开领用人弹窗
    openUserSelectDialog() {
      this.$refs.UserSelectDia.init()
    },
    // 领用人信息回调
    userIdSubmit(Selections) {
      if (!Selections) {
        return
      }
      const dutyPersonName = []
      Selections.forEach((item) => {
        dutyPersonName.push(item.fullName)
      })
      this.dutyPersonName = dutyPersonName.toString()
      this.inputForm.contactPerson = Selections
    },
    getcompanyIdAndName(id, title) {
      this.inputForm.companyId = id
      this.inputForm.companyName = title
      this.getAllDepartByCompanyList(id)
      this.$refs.inputForm.clearValidate('companyId')
    },
    getDepartmentIdAndName(id, title) {
      this.inputForm.departmentId = id
      this.inputForm.departmentName = title
      this.$refs.inputForm.clearValidate('departmentId')
    },

    getAllDepartByCompanyList(id) {
      getAllDepartByCompanyFn(id).then(({ data }) => {
        this.departmentList = (data.result || []).filter((item) => {
          return item.departmentType === 'DEPARTMENT'
        })
        this.workSectionList = (data.result || []).filter((res) => {
          return (res.departmentType = 'WORK_SECTION')
        })
      })
    },
    // 前往绘制
    goDrawArea() {
      // 设置默认距离
      this.$refs.drawMapArea.distance = 260
      // 保留盒子绘制
      this.$refs.drawMapArea.drawData = [{ label: '盒子', value: 'risk-box' }]
      // 设置绘制类型为盒子
      this.$refs.drawMapArea.initialDrawType('risk-box')
      // 禁用打开楼层选项
      // this.$refs.drawMapArea.isEnableFloor = false;

      // 修改原始颜色透明度
      // this.color = this.hexToTransparent(this.color);
      const location = this.inputForm.location.position ? this.inputForm.location : {}
      this.$refs.drawMapArea.initMap(location, this.color)
    },
    // 记录绘制区域
    changeArea(opt) {
      this.inputForm.location = opt
    },
    // 6位16进制颜色处理透明度
    hexToTransparent(hex) {
      // 16进制颜色转rgba 添加透明度 0.6
      if (!hex)
        hex = '#ededed'
      const rgba
        = `rgba(${
          Number.parseInt(`0x${hex.slice(1, 3)}`)
        },${
          Number.parseInt(`0x${hex.slice(3, 5)}`)
        },${
          Number.parseInt(`0x${hex.slice(5, 7)}`)
        },${
          0.6 || '1'
        })`

      // rbga转 16进制带透明颜色
      const str = rgba.slice(5, rgba.length - 1)
      const arry = str.split(',')
      const opa = Number(arry[3].trim()) * 100
      let strHex = '#'
      const r = Number(arry[0].trim())
      const g = Number(arry[1].trim())
      const b = Number(arry[2].trim())
      strHex += ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
      return strHex + opa
    },
    // 提交数据
    doSubmitPersonneDialog() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          addHygieneIdentification(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('提交成功')
                this.closeClick(true)
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch((err) => {
              this.$message.error('提交出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
    /* 关闭弹窗 */
    closeClick(isRefresh) {
      this.$emit('DialogClose', isRefresh)
    },
  },
}
</script>

<template>
  <div>
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :inline="true"
      :model="inputForm"
      label-width="100px"
      :class="Method === 'view' ? 'readonly' : ''"
      :disabled="Method === 'view'"
      @submit.native.prevent
    >
      <el-form-item
        label="接触职业病危害因素"
        prop="harmFactor"
        :rules="{
          required: true,
          message: '危害因素不能为空',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="inputForm.harmFactor"
          multiple
          class="small-row"
          placeholder="请选择"
          clearable
          @change="$forceUpdate()"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('occupational_hazards')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="单位名称"
        prop="companyId"
        :rules="{
          required: true,
          message: '单位名称不能为空',
          trigger: 'blur',
        }"
      >
        <SelectTree
          ref="officeTree"
          class="small-box"
          :props="{
            value: 'id', // ID字段名
            label: 'companyName', // 显示名称
            children: 'children', // 子级字段名
          }"
          url="sysCompany/getSubordinateCompany"
          :value="inputForm.companyId"
          :clearable="true"
          :accordion="true"
          @getValue="getcompanyIdAndName"
        />
      </el-form-item>
      <el-form-item
        label="部门名称"
        prop="departmentId"
        :rules="{
          required: true,
          message: '部门名称不能为空',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="inputForm.departmentId"
          placeholder="请选择"
          :filterable="true"
          class="small-row"
        >
          <el-option
            v-for="item in departmentList"
            :key="item.id"
            :label="item.departmentName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="工段名称"
        prop="workshopId"
      >
        <el-select
          v-model="inputForm.workshopId"
          placeholder="请选择"
          :filterable="true"
          class="small-row"
        >
          <el-option
            v-for="item in workSectionList"
            :key="item.id"
            :label="item.departmentName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="岗位名称"
        prop="postName"
      >
        <el-input
          v-model="inputForm.postName"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="辨识日期"
        prop="identifyDate"
      >
        <el-date-picker
          v-model="inputForm.identifyDate"
          class="small-row"
          style="width: 192px"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="辨识编号"
        prop="identifyRef"
      >
        <el-input
          v-model="inputForm.identifyRef"
          class="small-row"
          placeholder="数据保存后，平台自动生成"
          clearable
          disabled
        />
      </el-form-item>
      <el-form-item
        label="本岗位总人数"
        prop="postPersonTotal"
      >
        <el-input
          v-model="inputForm.postPersonTotal"
          class="small-row"
          placeholder="数据保存后，平台自动计算"
          clearable
          disabled
        />
      </el-form-item>
      <el-form-item
        label="岗位性质"
        prop="postNature"
      >
        <el-select
          v-model="inputForm.postNature"
          class="small-row"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in $dictUtils.getDictList('Post_nature')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="依据三同时报告"
        prop="threeReportId"
      >
        <el-select
          v-model="inputForm.threeReportId"
          placeholder="请选择"
          clearable
          class="small-row"
        >
          <el-option
            v-for="item in threeReportList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="接触人员"
        prop="dutyPerson"
      >
        <el-input
          v-model="dutyPersonName"
          class="big-row"
          placeholder="点击右侧选择"
          disabled
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="openUserSelectDialog()"
          />
        </el-input>
      </el-form-item>
      <el-form-item
        label="工作安排"
        prop="workArrange"
      >
        <el-input
          v-model="inputForm.workArrange"
          class="big-row"
          type="textarea"
          :rows="4"
          placeholder="请填写"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="工作内容"
        prop="workContent"
      >
        <el-input
          v-model="inputForm.workContent"
          class="big-row"
          type="textarea"
          :rows="4"
          placeholder="请填写"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="接触危害的主要地点，接触时间估算"
        prop="contactPlaceTime"
      >
        <el-input
          v-model="inputForm.contactPlaceTime"
          class="big-row"
          type="textarea"
          :rows="4"
          placeholder="请填写"
          clearable
        />
      </el-form-item>
      <el-row>
        <el-form-item label="分布图绘制">
          <el-button
            type="primary"
            @click="goDrawArea"
          >
            点击绘制
          </el-button>
          <el-tag
            v-if="
              inputForm.location
                && Object.keys(inputForm.location).length
                && inputForm.location.position
            "
            type="success"
            style="margin-left: 10px; cursor: pointer"
            @click="goDrawArea"
          >
            已绘制
          </el-tag>
          <el-tag
            v-else
            type="info"
            style="margin-left: 10px"
          >
            未绘制
          </el-tag>
        </el-form-item>
      </el-row>
    </el-form>
    <draw-map-area
      ref="drawMapArea"
      @changeArea="changeArea"
    />
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-if="Method !== 'view'"
          v-noMoreClick
          type="primary"
          @click="doSubmitPersonneDialog()"
        >确定保存</el-button>
      </span>
    </div>
    <!-- 领用人弹窗 -->
    <UserSelectDia
      ref="UserSelectDia"
      :selectData="dutyPersonList"
      @doSubmit="userIdSubmit"
    />
  </div>
</template>

<style scoped>
.small-row {
  width: 192px;
}

.big-row {
  width: 500px;
}
</style>
