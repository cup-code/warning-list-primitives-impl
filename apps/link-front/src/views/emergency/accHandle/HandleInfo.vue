<script>
import {
  emPlanAdd,
  emPlanGetById,
  emPlanUpdate,
} from '@/http/emergency/emsource-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'
import PickGroup from '../common/PickGroup.vue'
import PickProficient from '../common/PickProficient.vue'
// import EmPlanData from './emPlanData.js'
import PickSupply from '../common/PickSupply.vue'

export default {
  components: {
    PickSupply,
    PickGroup,
    PickProficient,
    FileUpload,
  },
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true,
    },
    // 详情id
    infoId: {
      type: [Number, String],
      default: null,
    },
    // 所属公司树数据
    companyData: {
      type: Array,
      default() {
        return []
      },
    },
    // 事故类型
    accTypeList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      isLoading: false,
      // 文件上传组件传参
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      // 应急预案类型下拉列表
      planTypeList: [],
      // 是否备案下拉列表
      isFillingList: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
      changeData: new EmPlanData(), // 修改/新增的数据
      showGoodsDialog: false, // 选择物资弹窗
      showGroupDialog: false, // 选择队伍弹窗
      showProficientDialog: false, // 选择专家弹窗
    }
  },
  created() {
    const allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.planTypeList = allDic.emplan_type
    if (this.infoId) {
      this.getInfoData()
    }
    else {
      const userData = JSON.parse(sessionStorage.getItem('user'))
      this.changeData.companyId = userData.companyId
      this.changeData.companyName = userData.companyName
    }
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      this.isLoading = true
      emPlanGetById(this.infoId)
        .then((res) => {
          if (res.data.success) {
            this.changeData = new EmPlanData(res.data.result)
            this.fileProp.oldFileList = res.data.result.accessorys
          }
          else {
            this.$message.warning(res.data.message || '获取详情失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取详情出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 所属公司下拉列表点击 */
    companyTreeNodeTap(data) {
      this.changeData.companyId = data.id
      this.changeData.companyName = data.companyName
      this.$refs.tableTypeSelect.blur()
    },
    /* 点击清空公司下拉列表 */
    clearClick() {
      this.changeData.companyName = ''
      this.changeData.companyId = ''
    },
    /* 文件上传回调 */
    uploadEvt(fileList) {
      this.changeData.files = fileList
    },
    /* 关闭物资选择回调 */
    closeSupplyEvt(result) {
      if (result) {
        this.changeData.materials = result.data
      }
      this.showGoodsDialog = false
    },
    /* 关闭队伍选择回调 */
    closeGroupEvt(result) {
      if (result) {
        this.changeData.team = result.data
      }
      this.showGroupDialog = false
    },
    /* 关闭专家选择回调 */
    closeProficientEvt(result) {
      if (result) {
        this.changeData.expert = result.data
      }
      this.showProficientDialog = false
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.planForm.validate((valid) => {
        if (valid) {
          let submitFunc = emPlanAdd
          if (this.infoId) {
            submitFunc = emPlanUpdate
          }
          this.isLoading = true
          const params = this.changeData.getSaveData()
          submitFunc(params)
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
  <div
    v-loading="isLoading"
    class="handle-info"
  >
    <el-form
      ref="planForm"
      inline
      label-width="120px"
      :model="changeData"
      :disabled="!editable"
    >
      <el-form-item label="事件名称">
        {{ planName }}
      </el-form-item>
      <el-form-item label="事件时间">
        {{ planName }}
      </el-form-item>
      <el-form-item label="事件地点">
        {{ planName }}
      </el-form-item>
      <el-form-item label="事件附件">
        <el-button type="text">
          查看
        </el-button>
      </el-form-item>
      <el-form-item label="事件内容">
        {{ planName }}
      </el-form-item>
      <el-form-item label="应急预案类型">
        {{ planName }}
      </el-form-item>
      <el-form-item label="是否已备案">
        <el-tag type="danger">
          否
        </el-tag>
      </el-form-item>
      <el-form-item label="应急预案名称">
        {{ planName }}
      </el-form-item>
      <el-form-item label="附件">
        <el-button type="text">
          查看
        </el-button>
      </el-form-item>
      <!-- 指挥长 -->
      <el-form-item
        label="指挥长"
        prop="person.name"
        :rules="[{ required: true, message: '请填写指挥长', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.person.name"
          style="width: 280px"
        />
      </el-form-item>
      <el-form-item
        label="指挥长电话"
        prop="person.phone"
        :rules="[{ required: true, message: '请填写指挥长电话', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.person.phone"
          style="width: 280px"
        />
      </el-form-item>
      <!-- 副指挥 -->
      <div
        v-for="(item, index) in changeData.personTow"
        :key="`personTow${index}`"
      >
        <el-form-item
          :label="index === 0 ? '副指挥长' : ' '"
          :prop="`personTow[${index}].name`"
          :rules="[{ required: true, message: '请填写副指挥长', trigger: 'blur' }]"
        >
          <el-input
            v-model="item.name"
            style="width: 305px"
          />
        </el-form-item>
        <el-form-item
          :prop="`personTow[${index}].phone`"
          :rules="[{ required: true, message: '请填写副指挥长电话', trigger: 'blur' }]"
        >
          <el-input
            v-model="item.phone"
            style="width: 305px"
          />
        </el-form-item>
        <el-button
          v-if="index === 0"
          type="primary"
          @click="changeData.addViceLeader()"
        >
          新增
        </el-button>
        <el-button
          v-else
          type="danger"
          @click="changeData.personTow.splice(index, 1)"
        >
          删除
        </el-button>
      </div>
      <!-- 其他成员 -->
      <div
        v-for="(item, index) in changeData.personOther"
        :key="`other${index}`"
      >
        <el-form-item
          :label="index === 0 ? '其他成员' : ' '"
          :prop="`personOther[${index}].name`"
          :rules="[{ required: true, message: '请填写其他成员', trigger: 'blur' }]"
        >
          <el-input
            v-model="item.name"
            style="width: 305px"
          />
        </el-form-item>
        <el-form-item
          :prop="`personOther[${index}].phone`"
          :rules="[{ required: true, message: '请填写其他成员电话', trigger: 'blur' }]"
        >
          <el-input
            v-model="item.phone"
            style="width: 305px"
          />
        </el-form-item>
        <el-button
          v-if="index === 0"
          type="primary"
          @click="changeData.addOther()"
        >
          新增
        </el-button>
        <el-button
          v-else
          type="danger"
          @click="changeData.personOther.splice(index, 1)"
        >
          删除
        </el-button>
      </div>
      <!-- 参与单位 -->
      <div
        v-for="(item, index) in changeData.planDept"
        :key="`dept${index}`"
      >
        <el-form-item
          :label="index === 0 ? '参与单位' : ' '"
          :prop="`planDept[${index}].deptName`"
          :rules="[{ required: true, message: '请填写参与单位', trigger: 'blur' }]"
        >
          <el-input
            v-model="item.deptName"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item
          :prop="`planDept[${index}].principal`"
          :rules="[{ required: true, message: '请填写单位负责人', trigger: 'blur' }]"
        >
          <el-input
            v-model="item.principal"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item
          :prop="`planDept[${index}].principalPhone`"
          :rules="[
            {
              required: true,
              message: '请填写单位负责人电话',
              trigger: 'blur',
            },
          ]"
        >
          <el-input
            v-model="item.principalPhone"
            style="width: 200px"
          />
        </el-form-item>
        <el-button
          type="primary"
          @click="changeData.addUnit()"
        >
          新增
        </el-button>
        <el-button
          v-if="false"
          type="danger"
          @click="changeData.planDept.splice(index, 1)"
        >
          删除
        </el-button>
      </div>
      <el-form-item label="通知内容">
        <el-input
          v-model="changeData.measure"
          type="textarea"
          resize="none"
          :rows="4"
          style="width: 690px"
        />
      </el-form-item>
      <el-form-item label="处置措施">
        <el-input
          v-model="changeData.measure"
          type="textarea"
          resize="none"
          :rows="4"
          style="width: 690px"
        />
      </el-form-item>
      <!-- 选择器 -->
      <el-form-item label="应急物资">
        <div class="pick-box">
          <div class="box-left">
            <el-button
              class="pick-btn"
              type="primary"
              size="mini"
              @click="showGoodsDialog = true"
            >
              选择物资
            </el-button>
          </div>
          <div class="box-right">
            <el-tag
              v-for="(item, index) in changeData.materials"
              :key="item.id"
              class="pick-item"
              closable
              @close="changeData.materials.splice(index, 1)"
            >
              {{ item.name }}
            </el-tag>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="应急队伍">
        <div class="pick-box">
          <div class="box-left">
            <el-button
              class="pick-btn"
              type="primary"
              size="mini"
              @click="showGroupDialog = true"
            >
              选择队伍
            </el-button>
          </div>
          <div class="box-right">
            <el-tag
              v-for="(item, index) in changeData.team"
              :key="item.id"
              class="pick-item"
              closable
              @close="changeData.team.splice(index, 1)"
            >
              {{ item.name }}
            </el-tag>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="应急专家">
        <div class="pick-box">
          <div class="box-left">
            <el-button
              class="pick-btn"
              type="primary"
              size="mini"
              @click="showProficientDialog = true"
            >
              选择专家
            </el-button>
          </div>
          <div class="box-right">
            <el-tag
              v-for="(item, index) in changeData.expert"
              :key="item.id"
              class="pick-item"
              closable
              @close="changeData.expert.splice(index, 1)"
            >
              {{ item.name }}
            </el-tag>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <div class="info-footer">
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        @click="submitClick"
      >
        启动预案
      </el-button>
    </div>
    <!-- 弹窗 -->
    <el-dialog
      class="normal-dialog"
      :visible.sync="showGoodsDialog"
      :close-on-click-modal="false"
      width="900px"
      title="应急物资"
      append-to-body
      top="5vh"
    >
      <PickSupply
        v-if="showGoodsDialog"
        :oldPickList="changeData.materials"
        @close="closeSupplyEvt"
      />
    </el-dialog>
    <el-dialog
      class="normal-dialog"
      :visible.sync="showGroupDialog"
      :close-on-click-modal="false"
      width="900px"
      title="应急队伍"
      append-to-body
      top="5vh"
    >
      <PickGroup
        v-if="showGroupDialog"
        :oldPickList="changeData.team"
        @close="closeGroupEvt"
      />
    </el-dialog>
    <el-dialog
      class="normal-dialog"
      :visible.sync="showProficientDialog"
      :close-on-click-modal="false"
      width="900px"
      title="应急专家"
      append-to-body
      top="5vh"
    >
      <PickProficient
        v-if="showProficientDialog"
        :oldPickList="changeData.expert"
        @close="closeProficientEvt"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.handle-info {
  height: calc(100% - 70px);
  overflow-y: auto;

  .pick-box {
    width: 690px;
    display: flex;
    // align-items: center;
    .box-left {
      width: 90px;
      .pick-btn {
        height: 30px;
      }
    }
    .box-right {
      width: 600px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      .pick-item {
        height: 30px;
        line-height: 30px;
        margin: 0 10px 10px 0;
      }
    }
  }
}
</style>
