import moment from 'moment'
import { getScreenData } from '@/http/videoStat/screenData'

export async function getScreenDatas(form, screenData, departmentIds = []) {
  try {
    form.departmentIds = departmentIds.join(',')
    form.alarmDateEnd = moment().format('YYYY-MM-DD HH:mm:ss')

    const timeType = Number(form.timeType)

    if (timeType === 0) {
      form.alarmDateStart = moment().startOf('date').format('YYYY-MM-DD HH:mm:ss')
    }
    else if (timeType === 1) {
      form.alarmDateStart = moment()
        .startOf('week')
        .format('YYYY-MM-DD HH:mm:ss')
    }
    else if (timeType === 2) {
      form.alarmDateStart = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss')
    }

    const { data } = await getScreenData({ ...form, timeType })
    if (data.code == 200) {
      if (form.type === 0) {
        return data.result
      }
      else {
        return {
          total: data.result.total,
          digital: data.result[screenData],
        }
      }
    }
    else {
      throw new Error(data.message || '查询失败')
    }
  }
  catch (error) {
    console.error('获取数据失败:', error)
  }
}
