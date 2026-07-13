import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
/* 应急物资 */
// 分页查询物资
export function emSupplyGetByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `emergency/resources/emergencySupplies/pageQuery`, params)
}

// 新增物资
export function emSupplyAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `emergency/resources/emergencySupplies/save`, params)
}

// 按id查询物资
export function emSupplyGetById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `emergency/resources/emergencySupplies/getById?id=${id}`)
}

// 更新物资
export function emSupplyUpdate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `emergency/resources/emergencySupplies/updete`, params)
}

// 删除物资
export function emSupplyDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `emergency/resources/emergencySupplies/removeById?id=${id}`)
}

// 按id查看单个物资下的检查记录分页
export function emSupplyRecordGetByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `emergency/resources/inspect/pageinfo`, params)
}
// 按id查看单条物资检查记录
export function emSupplyRecordGetById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `emergency/resources/inspect/selectbyid?id=${id}`)
}
// 新增物资检查记录
export function emSupplyRecordAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `emergency/resources/inspect/save`, params)
}
// 更新物资检查记录
export function emSupplyRecordUpdate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `emergency/resources/inspect/update`, params)
}

// 删除物资检查记录
export function emSupplyRecordDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `emergency/resources/inspect/removeById?id=${id}`)
}

/* 应急专家 */
// 新增专家*
export function emProficientAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `resources/emergencyPersonnel/save`, params)
}
// 删除专家*
export function emProficientDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `resources/emergencyPersonnel/delete?id=${id}`)
}
// 更新专家*
export function emProficientUpdate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `resources/emergencyPersonnel/update`, params)
}
// 按id查询专家*
export function emProficientGetById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `resources/emergencyPersonnel/getById?id=${id}`)
}
// 分页查询专家*
export function emProficientGetByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `resources/emergencyPersonnel/queryPageInfo`, params)
}

/* 应急队伍 */
// 删除应急队伍资料文件
export function emTeamDelFile(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `resources/emergencyTeam/delFile`, params)
}
// 删除应急队伍
export function emTeamDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `resources/emergencyTeam/delete?id=${id}`)
}
// 按id获取应急队伍详情
export function emTeamGetById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `resources/emergencyTeam/getById?id=${id}`)
}
// 分页查询应急队伍
export function emTeamGetByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `resources/emergencyTeam/queryPageInfo`, params)
}
// 新增应急队伍
export function emTeamAdd(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files') {
      data.files.forEach((item) => {
        formData.append('files', item)
      })
    }
    else if (key === 'teamMembers') {
      data.teamMembers.forEach((item, index) => {
        for (const teamKey in item) {
          formData.append(`teamMembers[${index}].${teamKey}`, item[teamKey])
        }
      })
    }
    else {
      if (data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
  }
  return axiosPost(axios, `resources/emergencyTeam/save`, formData)
}
// 更新应急队伍
export function emTeamUpdate(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files') {
      data.files.forEach((item) => {
        formData.append('files', item)
      })
    }
    else {
      if (data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
  }
  return axiosPost(axios, `resources/emergencyTeam/update`, formData)
}
// 获取队员列表*
export function emTeamMemberGetList(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `resources/emergencyPersonnel/getAllTeamPer?teamId=${id}`)
}
// 删除队员*
export function emTeamMemberDel(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `resources/emergencyPersonnel/deleteTeamMember`, params)
}
// 添加队员*
export function emTeamMemberAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `resources/emergencyPersonnel/addTeamMember`, params)
}

/* 应急预案 */
// 分页查询应急预案
export function emPlanGetByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `resources/emergencyPlan/queryPageInfo`, params)
}

// 按id查询应急预案
export function emPlanGetById(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `resources/emergencyPlan/getById?id=${id}`)
}

// 新增应急预案
export function emPlanAdd(data) {
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
  return axiosPost(axios, `resources/emergencyPlan/add`, formData)
}

// 更新应急预案
export function emPlanUpdate(data) {
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
  return axiosPost(axios, `resources/emergencyPlan/update`, formData)
}

// 删除应急预案
export function emPlanDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `resources/emergencyPlan/delete?id=${id}`)
}
