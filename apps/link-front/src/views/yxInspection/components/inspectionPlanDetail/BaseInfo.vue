<script>
import SelectTree from "@/components/treeSelect/treeSelect.vue";
import {
  saveInspectionPlan,
  getInspectionPlanById,
  queryLine,
} from "@/http/inspection/yx-inspection-api";
import { getDepartListSimple } from "@/http/safe-production/depart-manage-api";
import { getUsersByDepartIdFn } from "@/http/safe-production/user-manage-api";

export default {
  name: "YxInspectionPlanBaseInfo",
  components: {
    SelectTree,
  },
  props: {
    id: String,
    method: String,
  },
  data: () => ({
    loading: false,
    inputForm: {
      id: "",
      planName: "", // 计划名称
      planCode: "", // 计划编号
      departmentId: "", // 部门id
      lineId: "", // 巡检路线id
      planState: "1", // 状态：1-待提交 2-发布 3-停用
      violationAuditUserIdList: [], // 违规审核人员
      exceptionNotificationUserIdList: [], // 异常通知人员
      scheduleMode: "",
      cycleFiled: "",
      frequency: "", // 周期内巡检班次
      remarks: "", // 备注
    },
    dataRule: {
      planName: [{ required: true, message: "计划名称不能为空", trigger: "blur" }],
      planCode: [{ required: true, message: "计划编号不能为空", trigger: "blur" }],
      departmentId: [{ required: true, message: "部门不能为空", trigger: "change" }],
      lineId: [{ required: true, message: "巡检路线不能为空", trigger: "change" }],
      violationAuditUserIdList: [
        { required: true, message: "违规审核人员不能为空", trigger: "change" },
      ],
      exceptionNotificationUserIdList: [
        { required: true, message: "异常通知人员不能为空", trigger: "change" },
      ],
      cycleFiled: [{ required: true, message: "巡检周期不能为空", trigger: "change" }],
      scheduleMode: [{ required: true, message: "排班方式不能为空", trigger: "change" }],
    },
    departList: [], // 部门列表
    routeList: [], // 巡检路线列表
    companyUserList: [], // 公司人员列表
    cycleOptions: [
      {
        label: "每天",
        value: "DAY",
        id: 1,
      },
      {
        label: "每周",
        value: "WEEK",
        id: 2,
      },
      {
        label: "每月",
        value: "MONTH",
        id: 3,
      },
      {
        label: "每年",
        value: "YEAR",
        id: 4,
      },
    ],
    modeList: [
      {
        label: "周期排班",
        value: "CYCLE",
        id: 1,
      },
      {
        label: "滚动排班",
        value: "ROLL",
        id: 2,
      },
    ],
  }),
  created() {
    this.initData();
  },
  methods: {
    async initData() {
      await this.getDepartList();
      await this.getRouteList();
      if (this.method !== "add" && this.id && this.id !== "null") {
        this.getPlanInfoById();
      }
    },
    // 获取部门列表
    async getDepartList() {
      try {
        const { data } = await getDepartListSimple();
        this.departList = data.result || [];
      } catch (error) {
        this.$message.warning("获取部门列表失败");
      }
    },
    // 获取巡检路线列表
    async getRouteList() {
      try {
        const { data } = await queryLine({ pageNum: 1, pageSize: 100 });
        if (data.success) {
          this.routeList = (data.result?.list || []).map((item) => ({
            id: item.id,
            name: item.lineName,
          }));
        }
      } catch (error) {
        this.$message.warning("获取巡检路线列表失败");
      }
    },
    // 通过部门id获取人员列表
    async getUsersByDepartId(id, change = false) {
      this.inputForm.departmentId = id;
      if (change) {
        this.inputForm.violationAuditUserIdList = [];
        this.inputForm.exceptionNotificationUserIdList = [];
        this.companyUserList = [];
      }
      if (!id) return;
      try {
        const { data } = await getUsersByDepartIdFn(id);
        if (data.success) {
          this.companyUserList = data.result || [];
        }
      } catch (error) {
        this.$message.warning("获取人员列表失败");
      }
    },
    // 获取计划详情
    getPlanInfoById() {
      this.loading = true;
      getInspectionPlanById(this.id)
        .then(({ data }) => {
          this.loading = false;
          if (data.success && data.result) {
            const result = data.result;
            this.inputForm = data.result;
            // 获取部门人员列表
            if (result.departmentId) {
              this.getUsersByDepartId(result.departmentId, false);
            }
          } else {
            this.$message.error(data.message || "获取详情失败");
          }
        })
        .catch(() => {
          this.loading = false;
          this.$message.error("获取详情失败");
        });
    },
    // 保存
    doSubmit() {
      this.$refs.inputForm.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          try {
            const { data } = await saveInspectionPlan(this.inputForm);
            this.loading = false;
            if (data.success) {
              this.$message.success(data.message || "保存成功");
              if (this.method === "add") {
                this.$emit("update:id", data.result);
              }
            } else {
              this.$message.error(data.message || "保存失败");
            }
          } catch (error) {
            this.loading = false;
            this.$message.error("保存失败");
          }
        }
      });
    },
    // 发布
    doPublish() {
      if (!this.id || this.id === "null") {
        this.$message.warning("请先保存计划");
        return;
      }
      this.$confirm("确定要发布该计划吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            const { data } = await this.$http.post("/yx/inspectionPlan/changeState", {
              planId: this.id,
              planState: "2",
            });
            if (data.success) {
              this.$message.success("发布成功");
              this.inputForm.planState = "2";
            } else {
              this.$message.error(data.message || "发布失败");
            }
          } catch (error) {
            this.$message.error("发布失败");
          }
        })
        .catch(() => {});
    },
    // 返回
    backFn() {
      this.$router.back(-1);
    },
  },
};
</script>

<template>
  <div class="base-info">
    <div class="btnArea">
      <el-button
        v-if="method !== 'view'"
        type="primary"
        :loading="loading"
        @click="doSubmit()"
      >
        保存
      </el-button>
      <el-button
        v-if="method !== 'view' && method !== 'add'"
        type="success"
        :loading="loading"
        @click="doPublish()"
      >
        发布
      </el-button>
      <el-button @click="backFn"> 返回 </el-button>
    </div>
    <el-form
      ref="inputForm"
      v-loading="loading"
      :inline="true"
      :model="inputForm"
      :rules="dataRule"
      label-width="100px"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row class="title"> 计划设置 </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="计划名称" prop="planName">
            <el-input v-model="inputForm.planName" placeholder="请输入计划名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计划编号" prop="planCode">
            <el-input v-model="inputForm.planCode" placeholder="请输入计划编号" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="所属部门" prop="departmentId">
            <SelectTree
              :props="{
                value: 'id',
                label: 'departmentName',
                children: 'children',
              }"
              :list="departList"
              :value="inputForm.departmentId"
              :clearable="true"
              :accordion="true"
              @getValue="(val) => getUsersByDepartId(val, true)"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="巡检路线" prop="lineId">
            <el-select
              v-model="inputForm.lineId"
              placeholder="请选择巡检路线"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in routeList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="排班方式" prop="scheduleMode">
            <el-select
              v-model="inputForm.scheduleMode"
              placeholder="请选择"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in modeList"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="inputForm.scheduleMode === 'CYCLE'" :span="12">
          <el-form-item label="巡检周期" prop="cycleFiled">
            <el-select
              v-model="inputForm.cycleFiled"
              placeholder="请选择"
              style="width: 100px"
              filterable
            >
              <el-option
                v-for="item in cycleOptions"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="巡检" prop="frequency" label-width="50px">
            <el-input-number
              v-model="inputForm.frequency"
              controls-position="right"
              :min="1"
              style="width: 80px"
            />
            <span> (次)</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label="违规审核" prop="violationAuditUserIdList">
          <el-select
            v-model="inputForm.violationAuditUserIdList"
            placeholder="请选择违规审核人员"
            style="width: 500px"
            filterable
            multiple
          >
            <el-option
              v-for="item in companyUserList"
              :key="item.id"
              :label="item.fullName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="异常通知" prop="exceptionNotificationUserIdList">
          <el-select
            v-model="inputForm.exceptionNotificationUserIdList"
            placeholder="请选择异常通知人员"
            style="width: 500px"
            filterable
            multiple
          >
            <el-option
              v-for="item in companyUserList"
              :key="item.id"
              :label="item.fullName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="状态" prop="planState">
            <el-radio-group v-model="inputForm.planState">
              <el-radio-button label="1">待提交</el-radio-button>
              <el-radio-button label="2" :disabled="method === 'add'"
                >发布</el-radio-button
              >
              <el-radio-button label="3" :disabled="method === 'add'"
                >停用</el-radio-button
              >
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="inputForm.remarks"
            type="textarea"
            :rows="3"
            style="width: 500px"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-row>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.base-info {
  height: 80vh;
  overflow: auto;
}
.btnArea {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
.title {
  font-weight: bold;
  font-size: 16px;
  line-height: 30px;
  padding-left: 32px;
  text-align: left;
}
</style>
