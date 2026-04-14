<script>
import {
  getSpecifiedModule,
  setSpecifiedModule,
} from "@/http/companyConfig/companyConfig-api.js";
import MapSelection from "./mapSelection.vue";

export default {
  components: {
    MapSelection,
  },
  props: {
    companyId: {
      type: String,
      default: "",
    },
    itemCode: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      show: false,
      loading: false,
      mapSelectionIndex: 0,
      mapSelectionData: {},
      safetyEnvironmentalChart: {
        topNavigationBar: [], // 顶部导航
        positionInfoDisplay: 3, // 定位信息显示
        isCarNumber: true, // 人员定位是否显示厂区车辆数
        isShowOnePicture: true, // 是否显示安环一张图
        warningTitle: "", // 视频驾驶舱标题
        warningLogo: "", // 视频驾驶舱logo
        isAutoRefresh: true, // 是否自动刷新驾驶舱
        autoRefreshTime: 1, // 自动刷新驾驶舱时间
      },
      rules: {
        topNavigationBar: [
          {
            required: true,
            message: "请选择顶部导航栏配置",
            trigger: "change",
          },
        ],
        GlobalLayer: [
          { required: true, message: "请选择全局图层配置", trigger: "change" },
        ],
        SpecialWorkLayer: [
          {
            required: true,
            message: "请选择特殊作业图层配置",
            trigger: "change",
          },
        ],
        majorHazardSourcesLayer: [
          {
            required: true,
            message: "请选择重大危险源图层配置",
            trigger: "change",
          },
        ],
        RiskFourColorMapLayer: [
          {
            required: true,
            message: "请选择风险四色图图层配置",
            trigger: "change",
          },
        ],
        manVehicleControlLayer: [
          {
            required: true,
            message: "请选择人车管控图层配置",
            trigger: "change",
          },
        ],
        emergencyDrillLayer: [
          {
            required: true,
            message: "请选择应急演练图层配置",
            trigger: "change",
          },
        ],
      },
      navBarList: [],
      layerList: [],
      specialWorkList: [],
      majorHazardList: [],
      riskFourColorList: [],
      peopleVehiclesControlList: [],
      emergencyDrillsList: [],
    };
  },
  created() {
    this.getPrefix();
    const dictList = JSON.parse(sessionStorage.getItem("dictList"));
    this.navBarList = dictList.ah_nav_bar;
    this.layerList = dictList.ah_layer;
    this.specialWorkList = dictList.ah_special_work_layer;
    this.majorHazardList = dictList.ah_major_hazard_layer;
    this.riskFourColorList = dictList.ah_risk_four_color_layer;
    this.peopleVehiclesControlList = dictList.ah_people_vehicles_control_layer;
    this.peopleVehiclesControlList = dictList.ah_people_vehicles_control_layer;
    this.emergencyDrillsList = dictList.ah_emergency_drills_layer;
  },
  mounted() {
    this.getSpecifiedModule();
  },
  methods: {
    getSpecifiedModule() {
      getSpecifiedModule(this.companyId, this.itemCode).then(({ data }) => {
        if (data.success) {
          if (this.itemCode === "safetyEnvironmentalChart") {
            data.result.forEach((res) => {
              this.safetyEnvironmentalChart[res.item] = res.value;
            });
          }
        }
      });
    },
    indexMethod(index) {
      return index + 1;
    },

    // 新增
    addArea() {
      this.safetyEnvironmentalChart.MapAreaDivision.push({
        areaName: "",
        latitude: "",
        longitude: "",
        remark: "",
      });
    },
    // 删除
    deleteParam(index) {
      this.safetyEnvironmentalChart.MapAreaDivision.splice(index, 1);
    },
    // 地图选点
    goMapSelection(row, index) {
      this.mapSelectionData = row;
      this.mapSelectionIndex = index;
      this.show = true;
    },
    close(e) {
      this.show = e;
    },
    // 保存
    sumbit(formName) {
      const dtoList = [];
      for (const key in this.safetyEnvironmentalChart) {
        dtoList.push({
          item: key,
          value: this.safetyEnvironmentalChart[key],
        });
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          setSpecifiedModule(this.companyId, this.itemCode, dtoList).then(({ data }) => {
            this.$message({
              message: data.message,
              type: "success",
            });
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    saveArea(e) {
      this.show = e.isShow;
      this.safetyEnvironmentalChart.MapAreaDivision[e.mapSelectionIndex].latitude =
        e.form.latitude;
      this.safetyEnvironmentalChart.MapAreaDivision[e.mapSelectionIndex].longitude =
        e.form.longitude;
    },
  },
};
</script>

<template>
  <div>
    <el-form
      ref="safetyEnvironmentalChart"
      :model="safetyEnvironmentalChart"
      :rules="rules"
      label-width="200px"
      class="demo-ruleForm"
    >
      <!-- <el-form-item label="地图区域划分" prop="MapAreaDivision">
        <EButton type="primary" @click="addArea">新增区域</EButton>
        <el-table size="medium" :data="safetyEnvironmentalChart.MapAreaDivision" v-loading="loading" style="width: 80%; margin-top: 10px">
          <el-table-column type="index" :index="indexMethod" label="序号" width="50"></el-table-column>
          <el-table-column prop="areaName" min-width="120" align="center" label="区域名称">
            <template slot-scope="scope">
              <el-input v-model="scope.row.areaName"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="latitude" align="center" min-width="120" label="经度">
            <template slot-scope="scope">
              <el-input v-model="scope.row.longitude" disabled></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="longitude" align="center" min-width="120" label="纬度">
            <template slot-scope="scope">
              <el-input v-model="scope.row.latitude" disabled></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="remark" align="center" min-width="120" label="备注">
            <template slot-scope="scope">
              <el-input v-model="scope.row.remark" controls-position="right" :min="0"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="right" min-width="140" fixed="right">
            <template slot-scope="scope">
              <EButton icon="delete" type="text" @click="deleteParam(scope.$index)"> 删除 </EButton>
              <EButton icon="map" type="text" @click="goMapSelection(scope.row, scope.$index)"> 地图选点 </EButton>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item> -->
      <el-form-item label="顶部导航栏配置" prop="topNavigationBar">
        <el-checkbox-group v-model="safetyEnvironmentalChart.topNavigationBar">
          <el-checkbox v-for="item in navBarList" :key="item.id" :label="item.dictCode">
            {{ item.dictName }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="定位信息显示" prop="positionInfoDisplay">
        <el-radio-group v-model="safetyEnvironmentalChart.positionInfoDisplay">
          <el-radio :label="1"> 姓名 </el-radio>
          <el-radio :label="2"> 岗位 </el-radio>
          <el-radio :label="3"> 定位卡号 </el-radio>
          <el-radio :label="4"> 定位卡名称 </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="人员定位是否显示厂区车辆数" prop="isCarNumber">
        <el-radio-group v-model="safetyEnvironmentalChart.isCarNumber">
          <el-radio :label="true"> 显示 </el-radio>
          <el-radio :label="false"> 不显示 </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否显示安环一张图" prop="isShowOnePicture">
        <el-radio-group v-model="safetyEnvironmentalChart.isShowOnePicture">
          <el-radio :label="true"> 显示 </el-radio>
          <el-radio :label="false"> 不显示 </el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- <el-form-item label="全局图层配置" prop="GlobalLayer">
        <el-checkbox-group v-model="safetyEnvironmentalChart.GlobalLayer">
          <el-checkbox v-for="item in layerList" :key="item.id" :label="item.id">{{ item.dictName }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="特殊作业图层配置" prop="SpecialWorkLayer">
        <el-checkbox-group v-model="safetyEnvironmentalChart.SpecialWorkLayer">
          <el-checkbox v-for="item in layerList" :key="item.id" :label="item.id">{{ item.dictName }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="重大危险源图层配置" prop="majorHazardSourcesLayer">
        <el-checkbox-group v-model="safetyEnvironmentalChart.majorHazardSourcesLayer">
          <el-checkbox v-for="item in majorHazardList" :key="item.id" :label="item.id">{{ item.dictName }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="风险四色图图层配置" prop="RiskFourColorMapLayer">
        <el-checkbox-group v-model="safetyEnvironmentalChart.RiskFourColorMapLayer">
          <el-checkbox v-for="item in riskFourColorList" :key="item.id" :label="item.id">{{ item.dictName }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="人车管控图层配置" prop="manVehicleControlLayer">
        <el-checkbox-group v-model="safetyEnvironmentalChart.manVehicleControlLayer">
          <el-checkbox v-for="item in peopleVehiclesControlList" :key="item.id" :label="item.id">{{ item.dictName }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="应急演练图层配置" prop="emergencyDrillLayer">
        <el-checkbox-group v-model="safetyEnvironmentalChart.emergencyDrillLayer">
          <el-checkbox v-for="item in emergencyDrillsList" :key="item.id" :label="item.id">{{ item.dictName }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item> -->
    </el-form>
    <el-row justify="end">
      <el-col class="btnArea">
        <el-button type="primary" @click="sumbit('safetyEnvironmentalChart')">
          保存
        </el-button>
      </el-col>
    </el-row>

    <MapSelection
      v-if="show"
      :dialogFormVisible="show"
      :mapSelectionIndex="mapSelectionIndex"
      :mapSelectionData="mapSelectionData"
      @close="close"
      @saveArea="saveArea"
    />
  </div>
</template>

<style scoped lang="scss">
.add-button {
  margin-bottom: 8px;
}
.btnArea {
  padding-left: 200px;
  display: flex;
  justify-content: flex-start;
}
.demo-ruleForm {
  height: 66vh;
  overflow: auto;
}
</style>
