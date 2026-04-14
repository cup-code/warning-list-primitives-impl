import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

// 分页查询
export function getTableData(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.name) {
    pr += `&name=${encodeURIComponent(params.name)}`
  }
  if (params.year) {
    pr += `&year=${params.year}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/majorHazardBook/page${pr}`)
}

// 添加、保存重大危险源档案
export function addSourceFilesData(data) {
  const axios = createAxiosFromStore()
  const filestype = [
    '重大危险源档案',
    '辨识分级记录',
    '危险化学品重大危险源基本特征表',
    '涉及的所有化学品安全技术说明书',
    '区域位置图周边环境图平面布置图工艺流程图',
    '管理规章制度及安全操作规程',
    '设备安全设施和安全监测监控系统情况',
    '应急预案评审意见演练计划评估报告',
    '安全评估报告或者安全评价报告',
    '安全包保责任人职责联系方式',
    '场所安全包保责任人公示安全警示安全周知',
    '重大危险源场所关键装置重点部位照片',
    '重大危险源从业人员情况',
    '安全包保责任人履职记录',
    '其他文件',
  ]
  const formData = new FormData()
  for (const key in data) {
    if (filestype.includes(key)) {
      data[key].forEach((item) => {
        formData.append(key, item)
      })
    }
    else {
      if (data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
  }

  return axiosPost(axios, `/majorHazardBook/saveOrUpdate`, formData)
}

// 删除重大危险源档案
export function deleteSourceFilesData(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `/majorHazardBook/delete/${id}`)
}

// 获取回调文件
export function getSourceFile(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/majorHazardBook/detail/${id}`)
}
