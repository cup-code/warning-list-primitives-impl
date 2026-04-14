<script>
import Icon from '@/components/icon'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getAllHmi } from '@/http/hmi/manage-api'
import { saveMenu } from '@/http/safe-production/menu-manage-api'
import { menuOptions } from '@/utils/menuData'

export default {
  components: {
    Icon,
    SelectTree,
  },
  props: {
    canAsParentMenu: Array,
  },
  data() {
    const validateUrl = (rule, value, callback) => {
      if (this.inputForm.menuType === 1 && !/\S/.test(value)) {
        callback(new Error('菜单URL不能为空'))
      }
      else {
        callback()
      }
    }
    return {
      visible: false,
      loading: false,
      method: '',
      title: '新增',
      typeList: ['板块', '目录', '菜单', '按钮'],
      typeListOptions: [
        {
          label: '板块',
          value: '0',
        },
        {
          label: '目录',
          value: '1',
        },
        {
          label: '菜单',
          value: '2',
        },
      ],
      inputForm: {
        id: '', // id
        menuType: '0', // 类型：0代表板块，1代表目录，2代表菜单，3代表按钮
        menuName: '', // 中文名称
        englishName: '', // 英文名称，可以作为router的path
        parentId: '', // 父级id
        permissionFlag: '', // 权限，菜单和按钮需要用
        sort: 30, // 排序
        icon: '', // 图标
        remarks: 'false', // 备注
        channelType: 'WEB', // 归属
        pageSourceType: '', // 菜单类型： 1表示vue组件，2表示组态画面，3表示外链地址
        canCommon: true, // 是否通用
        vueComponent: '', // 如果是菜单时，选择的前端组件；为按钮时，选择的按钮标识
        externalUrl: '',
        businessType: '', // 菜单应用场景
        module: false, // 是否为主页面
      },
      dataRule: {
        menuName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        englishName: [{ required: true, message: '英文名称不能为空', trigger: 'blur' }],
        parentId: [{ required: true, message: '非板块时上级不能为空', trigger: 'blur' }],
      },
      attributionOptions: [
        {
          value: 'WEB',
          label: 'WEB平台',
        },
        {
          value: 'APP',
          label: 'APP',
        },
        {
          value: 'APP_MAIN',
          label: 'APP主页',
        },
      ],
      menuOptions,
      buttonOptions: [],
      appMenus: [
        { value: 'dangeBook', label: '隐患台账' },
        { value: 'fastReport', label: '隐患上报' },
        { value: 'safeCheck', label: '安全检查' },
        { value: 'dangeHandle', label: '隐患处理' },
        { value: 'dangeCtrl', label: '风险管控' },
        { value: 'hmiList', label: '组态列表' },
        { value: 'specialWork', label: '特殊作业' },
        { value: 'alarmList', label: '异常中心' },
        { value: 'inspection', label: '设备巡检' },
        { value: 'maintenance', label: '设备维保' },
        { value: 'education', label: '教育培训' },
        { value: 'buildWork', label: '工单上报' },
        { value: 'workList', label: '工单列表' },
        { value: 'convenient', label: '智能处理' },
        { value: 'voiceAssistant', label: '语音助手' },
        { value: 'home', label: '常规-首页' },
        { value: 'me', label: '常规-我的' },
        { value: 'videoMain', label: '预警-首页' },
        { value: 'videoForeWarning', label: '预警-预警' },
        { value: 'videoStatistic', label: '预警-统计' },
        { value: 'videoMe', label: '预警-我的' },
        { value: 'videoAll', label: '预警-复核' },
        { value: 'LanyingEquipment', label: '蓝莹设备' },
      ],
      hmiList: [], // 类型为组态画面时，可选的画面
      businessTypeList: [
        {
          // 应用场景列表
          value: 1,
          label: '开屏页',
        },
      ],
    }
  },
  mounted() {
    getAllHmi(1).then(({ data }) => {
      this.hmiList = data.result || []
    })
  },
  methods: {
    init(method, obj) {
      setTimeout(() => {
        // 移除表单项的校验结果
        this.$refs.inputForm.clearValidate()
      }, 100)
      this.visible = true
      this.method = method
      this.inputForm = Object.assign(
        {},
        {
          id: obj.id,
          menuType: '0',
          menuName: '',
          englishName: '',
          parentId: obj.parent.id,
          permissionFlag: '',
          sort: 30,
          icon: '',
          remarks: 'false',
          channelType: obj.parent.channelType,
          pageSourceType: '',
          canCommon: true,
          vueComponent: '',
          externalUrl: '',
          businessType: '', // 菜单应用场景
          module: obj.row.module === 'true', // 是否为主页面
        },
      )
      if (method === 'add') {
        this.title = `新增`
        this.inputForm.menuType = '0'
        this.typeListOptions = [
          {
            label: '板块',
            value: '0',
          },
          {
            label: '目录',
            value: '1',
          },
          {
            label: '菜单',
            value: '2',
          },
        ]
      }
      else if (method === 'addChild') {
        // this.inputForm.menuType = obj.parent.menuType === '0' ? '1' : obj.parent.menuType === '1' && !obj.row.vueComponent && !obj.row.externalUrl ? '2' : '3' // 根据父级类型来决定子级的类型，如果父级类型为1且没有设置跳转的情况下，子级类型为2，父级类型为2，子级类型为3
        if (obj.parent.menuType === '0' || obj.parent.menuType === '1') {
          this.inputForm.menuType = '1'
          this.typeListOptions = [
            {
              label: '目录',
              value: '1',
            },
            {
              label: '菜单',
              value: '2',
            },
          ]
        }
        else if (obj.parent.menuType === '2') {
          this.typeListOptions = [
            {
              label: '按钮',
              value: '3',
            },
          ]
          this.inputForm.menuType = '3'
        }
        this.title = '添加下级'
        if (this.inputForm.menuType === '3') {
          this.buttonOptions = this.menuOptions.find((option) => {
            return option.value === obj.parent.vueComponent
          }).children
        }
      }
      else if (method === 'edit') {
        this.title = '修改'
        this.inputForm = this.recover(this.inputForm, {
          ...obj.row,
          module: obj.row.module === 'true', // 是否为主页面
        })
      }
      else if (method === 'view') {
        this.title = '查看'
        this.inputForm = this.recover(this.inputForm, {
          ...obj.row,
          module: obj.row.module === 'true', // 是否为主页面
        })
      }
    },
    selectIcon() {
      this.$refs.icon.visible = true
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          saveMenu(this.inputForm).then((res) => {
            this.loading = false
            const resD = res.data
            if (resD && resD.success) {
              this.$message.success(resD.message)
              this.visible = false
              this.$emit('refreshDataList')
            }
            else {
              this.$message.error(resD.message)
            }
          })
        }
      })
    },
    // 设置app的菜单时，选中中文名称后，自动设置匹配的英文名
    appMenuChanged(v) {
      this.inputForm.englishName = this.appMenus.find((item) => {
        return item.label === v
      }).value
    },
    clearValidate() {
      this.$refs.inputForm.clearValidate()
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      :title="title + typeList[inputForm.menuType]"
      :close-on-click-modal="false"
      :visible.sync="visible"
      class="menu-form"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        size="small"
        :model="inputForm"
        :class="method === 'view' ? 'readonly' : ''"
        :disabled="method === 'view'"
        :rules="dataRule"
        label-width="100px"
        @submit.native.prevent
      >
        <el-form-item label="类型" prop="menuType">
          <el-select
            v-model="inputForm.menuType"
            placeholder="请选择"
            @change="clearValidate()"
          >
            <el-option
              v-for="item in typeListOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="
            method !== 'addChild'
              && inputForm.menuType !== '3'
              && inputForm.menuType !== '0'
          "
          label="选择上级"
          prop="parentId"
        >
          <SelectTree
            ref="officeTree"
            :props="{
              value: 'id', // ID字段名
              label: 'menuName', // 显示名称
              children: 'children', // 子级字段名
            }"
            :data="canAsParentMenu"
            :value="inputForm.parentId"
            :clearable="true"
            :accordion="true"
            @getValue="
              (value, title, node) => {
                inputForm.parentId = value;
                inputForm.channelType = node.channelType;
              }
            "
          />
        </el-form-item>
        <el-form-item label="名称" prop="menuName">
          <el-input
            v-show="inputForm.channelType === 'WEB' || inputForm.menuType === '0'"
            v-model="inputForm.menuName"
            :placeholder="`${typeList[inputForm.menuType]}名称`"
          />
          <el-select
            v-show="inputForm.channelType !== 'WEB' && inputForm.menuType !== '0'"
            v-model="inputForm.menuName"
            placeholder="请选择"
            style="width: 100%"
            @change="appMenuChanged"
          >
            <el-option
              v-for="item in appMenus"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="英文名" prop="englishName">
          <el-input
            v-model="inputForm.englishName"
            :placeholder="`${typeList[inputForm.menuType]}名称`"
            :disabled="inputForm.channelType !== 'WEB' && inputForm.menuType !== '0'"
          />
        </el-form-item>
        <el-form-item
          v-if="inputForm.menuType === '0'"
          label="归属"
          prop="channelType"
        >
          <el-select v-model="inputForm.channelType" placeholder="请选择">
            <el-option
              v-for="item in attributionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <template v-if="inputForm.channelType === 'WEB' || inputForm.menuType === '0'">
          <el-form-item
            v-if="inputForm.menuType === '2'"
            label="菜单类型"
            prop="pageSourceType"
          >
            <el-select
              v-model="inputForm.pageSourceType"
              placeholder="请选择"
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="item in $dictUtils.getDictList('page_source_type')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="
              (inputForm.menuType === '2' && inputForm.pageSourceType === '1')
                || inputForm.menuType === '3'
            "
            label="权限"
            prop="permissionFlag"
          >
            <el-input v-model="inputForm.permissionFlag" placeholder="请输入权限" />
          </el-form-item>
          <el-form-item
            v-if="inputForm.menuType === '2' && inputForm.pageSourceType === '1'"
            label="前端组件"
            prop="vueComponent"
          >
            <el-select
              v-model="inputForm.vueComponent"
              placeholder="请选择"
              filterable
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="item in menuOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <span style="float: left">{{ item.label }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{
                  item.describe
                }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="inputForm.menuType === '2' && inputForm.pageSourceType === '2'"
            label="可选画面"
            prop="externalUrl"
          >
            <el-select
              v-model="inputForm.externalUrl"
              placeholder="请选择"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in hmiList"
                :key="item.id"
                :label="item.name"
                :value="item.hmiIndex"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="inputForm.menuType === '3'"
            label="按钮组件"
            prop="vueComponent"
          >
            <el-select
              v-model="inputForm.vueComponent"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in buttonOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="inputForm.menuType === '2' && inputForm.pageSourceType === '3'"
            label="外链地址"
            prop="externalUrl"
          >
            <el-input v-model="inputForm.externalUrl" placeholder="请输入外链地址" />
          </el-form-item>
          <el-form-item
            v-if="inputForm.menuType === '2' && inputForm.pageSourceType === '3'"
            label="开启新页面打开"
            prop="remarks"
          >
            <el-radio v-model="inputForm.remarks" label="false">
              否
            </el-radio>
            <el-radio v-model="inputForm.remarks" label="true">
              是
            </el-radio>
          </el-form-item>
          <el-form-item
            v-if="inputForm.menuType === '2'"
            label="应用场景"
            prop="businessType"
          >
            <el-select
              v-model="inputForm.businessType"
              placeholder="请选择"
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="item in businessTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="inputForm.menuType !== '3'"
            label="图标"
            prop="icon"
          >
            <el-input
              v-model="inputForm.icon"
              clearable
              placeholder="菜单图标名称"
              @focus="selectIcon"
            />
          </el-form-item>
          <el-form-item label="排序号" prop="sort">
            <el-input-number
              v-model="inputForm.sort"
              :step="1"
              controls-position="right"
              :min="0"
              label="排序号"
            />
          </el-form-item>
        </template>
        <el-form-item label="是否通用" prop="canCommon">
          <el-switch v-model="inputForm.canCommon" />
        </el-form-item>
        <el-form-item
          v-if="inputForm.channelType === 'APP_MAIN'"
          label="是否为主页面"
          prop="module"
        >
          <el-switch v-model="inputForm.module" />
        </el-form-item>
        <!-- <el-form-item  label="备注" prop="remarks">
            <el-input type="textarea" :rows="2" v-model="inputForm.remarks"></el-input>
          </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">关闭</el-button>
        <el-button
          v-if="method != 'view'"
          v-noMoreClick
          size="small"
          type="primary"
          :loading="loading"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
    <Icon ref="icon" @getValue="(value) => (inputForm.icon = value)" />
  </div>
</template>

<style>
.menu-form .el-dialog {
	margin-top: 15px !important;
}
</style>
