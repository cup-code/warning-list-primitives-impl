<script>
import { saveCheckFinish, saveOrAddCheck } from '@/http/changeManagement/changeManagement-api'
import { getAllUsersByTenant } from '@/http/safe-production/depart-manage-api'
import { scceptanceList } from './scceptanceList.js'

export default {
  name: '',
  props: {
    id: {
      type: String,
      default: '',
    },
    method: {
      type: String,
      default: '',
    },
    recordData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      isLoading: false,
      dataRule: {},
      applicantList: [], // 申请人列表
      applicantListShow: [], // 展示申请人列表
      scceptanceList,
      // 整改状态列表
      rectificationStatusList: [
        {
          lable: '未整改',
          value: 0,
        },
        {
          lable: '已整改',
          value: 1,
        },
        {
          lable: '逾期未整改',
          value: 2,
        },
        {
          lable: '逾期已整改',
          value: 3,
        },
      ],
      // From表单数据
      inputForm: {
        applyRef: '', // 申请编号
        projectName: '', // 项目名称
        departmentName: '', // 项目单位
        checkPersons: [], // 验收人员
        checkTime: '', // 验收时间
        recordList: [], // 记录列表
        checkConclusion: '', // 验收结论
      },
      companyId: '',
      changeLevel: 0,
    }
  },
  computed: {
    // 根据层级，展示第一个大标题
    isShow() {
      return function (index) {
        let show = false
        switch (Number.parseInt(this.changeLevel)) {
          case 1:
            if (
              index == 0
              || index == 1
              || index == 4
              || index == 7
              || index == 12
              || index == 14
              || index == 18
            ) {
              show = true
            }
            break
          case 2:
            if (
              index == 0
              || index == 2
              || index == 5
              || index == 8
              || index == 12
              || index == 15
              || index == 19
            ) {
              show = true
            }
            break
          case 3:
            if (
              index == 0
              || index == 3
              || index == 6
              || index == 9
              || index == 13
              || index == 16
              || index == 20
            ) {
              show = true
            }
            break
        }
        return show
      }
    },
  },
  created() {
    this.getApplicantList()
    if (this.method !== 'add' && (this.method == 'view' || this.method == 'checkAccept')) {
      setTimeout(() => {
        const obj = JSON.parse(JSON.stringify(this.recordData))
        this.changeLevel = obj.reviewDetailsVO.changeApplyVO.changeLevel

        if (JSON.stringify(obj.recordMap) === '{}') {
          this.inputForm.recordList = [].concat(JSON.parse(JSON.stringify(this.scceptanceList)))
          if (this.changeLevel != 3) {
            this.setChangeLevel(this.changeLevel)
          }
        }
        else {
          this.inputForm.recordList = [].concat(
            obj.recordMap['1、立项审批'],
            obj.recordMap['2、设备本质安全'],
            obj.recordMap['3、制度规范'],
            obj.recordMap['4、职业健康'],
            obj.recordMap['5、消防'],
            obj.recordMap['6、其他项目'],
            obj.recordMap['7、记录和档案'],
          )
        }
        this.companyId = obj.reviewDetailsVO.changeApplyVO.companyId
        this.inputForm.checkConclusion = obj.reviewDetailsVO.changeApplyVO.checkConclusion || ''
        const objData = {
          applyRef: obj.reviewDetailsVO.changeApplyVO.applyRef,
          projectName: obj.reviewDetailsVO.changeApplyVO.projectName,
          fourProperties: obj.reviewDetailsVO.changeApplyVO.fourProperties,
          departmentName: obj.reviewDetailsVO.changeApplyVO.departmentName,
          checkPersons: obj.reviewDetailsVO.checkPersons,
          checkTime: obj.reviewDetailsVO.changeApplyVO.checkTime
            ? obj.reviewDetailsVO.changeApplyVO.checkTime
            : '',
        }
        this.inputForm = { ...this.inputForm, ...objData }
        this.filterUserList()
      }, 800)
    }
  },
  methods: {
    // 获取申请人
    getApplicantList() {
      const tenantId = this.$store.state.user.user.tenantId
      getAllUsersByTenant(tenantId)
        .then(({ data }) => {
          if (data.success) {
            this.applicantList = data.result || []
            if (this.applicantList.length) {
              this.filterUserList()
            }
          }
          else {
            this.$message.warning(data.message || '获取申请人列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取申请人列表失败', err)
        })
    },
    // 新增问题
    addQuestion(index) {
      this.inputForm.recordList[index].checkQuestionDTOS.push({
        askRectifyTime: '',
        businessCategory: 1,
        checkQuestion: '',
        companyId: this.companyId,
        id: '',
        realityRectifyTime: '',
        rectifyIdea: '',
        rectifyPerson: '',
        rectifyPersonName: '',
        rectifyStatus: 0,
        reviewId: '',
      })
    },
    // 删除问题
    delFn(index, formIndex) {
      this.inputForm.recordList[index].checkQuestionDTOS.splice(formIndex, 1)
    },
    filterUserList(val) {
      if (!val) {
        // 列表中展示的人员
        this.applicantListShow = this.applicantList.slice(0, 10) // 如果之前设置了人员，需要把设置的人员信息加入展示列表中，为了回显
        if (this.inputForm.recordList && this.inputForm.recordList.length) {
          for (const key of this.inputForm.recordList) {
            key.checkQuestionDTOS.forEach((element) => {
              if (element.rectifyPerson) {
                const rectifyPersonId = this.applicantList.find((item) => {
                  return item.id === element.rectifyPerson
                })
                if (!this.applicantListShow.includes(rectifyPersonId)) {
                  this.applicantListShow.push(rectifyPersonId)
                }
              }
            })
          }
        }
      }
      else {
        const result = this.applicantList.filter((item) => {
          return item.fullName.includes(val)
        }) // 存储符合条件的下拉选项
        this.applicantListShow = result.slice(0, 10) // 只取前10个
      }
    },
    confirmSelection(e, rectifierIndex, index) {
      this.applicantList.filter((item) => {
        if (e == item.id) {
          this.inputForm.recordList[index].checkQuestionDTOS[rectifierIndex].rectifyPersonName
            = item.fullName
          this.inputForm.recordList[index].checkQuestionDTOS[rectifierIndex].rectifyPerson = item.id
        }
      })
    },
    // 设置变更id和公司id
    setRecordList() {
      for (const key of this.inputForm.recordList) {
        key.applyId = this.id
        key.companyId = this.companyId
      }
    },
    // 根据变更层级展示
    setChangeLevel(val) {
      if (val == 1) {
        this.inputForm.recordList.splice(1, 2)
      }
      if (val == 2) {
        this.inputForm.recordList.splice(2, 1)
      }
      if (val == 3) {
        this.inputForm.recordList = [].concat(JSON.parse(JSON.stringify(this.scceptanceList)))
      }
    },
    // 问题整改提交
    saveOrAddCheck() {
      this.isLoading = true
      this.setRecordList()
      const params = {
        checkConclusion: this.inputForm.checkConclusion,
        checkRecordList: this.inputForm.recordList,
      }
      saveOrAddCheck(params)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success('提交成功')
            this.jumpOut()
          }
          else {
            this.$message.warning(data.message || '提交失败')
          }
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    getPersonnelList() {
      this.filterUserList()
    },
    // 确认验收
    saveCheckFinish() {
      this.isLoading = true
      this.setRecordList()
      const param = {
        checkConclusion: this.inputForm.checkConclusion,
        checkRecordList: this.inputForm.recordList,
      }
      saveCheckFinish(param)
        .then(({ data }) => {
          if (data.code === 200) {
            this.$message.success(data.message || '提交成功')
            this.jumpOut()
          }
          else {
            this.$message.warning(data.message || '提交失败')
          }
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 跳出 */
    jumpOut() {
      this.$router.back()
    },
  },
}
</script>

<template>
  <div class="fromClass">
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :inline="true"
      class="form-box"
      :model="inputForm"
      :rules="dataRule"
      label-width="100px"
      @submit.native.prevent
    >
      <div style="display: flex; align-items: center; justify-content: space-between">
        <h3 class="title-box">
          安全验收记录
        </h3>
        <span>
          <el-button
            v-show="method == 'checkAccept'"
            type="primary"
            :loading="isLoading"
            icon="el-icon-check"
            @click="saveCheckFinish()"
          >确认验收</el-button>
          <el-button
            v-show="method == 'checkAccept'"
            class="add-button"
            :loading="isLoading"
            icon="el-icon-warning-outline"
            @click="saveOrAddCheck()"
          >问题整改</el-button>
          <el-button
            icon="el-icon-refresh-right"
            @click="jumpOut()"
          >退出</el-button>
        </span>
      </div>
      <div id="check-accept-box">
        <el-form-item label="申请编号:">
          <div class="big-box">
            {{ inputForm.applyRef }}
          </div>
        </el-form-item>
        <el-form-item label="项目名称:">
          <div class="big-box">
            {{ inputForm.projectName }}
          </div>
        </el-form-item>
        <el-form-item label="项目单位:">
          <div class="big-box">
            {{ inputForm.departmentName }}
          </div>
        </el-form-item>
        <el-form-item label="验收人员:">
          <div class="big-box">
            <span
              v-for="(v, i) in inputForm.checkPersons"
              :key="v.fullName"
            >{{ v.fullName }}{{ i === inputForm.checkPersons.length - 1 ? '' : '、' }}</span>
          </div>
        </el-form-item>
        <el-form-item label="验收时间:">
          <div class="big-box">
            {{ inputForm.checkTime }}
          </div>
        </el-form-item>

        <div
          v-for="(item, index) in inputForm.recordList"
          :key="index"
        >
          <h5
            v-if="isShow(index)"
            style="text-indent: 2em"
          >
            {{ item.title }}
          </h5>
          <template>
            <el-form-item label="验收内容:">
              <div class="big-box">
                {{ item.checkContent }}
              </div>
            </el-form-item>
            <el-form-item label="工作要求:">
              <div class="big-box">
                {{ item.workAsk }}
              </div>
            </el-form-item>
            <el-form-item label="情况:">
              <el-radio-group
                v-model="item.conditionType"
                :disabled="method != 'checkAccept'"
              >
                <el-radio :label="2">
                  异常
                </el-radio>
                <el-radio :label="1">
                  正常
                </el-radio>
                <el-radio :label="0">
                  无
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <div
              v-if="method == 'checkAccept' && item.conditionType == 2"
              style="text-indent: 2em; margin-bottom: 10px; margin-left: 10px"
            >
              <el-button
                class="add-button"
                icon="el-icon-plus"
                @click="addQuestion(index)"
              >
                添加问题
              </el-button>
            </div>
            <template v-if="item.conditionType == 2">
              <el-table
                :data="item.checkQuestionDTOS"
                row-key="sort"
                :header-cell-style="{ background: 'var(--ky-head-color)' }"
                align="center"
                style="margin-left: 30px"
              >
                <el-table-column
                  label="序号"
                  type="index"
                  width="50"
                  align="center"
                />
                <el-table-column
                  label="验收问题"
                  align="center"
                  prop="checkQuestion"
                  width="150"
                >
                  <template slot-scope="scope">
                    <el-input
                      v-model="scope.row.checkQuestion"
                      class="required"
                      placeholder="请输入"
                      :disabled="method != 'checkAccept'"
                    />
                  </template>
                </el-table-column>
                <el-table-column
                  label="整改意见"
                  align="center"
                  prop="rectifyIdea"
                  width="220"
                >
                  <template slot-scope="scope">
                    <el-input
                      v-model="scope.row.rectifyIdea"
                      style="width: 200px"
                      placeholder="请输入"
                      :disabled="method != 'checkAccept'"
                    />
                  </template>
                </el-table-column>
                <el-table-column
                  label="要求整改时间"
                  align="center"
                  prop="askRectifyTime"
                  width="220"
                >
                  <template slot-scope="scope">
                    <el-date-picker
                      v-model="scope.row.askRectifyTime"
                      style="width: 180px"
                      :disabled="method != 'checkAccept'"
                      format="yyyy-MM-dd"
                      value-format="yyyy-MM-dd"
                      type="datetime"
                      placeholder="选择要求整改时间"
                    />
                  </template>
                </el-table-column>
                <el-table-column
                  label="整改人"
                  align="center"
                  prop="rectifyPerson"
                  width="220"
                >
                  <template slot-scope="scope">
                    <el-select
                      v-model="scope.row.rectifyPerson"
                      class="small-box mini-box required"
                      placeholder="请输入审批人"
                      filterable
                      :filter-method="filterUserList"
                      :disabled="method !== 'checkAccept'"
                      @change="confirmSelection($event, scope.$index, index)"
                      @focus="getPersonnelList"
                    >
                      <el-option
                        v-for="item in applicantListShow"
                        :key="item.id"
                        :label="item.fullName"
                        :value="item.id"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column
                  label="整改状态"
                  align="center"
                  prop="rectifyStatus"
                  width="220"
                >
                  <template slot-scope="scope">
                    <el-select
                      v-model="scope.row.rectifyStatus"
                      placeholder="请选择"
                      filterable
                      :disabled="method != 'checkAccept'"
                    >
                      <el-option
                        v-for="(item, index) in rectificationStatusList"
                        :key="index"
                        :label="item.lable"
                        :value="item.value"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column
                  label="实际整改时间"
                  align="center"
                  prop="realityRectifyTime"
                  width="220"
                >
                  <template slot-scope="scope">
                    <el-date-picker
                      v-model="scope.row.realityRectifyTime"
                      style="width: 180px"
                      :disabled="method != 'checkAccept'"
                      format="yyyy-MM-dd HH:mm:ss"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      type="datetime"
                      placeholder="选择实际整改时间"
                    />
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  min-width="160"
                  align="center"
                  fixed="right"
                >
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      :disabled="method != 'checkAccept'"
                      style="color: var(--ky-danger)"
                      @click="delFn(index, scope.$index)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </template>
        </div>
        <el-form-item
          label="验收结论"
          prop="checkConclusion"
          style="margin-top: 15px"
        >
          <el-input
            v-model="inputForm.checkConclusion"
            class="big-box"
            type="textarea"
            :rows="4"
            :disabled="method != 'checkAccept'"
          />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
.fromClass {
  .form-box {
    width: 80%;
  }
  .title-box {
    width: 70%;
    text-indent: 2em;
    position: relative;
  }
  .title-box::before {
    content: '';
    width: 4px;
    height: 20px;
    background: #409eff;
    position: absolute;
    left: 20px;
  }
  .small-box {
    width: 280px;
  }
  .big-box {
    width: 670px;
  }
}
.mini-box {
  width: 200px !important;
}

.required {
  position: relative;
}
.required::before {
  content: '*';
  font-size: 16px;
  color: red;
  position: absolute;
  top: 0;
  left: -10px;
}
</style>
