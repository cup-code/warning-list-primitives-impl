import { Loading } from 'element-ui'

let loadingInstance = null

/**
 * 全屏 Loading（Element Loading.service），全局单例：重复 open 返回同一实例。
 * 在 setup 中：const { proxy } = getCurrentInstance(); proxy.$openLoading(options)
 * 非组件内可直接 import { openLoading } from '@/utils/loading'
 * @param {Record<string, unknown>} [options] 同 Element Loading.service
 */
export function openLoading(options = {}) {
  if (loadingInstance)
    return loadingInstance
  loadingInstance = Loading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.3)',
    ...options,
  })
  return loadingInstance
}

export function closeLoading() {
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}
