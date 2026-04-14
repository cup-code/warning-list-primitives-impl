<script>
import { toString } from "xe-utils";
import SelectTree from "@/components/treeSelect/treeSelect";

import {
  addDepart,
  getAllUsersByCompany,
  getDepartListDetail,
  getDepartmentExtensionInfo,
  getDepartStaffing,
  getDepListByCompanyId,
  getDepListByOaCompanyId,
  removeDepartFn,
  saveDepartmentExtensionInfo,
  saveDepartStaffing,
} from "@/http/safe-production/depart-manage-api";
import DepartForm from "./form/DepartForm";
import pdf from "vue-pdf";

export default {
  components: {
    DepartForm,
    SelectTree,
    pdf,
  },
  data: () => ({
    loading: false,
    activeName: "first",
    treeData: [],
    defaultProps: {
      children: "children",
      label: "departmentName",
    },
    activeNameList: [
      {
        label: "部门信息",
        name: "first",
      },
      {
        label: "关键人信息",
        name: "second",
      },
      {
        label: "建筑场所信息",
        name: "third",
      },
    ],
    departmentTypeList: [
      {
        label: "无",
        value: 0,
      },
      {
        label: "大",
        value: 1,
      },
      {
        label: "小",
        value: 2,
      },
    ],
    form: {
      id: "",
      companyId: "", // 所属企业
      departmentType: "", // 部门类型
      businessTypeList: [], // 部门的业务类型，分为安全、设备、环保、生产
      parentId: "", // 上级部门
      departmentName: "", // 部门名称
      departmentCode: "", // 部门代码
      personLiableIdList: [], // 负责人
      safetyDuty: "", // 安全职责
      sort: 30,
      enable: true, // 是否启用
      externalPlatformId: "", // 外部平台id
      safeOfficer: [], // 部门安全员
      workshopLiableIdList: [], // 工段负责人
      companyGeneralManager: "", // 公司总经理
      companyChargeLeadership: "", // 公司分管领导
      corporationPersonCharge: "", // 公司负责人
      safetyChargeLeadership: "", // 安全分管领导
      secondaryApprovalCompany: "", // 二级审批人(公司)
      thirdApprovalCompany: "", // 三级审批人(公司)

      leaderChargeFactory: "", // 工厂分管领导
      personChargeFactory: "", // 工厂负责人
      secondaryApprovalFactory: "", // 二级审批人(工厂)
      thirdApprovalFactory: "", // 三级审批人(工厂)

      principalMainDepartments: "", // 部门负责人(主)
      headSecondaryDepartment: "", // 部门负责人(次)
      secondaryApprovalDepartment: "", // 二级审批人(部门)
      thirdApprovalDepartment: "", // 三级审批人(部门)
      mainSafeOfficer: "", // 主部门安全员
      secondarySafeOfficer: "", // 次部门安全员
      qualityManager: "", // 质量负责人
      sectionApprover: "", // 工段负责人
      farmApprover: "", // 车间负责人
      teamsApprover: "", // 班组负责人
      officeApprover: "", // 办公室负责人

      contractorApprover: "", // 承包商负责人
    },
    externalPlatFormList: [], // 外部平台数据列表
    rules: {
      companyId: [{ required: true, message: "所属企业不能为空", trigger: "change" }],
      departmentName: [{ required: true, message: "名称不能为空", trigger: "blur" }],
      parentId: [{ required: true, message: "所属部门不能为空", trigger: "change" }],
      departmentType: [
        { required: true, message: "部门类型不能为空", trigger: "change" },
      ],
      // businessTypeList: [{ required: true, message: '业务类型不能为空', trigger: 'change' }]
    },
    submitLoading: false,
    headerOptions: [],
    currentDepartType: "", // 点击树结构时，当前的部门类型，如果是公司，则有些内容不可编辑
    currentNode: "", // 记录当前选中的节点
    expandedList: [], // 记录展开的节点
    externalPlatform: {
      companyId: "",
    }, // 绑定oa的请求数据
    buildForm: {},
    srcPdf: "",
    pagesPdf: "",
    departmentCategory: 0,
    applicantListShow: [],
  }),
  mounted() {
    this.getDataList();
    this.companyId = this.$store.state.user.user.companyId;
    getAllUsersByCompany(this.companyId).then(({ data }) => {
      if (data.success) {
        this.headerOptions = data.result || [];
      }
    });
  },
  methods: {
    // 获取数据列表
    getDataList() {
      this.loading = true;
      getDepartListDetail(true)
        .then(({ data }) => {
          this.loading = false;
          if (data.success) {
            data.result.forEach((item) => {
              item.businessTypeList = item.businessTypeList || []; // 如果没有业务类型，则赋值[]
            });
            this.treeData = this.setTreeData(data.result || []);
            this.$nextTick(() => {
              this.$refs.tree.setCurrentKey(this.currentNode);
            });
          } else {
            this.$message.error(data.message || "查询部门失败");
          }
        })
        .catch((err) => {
          this.loading = false;
          this.$message.error("查询部门失败");
        });
    },
    selectCompany(value, title, data) {
      this.form.companyId = value;
      this.form.externalPlatformId = "";
      if (data) {
        const companyExternalPlatformId = data.externalPlatformId || "";
        if (!companyExternalPlatformId) {
          return;
        }
        getDepListByOaCompanyId(companyExternalPlatformId)
          .then(({ datas }) => {
            if (datas.success) {
              this.externalPlatFormList = datas.result;
            } else {
              this.$message.warning(datas.message || "获取绑定oa列表失败");
            }
          })
          .catch((err) => {
            this.$message.error("获取绑定oa列表出错", err);
          });
      }
    },
    // 增加部门
    addRootDp() {
      this.$refs.departForm.init("add", { id: "", parent: { id: "" } });
    },
    // 点击树节点后面的增加
    appendChild(parentData) {
      this.$refs.departForm.init("addChild", {
        id: "",
        parent: {
          id: parentData.id,
          companyId: parentData.companyId,
          departmentType: parentData.departmentType,
          businessTypeList: parentData.businessTypeList,
        },
      });
    },
    // 删除部门
    removeDepart(depart) {
      this.$confirm("您确认要删除此部门?", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          removeDepartFn(depart.id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success("删除成功");
                this.$refs.form.resetFields();
                this.getDataList();
              } else {
                this.$message.error(data.message || "删除失败");
              }
            })
            .catch((err) => {
              this.$message.error("删除失败");
            });
        })
        .catch(() => {});
    },
    // 点击树的item
    treeNodeTap(v) {
      if (v.onlyTreeUse) {
        this.$message.error("无此部门权限");
        return;
      }
      this.$refs.form.clearValidate();
      v.personLiableIdList = (v.personLiable || []).map((item) => {
        return item.id;
      });
      this.currentDepartType = v.departmentType;
      this.currentNode = v.id;
      this.form = this.recover(this.form, JSON.parse(JSON.stringify(v)));
      this.getExternalPlatFormList(v.companyId);
      this.setDepartStaffing(v.id);
      this.getDepartmentExtensionInfo(v.id);
    },

    filterUserList(val) {
      if (!val) {
        // 列表中展示的人员
        this.applicantListShow = this.headerOptions.slice(0, 30); // 如果之前设置了人员，需要把设置的人员信息加入展示列表中，为了回显
        // 公司总经理
        if (this.form.companyGeneralManager) {
          const companyGeneralManagerUser = this.headerOptions.find((item) => {
            return item.id === this.form.companyGeneralManager;
          });
          if (
            companyGeneralManagerUser &&
            !this.applicantListShow.includes(companyGeneralManagerUser)
          ) {
            this.applicantListShow.push(companyGeneralManagerUser);
          }
        }
        // 公司分管领导
        if (this.form.companyChargeLeadership) {
          const companyChargeLeadershipUser = this.headerOptions.find((item) => {
            return item.id === this.form.companyChargeLeadership;
          });
          if (
            companyChargeLeadershipUser &&
            !this.applicantListShow.includes(companyChargeLeadershipUser)
          ) {
            this.applicantListShow.push(companyChargeLeadershipUser);
          }
        }
        // 公司负责人
        if (this.form.corporationPersonCharge) {
          const corporationPersonChargeUser = this.headerOptions.find((item) => {
            return item.id === this.form.corporationPersonCharge;
          });
          if (
            corporationPersonChargeUser &&
            !this.applicantListShow.includes(corporationPersonChargeUser)
          ) {
            this.applicantListShow.push(corporationPersonChargeUser);
          }
        }
        if (this.form.safetyChargeLeadership) {
          const safetyChargeLeadershipUser = this.headerOptions.find((item) => {
            return item.id === this.form.safetyChargeLeadership;
          });
          if (
            safetyChargeLeadershipUser &&
            !this.applicantListShow.includes(safetyChargeLeadershipUser)
          ) {
            this.applicantListShow.push(safetyChargeLeadershipUser);
          }
        }

        // 工厂分管领导
        if (this.form.leaderChargeFactory) {
          const leaderChargeFactoryUser = this.headerOptions.find((item) => {
            return item.id === this.form.leaderChargeFactory;
          });
          if (
            leaderChargeFactoryUser &&
            !this.applicantListShow.includes(leaderChargeFactoryUser)
          ) {
            this.applicantListShow.push(leaderChargeFactoryUser);
          }
        }
        if (this.form.secondaryApprovalCompany) {
          const secondaryApprovalCompanyUser = this.headerOptions.find((item) => {
            return item.id === this.form.secondaryApprovalCompany;
          });
          if (
            secondaryApprovalCompanyUser &&
            !this.applicantListShow.includes(secondaryApprovalCompanyUser)
          ) {
            this.applicantListShow.push(secondaryApprovalCompanyUser);
          }
        }

        if (this.form.thirdApprovalCompany) {
          const thirdApprovalCompanyUser = this.headerOptions.find((item) => {
            return item.id === this.form.thirdApprovalCompany;
          });
          if (
            thirdApprovalCompanyUser &&
            !this.applicantListShow.includes(thirdApprovalCompanyUser)
          ) {
            this.applicantListShow.push(thirdApprovalCompanyUser);
          }
        }

        // 工厂负责人
        if (this.form.personChargeFactory) {
          const personChargeFactoryUser = this.headerOptions.find((item) => {
            return item.id === this.form.personChargeFactory;
          });
          if (
            personChargeFactoryUser &&
            !this.applicantListShow.includes(personChargeFactoryUser)
          ) {
            this.applicantListShow.push(personChargeFactoryUser);
          }
        }
        // 二级审批人(工厂)
        if (this.form.secondaryApprovalFactory) {
          const secondaryApprovalFactoryUser = this.headerOptions.find((item) => {
            return item.id === this.form.secondaryApprovalFactory;
          });
          if (
            secondaryApprovalFactoryUser &&
            !this.applicantListShow.includes(secondaryApprovalFactoryUser)
          ) {
            this.applicantListShow.push(secondaryApprovalFactoryUser);
          }
        }
        // 三级审批人(工厂)
        if (this.form.thirdApprovalFactory) {
          const thirdApprovalFactoryUser = this.headerOptions.find((item) => {
            return item.id === this.form.thirdApprovalFactory;
          });
          if (
            thirdApprovalFactoryUser &&
            !this.applicantListShow.includes(thirdApprovalFactoryUser)
          ) {
            this.applicantListShow.push(thirdApprovalFactoryUser);
          }
        }
        if (this.form.principalMainDepartments) {
          const principalMainDepartmentsUser = this.headerOptions.find((item) => {
            return item.id === this.form.principalMainDepartments;
          });
          if (
            principalMainDepartmentsUser &&
            !this.applicantListShow.includes(principalMainDepartmentsUser)
          ) {
            this.applicantListShow.push(principalMainDepartmentsUser);
          }
        }

        if (this.form.headSecondaryDepartment) {
          const headSecondaryDepartmentUser = this.headerOptions.find((item) => {
            return item.id === this.form.headSecondaryDepartment;
          });
          if (
            headSecondaryDepartmentUser &&
            !this.applicantListShow.includes(headSecondaryDepartmentUser)
          ) {
            this.applicantListShow.push(headSecondaryDepartmentUser);
          }
        }

        // 二级审批人(部门)
        if (this.form.secondaryApprovalDepartment) {
          const secondaryApprovalDepartmentUser = this.headerOptions.find((item) => {
            return item.id === this.form.secondaryApprovalDepartment;
          });
          if (
            secondaryApprovalDepartmentUser &&
            !this.applicantListShow.includes(secondaryApprovalDepartmentUser)
          ) {
            this.applicantListShow.push(secondaryApprovalDepartmentUser);
          }
        }
        // 三级审批人(部门)
        if (this.form.thirdApprovalDepartment) {
          const thirdApprovalDepartmentUser = this.headerOptions.find((item) => {
            return item.id === this.form.thirdApprovalDepartment;
          });
          if (
            thirdApprovalDepartmentUser &&
            !this.applicantListShow.includes(thirdApprovalDepartmentUser)
          ) {
            this.applicantListShow.push(thirdApprovalDepartmentUser);
          }
        }
        if (this.form.mainSafeOfficer) {
          const mainSafeOfficerUser = this.headerOptions.find((item) => {
            return item.id === this.form.mainSafeOfficer;
          });
          if (
            mainSafeOfficerUser &&
            !this.applicantListShow.includes(mainSafeOfficerUser)
          ) {
            this.applicantListShow.push(mainSafeOfficerUser);
          }
        }

        if (this.form.secondarySafeOfficer) {
          const secondarySafeOfficerUser = this.headerOptions.find((item) => {
            return item.id === this.form.secondarySafeOfficer;
          });
          if (
            secondarySafeOfficerUser &&
            !this.applicantListShow.includes(secondarySafeOfficerUser)
          ) {
            this.applicantListShow.push(secondarySafeOfficerUser);
          }
        }
        if (this.form.qualityManager) {
          const qualityManagerUser = this.headerOptions.find((item) => {
            return item.id === this.form.qualityManager;
          });
          if (
            qualityManagerUser &&
            !this.applicantListShow.includes(qualityManagerUser)
          ) {
            this.applicantListShow.push(qualityManagerUser);
          }
        }
        if (this.form.sectionApprover) {
          const sectionApproverUser = this.headerOptions.find((item) => {
            return item.id === this.form.sectionApprover;
          });
          if (
            sectionApproverUser &&
            !this.applicantListShow.includes(sectionApproverUser)
          ) {
            this.applicantListShow.push(sectionApproverUser);
          }
        }
        if (this.form.farmApprover) {
          const farmApproverUser = this.headerOptions.find((item) => {
            return item.id === this.form.farmApprover;
          });
          if (farmApproverUser && !this.applicantListShow.includes(farmApproverUser)) {
            this.applicantListShow.push(farmApproverUser);
          }
        }

        if (this.form.teamsApprover) {
          const teamsApproverUser = this.headerOptions.find((item) => {
            return item.id === this.form.teamsApprover;
          });
          if (teamsApproverUser && !this.applicantListShow.includes(teamsApproverUser)) {
            this.applicantListShow.push(teamsApproverUser);
          }
        }
        if (this.form.officeApprover) {
          const officeApproverUser = this.headerOptions.find((item) => {
            return item.id === this.form.officeApprover;
          });
          if (
            officeApproverUser &&
            !this.applicantListShow.includes(officeApproverUser)
          ) {
            this.applicantListShow.push(officeApproverUser);
          }
        }
        // 承包商负责人
        if (this.form.contractorApprover) {
          const contractorApproverUser = this.headerOptions.find((item) => {
            return item.id === this.form.contractorApprover;
          });
          if (
            contractorApproverUser &&
            !this.applicantListShow.includes(contractorApproverUser)
          ) {
            this.applicantListShow.push(contractorApproverUser);
          }
        }
      } else {
        const result = this.headerOptions.filter((item) => {
          return item.fullName.includes(val);
        }); // 存储符合条件的下拉选项
        this.applicantListShow = result.slice(0, 30); // 只取前30个
      }
    },
    // 设置部门的安全员和工段负责人信息
    setDepartStaffing(id) {
      getDepartStaffing(id).then(({ data }) => {
        this.form.companyGeneralManager = toString(data.result["10"]) || "";
        this.form.companyChargeLeadership = toString(data.result["11"]) || "";
        this.form.corporationPersonCharge = toString(data.result["6"]) || "";
        this.form.safetyChargeLeadership = toString(data.result["12"]) || "";
        this.form.leaderChargeFactory = toString(data.result["11"]) || "";
        this.form.secondaryApprovalCompany = toString(data.result["13"]) || "";
        this.form.personChargeFactory = toString(data.result["6"]) || ""; // 工厂负责人
        this.form.secondaryApprovalFactory = toString(data.result["13"]) || ""; // 二级审批人(工厂)
        this.form.thirdApprovalFactory = toString(data.result["14"]) || ""; // 三级审批人(工厂)
        this.form.thirdApprovalCompany = toString(data.result["14"]) || "";
        this.form.principalMainDepartments = toString(data.result["4"]) || "";
        this.form.headSecondaryDepartment = toString(data.result["5"]) || "";
        this.form.secondaryApprovalDepartment = toString(data.result["13"]) || ""; // 二级审批人(部门)
        this.form.thirdApprovalDepartment = toString(data.result["14"]) || ""; // 三级审批人(部门)
        this.form.mainSafeOfficer = toString(data.result["1"]) || "";
        this.form.secondarySafeOfficer = toString(data.result["3"]) || "";
        this.form.qualityManager = toString(data.result["15"]) || "";
        this.form.sectionApprover = toString(data.result["2"]) || "";
        this.form.farmApprover = toString(data.result["6"]) || "";
        this.form.teamsApprover = toString(data.result["6"]) || "";
        this.form.officeApprover = toString(data.result["6"]) || "";
        this.form.contractorApprover = toString(data.result["6"]) || "";
        this.filterUserList();
      });
    },
    // 获取节点的绑定oa部门列表
    async getExternalPlatFormList(companyId) {
      const oaCompany = await getDepListByCompanyId(companyId);
      if (oaCompany.data.code != "200") {
        this.$message.error("获取绑定oa部门列表出错", oaCompany.data.message);
        return;
      }
      this.externalPlatFormList = oaCompany.data.result || [];
    },

    // 获取部门扩展信息
    getDepartmentExtensionInfo(id) {
      getDepartmentExtensionInfo(id).then(({ data }) => {
        if (data.success) {
          this.departmentCategory = data.result.departmentLevel;
        }
      });
    },
    handleClick(e) {
      const idx = Number.parseInt(e.index);
      if (idx == 0) {
        this.activeName = "first";
      } else if (idx == 1) {
        this.activeName = "second";
      } else {
        this.activeName = "third";
      }
    },
    // 节点展开
    nodeExpand(data) {
      this.expandedList.push(data.id); // 在节点展开是添加到默认展开数组
    },
    // 节点收起
    nodeCollapse(data) {
      this.expandedList.splice(this.expandedList.indexOf(data.id), 1); // 收起时删除数组里对应选项
    },
    // 保存并修改 按钮
    submitEdit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        if (!this.form.id) {
          this.$message.warning("请先点击选择要修改的部门节点");
          return;
        }
        this.submitLoading = true;
        const userStaffing = []; // 保存部门人员配置
        switch (this.form.departmentType) {
          case "COMPANY":
            if (this.form.companyGeneralManager) {
              userStaffing.push({
                userId: this.form.companyGeneralManager,
                userType: 10,
              });
            }
            if (this.form.companyChargeLeadership) {
              userStaffing.push({
                userId: this.form.companyChargeLeadership,
                userType: 11,
              });
            }

            if (this.form.corporationPersonCharge) {
              userStaffing.push({
                userId: this.form.corporationPersonCharge,
                userType: 6,
              });
            }
            if (this.form.safetyChargeLeadership) {
              userStaffing.push({
                userId: this.form.safetyChargeLeadership,
                userType: 12,
              });
            }
            if (this.form.secondaryApprovalCompany) {
              userStaffing.push({
                userId: this.form.secondaryApprovalCompany,
                userType: 13,
              });
            }
            if (this.form.thirdApprovalCompany) {
              userStaffing.push({
                userId: this.form.thirdApprovalCompany,
                userType: 14,
              });
            }
            break;
          case "FACTORY":
            if (this.form.safetyChargeLeadership) {
              userStaffing.push({
                userId: this.form.safetyChargeLeadership,
                userType: 12,
              });
            }
            if (this.form.leaderChargeFactory) {
              userStaffing.push({
                userId: this.form.leaderChargeFactory,
                userType: 11,
              });
            }
            if (this.form.personChargeFactory) {
              userStaffing.push({
                userId: this.form.personChargeFactory,
                userType: 6,
              });
            }
            if (this.form.secondaryApprovalFactory) {
              userStaffing.push({
                userId: this.form.secondaryApprovalFactory,
                userType: 13,
              });
            }
            if (this.form.thirdApprovalFactory) {
              userStaffing.push({
                userId: this.form.thirdApprovalFactory,
                userType: 14,
              });
            }

            break;
          case "DEPARTMENT":
            if (this.form.principalMainDepartments) {
              userStaffing.push({
                userId: this.form.principalMainDepartments,
                userType: 4,
              });
            }
            if (this.form.headSecondaryDepartment) {
              userStaffing.push({
                userId: this.form.headSecondaryDepartment,
                userType: 5,
              });
            }
            if (this.form.secondaryApprovalDepartment) {
              userStaffing.push({
                userId: this.form.secondaryApprovalDepartment,
                userType: 13,
              });
            }
            if (this.form.thirdApprovalDepartment) {
              userStaffing.push({
                userId: this.form.thirdApprovalDepartment,
                userType: 14,
              });
            }
            if (this.form.mainSafeOfficer) {
              userStaffing.push({
                userId: this.form.mainSafeOfficer,
                userType: 1,
              });
            }
            if (this.form.secondarySafeOfficer) {
              userStaffing.push({
                userId: this.form.secondarySafeOfficer,
                userType: 3,
              });
            }
            if (this.form.qualityManager) {
              userStaffing.push({
                userId: this.form.qualityManager,
                userType: 15,
              });
            }
            break;
          case "WORK_SECTION":
            if (this.form.sectionApprover) {
              userStaffing.push({
                userId: this.form.sectionApprover,
                userType: 2,
              });
            }
            break;
          case "WORKSHOP":
            if (this.form.farmApprover) {
              userStaffing.push({
                userId: this.form.farmApprover,
                userType: 6,
              });
            }
            break;
          case "GROUP":
            if (this.form.teamsApprover) {
              userStaffing.push({
                userId: this.form.teamsApprover,
                userType: 6,
              });
            }
            break;
          case "OFFICE":
            if (this.form.officeApprover) {
              userStaffing.push({
                userId: this.form.officeApprover,
                userType: 6,
              });
            }
            break;
          case "CONTRACTOR":
            if (this.form.contractorApprover) {
              userStaffing.push({
                userId: this.form.contractorApprover,
                userType: 6,
              });
            }
            break;
        }

        // delete this.form.safeOfficer
        // delete this.form.workshopLiableIdList
        const param = {
          deptId: this.form.id,
          userStaffing,
        };
        saveDepartStaffing(param).then(({ data }) => {
          console.log(data.message);
        });

        // 保存部门扩展信息
        const params = {
          departmentId: this.form.id,
          departmentLevel: this.departmentCategory,
        };
        saveDepartmentExtensionInfo(params).then(({ data }) => {
          console.log(data);
        });

        addDepart(this.form)
          .then(({ data }) => {
            this.submitLoading = false;
            if (data.success) {
              this.$message.success(data.message || "编辑成功");
              this.getDataList();
            } else {
              this.$message.warning(data.message || "编辑失败");
            }
          })
          .catch((err) => {
            this.submitLoading = false;
            this.$message.error("编辑失败");
          });
      });
    },

    mouseleave(data, $event) {
      $event.currentTarget.firstElementChild.nextElementSibling.setAttribute(
        "class",
        "none"
      );
    },
    mouseover(data, $event) {
      $event.currentTarget.nextElementSibling.setAttribute("class", "block");
    },
    loadPdf(src) {
      // this.srcPdf = pdf.createLoadingTask(this.filePrefix + src);
      this.srcPdf = pdf.createLoadingTask(src);
      this.srcPdf.promise.then((pdf) => {
        this.pagesPdf = pdf.numPages;
      });
    },
  },
};
</script>

<template>
  <KyTreeTable :isShowLeft="false">
    <ECard slot="table">
      <div class="card-content">
        <div class="card-content-sider">
          <div slot="title" class="block-title">
            <div class="title-text">组织架构树</div>
            <EButton
              v-if="hasBtnPermission('manage_depart_add')"
              icon="add"
              type="text"
              size="mini"
              @click="addRootDp"
            >
              新增
            </EButton>
          </div>
          <div class="tree-bar" style="height: 68vh; overflow: auto">
            <el-tree
              ref="tree"
              v-loading="loading"
              :data="treeData"
              :props="defaultProps"
              :default-expanded-keys="expandedList"
              highlight-current
              :expand-on-click-node="false"
              node-key="id"
              @node-click="treeNodeTap"
              @node-expand="nodeExpand"
              @node-collapse="nodeCollapse"
            >
              <div
                slot-scope="{ node, data }"
                class="custom-tree-node"
                @mouseleave="mouseleave(data, $event)"
              >
                <div class="tree-node-label" @mouseover="mouseover(data, $event)">
                  {{ node.label }}
                </div>
                <div style="padding: 0 8px" class="none">
                  <el-button
                    v-if="
                      hasBtnPermission('manage_depart_add') &&
                      !data.onlyTreeUse &&
                      data.departmentType !== 'CONTRACTOR'
                    "
                    type="text"
                    @click.stop="appendChild(data)"
                  >
                    <i class="el-icon-circle-plus-outline" />
                  </el-button>
                  <el-button
                    v-if="
                      hasBtnPermission('manage_depart_delete') &&
                      !data.onlyTreeUse &&
                      data.departmentType !== 'CONTRACTOR'
                    "
                    type="text"
                    @click.stop="() => removeDepart(data)"
                  >
                    <i class="el-icon-delete" style="color: #ff4949" />
                  </el-button>
                </div>
              </div>
            </el-tree>
          </div>
        </div>
        <div class="card-content-main">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane
              v-for="item in activeNameList"
              :key="item.name"
              :label="item.label"
              :name="item.name"
            />
          </el-tabs>
          <el-form
            v-if="activeName != 'third'"
            ref="form"
            class="form tree-bar"
            :model="form"
            label-width="110px"
            :rules="rules"
            size="mini"
          >
            <div v-show="activeName == 'first'">
              <el-form-item label="所属部门" prop="companyId">
                <SelectTree
                  :props="{
                    value: 'id', // ID字段名
                    label: 'companyName', // 显示名称
                    children: 'children', // 子级字段名
                  }"
                  url="sysCompany/getSubordinateCompany"
                  :value="form.companyId"
                  :clearable="false"
                  :accordion="true"
                  :disabled="currentDepartType === 'COMPANY'"
                  @getValue="selectCompany"
                />
              </el-form-item>
              <el-form-item label="所属类型" prop="departmentType">
                <el-radio-group
                  v-model="form.departmentType"
                  :disabled="currentDepartType === 'COMPANY'"
                >
                  <el-radio-button
                    v-for="item in $dictUtils.getDictList('depart_type')"
                    :key="item.id"
                    :label="item.dictCode"
                    :disabled="item.dictCode === 'COMPANY'"
                  >
                    {{ item.dictName }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
              <!-- <el-form-item label="业务类型" prop="businessTypeList" v-if="currentDepartType !== 'COMPANY'">
              <el-checkbox-group v-model="form.businessTypeList">
                <el-checkbox v-for="item in $dictUtils.getDictList('department_classify')" :label="item.dictCode" :key="item.id">{{ item.dictName }} </el-checkbox>
              </el-checkbox-group>
            </el-form-item> -->
              <el-form-item v-if="form.departmentType == 'DEPARTMENT'" label="部门类别">
                <el-radio-group v-model="departmentCategory">
                  <el-radio
                    v-for="item in departmentTypeList"
                    :key="item.value"
                    :label="item.value"
                  >
                    {{ item.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="form.parentId" label="上级部门" prop="parentId">
                <SelectTree
                  ref="officeTree"
                  :props="{
                    value: 'id', // ID字段名
                    label: 'departmentName', // 显示名称
                    children: 'children', // 子级字段名
                  }"
                  :data="treeData"
                  :value="form.parentId"
                  :clearable="false"
                  :accordion="true"
                  :disabled="currentDepartType === 'COMPANY'"
                  @getValue="
                    (value) => {
                      form.parentId = value;
                    }
                  "
                />
              </el-form-item>
              <el-form-item label="部门名称" prop="departmentName">
                <el-input
                  v-model="form.departmentName"
                  :disabled="currentDepartType === 'COMPANY'"
                />
              </el-form-item>
              <el-form-item label="安全职责" prop="safetyDuty">
                <el-input
                  v-model="form.safetyDuty"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                />
              </el-form-item>
              <el-form-item label="部门代码" prop="departmentCode">
                <el-input
                  v-model="form.departmentCode"
                  :disabled="currentDepartType === 'COMPANY'"
                />
              </el-form-item>
              <el-form-item label="绑定oa部门" prop="externalPlatformId">
                <el-select v-model="form.externalPlatformId" clearable filterable>
                  <el-option
                    v-for="item in externalPlatFormList"
                    :key="item.departmentid"
                    :value="item.departmentid"
                    :label="item.shortname"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="排序" prop="sort">
                <el-input-number
                  v-model="form.sort"
                  controls-position="right"
                  :min="0"
                  :max="1000"
                />
                <span style="margin-left: 5px; font-size: 12px; color: #606266"
                  >值越小越靠前，支持小数</span
                >
              </el-form-item>
              <el-form-item label="是否启用" prop="enable">
                <el-switch v-model="form.enable" />
              </el-form-item>
            </div>
            <template v-if="activeName == 'second'">
              <el-form-item
                v-if="form.departmentType == 'COMPANY'"
                label="公司总经理"
                prop="companyGeneralManager"
              >
                <el-select
                  v-model="form.companyGeneralManager"
                  :filter-method="filterUserList"
                  clearable
                  filterable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in applicantListShow"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.fullName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{
                      item.departmentName
                    }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="form.departmentType == 'COMPANY'"
                label="公司分管领导"
                prop="companyChargeLeadership"
              >
                <el-select
                  v-model="form.companyChargeLeadership"
                  :filter-method="filterUserList"
                  clearable
                  filterable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in applicantListShow"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.fullName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{
                      item.departmentName
                    }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="form.departmentType == 'COMPANY'"
                label="公司负责人"
                prop="corporationPersonCharge"
              >
                <el-select
                  v-model="form.corporationPersonCharge"
                  :filter-method="filterUserList"
                  clearable
                  filterable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in applicantListShow"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.fullName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{
                      item.departmentName
                    }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="
                  form.departmentType == 'COMPANY' || form.departmentType == 'FACTORY'
                "
                label="安全分管领导"
                prop="safetyChargeLeadership"
              >
                <el-select
                  v-model="form.safetyChargeLeadership"
                  :filter-method="filterUserList"
                  clearable
                  filterable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in applicantListShow"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.fullName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{
                      item.departmentName
                    }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="form.departmentType == 'COMPANY'"
                label="二级审批人(公司)"
                prop="secondaryApprovalCompany"
              >
                <el-select
                  v-model="form.secondaryApprovalCompany"
                  :filter-method="filterUserList"
                  clearable
                  filterable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in applicantListShow"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.fullName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{
                      item.departmentName
                    }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="form.departmentType == 'COMPANY'"
                label="三级审批人(公司)"
                prop="thirdApprovalCompany"
              >
                <el-select
                  v-model="form.thirdApprovalCompany"
                  :filter-method="filterUserList"
                  clearable
                  filterable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in applicantListShow"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.fullName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{
                      item.departmentName
                    }}</span>
                  </el-option>
                </el-select>
              </el-form-item>

              <div v-if="form.departmentType == 'FACTORY'">
                <el-form-item label="工厂分管领导" prop="leaderChargeFactory">
                  <el-select
                    v-model="form.leaderChargeFactory"
                    :filter-method="filterUserList"
                    clearable
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in applicantListShow"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    >
                      <span style="float: left">{{ item.fullName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{
                        item.departmentName
                      }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="工厂负责人" prop="personChargeFactory">
                  <el-select
                    v-model="form.personChargeFactory"
                    :filter-method="filterUserList"
                    clearable
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in applicantListShow"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    >
                      <span style="float: left">{{ item.fullName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{
                        item.departmentName
                      }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="二级审批人(工厂)" prop="secondaryApprovalFactory">
                  <el-select
                    v-model="form.secondaryApprovalFactory"
                    :filter-method="filterUserList"
                    clearable
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in applicantListShow"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    >
                      <span style="float: left">{{ item.fullName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{
                        item.departmentName
                      }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="三级审批人(工厂)" prop="thirdApprovalFactory">
                  <el-select
                    v-model="form.thirdApprovalFactory"
                    :filter-method="filterUserList"
                    clearable
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in applicantListShow"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    >
                      <span style="float: left">{{ item.fullName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{
                        item.departmentName
                      }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>

              <div v-if="form.departmentType == 'DEPARTMENT'">
                <el-form-item label="部门负责人(主)" prop="principalMainDepartments">
                  <el-select
                    v-model="form.principalMainDepartments"
                    :filter-method="filterUserList"
                    clearable
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in applicantListShow"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    >
                      <span style="float: left">{{ item.fullName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{
                        item.departmentName
                      }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="部门负责人(次)" prop="headSecondaryDepartment">
                  <el-select
                    v-model="form.headSecondaryDepartment"
                    :filter-method="filterUserList"
                    clearable
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in applicantListShow"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    >
                      <span style="float: left">{{ item.fullName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{
                        item.departmentName
                      }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="二级审批人(部门)" prop="secondaryApprovalDepartment">
                  <el-select
                    v-model="form.secondaryApprovalDepartment"
                    :filter-method="filterUserList"
                    clearable
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in applicantListShow"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    >
                      <span style="float: left">{{ item.fullName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{
                        item.departmentName
                      }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="三级审批人(部门)" prop="thirdApprovalDepartment">
                  <el-select
                    v-model="form.thirdApprovalDepartment"
                    :filter-method="filterUserList"
                    clearable
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in applicantListShow"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    >
                      <span style="float: left">{{ item.fullName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{
                        item.departmentName
                      }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="部门安全员(主)" prop="mainSafeOfficer">
                  <el-select
                    v-model="form.mainSafeOfficer"
                    :filter-method="filterUserList"
                    clearable
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in applicantListShow"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    >
                      <span style="float: left">{{ item.fullName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{
                        item.departmentName
                      }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="部门安全员(次)" prop="secondarySafeOfficer">
                  <el-select
                    v-model="form.secondarySafeOfficer"
                    :filter-method="filterUserList"
                    clearable
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in applicantListShow"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    >
                      <span style="float: left">{{ item.fullName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{
                        item.departmentName
                      }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="质量负责人" prop="qualityManager">
                  <el-select
                    v-model="form.qualityManager"
                    :filter-method="filterUserList"
                    clearable
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in applicantListShow"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    >
                      <span style="float: left">{{ item.fullName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{
                        item.departmentName
                      }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>

              <el-form-item
                v-if="form.departmentType == 'WORK_SECTION'"
                label="工段负责人"
                prop="sectionApprover"
              >
                <el-select
                  v-model="form.sectionApprover"
                  :filter-method="filterUserList"
                  clearable
                  filterable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in applicantListShow"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.fullName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{
                      item.departmentName
                    }}</span>
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                v-if="form.departmentType == 'WORKSHOP'"
                label="车间负责人"
                prop="farmApprover"
              >
                <el-select
                  v-model="form.farmApprover"
                  :filter-method="filterUserList"
                  clearable
                  filterable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in applicantListShow"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.fullName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{
                      item.departmentName
                    }}</span>
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                v-if="form.departmentType == 'GROUP'"
                label="班组负责人"
                prop="teamsApprover"
              >
                <el-select
                  v-model="form.teamsApprover"
                  :filter-method="filterUserList"
                  clearable
                  filterable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in applicantListShow"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.fullName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{
                      item.departmentName
                    }}</span>
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                v-if="form.departmentType == 'OFFICE'"
                label="办公室负责人"
                prop="officeApprover"
              >
                <el-select
                  v-model="form.officeApprover"
                  :filter-method="filterUserList"
                  clearable
                  filterable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in applicantListShow"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.fullName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{
                      item.departmentName
                    }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="form.departmentType == 'CONTRACTOR'"
                label="负责人"
                prop="contractorApprover"
              >
                <el-select
                  v-model="form.contractorApprover"
                  :filter-method="filterUserList"
                  clearable
                  filterable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in applicantListShow"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.fullName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{
                      item.departmentName
                    }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
            <el-form-item>
              <el-button
                v-if="hasBtnPermission('manage_depart_modify')"
                type="primary"
                :loading="submitLoading"
                :disabled="form.departmentType == 'CONTRACTOR' && activeName == 'first'"
                @click="submitEdit"
              >
                保存并修改
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 建筑场所表单 -->
          <el-form v-else class="buildForm" :model="buildForm" label-width="110px">
            <div class="topBox">
              <el-form-item label="建筑场所信息附件" prop="a" style="width: 80%">
                <el-upload action="#" :limit="1" :auto-upload="false" class="diyUpload">
                  <el-button type="primary" icon="el-icon-upload"> 上传文件 </el-button>
                </el-upload>
              </el-form-item>
              <el-form-item label="关联的三同时" prop="b" style="width: 80%">
                <el-select
                  v-model="buildForm.b"
                  filterable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in []"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-button class="diyBtn" type="primary"> 修改 </el-button>
            </div>
            <!-- pdf预览 -->
            <div class="pdfBox">
              <pdf
                v-for="i in pagesPdf"
                :key="i"
                :src="srcPdf"
                :page="i"
                @page-loaded="pageLoaded"
              />
            </div>
          </el-form>

          <div style="text-align: center" />
        </div>
      </div>
    </ECard>

    <!-- 主要内容
    <el-row class="bot">
    // 左侧
      <el-col :span="7" class="left"> </el-col>
     //右侧
      <el-col :span="14" class="right" v-show="currentNode"> </el-col>
    </el-row> -->

    <!-- 弹窗, 新增 / 修改 -->
    <depart-form
      slot="dialog"
      ref="departForm"
      :headerOptions="headerOptions"
      @refreshDataList="getDataList"
    />
  </KyTreeTable>
</template>

<style scoped lang="scss">
.card-content {
  display: flex;
  margin-top: 10px;

  &-sider {
    width: 230px;
    margin-right: 24px;
    padding-right: 20px;
    box-sizing: border-box;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 100%;
      background-color: #eeeeee;
    }

    .block-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;
      line-height: 40px;
      margin-bottom: 14px;
      padding: 0 4px;
      // border-radius: 6px;
      // background-color: #eeeeee;
      border-bottom: 1px solid #eeeeee;

      .title-text {
        font-size: 14px;
        font-weight: 600;
        margin-right: 20px;
      }
    }
  }

  &-main {
    width: calc(100% - 400px);
  }

  .top {
    margin: 10px;
  }

  .bot {
    background: #ffffff;
    padding: 5px;

    .select-clear {
      margin-left: 10px;
      color: #409eff;
    }

    .tree-bar {
      margin-top: 6px;
    }

    .form {
      .choose-icon-btn {
        cursor: pointer;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .right {
      margin-left: 20px;
    }
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .tree-node-label {
    max-width: 96px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .buildForm {
    position: relative;
    .topBox {
      position: relative;
      .diyUpload {
        display: flex;
        ul {
          flex: 1;
          overflow: hidden;
          padding-left: 10px;
          display: flex;
          align-items: center;
          li {
            margin-top: 0;
          }
        }
      }
      .diyBtn {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      }
    }
    .pdfBox {
      height: 400px;
      border: 1px solid var(--ky-border-color);
      border-radius: 6px;
    }
  }
}
// }

.none {
  display: none;
}

.block {
  display: inline-block;
}
</style>
