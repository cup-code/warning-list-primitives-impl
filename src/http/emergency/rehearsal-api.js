import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
/* 演练计划 */
// 分页查询演练计划
export function emRehearsalPlanByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `resources/emergencyDrillPlan/queryPageInfo`, params)
}
// 按ID查询演练计划
export function emRehearsalPlanById(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `resources/emergencyDrillPlan/getById?id=${id}`)
}
// 新增演练计划
export function emRehearsalPlanAdd(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files') {
      data.files.forEach((item) => {
        formData.append('files', item)
      })
    }
    else {
      formData.append(key, data[key])
    }
  }
  return axiosPost(axios, `resources/emergencyDrillPlan/add`, formData)
}
// 更新演练计划
export function emRehearsalPlanUpdate(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files') {
      data.files.forEach((item) => {
        formData.append('files', item)
      })
    }
    else {
      formData.append(key, data[key])
    }
  }
  return axiosPost(axios, `resources/emergencyDrillPlan/update`, formData)
}
// 删除演练计划
export function emRehearsalPlanDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `resources/emergencyDrillPlan/delete?id=${id}`)
}

/* 演练记录 */
// 分页查询演练计划
export function emRehearsalRecordByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `resources/emergencyDrillRecord/queryPageInfo`, params)
}
// 按ID查询演练计划
export function emRehearsalRecordById(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `resources/emergencyDrillRecord/getById?id=${id}`)
}
// 新增演练记录
export function emRehearsalRecordAdd(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (['accessorys', 'evaluation', 'images'].includes(key)) {
      data[key].forEach((item) => {
        formData.append(key, item)
      })
    }
    else {
      formData.append(key, data[key])
    }
  }
  return axiosPost(axios, `resources/emergencyDrillRecord/add`, formData)
}
// 更新演练记录
export function emRehearsalRecordUpdate(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (['accessorys', 'evaluation', 'images'].includes(key)) {
      data[key].forEach((item) => {
        formData.append(key, item)
      })
    }
    else {
      formData.append(key, data[key])
    }
  }
  return axiosPost(axios, `resources/emergencyDrillRecord/update`, formData)
}
// 删除演练记录
export function emRehearsalRecordDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `resources/emergencyDrillRecord/delete?id=${id}`)
}
