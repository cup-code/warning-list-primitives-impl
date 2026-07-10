import qs from 'qs'
import {
  axiosDelete,
  axiosDownload,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'

// 获取流程列表
export function getFlowableModelList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}&filter=processes&modelType=0&sort=modifiedDesc`
  if (params.filterText) {
    pr += `&filterText=${params.filterText}`
  }
  if (params.category) {
    pr += `&category=${params.category}`
  }

  return axiosGet(axios, `flowable/model/list?${pr}`)
}

// 获取 指定流程的 内容
export function getBpmnXmlById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `flowable/model/getBpmnXml?id=${id}`)
}

export function appRestModels(params) {
  const axios = createAxiosFromStore()
  // return axiosPost(axios, `app/rest/models`, params)
  return axiosPost(axios, `flowable/model/rest/models`, params)
}

export function flowableProcessExist(key) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `flowable/process/exist?key=${key}`)
}

export function appRestModelsEditorJson(id, version) {
  const axios = createAxiosFromStore()
  // return axiosGet(axios, `app/rest/models/${id}/editor/json?version=${version}`)
  return axiosGet(axios, `flowable/model/rest/models/${id}/editor/json?version=${version}`)
}

export function flowableModelSaveModel(id, params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/model/saveModel/${id}`, paramsEncoded)
}

export function extensionTaskDefExtensionSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `extension/taskDefExtension/save`, params)
}

export function extensionNodeSettingSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `extension/nodeSetting/save`, params)
}

export function flowableModelDeploy(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/model/deploy`, paramsEncoded)
}

export function getExtensionButtonList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.orderBy) {
    pr += `&orderBy=${params.orderBy}`
  }
  if (params.name) {
    pr += `&name=${params.name}`
  }
  if (params.code) {
    pr += `&code=${params.code}`
  }

  return axiosGet(axios, `extension/button/list?${pr}`)
}

export function getExtensionConditionList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.orderBy) {
    pr += `&orderBy=${params.orderBy}`
  }
  if (params.name) {
    pr += `&name=${params.name}`
  }

  return axiosGet(axios, `extension/condition/list?${pr}`)
}

export function getExtensionFormDefinitionByJsonId(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `extension/formDefinition/queryByJsonId?jsonId=${id}`)
}

export function getExtensionFormDefinitionList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`

  if (params.orderBy) {
    pr += `&orderBy=${params.orderBy}`
  }
  if (params.name) {
    pr += `&name=${params.name}`
  }
  if (params.status) {
    pr += `&formDefinitionJson.status=${params.status}`
  }
  if (params.category && params.category.id) {
    pr += `&category.id=${params.category.id}`
  }

  return axiosGet(axios, `extension/formDefinition/list?${pr}`)
}

export function getExtensionListenerList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.orderBy) {
    pr += `&orderBy=${params.orderBy}`
  }
  if (params.name) {
    pr += `&name=${params.name}`
  }
  if (params.listenerType) {
    pr += `&listenerType=${params.listenerType}`
  }

  return axiosGet(axios, `extension/listener/list?${pr}`)
}

export function getExtensionActCategoryTreeData() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `extension/actCategory/treeData`)
}

export function flowableModelDelete(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `flowable/model/delete?ids=${ids}`)
}

export function flowableModelCopy(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/model/copy`, paramsEncoded)
}

export function flowableProcessUpdateSuspend(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `flowable/process/update/suspend?procDefId=${id}`)
}

export function flowableProcessUpdateActive(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `flowable/process/update/active?procDefId=${id}`)
}

export function flowableModelUpdateCategory(params) {
  const axios = createFormUrlencodedAxios()
  return axiosPost(
    axios,
    `flowable/model/updateCategory?id=${params.id}&category=${params.category}`,
  )
}

export function extensionConditionDelete(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `extension/condition/delete?ids=${ids}`)
}

export function getExtensionConditionById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `extension/condition/queryById?id=${id}`)
}

export function extensionConditionSave(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `extension/condition/save`, paramsEncoded)
}

export function extensionButtonDelete(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `extension/button/delete?ids=${ids}`)
}

export function getExtensionButtonById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `extension/button/queryById?id=${id}`)
}

export function extensionButtonSave(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `extension/button/save`, paramsEncoded)
}

export function extensionActCategoryDelete(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `extension/actCategory/delete?ids=${ids}`)
}

export function getExtensionActCategoryById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `extension/actCategory/queryById?id=${id}`)
}

export function extensionActCategorySave(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `extension/actCategory/save`, paramsEncoded)
}

export function extensionListenerDelete(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `extension/listener/delete?ids=${ids}`)
}

export function getExtensionListenerById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `extension/listener/queryById?id=${id}`)
}

export function extensionListenerSave(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `extension/listener/save`, paramsEncoded)
}

export function getFlowableProcessRunningData(params) {
  const axios = createAxiosFromStore()
  const pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  return axiosGet(axios, `flowable/process/runningData?${pr}`)
}

export function getFlowableTaskDef(params) {
  const axios = createAxiosFromStore()
  let pr = '?'

  if (params.status) {
    pr += `&status=${params.status}`
  }

  if (params.taskId) {
    pr += `&taskId=${params.taskId}`
  }
  if (params.taskName) {
    pr += `&taskName=${params.taskName}`
  }
  if (params.taskDefKey) {
    pr += `&taskDefKey=${params.taskDefKey}`
  }

  if (params.procDefKey) {
    pr += `&procDefKey=${params.procDefKey}`
  }
  if (params.procInsId) {
    pr += `&procInsId=${params.procInsId}`
  }
  if (params.procDefId) {
    pr += `&procDefId=${params.procDefId}`
  }

  pr = pr.replace('?&', '?')

  return axiosGet(axios, `flowable/task/getTaskDef${pr}`)
}

export function flowableProcessDeleteProcIns(params) {
  const axios = createAxiosFromStore()
  return axiosDelete(
    axios,
    `flowable/process/deleteProcIns?ids=${params.ids}&reason=${params.reason}`,
  )
}

export function getFlowableTaskFlowChart(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `flowable/task/getFlowChart?processInstanceId=${id}`)
}

export function getFlowableProcessFlowChart(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `flowable/process/getFlowChart?processDefId=${id}`)
}

export function getFlowableProcessHistoryListData(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.beginDate) {
    pr += `&beginDate=${params.beginDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  return axiosGet(axios, `flowable/process/historyListData?${pr}`)
}

export function flowableProcessHistoryDeleteAllProcIns(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `flowable/process/history/deleteAllProcIns?procInsIds=${ids}`)
}

export function getFlowableTaskTodo(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.beginDate) {
    pr += `&beginDate=${params.beginDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  return axiosGet(axios, `flowable/task/todo?${pr}`)
}

export function flowableTaskClaim(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/task/claim`, paramsEncoded)
}

export function flowableTaskUnclaim(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/task/unclaim`, paramsEncoded)
}

export function flowableTaskDelegate(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/task/delegate`, paramsEncoded)
}

export function getFlowableTaskHistoric(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.beginDate) {
    pr += `&beginDate=${params.beginDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  return axiosGet(axios, `flowable/task/historic/?${pr}`)
}

export function flowableTaskCallback(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/task/callback`, paramsEncoded)
}

export function getFlowableProcessList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.category) {
    pr += `&category=${params.category}`
  }
  if (params.name) {
    pr += `&name=${params.name}`
  }

  return axiosGet(axios, `flowable/process/list?${pr}`)
}

export function getFlowableTaskMyApplyed(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.beginDate) {
    pr += `&beginDate=${params.beginDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  return axiosGet(axios, `flowable/task/myApplyed?${pr}`)
}

export function flowableProcessRevokeProcIns(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/process/revokeProcIns`, paramsEncoded)
}

export function getExtensionFlowCopyList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.orderBy) {
    pr += `&orderBy=${params.orderBy}`
  }
  if (params.userId) {
    pr += `&userId=${params.userId}`
  }
  if (params.procDefId) {
    pr += `&procDefId=${params.procDefId}`
  }
  if (params.procInsId) {
    pr += `&procInsId=${params.procInsId}`
  }
  return axiosGet(axios, `extension/flowCopy/list?${pr}`)
}

export function extensionFlowCopyDelete(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `extension/flowCopy/delete?ids=${ids}`)
}

export function getExtensionFormCategoryTreeData() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `extension/formCategory/treeData`)
}

export function extensionFormCategoryDelete(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `extension/formCategory/delete?id=${id}`)
}

export function extensionFormDefinitionDelete(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `extension/formDefinition/delete?ids=${ids}`)
}

export function getExtensionFormCategoryById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `extension/formCategory/queryById?id=${id}`)
}

export function extensionFormCategorySave(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `extension/formCategory/save`, paramsEncoded)
}

export function getExtensionFormDefinitionById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `extension/formDefinition/queryById?id=${id}`)
}

export function extensionFormDefinitionSave(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `extension/formDefinition/save`, paramsEncoded)
}

export function getExtensionFormDefinitionJsonById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `extension/formDefinitionJson/queryById?id=${id}`)
}

export function extensionFormDefinitionJsonSave(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `extension/formDefinitionJson/save`, paramsEncoded)
}

export function getFlowableFormHistoryTaskFormData(params) {
  const axios = createAxiosFromStore()
  let pr = '?'

  if (params.processInstanceId) {
    pr += `&processInstanceId=${params.processInstanceId}`
  }

  if (params.procDefId) {
    pr += `&procDefId=${params.procDefId}`
  }
  if (params.taskDefKey) {
    pr += `&taskDefKey=${params.taskDefKey}`
  }

  pr = pr.replace('?&', '?')

  return axiosGet(axios, `flowable/form/getHistoryTaskFormData${pr}`)
}

export function getFlowableProcessQueryProcessStatus(params) {
  const axios = createAxiosFromStore()
  let pr = '?'

  if (params.procInsId) {
    pr += `&procInsId=${params.procInsId}`
  }
  if (params.procDefId) {
    pr += `&procDefId=${params.procDefId}`
  }

  pr = pr.replace('?&', '?')

  return axiosGet(axios, `flowable/process/queryProcessStatus${pr}`)
}

export function getFlowableTaskHistoricTaskList(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `flowable/task/historicTaskList?procInsId=${id}`)
}

export function getFlowableFormStartFormData(params) {
  const axios = createAxiosFromStore()
  let pr = '?'

  if (params.processDefinitionId) {
    pr += `&processDefinitionId=${params.processDefinitionId}`
  }

  pr = pr.replace('?&', '?')

  return axiosGet(axios, `flowable/form/getStartFormData${pr}`)
}

export function getFlowableFormTaskFormData(params) {
  const axios = createAxiosFromStore()
  let pr = '?'

  if (params.taskId) {
    pr += `&taskId=${params.taskId}`
  }

  pr = pr.replace('?&', '?')

  return axiosGet(axios, `flowable/form/getTaskFormData${pr}`)
}

export function getTaskDefExtensionByDefIdAndTaskId(params) {
  const axios = createAxiosFromStore()
  let pr = '?'

  if (params.processDefId) {
    pr += `&processDefId=${params.processDefId}`
  }
  if (params.taskDefId) {
    pr += `&taskDefId=${params.taskDefId}`
  }

  pr = pr.replace('?&', '?')

  return axiosGet(axios, `extension/taskDefExtension/queryByDefIdAndTaskId${pr}`)
}

export function extensionFlowCopySave(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `extension/flowCopy/save`, paramsEncoded)
}

export function flowableTaskStart(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/task/start`, paramsEncoded)
}

export function flowableTaskBackNodes(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/task/backNodes`, paramsEncoded)
}

export function flowableTaskBack(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/task/back`, paramsEncoded)
}

export function flowableTaskAddSignTask(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/task/addSignTask`, paramsEncoded)
}

export function flowableTaskTransfer(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/task/transfer`, paramsEncoded)
}

export function flowableProcessStop(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/process/stop`, paramsEncoded)
}

export function flowableTaskAudit(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `flowable/task/audit`, paramsEncoded)
}

export function getSysOfficeTreeData() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sys/office/treeData`)
}

export function getSysUserList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.orderBy) {
    pr += `&orderBy=${params.orderBy}`
  }
  if (params.loginName) {
    pr += `&loginName=${params.loginName}`
  }
  if (params.name) {
    pr += `&name=${params.name}`
  }
  if (params.company && params.company.id) {
    pr += `&company.id=${params.company.id}`
  }
  if (params.office && params.office.id) {
    pr += `&office.id=${params.office.id}`
  }
  return axiosGet(axios, `sys/user/list?${pr}`)
}

export function getSysUserById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sys/user/queryById?id=${id}`)
}

export function getSysRoleList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.orderBy) {
    pr += `&orderBy=${params.orderBy}`
  }
  if (params.roleCode) {
    pr += `&roleCode=${params.roleCode}`
  }
  if (params.roleName) {
    pr += `&roleName=${params.roleName}`
  }
  return axiosGet(axios, `sys/role/list?${pr}`)
}

export function getSysRoleById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sys/role/queryById?id=${id}`)
}

export function getSysOfficeById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sys/office/queryById?id=${id}`)
}

export function exportBpmnXml(id) {
  const axios = createAxiosFromStore()
  return axiosDownload(axios, `flowable/model/rest/models/${id}/bpmn20`)
}
