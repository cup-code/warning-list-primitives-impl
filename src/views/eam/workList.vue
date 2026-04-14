<script>
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import {
  addFaultKnowledge,
  addRepair,
  addRepairPhoto,
  assignRepair,
  cancelRepair,
  deleteRepair,
  editRepair,
  editRepairState,
  exportRepairRecord,
  getAllAsset,
  getAllAssetType,
  getExecuteUsers,
  getFaultTypeList,
  getRepairList,
} from '@/http/eam-api'
import { formatDate } from '@/utils'

export default {
  data: () => ({
    loading: false,
    tableData: [],
    pageFlag: true,
    sForm: {
      page: 1,
      pageSize: 10,
    },
    total: 0,
    drawer: false,
    drawerType: 0,
    drawerTitle: '',
    form: {},
    rules: {},
    submitLoading: false,
    assetList: [],
    // 优先级列表
    levelList: [
      { name: '一般', value: 'ORDINARY' },
      { name: '报警', value: 'WARN' },
      { name: '紧急', value: 'URGENT' },
    ],
    // 记录状态列表
    stateList: [
      { name: '已创建', value: 'CREATED' },
      { name: '已取消', value: 'CANCEL' },
      { name: '已派单', value: 'ORDER_SENT' },
      { name: '已拒绝', value: 'REFUSED' },
      { name: '已接受', value: 'ACCEPTED' },
      { name: '已提交', value: 'SUBMITTED' },
      { name: '已驳回', value: 'REJECTED' },
      { name: '已确认', value: 'ONFIRMED' },
    ],
    drawer_sh: false,
    options: [], // 查询条件
    sFormCopy: null, // sForm的原始数据
    fileList: [], // 记录所选图片
    form_reject: {}, // 驳回表单
    rules_reject: {
      rejectReason: [{ required: true, message: '不能为空', trigger: 'blur' }],
    },
    addLoading: false,
    userList: [],
    form_appoint: {}, // 派单表单
    rules_appoint: {
      headman: [{ required: true, message: '请选择维修组长', trigger: 'change' }],
    },

    assetTypeList: [], // 资产类别列表
    faultTypeList: [], // 故障类型列表
    form_addTo: {}, // 添加到知识库表单
    rules_addTo: {
      faultTypeId: [{ required: true, message: '请选择故障类型', trigger: 'change' }],
    },
    isSendSms: ['邮件'],

    drawer_ex: false, // 后台导出
    exForm: {}, // 后台导出 筛选表单
  }),
  watch: {
    filePrefix(v) {
      const dt = this.tableData
      if (dt.length !== 0) {
        this.fixDataFn(dt)
      }
    },
  },
  created() {
    this.getPrefix()
    this.getDataList()
    this.getAllAssetList()
    this.getAllUsers()
    this.getAllAssetTypeList()
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true
      getRepairList(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            // this.tableData = resD.result || [];
            this.fixDataFn(resD.result.list || [])
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '查询工单失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询工单失败')
        })
    },
    // 查询所有资产列表
    getAllAssetList() {
      getAllAsset().then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.assetList = resD.result || []
        }
      })
    },
    // 查询所有执行人
    getAllUsers() {
      // 参数为 角色code: ROLE_INSPECTION(巡检角色)、 ROLE_MAINTENANCE(保养角色)、 ROLE_REPAIR(维修角色)
      getExecuteUsers('ROLE_REPAIR').then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.userList = resD.result || []
        }
      })
    },
    // 查询所有资产类型列表
    getAllAssetTypeList() {
      getAllAssetType().then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.assetTypeList = resD.result
        }
      })
    },
    // 根据资产类别id 查询故障类型列表
    getFaultTypeListById(id) {
      this.faultTypeList = []
      getFaultTypeList({ page: 1, pageSize: 10000, assetsTypeId: id }).then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.faultTypeList = resD.result.list || []
        }
      })
    },

    // 处理数据
    fixDataFn(dt) {
      this.tableData = dt.map((item) => {
        item.pictureList = (item.pictureList || []).map(i => this.filePrefix + i)

        // 可以派单的
        if (item.state === 'CREATED' || item.state === 'REFUSED') {
          item.atLoading = false // 派单loading状态
        }
        // 可以驳回和确认
        if (item.state === 'SUBMITTED') {
          item.rtLoading = false // 驳回loading状态
          item.cmLoading = false // 确认loading状态
        }

        // 可以 添加到知识库
        if (item.state === 'CONFIRMED') {
          item.addToLoading = false // 添加到知识库loading状态
        }

        return item
      })
    },
    pageSizeFn(v) {
      this.sForm.page = 1
      this.sForm.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    // 新增 工单
    addFn() {
      this.fileList = []

      this.form = {
        pictures: [],
      }
      this.drawerTitle = '新增工单'
      this.drawerType = 0
      this.drawer = true
    },
    // 编辑 工单
    editFn(v) {
      // 根据后台数据 生成el-upload可以识别的 fileList
      const pics = v.pictureList || []
      this.fileList = this.genFileList(pics)

      this.form = JSON.parse(JSON.stringify(v))
      this.drawerTitle = '编辑工单'
      this.drawerType = 1
      this.drawer = true
    },
    // 删除 工单
    delFn(v) {
      this.$confirm('您确认要删除工单', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteRepair(v.id)
            .then((res) => {
              this.loading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success === true) {
                this.$message.success(msg || '删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败!')
              }
            })
            .catch((err) => {
              this.loading = false
              this.$message.error('删除失败!')
            })
        })
        .catch(() => {})
    },
    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        // 添加
        if (this.drawerType === 0) {
          addRepair(this.form)
            .then((res) => {
              this.submitLoading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success) {
                this.$message.success(msg || '添加成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '添加失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('添加失败')
            })
        }
        // 编辑
        else {
          const {
            assetsId,
            assetsName,
            priorityLevel,
            place,
            trouble,
            repairContent,
            reason,
            id,
          }
            = this.form
          const params = {
            assetsId,
            assetsName,
            priorityLevel,
            place,
            trouble,
            repairContent,
            reason,
            id,
          }

          editRepair(params)
            .then((res) => {
              this.submitLoading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success) {
                this.$message.success(msg || '编辑成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '编辑失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('编辑失败')
            })
        }
      })
    },

    // ********************************* 老版本(上传图片没有单独的接口，在添加接口中上传图片)  begin *********************************
    // 上传组件的 change事件（移除时不会触发）
    // fileChangeFn(file, fileList) {
    //     this.fileList = fileList;
    //     this.form.pictures = this.fileList;
    // },
    // 移除图片
    // fileRemoveFn(file) {
    //     let idx = this.fileList.indexOf(file);
    //     this.fileList.splice(idx, 1);
    //     this.form.pictures = this.fileList;
    // },
    // ********************************* 老版本(上传图片没有单独的接口，在添加接口中上传图片)  end *********************************

    // ********************************* 新版本(上传图片有单独的接口)  begin *********************************
    // 上传组件的 change事件（移除时不会触发）
    fileChangeFn(file, fileList) {
      this.fileList = fileList

      this.addLoading = true
      addRepairPhoto(file.raw)
        .then((res) => {
          this.addLoading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || '上传成功')
            this.form.pictures.push(resD.result[0]) // 组装接口数据
          }
          else {
            this.$message.error(msg || '上传失败')
            this.fileList.pop() // 从界面上删除
          }
        })
        .catch((err) => {
          this.$message.error('上传失败')
          this.fileList.pop() // 从界面上删除
          this.addLoading = false
        })
    },
    // 移除图片
    fileRemoveFn(file) {
      const idx = this.fileList.indexOf(file)
      this.fileList.splice(idx, 1)
      this.form.pictures.splice(idx, 1)
    },
    // ********************************* 新版本(上传图片有单独的接口)  end *********************************

    // 资产change
    assetFn(v) {
      // 使用try方式， 可以实现 找到目标后终止遍历
      try {
        this.assetList.forEach((t) => {
          if (t.id == v) {
            this.form.assetsName = t.name
            throw '找到目标，终止遍历'
          }
        })
      }
      catch (e) {}
    },
    // 根据后台数据 生成el-upload可以识别的fileList
    genFileList(files) {
      let temp
      return files.map((item) => {
        temp = {}
        temp.url = item

        return temp
      })
    },

    // 确认工单 按钮
    confirmFn(v) {
      v.cmLoading = true

      // confirmed: true是确认工单、 false是驳回工单
      const params = { id: v.id, confirmed: true }
      editRepairState(params)
        .then((res) => {
          v.cmLoading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || '确认工单成功')
            this.getDataList()
          }
          else {
            this.$message.error(msg || '确认工单失败')
          }
        })
        .catch((err) => {
          v.cmLoading = false
          this.$message.error('确认工单失败')
        })
    },

    // 驳回工单 按钮
    rejectFn() {
      // 清空
      this.$set(this.form_reject, 'rejectReason', '')
    },
    // 驳回工单 确定按钮
    rejectDoneFn(v) {
      this.$refs[`rejectForm_${v.id}`].validate((valid) => {
        if (!valid)
          return

        v.rtLoading = true

        // 调用接口
        const params = { id: v.id, confirmed: false } // confirmed: true是确认工单、 false是驳回工单
        params.rejectReason = this.form_reject.rejectReason || '' // 驳回原因

        editRepairState(params)
          .then((res) => {
            v.rtLoading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              v.visible_reject = false
              this.$message.success(msg || '驳回工单成功')
              this.getDataList()
            }
            else {
              this.$message.error(msg || '驳回工单失败')
            }
          })
          .catch((err) => {
            v.rtLoading = false
            this.$message.error('驳回工单失败')
          })
      })
    },

    // 派单 按钮
    appointFn() {
      // 清空
      this.$set(this.form_appoint, 'headman', '')
      this.$set(this.form_appoint, 'teamMember', [])
      this.isSendSms = ['邮件']
    },
    // 派单 确定按钮
    appointDoneFn(v) {
      this.$refs[`appointForm_${v.id}`].validate((valid) => {
        if (!valid)
          return

        v.atLoading = true

        // 调用接口
        const params = {
          id: v.id,
          headman: this.form_appoint.headman,
          teamStr:
            this.form_appoint.teamMember.length > 0
              ? `&teamMember=${this.form_appoint.teamMember.join('&teamMember=')}`
              : '',
          isSendSms: !!this.isSendSms.includes('短信'),
        }

        assignRepair(params)
          .then((res) => {
            v.atLoading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              v.visible_appoint = false
              this.$message.success(msg || '派单成功')
              this.getDataList()
            }
            else {
              this.$message.error(msg || '派单失败')
            }
          })
          .catch((err) => {
            v.atLoading = false
            this.$message.error('派单失败')
          })
      })
    },

    // 撤销 按钮
    cancelFn(v) {
      this.$confirm('您确认要撤销此工单 ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // 调用接口
          cancelRepair(v.id)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              if (resD.success) {
                this.$message.success(msg || '撤销工单成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '撤销工单失败')
              }
            })
            .catch((err) => {
              this.$message.error('撤销工单失败')
            })
        })
        .catch(() => {})
    },

    // 添加到知识库 按钮
    addToFn(v) {
      // 清空
      this.$set(this.form_addTo, 'faultTypeId', '')

      // 根据资产id确定 资产类型 和 故障类型列表
      this.genTypeAndFaultType(v.assetsId)
    },
    // 添加到知识库 确定按钮
    addToDoneFn(v) {
      this.$refs[`addToForm_${v.id}`].validate((valid) => {
        if (!valid)
          return

        v.addToLoading = true

        // 调用接口
        const form = this.form_addTo
        const params = {
          assetsType: form.assetsType,
          assetsTypeId: form.assetsTypeId,
          faultType: form.faultType,
          faultTypeId: form.faultTypeId,
          reason: v.reason,
          repairContent: v.repairContent,
          trouble: v.trouble,
        }

        addFaultKnowledge(params)
          .then((res) => {
            v.addToLoading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              v.visible_addTo = false
              this.$message.success(msg || '添加知识成功')
            }
            else {
              this.$message.error(msg || '添加知识失败')
            }
          })
          .catch((err) => {
            v.addToLoading = false
            this.$message.error('添加知识失败')
          })
      })
    },
    // 根据资产id确定 资产类型 和 故障类型列表
    genTypeAndFaultType(id) {
      // 一、 找到对应资产
      try {
        this.assetList.forEach((asset) => {
          if (asset.id == id) {
            const assetTypeId = asset.assetsType // 资产类别id
            this.form_addTo.assetsTypeId = assetTypeId // 记录资产类别id

            // 二、 找到对应资产类别
            try {
              this.assetTypeList.forEach((aType) => {
                if (aType.id == assetTypeId) {
                  this.form_addTo.assetsType = aType.name // 记录资产类别name

                  throw '找到对应资产类别，终止遍历'
                }
              })
            }
            catch (e) {}

            // 三、 确定故障类型列表
            this.getFaultTypeListById(assetTypeId)

            throw '找到对应资产，终止遍历'
          }
        })
      }
      catch (e) {}
    },
    // 故障类型 change 事件
    fTypeFn(id) {
      try {
        this.faultTypeList.forEach((f) => {
          if (f.id == id) {
            this.form_addTo.faultType = f.name

            throw '找到对应故障类型，终止遍历'
          }
        })
      }
      catch (e) {}
    },

    // 查询产品 按钮
    searchFn() {
      this.drawer_sh = true

      // 记录sForm数据 到 sFormCopy
      this.sFormCopy = JSON.parse(JSON.stringify(this.sForm))
    },
    // 查询 按钮
    searchDoFn() {
      this.drawer_sh = false

      this.sFormCopy = JSON.parse(JSON.stringify(this.sForm))
      // 生成搜索条件数据
      this.genOpts()
    },
    // 生成搜索条件数据
    genOpts() {
      const opts = []
      let temp
      let key
      let val
      Object.entries(this.sForm).forEach((item) => {
        temp = {}
        key = item[0]
        val = `${item[1]}`
        if (key !== 'page' && key !== 'pageSize' && val) {
          temp.name = val
          temp.type = key

          let i, list, len, cur
          if (key === 'assetsId') {
            // 资产类别
            list = this.assetTypeList
            len = list.length
            for (i = 0; i < len; i++) {
              cur = list[i]
              if (cur.id == val) {
                temp.name = cur.fullName
                break
              }
            }
          }
          if (key === 'priorityLevel') {
            // 优先级
            list = this.levelList
            len = list.length
            for (i = 0; i < len; i++) {
              cur = list[i]
              if (cur.value == val) {
                temp.name = cur.name
                break
              }
            }
          }
          if (key === 'state') {
            // 记录状态
            list = this.stateList
            len = list.length
            for (i = 0; i < len; i++) {
              cur = list[i]
              if (cur.value == val) {
                temp.name = cur.name
                break
              }
            }
          }

          opts.push(temp)
        }
      })
      // 页面展示查询条件需要的 list
      this.options = opts

      // 根据新生成的sForm, 重新请求数据
      this.sForm.page = 1
      this.sForm.pageSize = 10
      this.getDataList()
    },
    // 查询抽屉的 关闭
    dCloseFn() {
      this.sForm = JSON.parse(JSON.stringify(this.sFormCopy))
    },
    // 移除筛选条件
    removeFn(v) {
      const opts = this.options
      const idx = opts.indexOf(v)
      this.options.splice(idx, 1)

      Object.keys(this.sForm).forEach((key) => {
        if (v.type === key) {
          this.sForm[key] = ''
        }
      })

      // 根据新生成的sForm, 重新请求数据
      this.sForm.page = 1
      this.sForm.pageSize = 10
      this.getDataList()
    },

    // 导出
    exportFn() {
      const param = {
        raw: true, // 表示导出的数据 是否是未加工的
      }
      // 从表生成工作簿对象
      const wb = XLSX.utils.table_to_book(document.getElementById('down_table'), param)

      // 获取二进制字符串作为输出
      const wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array',
      })

      // 生成文件名
      const fileName = '维修工单'

      try {
        FileSaver.saveAs(
          // Blob 对象表示一个不可变、原始数据的类文件对象。
          // Blob 表示的不一定是JavaScript原生格式的数据。//File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。
          // 返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
          new Blob([wbout], { type: 'application/octet-stream' }),
          // 设置导出文件名称
          `${fileName}.xlsx`,
        )
      }
      catch (e) {
        if (typeof console !== 'undefined')
          console.log(e, wbout)
      }
      return wbout
    },

    // 后台导出 按钮
    backExportFn() {
      this.drawer_ex = true
      this.exForm = Object.assign({}, this.sForm)
    },
    // 后台导出 确定
    backExportDoFn() {
      exportRepairRecord(this.exForm).then((res) => {
        const resD = res.data
        const msg = resD.message
        if (resD.success) {
          window.open(resD.result, '_self')
        }
        else {
          this.$message.error(msg || '导出失败')
        }
      })
    },
  },
}
</script>

<template>
  <div class="workList-eam">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="12">
        <!-- <el-button type="primary" icon="el-icon-plus" size="mini" @click="addFn">新增</el-button> -->
        <!-- <el-button type="success" icon="el-icon-download" size="mini" @click="exportFn">导出</el-button> -->
        <el-button
          type="success"
          icon="el-icon-download"
          size="mini"
          @click="backExportFn"
        >
          导出
        </el-button>
      </el-col>
      <el-col
        :span="12"
        class="cdns-con"
      >
        <div class="cdns">
          <transition-group name="toUp">
            <el-tag
              v-for="item in options"
              :key="item.name"
              type="danger"
              size="small"
              closable
              @close="removeFn(item)"
            >
              {{ item.name }}
            </el-tag>
          </transition-group>
        </div>
        <el-button
          size="mini"
          type="primary"
          @click="searchFn"
        >
          查询
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          id="down_table"
          v-loading="loading"
          class="group-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form
                label-position="left"
                inline
                class="expand-form"
                size="mini"
              >
                <el-form-item
                  v-if="props.row.findByName"
                  label="发现人:"
                >
                  <span>{{ props.row.findByName }}</span>
                </el-form-item>
                <el-form-item
                  v-if="props.row.assignInfos"
                  label="维修组长:"
                >
                  <span>{{
                    props.row.assignInfos
                      .filter(item => item.isHeadman)
                      .map(item => item.userName)
                      .join(', ')
                  }}</span>
                </el-form-item>
                <el-form-item
                  v-if="props.row.assignInfos"
                  label="维修组员:"
                >
                  <span>{{
                    props.row.assignInfos
                      .filter(item => !item.isHeadman)
                      .map(item => item.userName)
                      .join(', ')
                  }}</span>
                </el-form-item>
                <el-form-item
                  v-if="props.row.place"
                  label="地点:"
                >
                  <span>{{ props.row.place }}</span>
                </el-form-item>
                <el-form-item
                  v-if="props.row.repairContent"
                  label="维修内容:"
                >
                  <span>{{ props.row.repairContent }}</span>
                </el-form-item>
                <el-form-item
                  v-if="props.row.reason"
                  label="问题原因:"
                >
                  <span>{{ props.row.reason }}</span>
                </el-form-item>
                <el-form-item
                  v-if="props.row.rejectInfos"
                  label="工单驳回原因:"
                >
                  <span>{{
                    (props.row.rejectInfos || []).map(item => item.rejectReason).join('; ')
                  }}</span>
                </el-form-item>
                <el-form-item
                  v-if="props.row.refuseInfos"
                  label="工单被拒绝原因:"
                >
                  <span>{{
                    (props.row.refuseInfos || []).map(item => item.refuseReason).join('; ')
                  }}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column
            label="资产"
            prop="assetsName"
            align="center"
          />
          <el-table-column
            label="优先级"
            prop="priorityLevel"
            align="center"
          >
            <template slot-scope="props">
              <el-tag
                v-if="props.row.priorityLevel === 'ORDINARY'"
                size="mini"
              >
                一般
              </el-tag>
              <el-tag
                v-if="props.row.priorityLevel === 'WARN'"
                size="mini"
                type="warning"
              >
                报警
              </el-tag>
              <el-tag
                v-if="props.row.priorityLevel === 'URGENT'"
                size="mini"
                type="danger"
              >
                紧急
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="故障图片"
            prop="pictureList"
            align="center"
            width="100"
          >
            <template slot-scope="props">
              <div class="icons-cell">
                <el-popover
                  v-for="(item, key) in props.row.pictureList"
                  :key="key"
                  class="icon-pop"
                  placement="right"
                  trigger="click"
                >
                  <img
                    :src="item"
                    style="height: 200px"
                  >
                  <img
                    slot="reference"
                    :src="item"
                    style="height: 100%"
                  >
                </el-popover>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="问题描述"
            prop="trouble"
            align="center"
          />
          <el-table-column
            label="创建人"
            prop="createdBy"
            align="center"
          />
          <el-table-column
            label="创建时间"
            prop="createdTime"
            align="center"
            width="150"
          >
            <template slot-scope="props">
              {{ formatDate(props.row.createdTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            prop="state"
            align="center"
          >
            <template slot-scope="props">
              <el-tag
                v-if="props.row.state === 'CREATED'"
                size="mini"
                type="warning"
              >
                已创建
              </el-tag>
              <el-tag
                v-if="props.row.state === 'ORDER_SENT'"
                size="mini"
                type="success"
              >
                已派单
              </el-tag>
              <el-tag
                v-if="props.row.state === 'REFUSED'"
                size="mini"
                type="danger"
              >
                已拒绝
              </el-tag>
              <el-tag
                v-if="props.row.state === 'ACCEPTED'"
                size="mini"
                type="warning"
              >
                已接受
              </el-tag>
              <el-tag
                v-if="props.row.state === 'SUBMITTED'"
                size="mini"
                type="success"
              >
                已提交
              </el-tag>
              <el-tag
                v-if="props.row.state === 'REJECTED'"
                size="mini"
                type="danger"
              >
                已驳回
              </el-tag>
              <el-tag
                v-if="props.row.state === 'CONFIRMED'"
                size="mini"
                type="success"
              >
                已结单
              </el-tag>
              <el-tag
                v-if="props.row.state === 'CANCEL'"
                size="mini"
                type="danger"
              >
                已撤销
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <!-- 不允许编辑 -->
              <!-- <el-button @click="editFn(scope.row)" size="mini" type="primary">编辑</el-button> -->
              <!-- 不允许删除 -->
              <!-- <el-button @click="delFn(scope.row)" size="mini" type="danger">删除</el-button> -->

              <!-- 状态为 已创建、已拒绝时， 才有 派单，也可以撤销工单 -->
              <el-popover
                v-model="scope.row.visible_appoint"
                width="260"
              >
                <el-form
                  :ref="`appointForm_${scope.row.id}`"
                  :model="form_appoint"
                  :rules="rules_appoint"
                  label-width="70px"
                  size="mini"
                >
                  <el-form-item
                    label="维修组长"
                    prop="headman"
                  >
                    <el-select
                      v-model="form_appoint.headman"
                      placeholder="请选择"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in userList"
                        :key="item.id"
                        :label="item.username"
                        :value="item.id"
                      >
                        <span>{{ item.username }}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="维修组员"
                    prop="teamMember"
                  >
                    <el-select
                      v-model="form_appoint.teamMember"
                      multiple
                      placeholder="请选择"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in userList"
                        :key="item.id"
                        :label="item.username"
                        :value="item.id"
                      >
                        <span>{{ item.username }}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="通知方式"
                    prop="isSendSms"
                    style="margin-bottom: 10px"
                  >
                    <el-checkbox-group v-model="isSendSms">
                      <el-checkbox
                        label="邮件"
                        disabled
                      />
                      <el-checkbox label="短信" />
                    </el-checkbox-group>
                  </el-form-item>
                </el-form>

                <div style="text-align: right; margin: 0">
                  <el-button
                    size="mini"
                    type="text"
                    @click="scope.row.visible_appoint = false"
                  >
                    取消
                  </el-button>
                  <el-button
                    size="mini"
                    type="primary"
                    :loading="scope.row.atLoading"
                    @click="appointDoneFn(scope.row)"
                  >
                    确定
                  </el-button>
                </div>
                <el-button
                  v-show="scope.row.state === 'CREATED' || scope.row.state === 'REFUSED'"
                  slot="reference"
                  size="mini"
                  type="success"
                  @click="appointFn"
                >
                  派单
                </el-button>
              </el-popover>

              <!-- 工单状态为 已创建、已拒绝时， 可撤销 -->
              <el-button
                v-if="scope.row.state === 'CREATED' || scope.row.state === 'REFUSED'"
                size="mini"
                type="danger"
                style="margin-left: 10px"
                @click="cancelFn(scope.row)"
              >
                撤销
              </el-button>

              <!-- 状态为 已提交时， 才有 驳回和确认 -->
              <!-- 驳回 -->
              <el-popover
                v-model="scope.row.visible_reject"
                width="260"
              >
                <el-form
                  :ref="`rejectForm_${scope.row.id}`"
                  :model="form_reject"
                  :rules="rules_reject"
                  label-width="70px"
                  size="mini"
                >
                  <el-form-item
                    label="驳回原因"
                    prop="rejectReason"
                  >
                    <el-input v-model="form_reject.rejectReason" />
                  </el-form-item>
                </el-form>

                <div style="text-align: right; margin: 0">
                  <el-button
                    size="mini"
                    type="text"
                    @click="scope.row.visible_reject = false"
                  >
                    取消
                  </el-button>
                  <el-button
                    size="mini"
                    type="primary"
                    :loading="scope.row.rtLoading"
                    @click="rejectDoneFn(scope.row)"
                  >
                    确定
                  </el-button>
                </div>
                <el-button
                  v-show="scope.row.state === 'SUBMITTED'"
                  slot="reference"
                  size="mini"
                  type="danger"
                  style="margin: 0 10px"
                  @click="rejectFn"
                >
                  驳回
                </el-button>
              </el-popover>

              <!-- 确认 -->
              <el-button
                v-if="scope.row.state === 'SUBMITTED'"
                :loading="scope.row.cmLoading"
                size="mini"
                type="success"
                @click="confirmFn(scope.row)"
              >
                确认
              </el-button>

              <!-- 添加到知识库 -->
              <el-popover
                v-model="scope.row.visible_addTo"
                width="260"
              >
                <el-form
                  :ref="`addToForm_${scope.row.id}`"
                  :model="form_addTo"
                  :rules="rules_addTo"
                  label-width="70px"
                  size="mini"
                >
                  <el-form-item
                    label="故障类型"
                    prop="faultTypeId"
                  >
                    <el-select
                      v-model="form_addTo.faultTypeId"
                      placeholder="请选择故障类型"
                      style="width: 100%"
                      @change="fTypeFn"
                    >
                      <el-option
                        v-for="item in faultTypeList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                      >
                        <span>{{ item.name }}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-form>
                <div style="text-align: right; margin: 0">
                  <el-button
                    size="mini"
                    type="text"
                    @click="scope.row.visible_addTo = false"
                  >
                    取消
                  </el-button>
                  <el-button
                    size="mini"
                    type="primary"
                    :loading="scope.row.addToLoading"
                    @click="addToDoneFn(scope.row)"
                  >
                    确定
                  </el-button>
                </div>

                <el-button
                  v-show="scope.row.state === 'CONFIRMED'"
                  slot="reference"
                  size="mini"
                  type="danger"
                  style="margin: 0 10px"
                  @click="addToFn(scope.row)"
                >
                  添加到知识库
                </el-button>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 页码 -->
    <el-row>
      <el-pagination
        v-if="pageFlag"
        style="text-align: right"
        :current-page="sForm.page"
        :page-sizes="[10, 20, 50]"
        :page-size="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </el-row>

    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
    >
      <div
        v-loading="addLoading"
        style="display: flex; flex-direction: column; overflow: hidden"
      >
        <!-- 标题 -->
        <div class="drawer-title">
          {{ drawerTitle }}
        </div>

        <!-- 分割线 -->
        <el-divider />

        <!-- 内容 -->
        <div class="drawer-con">
          <el-form
            ref="form"
            :model="form"
            label-width="65px"
            :rules="rules"
            size="mini"
          >
            <el-form-item
              label="资产"
              prop="assetsId"
            >
              <el-select
                v-model="form.assetsId"
                placeholder="请选择"
                style="width: 100%"
                @change="assetFn"
              >
                <el-option
                  v-for="item in assetList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                  <span>{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="优先级"
              prop="priorityLevel"
            >
              <el-select
                v-model="form.priorityLevel"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in levelList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                >
                  <span>{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="资产图片">
              <el-upload
                :class="drawerType == 0 ? '' : 'hide-upload'"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :on-change="fileChangeFn"
                :file-list="fileList"
              >
                <template #default>
                  <i class="el-icon-plus" />
                </template>
                <template #file="{ file }">
                  <div>
                    <img
                      class="el-upload-list__item-thumbnail"
                      :src="file.url"
                      alt=""
                    >
                    <span
                      v-show="drawerType == 0"
                      class="el-upload-list__item-actions"
                    >
                      <span
                        class="el-upload-list__item-delete"
                        @click="fileRemoveFn(file)"
                      >
                        <i class="el-icon-delete" />
                      </span>
                    </span>
                  </div>
                </template>
              </el-upload>
            </el-form-item>
            <el-form-item
              label="地点"
              prop="place"
            >
              <el-input v-model="form.place" />
            </el-form-item>
            <el-form-item
              label="问题描述"
              prop="trouble"
            >
              <el-input v-model="form.trouble" />
            </el-form-item>
            <el-form-item
              label="维修内容"
              prop="repairContent"
            >
              <el-input v-model="form.repairContent" />
            </el-form-item>
            <el-form-item
              label="问题原因"
              prop="reason"
            >
              <el-input v-model="form.reason" />
            </el-form-item>
          </el-form>

          <div style="text-align: center">
            <el-button
              size="mini"
              type="primary"
              :loading="submitLoading"
              @click="submitFn"
            >
              提交
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 查询 抽屉 -->
    <el-drawer
      :visible.sync="drawer_sh"
      :with-header="false"
      @close="dCloseFn"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        查询条件
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="sForm"
          :model="sForm"
          label-width="60px"
          size="mini"
        >
          <el-form-item label="问题描述">
            <el-input v-model="sForm.trouble" />
          </el-form-item>
          <el-form-item label="资产类型">
            <el-select
              v-model="sForm.assetsId"
              placeholder="请选择"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in assetTypeList"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              >
                <span>{{ item.fullName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="优先级">
            <el-select
              v-model="sForm.priorityLevel"
              placeholder="请选择"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in levelList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="记录状态">
            <el-select
              v-model="sForm.state"
              placeholder="请选择"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in stateList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            @click="searchDoFn"
          >
            查询
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 后台导出 抽屉 -->
    <el-drawer
      :visible.sync="drawer_ex"
      :with-header="false"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        筛选条件
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="exForm"
          :model="exForm"
          label-width="60px"
          size="mini"
        >
          <el-form-item label="问题描述">
            <el-input v-model="exForm.trouble" />
          </el-form-item>
          <el-form-item label="资产类型">
            <el-select
              v-model="exForm.assetsId"
              placeholder="请选择"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in assetTypeList"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              >
                <span>{{ item.fullName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="优先级">
            <el-select
              v-model="exForm.priorityLevel"
              placeholder="请选择"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in levelList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="记录状态">
            <el-select
              v-model="exForm.state"
              placeholder="请选择"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in stateList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="success"
            @click="backExportDoFn"
          >
            导出
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.workList-eam {
  position: relative;
  padding: 10px;
  .cdns-con {
    display: flex;
    justify-content: flex-end;
    .cdns {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .el-tag {
        margin-right: 6px;
      }
    }
  }
  .mid-con {
    padding: 2vh 0;
    .group-table {
      .expand-form {
        .el-form-item {
          margin-bottom: 0;
          margin-right: 30px;
          .el-form-item__label {
            padding-right: 6px;
          }
        }
      }
      .el-button {
        padding: 5px 7px;
      }
      .icons-cell {
        display: flex;
        overflow: auto;
        .icon-pop {
          height: 30px;
          margin-right: 10px;
          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
  }
  // 上传图片的加号盒子
  .el-upload--picture-card {
    width: 80px;
    height: 80px;
    line-height: 90px;
  }
  // 展示每个图片的容器
  .el-upload-list--picture-card .el-upload-list__item {
    width: 80px;
    height: 80px;
    & > div {
      height: 100%;
    }
  }
  // 如果是编辑， 则隐藏上传图片按钮
  .hide-upload > .el-upload.el-upload--picture-card {
    display: none;
  }
}
</style>
