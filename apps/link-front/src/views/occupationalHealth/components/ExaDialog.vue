<script>
import SelectTree from "@/components/treeSelect/treeSelect.vue";
import {
  addExaminationBook,
  getUserPostName,
} from "@/http/occupationalHealth/sanitation-api";
import {
  getAllDepartByCompanyFn,
  getAssignUserInfo,
} from "@/http/safe-production/depart-manage-api";
import FileUpload from "@/views/common-ui/FileUpload";

export default {
  name: "ExaDialog",
  components: { FileUpload, SelectTree },
  props: {
    Method: {
      type: String,
      default: "",
    },
    FromData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      isLoading: false,
      showPeopleDialog: false,
      departmentList: [], // 所属部门list
      workSectionList: [], // 工段list
      projectStartDate: [],
      checkupList: [], // 体检类型
      sexList: [
        { value: 0, label: "男" },
        { value: 1, label: "女" },
      ],
      conclusionList: [
        { value: 0, label: "不合格" },
        { value: 1, label: "合格" },
      ],
      natureList: [
        {
          label: "岗前",
          value: 1,
        },
        {
          label: "岗中",
          value: 2,
        },
        {
          label: "离岗",
          value: 3,
        },
      ],
      // userList: [],
      inputForm: {
        userId: "",
        userName: "",
        sex: undefined,
        age: undefined,
        harmFactor: null,
        postName: "",
        companyId: "",
        companyName: "",
        departmentId: "",
        departmentName: "",
        workshopId: "",
        workshopName: "",
        examinationDate: "",
        occupationalDiseasesType: "",
        examinationResult: "",
        examinationConclusion: "",
        identificationNumber: "",
      },
      peopleProp: {},
    };
  },
  created() {
    if (this.Method !== "add") {
      this.inputForm.id = this.FromData.id;
      this.getAllDepartByCompanyList(this.FromData.companyId);
      Object.assign(this.inputForm, this.FromData);
    } else {
    }
    // if (this.inputForm.userId) {
    //   this.userList.push({
    //     id: this.inputForm.userId,
    //     fullName: this.inputForm.userName
    //   })
    // }
  },
  methods: {
    getAllDepartByCompany(id, title) {
      this.inputForm.companyId = id;
      this.inputForm.companyName = title;
      if (!this.inputForm.companyId) {
        this.departmentList = [];
      }
      this.getAllDepartByCompanyList(this.inputForm.companyId);
    },
    getAllDepartByCompanyList(id) {
      getAllDepartByCompanyFn(id).then(({ data }) => {
        this.departmentList = (data.result || []).filter((item) => {
          return item.departmentType === "DEPARTMENT";
        });
        this.workSectionList = (data.result || []).filter((res) => {
          return (res.departmentType = "WORK_SECTION");
        });
      });
    },
    getAssignUserInfoFn(id) {
      getAssignUserInfo(id).then(({ data }) => {
        if (data.success) {
          this.inputForm.medicalExaminationNo = data.result.medicalExaminationNo || "";
        }
      });
    },
    choosePeople() {
      this.showPeopleDialog = true;
      this.peopleProp.isSingle = true;
      this.peopleProp.listType = "company";
      this.peopleProp.oldPickData = {};
    },
    // 选择人员之后的回调
    handleColse(params) {
      if (params) {
        // 回调数据
        this.inputForm.userId = params.data.id;
        this.inputForm.userName = params.data.fullName;
        getUserPostName(this.inputForm.userId)
          .then(({ data }) => {
            if (data.success) {
              this.inputForm.postName = data.result.postName || "";
              this.inputForm.companyId = data.result.companyId || "";
              this.inputForm.companyName = data.result.companyName || "";
              this.inputForm.departTypeDepartId = data.result.departTypeDepartId || "";
              this.inputForm.departTypeDepartName =
                data.result.departTypeDepartName || "";
              this.inputForm.departmentId = data.result.departmentId || "";
              this.inputForm.departmentName = data.result.departmentName || "";
              this.inputForm.sex = data.result.sex || "";
              this.inputForm.identificationNumber =
                data.result.identificationNumber || "";
            } else {
              this.$message.warning(data.message || "岗位查询出错");
            }
          })
          .catch((err) => {
            this.$message.error("岗位查询出错", err);
          });
        // 获取体检档案编号
        this.getAssignUserInfoFn(this.inputForm.userId);
      }
      this.showPeopleDialog = false;
    },
    // 提交数据
    doSubmitPersonneDialog() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true;
          addExaminationBook(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success("提交成功");
                this.closeClick(true);
              } else {
                this.$message.warning(data.message || "提交失败");
              }
            })
            .catch((err) => {
              this.$message.error("提交出错", err);
            })
            .finally(() => {
              this.isLoading = false;
            });
        }
      });
    },
    /* 关闭弹窗 */
    closeClick(isRefresh) {
      this.$emit("DialogClose", isRefresh);
    },
  },
};
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
        label="人员姓名"
        prop="userName"
        :rules="{
          required: true,
          message: '人员姓名不能为空',
          trigger: 'change',
        }"
      >
        <el-input
          v-model="inputForm.userName"
          style="width: 200px"
          placeholder="点击右侧选择"
          disabled
        >
          <el-button slot="append" icon="el-icon-search" @click="choosePeople()" />
        </el-input>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select
          v-model="inputForm.sex"
          class="small-row"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in sexList"
            :key="item.value"
            :label="item.label"
            :value="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="单位名称"
        prop="companyName"
        :rules="{
          required: true,
          message: '单位名称不能为空',
          trigger: 'blur',
        }"
      >
        <SelectTree
          ref="officeTree"
          class="small-row"
          :props="{
            value: 'id', // ID字段名
            label: 'companyName', // 显示名称
            children: 'children', // 子级字段名
          }"
          url="sysCompany/getSubordinateCompany"
          :value="inputForm.companyId"
          :label="inputForm.companyName"
          :clearable="true"
          :accordion="true"
          @getValue="
            (id, title) => {
              getAllDepartByCompany(id, title);
            }
          "
        />
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input
          v-model="inputForm.age"
          class="small-row"
          placeholder="请输入"
          clearable
          type="number"
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
      <el-form-item label="体检档案编号" prop="medicalExaminationNo">
        <el-input
          v-model="inputForm.medicalExaminationNo"
          class="small-row"
          placeholder="系统自动判定"
          disabled
        />
      </el-form-item>
      <el-form-item label="所属岗位" prop="postName">
        <el-input
          v-model="inputForm.postName"
          class="small-row"
          placeholder="系统自动判定"
          disabled
        />
      </el-form-item>
      <el-form-item label="工段名称" prop="workshopId">
        <el-select
          v-model="inputForm.departmentName"
          placeholder="请选择"
          :filterable="true"
          class="small-row"
        >
          <el-option
            v-for="item in workSectionList"
            :key="item.id"
            :label="item.departmentName"
            :value="item.departmentName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="体检日期" prop="examinationDate">
        <el-date-picker
          v-model="inputForm.examinationDate"
          style="width: 200px"
          class="small-row"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="体检类型"
        prop="harmFactor"
        :rules="{
          required: true,
          message: '体检类型不能为空',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="inputForm.harmFactor"
          class="small-row"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in $dictUtils.getDictList('occupational_hazards')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="身份证号" prop="identificationNumber">
        <el-input
          v-model="inputForm.identificationNumber"
          placeholder="请输入"
          class="small-row"
        />
      </el-form-item>
      <el-form-item label="体检状态" prop="occupationalDiseasesType">
        <el-select
          v-model="inputForm.occupationalDiseasesType"
          class="small-row"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in $dictUtils.getDictList('occupationalDiseases_Type')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.dictName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="体检性质" prop="examinationNature">
        <el-select
          v-model="inputForm.examinationNature"
          style="width: 200px"
          class="small-row"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in natureList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="体检结果" prop="examinationResult">
        <el-input
          v-model="inputForm.examinationResult"
          placeholder="请输入"
          type="textarea"
          :rows="3"
          clearable
          class="big-row"
        />
      </el-form-item>
      <el-form-item label="体检结论" prop="examinationConclusion">
        <el-select
          v-model="inputForm.examinationConclusion"
          class="small-row"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in conclusionList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-if="Method !== 'view'"
          v-noMoreClick
          type="primary"
          @click="doSubmitPersonneDialog()"
          >确定保存</el-button
        >
      </span>
    </div>
    <!-- 人员弹窗 -->
    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <KyPickPeople v-if="showPeopleDialog" v-bind="peopleProp" @close="handleColse" />
    </el-dialog>
  </div>
</template>

<style scoped>
.small-row {
  width: 200px;
}

.big-row {
  width: 650px;
}
</style>
