/* * @Author: xiaorui 巡检计划详情页的基础信息 * @Date: 2022-05-07 17:12:56 * @Last
Modified by: xiaorui * @Last Modified time: 2022-11-15 15:38:11 */
<script>
import SelectTree from "@/components/treeSelect/treeSelect.vue";
import { addInspectionPlanFn, getPlanInfoByIdFn } from "@/http/dev_new/inspection-api";
import { getHmiListByDepartFn } from "@/http/hmi/manage-api";
import { getDepartListSimple } from "@/http/safe-production/depart-manage-api";
import { getAllPostByCompanyFn } from "@/http/safe-production/post-manage-api";
import { getUsersByDepartIdFn } from "@/http/safe-production/user-manage-api";

export default {
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
      postId: "", // 岗位id
      departmentId: "", // 部门id
      liableUserId: "", // 责任人id
      inspectionType: "", // 巡检类型：日常巡检-1；专业点检-2；精密点检-3；辅助纪录-4
      cycleFiled: "", // 巡检周期：日-DAY；周-WEEK；月-MONTH；年-YEAR
      frequency: "", // 周期内巡检班次
      planState: "1", // 状态
      contentCategoryList: [], // 巡检内容分类
      exceptionNotificationUserIdList: [], // 异常通知人员
      violationAuditUserIdList: [], // 违规审核人员
      hmiId: "", // 路线组态id
      remarks: "", // 备注
      scheduleMode: "", // 排班方式 周期排班-CYCLE；滚动排班-ROLL
    },
    dataRule: {
      planName: [{ required: true, message: "计划名称不能为空", trigger: "blur" }],
      planCode: [{ required: true, message: "计划编号不能为空", trigger: "change" }],
      postId: [{ required: true, message: "岗位不能为空", trigger: "change" }],
      liableUserId: [{ required: true, message: "责任人不能为空", trigger: "change" }],
      departmentId: [{ required: true, message: "部门不能为空", trigger: "change" }],
      inspectionType: [
        { required: true, message: "巡检类型不能为空", trigger: "change" },
      ],
      cycleFiled: [{ required: true, message: "巡检周期不能为空", trigger: "change" }],
      scheduleMode: [{ required: true, message: "排班方式不能为空", trigger: "change" }],
      contentCategoryList: [
        { required: true, message: "内容分类不能为空", trigger: "change" },
      ],
      exceptionNotificationUserIdList: [
        { required: true, message: "异常通知人员不能为空", trigger: "change" },
      ],
    },
    postList: [], // 岗位list
    departList: [], // 部门list
    hmiList: [], // 组态画面列表
    companyUserList: [], // 责任人和异常通知人员列表，获取计划所属部门所在公司下的人员列表
    typeList: [
      {
        label: "日常巡检",
        value: "1",
        id: 1,
      },
      {
        label: "专业点检",
        value: "2",
        id: 2,
      },
      {
        label: "精密点检",
        value: "3",
        id: 3,
      },
      {
        label: "辅助记录",
        value: "4",
        id: 4,
      },
    ], // 巡检类型list
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
    // 获取当前用户所拥有的部门
    // 获取岗位列表
    const companyId = this.$store.state.user.user.companyId;
    Promise.all([getDepartListSimple()])
      .then((res) => {
        this.departList = res[0].data.result || [];
        if (this.method !== "add") {
          this.getPlanInfoById();
        }
      })
      .catch((err) => {
        this.$message.warning("获取部门列表失败");
      });
  },
  methods: {
    // 查询指定计划id的信息
    getPlanInfoById() {
      this.loading = true;
      getPlanInfoByIdFn(this.id).then(({ data }) => {
        this.loading = false;
        if (data.success) {
          this.inputForm = this.recover(this.inputForm, data.result);
          this.getUsersByDepartId(this.inputForm.departmentId, false);
        } else {
          this.$message.error(data.message || "查询失败");
        }
      });
    },
    // 通过部门id获取部门所属公司下的人员列表和组态列表
    getUsersByDepartId(id, change) {
      this.inputForm.departmentId = id;
      if (!id || change) {
        this.inputForm.liableUserId = "";
        this.inputForm.exceptionNotificationUserIdList = [];
        this.inputForm.violationAuditUserIdList = [];
        this.inputForm.hmiId = "";
        this.companyUserList = [];
        this.hmiList = [];
        this.postList = [];
        this.inputForm.postId = "";
        if (!id) return;
      }
      const companyId = (
        this.departList.find((item) => {
          return item.id === id;
        }) || {}
      ).companyId;
      getAllPostByCompanyFn(companyId).then(({ data }) => {
        if (data.success) {
          this.postList = data.result || [];
        } else {
          this.$message.warning(data.message || "获取岗位列表失败");
        }
      });
      getUsersByDepartIdFn(id).then(({ data }) => {
        if (data.success) {
          this.companyUserList = data.result || [];
        } else {
          this.$message.warning(data.message || "获取人员列表失败");
        }
      });
      getHmiListByDepartFn(id).then(({ data }) => {
        if (data.success) {
          this.hmiList = data.result || [];
        } else {
          this.$message.warning(data.message || "获取组态列表失败");
        }
      });
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          addInspectionPlanFn(this.inputForm).then(({ data }) => {
            this.loading = false;
            if (data && data.success) {
              this.$message.success(data.message);
              if (this.method === "add") {
                this.$emit("update:id", data.result); // 提交成功之后，更新id，保存其他参数时需要
              }
            } else {
              this.$message.error(data.message || "提交失败");
            }
          });
        }
      });
    },
    backFn() {
      this.$router.back(-1);
    },
  },
};
</script>

<template>
  <div class="asset-baseinfo">
    <div class="btnArea">
      <el-button
        type="primary"
        :loading="loading"
        :disabled="method === 'view'"
        @click="doSubmit()"
      >
        保存
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
            <el-input v-model="inputForm.planName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计划编号" prop="planCode">
            <el-input v-model="inputForm.planCode" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="巡检类型" prop="inspectionType">
            <el-select v-model="inputForm.inspectionType" placeholder="请选择" filterable>
              <el-option
                v-for="item in typeList"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门" prop="departmentId">
            <SelectTree
              :props="{
                value: 'id', // ID字段名
                label: 'departmentName', // 显示名称
                children: 'children', // 子级字段名
              }"
              :list="departList"
              :value="inputForm.departmentId"
              :clearable="true"
              :accordion="true"
              @getValue="
                (value) => {
                  getUsersByDepartId(value, true);
                }
              "
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="巡检岗位" prop="postId">
            <el-select
              v-model="inputForm.postId"
              placeholder="请选择"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in postList"
                :key="item.id"
                :label="item.postName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="责任人" prop="liableUserId">
            <el-select
              v-model="inputForm.liableUserId"
              placeholder="请选择"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in companyUserList"
                :key="item.id"
                :label="item.fullName"
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
        <el-form-item label="巡检内容分类" prop="contentCategoryList">
          <el-select
            v-model="inputForm.contentCategoryList"
            placeholder="请选择"
            style="width: 500px"
            filterable
            multiple
          >
            <el-option
              v-for="item in $dictUtils.getDictList('content_category')"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="异常通知" prop="exceptionNotificationUserIdList">
          <el-select
            v-model="inputForm.exceptionNotificationUserIdList"
            placeholder="请选择"
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
        <el-form-item label="违规审核" prop="violationAuditUserIdList">
          <el-select
            v-model="inputForm.violationAuditUserIdList"
            placeholder="请选择"
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
        <el-form-item label="路线组态" prop="hmiId">
          <el-select
            v-model="inputForm.hmiId"
            placeholder="请选择"
            style="width: 500px"
            filterable
          >
            <el-option
              v-for="item in hmiList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="状态" prop="planState">
          <el-radio-group v-model="inputForm.planState">
            <el-radio-button label="1"> 待发布 </el-radio-button>
            <el-radio-button label="2" :disabled="method === 'add'">
              发布
            </el-radio-button>
            <el-radio-button label="3" :disabled="method === 'add'">
              停用
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="inputForm.remarks"
            type="textarea"
            :rows="3"
            style="width: 500px"
          />
        </el-form-item>
      </el-row>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.asset-baseinfo {
  height: 80vh;
  overflow: auto;
}
.btnArea {
  display: flex;
  justify-content: flex-end;
}
.title {
  font-weight: bold;
  font-size: 16px;
  line-height: 30px;
  padding-left: 32px;
  text-align: left;
}
</style>
