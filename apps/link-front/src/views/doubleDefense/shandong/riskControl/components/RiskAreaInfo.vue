<script>
import TreeSelect from '@/components/treeSelect/treeSelect'
import { getRiskAreaAll, riskAreaSave } from '@/http/defense/shandong/riskControl-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import DrawMapArea from '@/views/common-ui/DrawMapArea'
import PickPeople from '@/views/common-ui/PickPeople'
import { RiskLevel } from '@/views/doubleDefense/shandong/config/constant'

export default {
  components: {
    TreeSelect,
    PickPeople,
    DrawMapArea,
  },
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true,
    },
    // 详情数据
    info: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      isLoading: false,
      allDic: {}, // 字典信息
      departList: [], // 部门列表
      changeData: {}, // 编辑的数据
      RiskLevel,
      // 默认为低风险 #2DAFF9 、基础高度 0，拉伸高度 20
      selectRiskLevel: 0,
      color: '#2DAFF9',
      showPeopleDialog: false, // 选择责任人弹框是否显示
      peopleProp: {}, // 选择人员组件传递信息
      allRiskAreaList: [], // 所有的风险区域列表，选择上级区域使用
    }
  },
  created() {
    this.getInfoData()
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    Promise.all([getDepartListSimple(), getRiskAreaAll()])
      .then((res) => {
        this.departList = res[0].data.result || []
        this.allRiskAreaList = res[1].data.result || []
      })
      .catch((err) => {
        this.$message.error('获取列表失败')
      })
  },
  methods: {
    selectSubItem(event) {
      this.changeData.mapRegionId = event.id // 赋值给后端需要的字段
      this.changeData.mapRegionName = event.name // 赋值给后端需要的字段
    },
    /* 获取详情数据 */
    getInfoData() {
      // 查看或修改
      if (this.info.id) {
        this.changeData = this.info
        if (!this.changeData.areaOnMap) {
          // this.changeData.areaOnMap = {}
          this.$set(this.changeData, 'areaOnMap', {})
        }
        // 初始化
        this.selectRiskLevel = this.changeData.riskLevel
      }
      // 新增
      else {
        this.changeData = {
          responsibilityDeptId: '',
          responsibilityDeptName: '',
          areaOnMap: {},
          // 新增默认低风险
          riskLevel: this.selectRiskLevel,
        }
        this.$nextTick(() => {
          this.$refs.areaForm.clearValidate()
        })
      }
    },
    /* 部门下拉列表选择回调 */
    depChangeEvt(id, name) {
      this.changeData.responsibilityDeptId = id || ''
      this.changeData.responsibilityDeptName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
    // 风险等级变化
    riskLevelFn(v) {
      this.color = this.RiskLevel.find(l => l.value === v).color
      // 风险等级
      this.changeData.riskLevel = v
      // 修改原始颜色透明度
      this.color = this.hexToTransparent(this.color)
      this.changeData.areaOnMap.color = this.color

      console.log(v, ' 风险区域等级:', this.RiskLevel)
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
    // 前往绘制
    goDrawArea() {
      // 修改原始颜色透明度
      // this.color = this.hexToTransparent(this.color);
      // 更新当前颜色
      this.riskLevelFn(this.selectRiskLevel)
      const areaOnMap = this.changeData.areaOnMap.position ? this.changeData.areaOnMap : {}
      this.$refs.drawMapArea.initMap(areaOnMap, this.color)
    },
    // 记录绘制区域
    changeArea(opt) {
      this.changeData.areaOnMap = opt
    },
    // 选择责任人
    choosePeople() {
      this.peopleProp.oldPickData = {
        id: this.changeData.responsibilityUserId || '',
        fullName: this.changeData.responsibilityUserName || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'role'
      this.showPeopleDialog = true
    },
    // 选择责任人之后的回调
    closePeopleEvt(params) {
      if (params) {
        this.changeData.responsibilityUserId = params.data.id
        this.changeData.responsibilityUserName = params.data.fullName
      }
      this.showPeopleDialog = false
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.areaForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          riskAreaSave(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <!-- 分析单元详情 -->
  <div v-loading="isLoading">
    <el-form
      ref="areaForm"
      :model="changeData"
      label-width="100px"
      style="width: 750px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="上级区域"
        prop="parentId"
      >
        <el-select
          v-model="changeData.parentId"
          clearable
          filterable
          style="width: 250px"
        >
          <el-option
            v-for="item in allRiskAreaList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="名称"
        prop="regionName"
        :rules="{ required: true, message: '请填写名称', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.regionName"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="类型"
        prop="regionType"
        :rules="{ required: true, message: '请选择类型', trigger: 'change' }"
      >
        <el-select
          v-model="changeData.regionType"
          clearable
          filterable
          style="width: 250px"
        >
          <el-option
            v-for="item in allDic.riskArea_type"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="责任组织"
        prop="responsibilityDeptId"
        :rules="{
          required: true,
          message: '请选择责任组织',
          trigger: 'change',
        }"
      >
        <TreeSelect
          ref="treeSelect"
          style="width: 250px"
          :list="departList"
          :props="{
            value: 'id',
            label: 'departmentName',
            children: 'children',
          }"
          :value="changeData.responsibilityDeptId"
          :label="changeData.responsibilityDeptName"
          @getValue="depChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="责任人"
        prop="responsibilityUserName"
      >
        <el-input
          v-model="changeData.responsibilityUserName"
          style="width: 250px"
          readonly
          @focus="choosePeople"
        />
      </el-form-item>
      <el-form-item
        label="风险等级"
        prop="riskLevel"
        :rules="{
          required: false,
          message: '请选择风险等级',
          trigger: 'change',
        }"
      >
        <!-- changeData.riskLevel,selectRiskLevel -->
        <el-select
          v-model="selectRiskLevel"
          style="width: 250px"
          filterable
          @change="riskLevelFn"
        >
          <el-option
            v-for="item in RiskLevel"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-form-item label="区域范围">
          <el-button
            v-if="editable"
            type="primary"
            @click="goDrawArea"
          >
            前往绘制
          </el-button>
          <el-tag
            v-if="
              changeData.areaOnMap
                && Object.keys(changeData.areaOnMap).length
                && changeData.areaOnMap.position
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
      <el-form-item label="备注">
        <el-input
          v-model="changeData.remark"
          type="textarea"
          :rows="4"
          resize="none"
          style="width: 610px"
        />
      </el-form-item>
    </el-form>
    <draw-map-area
      ref="drawMapArea"
      @changeArea="changeArea"
    />
    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickPeople
        v-if="showPeopleDialog"
        v-bind="peopleProp"
        @close="closePeopleEvt"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.tips-box {
  width: 710px;
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
  border: 1px solid #e6a23c;
  border-radius: 5px;
  padding: 5px;
  font-size: 14px;
  i {
    margin: 0 10px 0 0;
  }
}
</style>
