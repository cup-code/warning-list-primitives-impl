<script>
import {
  getScheduleByPlanIdAndYearAndType,
  saveScheduleConfigure,
} from "@/http/inspection/yx-inspection-api";
import { getUsersByDepartIdFn } from "@/http/safe-production/user-manage-api";

export default {
  name: "RollScheduleDialog",
  props: {
    planBaseInfo: Object,
  },
  data() {
    return {
      visible: false,
      loading: false,
      userList: [],
      planId: "",
      planYear: null,
      scheduleType: "",
      inputForm: {
        id: "",
        completionCondition: 0,
        startHour: "00",
        startMinute: "00",
        duration: 1,
        expireHours: 0,
        scheduleDetails: [],
      },
      dataRule: {
        duration: [{ required: true, message: "持续时间不能为空", trigger: "change" }],
      },
      hourOptions: [
        "00",
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
      ],
      minuteOptions: [
        "00",
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30",
        "31",
        "32",
        "33",
        "34",
        "35",
        "36",
        "37",
        "38",
        "39",
        "40",
        "41",
        "42",
        "43",
        "44",
        "45",
        "46",
        "47",
        "48",
        "49",
        "50",
        "51",
        "52",
        "53",
        "54",
        "55",
        "56",
        "57",
        "58",
        "59",
      ],
    };
  },
  methods: {
    async init(planId, year, type) {
      this.visible = true;
      this.planId = planId;
      this.planYear = year;
      this.scheduleType = type;
      this.loading = true;

      // 获取部门所属公司下的所有人员
      if (this.planBaseInfo.departmentId) {
        const res = await getUsersByDepartIdFn(this.planBaseInfo.departmentId);
        this.userList = res.data.result || [];
      }

      // 获取排班详情
      try {
        const { data } = await getScheduleByPlanIdAndYearAndType({
          planId,
          year,
          scheduleType: type,
        });
        this.loading = false;
        this.inputForm.scheduleDetails = [];

        if (data.result) {
          this.inputForm.id = data.result.id;
          this.inputForm.completionCondition = data.result.completionCondition || 0;
          const scheduleDetails = data.result.scheduleDetails || [];
          if (scheduleDetails.length > 0) {
            this.inputForm.startHour = scheduleDetails[0].executeStart.split(":")[0];
            this.inputForm.startMinute = scheduleDetails[0].executeStart.split(":")[1];
            this.inputForm.duration = scheduleDetails[0].duration || 1;
            this.inputForm.expireHours = scheduleDetails[0].expireHours || 0;
          }
          scheduleDetails.forEach((item, index) => {
            this.inputForm.scheduleDetails.push({
              scheduleSort: item.scheduleSort,
              executeStart: this.getExecuteStart(index),
              executeEnd: this.getExecuteEnd(index),
              id: item.id,
              executeUserIdList: item.executeUserIdList || [],
            });
          });
        } else {
          this.$refs.inputForm && this.$refs.inputForm.resetFields();
        }
      } catch (error) {
        this.loading = false;
      }
    },
    add() {
      const length = this.inputForm.scheduleDetails.length;
      const executeStart = this.getExecuteStart(length);
      const executeEnd = this.getExecuteEnd(length);
      this.inputForm.scheduleDetails.push({
        scheduleSort: length + 1,
        executeStart,
        executeEnd,
        id: "",
        executeUserIdList: [],
      });
    },
    delFn(index) {
      this.inputForm.scheduleDetails.splice(index, 1);
    },
    getExecuteStart(index) {
      const startHour =
        (Number(this.inputForm.startHour) + this.inputForm.duration * index) % 24;
      return `${startHour < 10 ? "0" + startHour : startHour}:${
        this.inputForm.startMinute
      }`;
    },
    getExecuteEnd(index) {
      const startHour =
        (Number(this.inputForm.startHour) + this.inputForm.duration * index) % 24;
      const endHour = (startHour + this.inputForm.duration) % 24;
      return `${endHour < 10 ? "0" + endHour : endHour}:${this.inputForm.startMinute}`;
    },
    doSubmit() {
      this.$refs.inputForm.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          const scheduleDetails = this.inputForm.scheduleDetails.map((item) => {
            return {
              executeStart: `${this.inputForm.startHour}:${this.inputForm.startMinute}`,
              executeEnd: `${this.inputForm.startHour}:${this.inputForm.startMinute}`,
              duration: this.inputForm.duration,
              executeUserIdList: item.executeUserIdList,
              expireHours: this.inputForm.expireHours,
              id: item.id,
              scheduleSort: item.scheduleSort,
            };
          });
          const params = {
            completionCondition: this.inputForm.completionCondition,
            id: this.inputForm.id,
            planId: this.planId,
            planYear: this.planYear,
            scheduleType: this.scheduleType,
            scheduleDetails,
          };
          try {
            const { data } = await saveScheduleConfigure(params);
            this.loading = false;
            if (data && data.success) {
              this.$message.success(data.message || "保存成功");
              this.visible = false;
              this.$emit("refreshDataList");
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
  },
};
</script>

<template>
  <el-dialog
    title="巡检滚动排班"
    :close-on-click-modal="false"
    width="800px"
    :visible.sync="visible"
    class="normal-dialog"
  >
    <el-form
      ref="inputForm"
      :model="inputForm"
      :rules="dataRule"
      label-width="100px"
      @submit.native.prevent
    >
      <!-- <el-form-item label="节假日设置" prop="holidaysInclude">
        <el-checkbox-group v-model="inputForm.holidaysInclude">
          <el-checkbox label="includeSaturday">包含周六</el-checkbox>
          <el-checkbox label="includeSunday">包含周日</el-checkbox>
          <el-checkbox label="includeHoliday">包含节假日</el-checkbox>
        </el-checkbox-group>
      </el-form-item> -->
      <el-form-item label="班次完成条件" prop="completionCondition">
        <el-radio-group v-model="inputForm.completionCondition">
          <el-radio :label="0">任意执行人巡检完成</el-radio>
          <el-radio :label="1">所有执行人巡检完成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="起始时间" prop="executeStart">
            <el-select v-model="inputForm.startHour" filterable style="width: 80px">
              <el-option
                v-for="item in hourOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <el-select v-model="inputForm.startMinute" filterable style="width: 80px">
              <el-option
                v-for="item in minuteOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="班次持续时间（时）" prop="duration" label-width="130px">
            <el-input-number
              v-model="inputForm.duration"
              controls-position="right"
              :min="1"
              :max="240"
              style="width: 80px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="过期时间(时)" prop="expireHours">
        <el-input-number
          v-model="inputForm.expireHours"
          controls-position="right"
          :min="0"
          :max="24"
          style="width: 80px"
        />
      </el-form-item>
      <el-button @click="add">添加班次</el-button>
      <el-table v-loading="loading" :data="inputForm.scheduleDetails">
        <el-table-column type="index" label="序号" width="50" />
        <el-table-column prop="scheduleSort" align="center" label="班次" width="80">
          <template slot-scope="scope"> 第 {{ scope.row.scheduleSort }} 班 </template>
        </el-table-column>
        <el-table-column align="center" label="排班时间" width="150">
          <div slot-scope="scope">
            {{ scope.row.executeStart }} - {{ scope.row.executeEnd }}
          </div>
        </el-table-column>
        <el-table-column align="center" label="巡检人">
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.executeUserIdList"
              placeholder="请选择"
              filterable
              style="width: 360px"
              multiple
            >
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="`${item.fullName}(${item.postName})`"
                :value="item.id"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="50" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              style="color: var(--ky-danger)"
              :disabled="scope.$index !== inputForm.scheduleDetails.length - 1"
              @click="delFn(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="visible = false">关闭</el-button>
      <el-button size="small" type="primary" :loading="loading" @click="doSubmit"
        >确定</el-button
      >
    </span>
  </el-dialog>
</template>
