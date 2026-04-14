import request from '@/utils/request'

export function download(fileId) {
  return request({
    url: `/file/download/${fileId}`,
    responseType: 'blob',
    method: 'GET',
  })
}

export function fileList(params) {
  return request({
    url: '/file/pageList',
    method: 'GET',
    params,
  })
}

export function fileAdd(data) {
  return request({
    url: '/file',
    method: 'post',
    data,
  })
}

export function fileDel(data) {
  return request({
    url: `/file/delete/batch`,
    method: 'POST',
    data,
  })
}

export function fileUpdate(data) {
  return request({
    url: '/file',
    method: 'put',
    data,
  })
}

export function fileDetail(data) {
  return request({
    url: `/file/${data.id}`,
    method: 'get',
    params: data,
  })
}

export default { fileList, fileAdd, fileDel, fileUpdate, fileDetail }
