<script>
import {
  getScheduleByPlanIdAndYearAndType,
  saveScheduleConfigure,
} from "@/http/inspection/yx-inspection-api";
import {
  getAllPostByDepartFn,
  getUsersByPostFn,
} from "@/http/safe-production/post-manage-api";

export default {
  name: "PersonScheduleDialog",
  props: {
    planBaseInfo: Object,
  },
  data() {
    return {
      visible: false,
      loading: false,
      postList: [],
      users: [],
      planId: "",
      planYear: null,
      scheduleType: "",
      inputForm: {
        id: "",
        postId: "",
        executeUserIdList: "",
        scheduleDetails: [],
      },
      dataRule: {
        postId: [{ required: true, message: "岗位不能为空", trigger: "change" }],
        executeUserIdList: [
          { required: true, message: "责任人不能为空", trigger: "change" },
        ],
      },
      inspectionCycle: "",
      inspectionType: "",
      cycleNumber: 1,
      cycleOptions: [
        { label: "每天", value: "DAY", id: 1 },
        { label: "每周", value: "WEEK", id: 2 },
        { label: "每月", value: "MONTH", id: 3 },
        { label: "每年", value: "YEAR", id: 4 },
      ],
      weekOptions: [
        { value: "02", label: "周一" },
        { value: "03", label: "周二" },
        { value: "04", label: "周三" },
        { value: "05", label: "周四" },
        { value: "06", label: "周五" },
        { value: "07", label: "周六" },
        { value: "01", label: "周日" },
      ],
      monthOptions: [
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
      ],
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
      this.inputForm.postId = this.planBaseInfo.postId;
      this.inspectionType = this.planBaseInfo.cycleFiled;
      this.cycleNumber = this.planBaseInfo.frequency;
      this.inspectionCycle = `${this.getCycleLabel(this.planBaseInfo.cycleFiled)}${
        this.planBaseInfo.frequency
      }次`;

      this.loading = true;
      // 获取岗位列表
      const { data: postRes } = await getAllPostByDepartFn(
        this.planBaseInfo.departmentId
      );
      this.postList = postRes.result || [];

      // 获取已有排班信息
      const { data } = await getScheduleByPlanIdAndYearAndType({
        planId,
        year,
        scheduleType: type,
      });
      this.loading = false;
      this.inputForm.scheduleDetails = [];

      if (data.result) {
        this.inputForm.id = data.result.id;
        const details = data.result.scheduleDetails || [];
        if (details.length > 0) {
          this.inputForm.postId = details[0].postId;
          this.inputForm.executeUserIdList = details[0].executeUserIdList[0];
        }
        if (this.inspectionType === "WEEK" || this.inspectionType === "MONTH") {
          this.inputForm.scheduleDetails = details.map((item) => {
            return {
              scheduleSort: item.scheduleSort,
              startDay: item.executeStart,
              endDay: item.executeEnd,
              expireHours: item.expireHours,
              id: item.id,
            };
          });
        } else if (this.inspectionType === "DAY") {
          this.inputForm.scheduleDetails = details.map((item) => {
            return {
              scheduleSort: item.scheduleSort,
              startHour: item.executeStart.split(":")[0],
              startMinute: item.executeStart.split(":")[1],
              endHour: item.executeEnd.split(":")[0],
              endMinute: item.executeEnd.split(":")[1],
              expireHours: item.expireHours,
              id: item.id,
            };
          });
        }
        this.getUsersByPost(this.inputForm.postId);
      } else {
        if (this.inspectionType === "WEEK" || this.inspectionType === "MONTH") {
          for (let i = 0; i < this.cycleNumber; i++) {
            this.inputForm.scheduleDetails.push({
              scheduleSort: i + 1,
              startDay: "",
              endDay: "",
              expireHours: 0,
              id: "",
            });
          }
        } else if (this.inspectionType === "DAY") {
          for (let i = 0; i < this.cycleNumber; i++) {
            this.inputForm.scheduleDetails.push({
              scheduleSort: i + 1,
              startHour: "00",
              startMinute: "00",
              endHour: "00",
              endMinute: "00",
              expireHours: 0,
              id: "",
            });
          }
        }
        this.getUsersByPost(this.inputForm.postId);
      }
    },
    doSubmit() {
      this.$refs.inputForm.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          let scheduleDetails = [];
          if (this.inspectionType === "WEEK" || this.inspectionType === "MONTH") {
            scheduleDetails = this.inputForm.scheduleDetails.map((item) => {
              return {
                executeStart: item.startDay,
                executeEnd: item.endDay,
                id: item.id,
                executeUserIdList: [this.inputForm.executeUserIdList],
                postId: this.inputForm.postId,
                scheduleSort: item.scheduleSort,
                expireHours: item.expireHours,
              };
            });
          } else if (this.inspectionType === "DAY") {
            scheduleDetails = this.inputForm.scheduleDetails.map((item) => {
              return {
                executeStart: `${item.startHour}:${item.startMinute}`,
                executeEnd: `${item.endHour}:${item.endMinute}`,
                id: item.id,
                executeUserIdList: [this.inputForm.executeUserIdList],
                postId: this.inputForm.postId,
                scheduleSort: item.scheduleSort,
                expireHours: item.expireHours,
              };
            });
          }
          const params = {
            completionCondition: 1,
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
    getUsersByPost(postId) {
      getUsersByPostFn(postId).then(({ data }) => {
        this.users = data.result || [];
      });
    },
    postChange(postId) {
      this.inputForm.executeUserIdList = "";
      if (postId) {
        this.getUsersByPost(postId);
      }
    },
    getCycleLabel(val) {
      const found = this.cycleOptions.find((item) => item.value === val);
      return found ? found.label : "";
    },
  },
};
</script>

<template>
  <el-dialog
    title="巡检专人排班"
    :close-on-click-modal="false"
    width="620px"
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
      <el-form-item label="岗位" prop="postId">
        <el-select
          v-model="inputForm.postId"
          placeholder="请选择"
          style="width: 100%"
          filterable
          @change="postChange"
        >
          <el-option
            v-for="item in postList"
            :key="item.id"
            :label="item.postName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="巡检人" prop="executeUserIdList">
        <el-select
          v-model="inputForm.executeUserIdList"
          placeholder="请选择"
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="item in users"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排班形式">
        <el-input v-model="inspectionCycle" disabled />
      </el-form-item>
      <!-- <el-form-item label="节假日设置" prop="holidaysInclude">
        <el-checkbox-group v-model="inputForm.holidaysInclude">
          <el-checkbox label="includeSaturday">包含周六</el-checkbox>
          <el-checkbox label="includeSunday">包含周日</el-checkbox>
          <el-checkbox label="includeHoliday">包含节假日</el-checkbox>
        </el-checkbox-group>
      </el-form-item> -->
      <el-table v-loading="loading" :data="inputForm.scheduleDetails">
        <el-table-column type="index" label="序号" width="50" />
        <el-table-column prop="scheduleSort" align="center" label="班次">
          <template slot-scope="scope"> 第 {{ scope.row.scheduleSort }} 班 </template>
        </el-table-column>
        <el-table-column align="center" label="排班时间" width="300">
          <div v-if="inspectionType === 'DAY'" slot-scope="scope">
            <el-select v-model="scope.row.startHour" filterable style="width: 60px">
              <el-option
                v-for="item in hourOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <el-select v-model="scope.row.startMinute" filterable style="width: 60px">
              <el-option
                v-for="item in minuteOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <span>&nbsp; 至 &nbsp;</span>
            <el-select v-model="scope.row.endHour" filterable style="width: 60px">
              <el-option
                v-for="item in hourOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <el-select v-model="scope.row.endMinute" filterable style="width: 60px">
              <el-option
                v-for="item in minuteOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </div>
          <div v-else-if="inspectionType === 'WEEK'" slot-scope="scope">
            <el-select
              v-model="scope.row.startDay"
              placeholder="请选择"
              filterable
              style="width: 120px"
            >
              <el-option
                v-for="item in weekOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <span>&nbsp; 至 &nbsp;</span>
            <el-select
              v-model="scope.row.endDay"
              placeholder="请选择"
              filterable
              style="width: 120px"
            >
              <el-option
                v-for="item in weekOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div v-else-if="inspectionType === 'MONTH'" slot-scope="scope">
            <el-select
              v-model="scope.row.startDay"
              placeholder="请选择"
              filterable
              style="width: 120px"
            >
              <el-option
                v-for="item in monthOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <span>&nbsp; 至 &nbsp;</span>
            <el-select
              v-model="scope.row.endDay"
              placeholder="请选择"
              filterable
              style="width: 120px"
            >
              <el-option
                v-for="item in monthOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </div>
        </el-table-column>
        <el-table-column align="center" label="过期时间(时)">
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.expireHours"
              controls-position="right"
              :min="0"
              :max="24"
              style="width: 80px"
            />
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
