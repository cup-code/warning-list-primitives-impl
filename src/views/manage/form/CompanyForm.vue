<script>
import basePic from '@/assets/anqiBi/yichang04.png'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getBaseUrl } from '@/http/common/utils'
import { upLoadImgNoOriName } from '@/http/manage-api'
import {
  getChildCity,
  getExternalPlatform,
  getProvinces,
  saveChildCompany,
  saveFirstCompany,
} from '@/http/safe-production/company-manage-api'
import Cropper from '@/views/common-ui/Cropper'

export default {
  components: {
    SelectTree,
    Cropper,
  },
  props: {
    method: {
      type: String,
      default: '',
    },
    obj: {
      type: Object,
      default() {
        return {}
      },
    },
    row: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      title: '新增',
      loading: false,
      inputForm: {
        id: '',
        parentId: '', // 上级id，没有则说明是一级公司
        companyName: '', // 企业名称
        socialCreditCode: '', // 统一社会信用代码
        tenantCode: '', // 租户编码
        trade: [], // 行业
        major: [], // 专业
        province: '', // 省
        city: '', // 市
        county: '', // 区
        detailedAddress: '', // 详细地址
        contacts: '', // 联系人
        contactsPhone: '', // 联系人电话
        legalPerson: '', // 法人
        legalPersonPhone: '', // 法人电话
        maxCompanies: '', // 最大公司数量
        companyNo: '', // 公司代码
        maxUsers: '', // 最大用户人数
        businessScope: '', // 经营范围
        operatingProducts: '', // 主要产品
        longitudeLatitude: [], // 经纬度
        logo: '', // 企业logo
        businessLicense: '', // 营业执照
        fourColorGraph: '', // 平面四色图
        area: '', // 所属区域，表格回显的
        buildId: '', // 在定位引擎中的建筑id
        shrinkLogo: '', // 收缩logo
        webIcon: '', // 网站icon
        safeProductionStart: '', // 安全生产起始日期
        externalPlatformId: '', // 外部平台id
      },
      externalPlatformList: [], // 外部平台id选择列表
      dataRule: {
        companyName: [{ required: true, message: '公司名称不能为空', trigger: 'blur' }],
        tenantCode: [{ required: true, message: '租户编码不能为空', trigger: 'blur' }],
        // contactsPhone: [
        //   {required: true, message: '联系人电话不能为空', trigger: 'blur'},
        //   {validator: this.validator.isMobile, trigger:'blur'}
        // ]
      },
      logoFileList: [],
      businessLicenseFileList: [],
      fourColorGraphFileList: [],
      shrinkLogoFileList: [],
      webIconFileList: [],
      hideUpload: {
        logo: false,
        businessLicense: false,
        fourColorGraph: false,
        shrinkLogo: false,
        webIcon: false,
      },
      provinceOptions: [],
      cityOptions: [],
      countyOptions: [],
      header: {
        Authorization: localStorage.getItem('tk'),
        clientChannel: 'WEB',
      },
      actionUrl: '',
      // myLogo: {
      //     headurl: '',
      // },
      // uploadData: { // 上传需要的额外参数
      //     siteId: 1,
      //     source: 1,
      //     fileName: ''
      // },
      // action: 'https://jsonplaceholder.typicode.com/posts/', // 上传地址，必填
      // logoUrl: '',
      cropperImg: '', // 需要裁剪的图片
      showCropper: false, // 是否显示裁剪框
      uploadFile: '', // 裁剪后的文件
      layer: 1,
      layerList: [
        // {name: '地市', id: 1},
        { name: '大陆', id: 2 },
        // {name: '全球', id: 3},
      ],
      basePic,
      markList: [],
    }
  },
  created() {
    this.getPrefix()
    this.init(this.method, this.obj, this.row)
  },
  mounted() {
    getProvinces().then(({ data }) => {
      if (data.success) {
        this.provinceOptions = data.result || []
      }
    })
    this.getRequestUrl()
    this.getExternalPlat()
  },
  methods: {
    // 获取绑定oa公司列表
    getExternalPlat() {
      getExternalPlatform(this.inputForm.tenantCode)
        .then(({ data }) => {
          if (data.success) {
            this.externalPlatformList = data.result
            if (
              this.inputForm.externalPlatformId == '0'
              || this.inputForm.externalPlatformId == ''
            ) {
              this.externalPlatformList.push({
                subcompanyid: '0',
                shortname: '无',
              })
            }
          }
          else {
            this.$message.warning('绑定oa公司列表请求失败')
          }
        })
        .catch((err) => {
          this.$message.error('绑定oa公司列表请求出错', err)
        })
    },
    // 选择图片后做图片格式限制（手动上传图片时，before-upload钩子无效，使用此方法替代）
    imageChange(file) {
      // console.log(file)
      const isPNG = /^.png$/.test(file.name.substring(file.name.lastIndexOf('.')))
      const isLt100KB = file.size / 1024 < 100

      if (!isPNG) {
        this.$message.error('上传图片只能是 PNG 格式!')
        return false
      }
      if (!isLt100KB) {
        this.$message.error('上传图片大小不能超过 80KB!')
        return false
      }
      let is80x56 = true
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (theFile) => {
        const image = new Image()
        image.src = theFile.target.result
        image.onload = () => {
          const { width, height } = image
          if (width >= 1000 || height >= 1000) {
            this.$message.error('请上传 小于1000*1000 的图片！')
            is80x56 = false
          }
        }
      }
      return isPNG && isLt100KB && is80x56
    },
    async getRequestUrl() {
      const baseUrl = await getBaseUrl()
      this.actionUrl = `${baseUrl}sys/uploadFile`
    },
    init(method, obj, row) {
      this.inputForm.id = obj.id
      this.inputForm.parentId = obj.parent.id
      this.inputForm.tenantCode = row.tenantCode
      this.inputForm.externalPlatformId = row.externalPlatformId || ''
      if (method === 'add') {
        this.title = '新增企业'
      }
      else if (method === 'addChild') {
        this.title = '新增子公司'
      }
      else if (method === 'edit') {
        this.title = '修改公司信息'
      }
      else if (method === 'view') {
        this.title = '查看公司信息'
      }

      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.inputForm.area = ''
        this.inputForm.trade = [] // 不知道为什么数组格式的没有重置，待解决
        this.inputForm.major = []
        // console.log(this.inputForm)
        if (this.inputForm.id) {
          if (row.logo) {
            this.logoFileList = [
              {
                url: this.filePrefix + row.logo,
              },
            ]
            this.hideUpload.logo = true
          }
          if (row.businessLicense) {
            this.businessLicenseFileList = [
              {
                url: this.filePrefix + row.businessLicense,
              },
            ]
            this.hideUpload.businessLicense = true
          }
          if (row.fourColorGraph) {
            this.fourColorGraphFileList = [
              {
                url: this.filePrefix + row.fourColorGraph,
              },
            ]
            this.hideUpload.fourColorGraph = true
          }
          if (row.webIcon) {
            this.webIconFileList = [
              {
                url: this.filePrefix + row.webIcon,
              },
            ]
            this.hideUpload.webIcon = true
          }
          if (row.shrinkLogo) {
            this.shrinkLogoFileList = [
              {
                url: this.filePrefix + row.shrinkLogo,
              },
            ]
            this.hideUpload.shrinkLogo = true
          }
          row.trade = row.trade ? row.trade.split(',') : []
          row.major = row.major ? row.major.split(',') : []
          this.inputForm = this.recover(this.inputForm, row)
          // 如果有区域信息，则需要获取区域list
          if (this.inputForm.province) {
            this.getCitys(this.inputForm.province)
          }
          if (this.inputForm.city) {
            this.getCountys(this.inputForm.city)
          }
          if (this.inputForm.county) {
            this.getCountyName(this.inputForm.county)
          }
          if (row.longitudeLatitude && row.longitudeLatitude.length > 0) {
            const mark = {
              markLeft: row.longitudeLatitude[0],
              markTop: row.longitudeLatitude[1],
            }
            this.$set(this.markList, 0, mark)
          }
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.inputForm.trade = this.inputForm.trade.join()
          this.inputForm.major = this.inputForm.major.join()
          this.inputForm.area
            = (this.provinceName || '') + (this.cityName || '') + (this.countyName || '')
          const submitFn = this.inputForm.parentId ? saveChildCompany : saveFirstCompany
          submitFn(this.inputForm).then(({ data }) => {
            this.loading = false
            if (data.success) {
              this.$message.success(data.message)
              this.closeClick(true)
            }
            else {
              this.$message.error(data.message)
              this.inputForm.trade = this.inputForm.trade ? this.inputForm.trade.split() : []
              this.inputForm.major = this.inputForm.major ? this.inputForm.major.split() : []
            }
          })
        }
      })
    },
    getCitys(v) {
      this.provinceName = v.split('+')[1]
      const id = v.split('+')[0]
      this.inputForm.province = v
      getChildCity(id).then(({ data }) => {
        if (data.success) {
          this.cityOptions = data.result || []
        }
      })
    },
    getCountys(v) {
      this.cityName = v.split('+')[1]
      const id = v.split('+')[0]
      this.inputForm.city = v
      getChildCity(id).then(({ data }) => {
        if (data.success) {
          this.countyOptions = data.result || []
        }
      })
    },
    getCountyName(v) {
      this.countyName = v.split('+')[1]
      // console.log(this.countyName)
      // this.inputForm.county = v.split('+')[0]
      this.inputForm.county = v
    },
    fileSuccessFn(name, res, file, fileList) {
      if (res.success) {
        // console.log(name)
        this[`${name}FileList`] = fileList
        this.hideUpload[name] = this[`${name}FileList`].length >= 1
        this.inputForm[name] = res.result
      }
      else {
        this.$message.error(res.message)
      }
    },
    fileRemoveFn(name, file) {
      const idx = this[`${name}FileList`].indexOf(file)
      this[`${name}FileList`].splice(idx, 1)
      this.inputForm[name] = ''
      this.hideUpload[name] = this[`${name}FileList`].length >= 1
    },
    // 下面这部分为上传企业logo是需要做裁剪的代码
    // 图片上传
    // httpRequest(request) {
    //     console.log(request)
    //     const { data, filename} = request;
    //     // 新建formDate对象
    //     let formData = new FormData();
    //     for (let key in data) {
    //         formData.append(key, data[key]);
    //     }
    //     // 文件单独push,第三个参数指定上传的文件名
    //     formData.append(filename, this.uploadFile, data.fileName);
    // },
    // 选择文件
    selectChange(file) {
      const { raw, name } = file
      this.openCropper(raw)
      // this.uploadData.fileName = name;
    },
    /**
     * @param {file} 上传的文件
     */
    openCropper(file) {
      const files = file
      const isLt5M = files.size > 5 << 20
      if (isLt5M) {
        this.$message.error('请上传5M内的图片')
        return false
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        let data
        if (typeof e.target.result === 'object') {
          // 把Array Buffer转化为blob 如果是base64不需要
          data = window.URL.createObjectURL(new Blob([e.target.result]))
        }
        else {
          data = e.target.result
        }
        this.cropperImg = data
      }
      // 转化为base64
      // reader.readAsDataURL(file)
      // 转化为blob
      reader.readAsArrayBuffer(files)
      this.showCropper = true
    },
    // 上传图片
    uploadImg(file) {
      this.uploadFile = file
      // console.log(file)
      upLoadImgNoOriName(file, 'COMPANY_LOGO_PATH').then(({ data }) => {
        // console.log(data)
        this.inputForm.logo = data.result || ''
      })
      this.closeDialog()
    },
    // 关闭窗口
    closeDialog() {
      this.showCropper = false
    },
    /* 关闭弹窗 */
    closeClick(isRefresh) {
      this.$emit('succ', isRefresh)
    },
    // 裁剪代码结束

    panelTap(e) {
      const { offsetWidth, offsetHeight } = e.target.offsetParent
      const { offsetX, offsetY } = e
      const x = offsetX / offsetWidth
      const y = offsetY / offsetHeight
      const mark = {
        markLeft: `${x * 100}%`,
        markTop: `${y * 100}%`,
      }
      this.$set(this.markList, 0, mark)
      this.inputForm.longitudeLatitude = [mark.markLeft, mark.markTop]
    },
  },
}
</script>

<template>
  <div class="form-container">
    <div class="dialog-info">
      <el-form
        ref="inputForm"
        v-loading="loading"
        size="small"
        :model="inputForm"
        :rules="dataRule"
        label-width="150px"
        :class="method === 'view' ? 'readonly' : ''"
        :disabled="method === 'view'"
        @keyup.enter.native="doSubmit()"
        @submit.native.prevent
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="公司名称"
              prop="companyName"
            >
              <el-input v-model="inputForm.companyName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="统一社会信用代码"
              prop="socialCreditCode"
            >
              <el-input v-model="inputForm.socialCreditCode" />
            </el-form-item>
          </el-col>
          <el-col
            v-if="!inputForm.parentId"
            :span="12"
          >
            <el-form-item
              label="租户编码"
              prop="tenantCode"
            >
              <el-input
                v-model="inputForm.tenantCode"
                :disabled="method === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="所属行业"
              prop="trade"
            >
              <el-select
                v-model="inputForm.trade"
                multiple
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('industry_type')"
                  :key="item.id"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="所属领域"
              prop="major"
            >
              <el-select
                v-model="inputForm.major"
                multiple
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('major_type')"
                  :key="item.id"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-row>
              <el-col :span="12">
                <el-form-item
                  label="所属区域"
                  prop="province"
                >
                  <el-select
                    v-model="inputForm.province"
                    placeholder="省"
                    style="width: 100%"
                    @change="getCitys"
                  >
                    <el-option
                      v-for="item in provinceOptions"
                      :key="item.districtCode"
                      :label="item.districtName"
                      :value="`${item.districtCode}+${item.districtName}`"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item
                  prop="city"
                  label-width="16px"
                >
                  <el-select
                    v-model="inputForm.city"
                    placeholder="市"
                    style="width: 100%"
                    @change="getCountys"
                  >
                    <el-option
                      v-for="item in cityOptions"
                      :key="item.districtCode"
                      :label="item.districtName"
                      :value="`${item.districtCode}+${item.districtName}`"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item
                  prop="county"
                  label-width="16px"
                >
                  <el-select
                    v-model="inputForm.county"
                    placeholder="区/县"
                    style="width: 100%"
                    @change="getCountyName"
                  >
                    <el-option
                      v-for="item in countyOptions"
                      :key="item.districtCode"
                      :label="item.districtName"
                      :value="`${item.districtCode}+${item.districtName}`"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="详细地址"
              prop="detailedAddress"
            >
              <el-input v-model="inputForm.detailedAddress" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="联系人"
              prop="contacts"
            >
              <el-input v-model="inputForm.contacts" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="联系人电话"
              prop="contactsPhone"
            >
              <el-input v-model="inputForm.contactsPhone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="法人"
              prop="legalPerson"
            >
              <el-input v-model="inputForm.legalPerson" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="法人电话"
              prop="legalPersonPhone"
            >
              <el-input v-model="inputForm.legalPersonPhone" />
            </el-form-item>
          </el-col>
          <el-col
            v-if="!inputForm.parentId"
            :span="12"
          >
            <el-form-item
              label="最大公司数量"
              prop="maxCompanies"
            >
              <el-input v-model="inputForm.maxCompanies" />
            </el-form-item>
          </el-col>
          <el-col
            v-if="!inputForm.parentId"
            :span="12"
          >
            <el-form-item
              label="最大用户人数"
              prop="maxUsers"
            >
              <el-input v-model="inputForm.maxUsers" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="主要产品"
              prop="operatingProducts"
            >
              <el-input
                v-model="inputForm.operatingProducts"
                type="textarea"
                :rows="1"
                placeholder="请输入内容"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="建筑ID"
              prop="buildId"
            >
              <el-select
                v-model="inputForm.buildId"
                :disabled="isCheck"
                placeholder="请选择建筑名称"
              >
                <el-option
                  v-for="(item, index) in $dictUtils.getDictList('3DModel')"
                  :key="index"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
              <!-- <el-input v-model="inputForm.buildId"></el-input> -->
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="生产起始日期"
              prop="safeProductionStart"
            >
              <el-date-picker
                v-model="inputForm.safeProductionStart"
                type="date"
                placeholder="生产起始日期"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="绑定oa公司"
              prop="externalPlatformId"
            >
              <el-select
                v-model="inputForm.externalPlatformId"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="item in externalPlatformList"
                  :key="item.subcompanyid"
                  :value="item.subcompanyid"
                  :label="item.shortname"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="公司代码"
              prop="companyNo"
            >
              <el-input v-model="inputForm.companyNo" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              class="businessInfo"
              label="公司简介"
              prop="businessScope"
            >
              <el-input
                v-model="inputForm.businessScope"
                type="textarea"
                :rows="6"
                placeholder="请输入公司简介"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="企业LOGO"
              prop="logo"
            >
              <div class="avatar-uploader">
                <el-upload
                  :show-file-list="false"
                  action="#"
                  :on-change="selectChange"
                  :auto-upload="false"
                >
                  <img
                    v-if="inputForm.logo"
                    :src="filePrefix + inputForm.logo"
                    class="avatar"
                  >
                  <i
                    v-else
                    class="el-icon-plus avatar-uploader-icon"
                  />
                </el-upload>
                <cropper
                  v-if="showCropper"
                  style="margin-top: -20px"
                  :dialog-visible="showCropper"
                  :cropper-img="cropperImg"
                  @colse-dialog="closeDialog"
                  @upload-img="uploadImg"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="营业执照"
              prop="businessLicense"
            >
              <el-upload
                :action="`${actionUrl}?fileType=COMPANY_BUSINESS_LICENSE_PATH`"
                :headers="header"
                list-type="picture-card"
                :on-success="
                  (res, file, fileList) => fileSuccessFn('businessLicense', res, file, fileList)
                "
                :auto-upload="true"
                :file-list="businessLicenseFileList"
                :limit="1"
                :class="{ hide: hideUpload.businessLicense }"
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
                    <span class="el-upload-list__item-actions">
                      <span
                        class="el-upload-list__item-delete"
                        @click="fileRemoveFn('businessLicense', file)"
                      >
                        <i class="el-icon-delete" />
                      </span>
                    </span>
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="平面四色图"
              prop="fourColorGraph"
            >
              <el-upload
                :action="`${actionUrl}?fileType=COMPANY_GRAPH_PATH`"
                :headers="header"
                list-type="picture-card"
                :on-success="
                  (res, file, fileList) => fileSuccessFn('fourColorGraph', res, file, fileList)
                "
                :auto-upload="true"
                :file-list="fourColorGraphFileList"
                :limit="1"
                :class="{ hide: hideUpload.fourColorGraph }"
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
                    <span class="el-upload-list__item-actions">
                      <span
                        class="el-upload-list__item-delete"
                        @click="fileRemoveFn('fourColorGraph', file)"
                      >
                        <i class="el-icon-delete" />
                      </span>
                    </span>
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="上传icon"
              prop="webIcon"
            >
              <el-upload
                :action="`${actionUrl}?fileType=COMPANY_LOGO_PATH`"
                :headers="header"
                list-type="picture-card"
                :on-success="(res, file, fileList) => fileSuccessFn('webIcon', res, file, fileList)"
                :auto-upload="true"
                :file-list="webIconFileList"
                :limit="1"
                :class="{ hide: hideUpload.webIcon }"
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
                    <span class="el-upload-list__item-actions">
                      <span
                        class="el-upload-list__item-delete"
                        @click="fileRemoveFn('webIcon', file)"
                      >
                        <i class="el-icon-delete" />
                      </span>
                    </span>
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="收缩logo"
              prop="shrinkLogo"
            >
              <el-upload
                :action="`${actionUrl}?fileType=COMPANY_LOGO_PATH`"
                :headers="header"
                list-type="picture-card"
                :on-success="
                  (res, file, fileList) => fileSuccessFn('shrinkLogo', res, file, fileList)
                "
                :auto-upload="true"
                :file-list="shrinkLogoFileList"
                :limit="1"
                :class="{ hide: hideUpload.shrinkLogo }"
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
                    <span class="el-upload-list__item-actions">
                      <span
                        class="el-upload-list__item-delete"
                        @click="fileRemoveFn('shrinkLogo', file)"
                      >
                        <i class="el-icon-delete" />
                      </span>
                    </span>
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <!--                <el-row> -->
        <!--                    <el-col :span="24"> -->
        <!--                        <el-form-item class="businessInfo" label="地图标注"> -->
        <!--                            <div style="display: flex;"> -->
        <!--                                <el-select v-model="layer" placeholder="请选择"> -->
        <!--                                    <el-option v-for="item in layerList" :key="item.id" :label="item.name" :value="item.id"> -->
        <!--                                        <span>{{ item.name }}</span> -->
        <!--                                    </el-option> -->
        <!--                                </el-select> -->
        <!--                                <span style="margin-left: 5px;">选择图层</span> -->
        <!--                            </div> -->
        <!--                            <div class="base-map"> -->
        <!--                                <img :src="basePic" /> -->
        <!--                                <div class="panel" @click="panelTap"> -->
        <!--                                    <div v-for="(item, idx) in markList" :key="idx" class="marker" :style="{left: item.markLeft, top: item.markTop}" /> -->
        <!--                                </div> -->
        <!--                            </div> -->
        <!--                        </el-form-item> -->
        <!--                    </el-col> -->
        <!--                </el-row> -->
      </el-form>
    </div>
    <span class="dialog-footer">
      <el-button @click="closeClick(false)">关闭</el-button>
      <el-button
        v-if="method != 'view'"
        type="primary"
        :loading="loading"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </div>
</template>

<style lang="scss">
.company-form .dialog-info {
  padding: 24px;
}
.company-form .el-dialog__body {
  padding: unset;
  .dialog-footer {
    padding: 0 20px;
  }
}
.company-form .hide .el-upload--picture-card {
  display: none;
}
.avatar-uploader {
  /*border:1px dashed #000*/
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  width: 148px;
  height: 148px;
}

.avatar-uploader .el-upload {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 148px;
  height: 148px;
  line-height: 148px;
  text-align: center;
}

.avatar {
  width: 148px;
  height: 148px;
  display: block;
}
.form-container {
  height: 100%;
}

.company-form .base-map {
  margin-top: 10px;
  position: relative;
  img {
    width: 100%;
    display: block;
  }
  .panel {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    .marker {
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #e6a23c;
      background: radial-gradient(#e6a23c, yellow);
      position: absolute;
      top: 0;
      left: 0;
    }
  }
}
</style>
