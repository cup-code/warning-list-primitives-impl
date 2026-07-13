import assert from 'node:assert/strict'
import test from 'node:test'

import { createVideoWarningApi } from './createVideoWarningApi.js'

const expectedExports = [
  'getWarningTypeList',
  'getWarningTypeListAllTenant',
  'addCamera',
  'deleteCamera',
  'batchDeleteCamera',
  'cameraList',
  'exportCameraList',
  'downloadCameraTemplate',
  'importCameraList',
  'clientWarningList',
  'clientWarningAudit',
  'maintenanceWarningAudit',
  'maintenanceWarningList',
  'machineList',
  'addMachine',
  'deleteMachine',
  'allMachineList',
  'allWarningList',
  'allWarningAudit',
  'machineIndustryList',
  'machineCompanyList',
  'machineRegionList',
  'machineProvinceList',
  'warningStatusList',
  'machineTypeYear',
  'machineRank',
  'saveOrUpdateAiSkill',
  'deleteAiAuditSkill',
  'aiAuditSkillList',
  'videoModelSkillGlobalQuery',
  'deleteVideoModelSkillGlobal',
  'saveOrUpdateVideoModelSkillGlobal',
  'videoModelSkillTenantQuery',
  'deleteVideoModelSkillTenant',
  'saveOrUpdateVideoModelSkillTenant',
  'attentionAlarm',
  'batchAttentionAlarm',
  'batchAttentionAlarmInternal',
  'exportWarningData',
  'exportWarningTrend',
  'exportWarningProcess',
  'exportOrgWarning',
  'exportPointWarning',
  'exportWarningType',
  'exportWarningLevel',
  'saveOrUpdateVideoSiren',
  'deleteVideoSiren',
  'queryVideoSiren',
  'batchDeleteWarningProcess',
  'uploadWarningImage',
  'queryWarningDetailById',
  'saveOrUpdateCardSiren',
  'queryCardSiren',
  'deleteCardSiren',
].sort()

function createFixture() {
  const calls = []
  const axios = {
    request: async (config) => {
      calls.push(['request', config])
      return {
        data: new Blob(['file']),
        headers: { 'content-disposition': 'attachment; filename=alarms.xlsx' },
      }
    },
  }
  const dependencies = {
    axiosParams: (...args) => { calls.push(['axiosParams', ...args]); return args },
    axiosPost: (...args) => { calls.push(['axiosPost', ...args]); return args },
    createAxiosFromStore: () => axios,
    createFormDataAxios: () => ({ kind: 'formAxios' }),
    qs: { stringify: params => new URLSearchParams(params).toString() },
    fileDownload: (...args) => calls.push(['fileDownload', ...args]),
    createFormData: () => new FormData(),
  }
  return { api: createVideoWarningApi(dependencies), calls }
}

test('返回固定的 54 个预警 API', () => {
  const { api } = createFixture()
  assert.deepEqual(Object.keys(api).sort(), expectedExports)
})

test('普通查询通过 axiosParams 保持原参数顺序', () => {
  const { api, calls } = createFixture()
  const params = { pageNum: 1 }
  api.cameraList(params)
  assert.deepEqual(calls[0], ['axiosParams', 'get', 'videoCamera/pageQueryCamera', params])
})

test('JSON 提交使用宿主 axios 和 axiosPost', () => {
  const { api, calls } = createFixture()
  const params = { id: '1' }
  api.addCamera(params)
  assert.equal(calls[0][0], 'axiosPost')
  assert.equal(calls[0][2], 'videoCamera/saveOrUpdateCamera')
  assert.equal(calls[0][3], params)
})

test('导出接口完成请求、文件名解析和下载', async () => {
  const { api, calls } = createFixture()
  const filename = await api.exportCameraList({ keyword: 'test' })
  assert.equal(filename, '摄像头列表.xlsx')
  assert.equal(calls.at(-1)[0], 'fileDownload')
})

test('文件导入使用宿主 FormData 工厂', () => {
  const { api, calls } = createFixture()
  const file = new Blob(['camera'])
  api.importCameraList(file)
  assert.equal(calls[0][0], 'axiosPost')
  assert.equal(calls[0][2], 'videoCamera/importCamera')
  const storedFile = calls[0][3].get('file')
  assert.equal(storedFile.size, file.size)
  assert.equal(storedFile.type, file.type)
})

test('缺少宿主依赖时给出明确错误', () => {
  assert.throws(
    () => createVideoWarningApi({}),
    /createVideoWarningApi: axiosParams must be provided/,
  )
})
