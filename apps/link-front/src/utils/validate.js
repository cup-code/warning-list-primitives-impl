/**
 * @param {string} path
 * @returns {boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

// 校验 数字
export function $checkNum(rule, value, callback) {
  const reg = /^\d+$/
  if (!value && value != 0) {
    callback(new Error('不能为空'))
    return
  }
  else if (!reg.test(value)) {
    callback(new Error('必须为整数'))
    return
  }
  callback()
}
// 校验 浮点数
export function $checkFloat(rule, value, callback) {
  const reg = /\d+(\.\d+)?/
  if (!value && value != 0) {
    callback(new Error('不能为空'))
    return
  }
  else if (!reg.test(value)) {
    callback(new Error('必须为数字'))
    return
  }
  callback()
}
// 校验 字母
export function $checkWord(rule, value, callback) {
  const reg = /^[a-z]+$/i
  if (!value && value != 0) {
    callback(new Error('不能为空'))
    return
  }
  else if (!reg.test(value)) {
    callback(new Error('必须为字母'))
    return
  }
  callback()
}
// 校验 只能是 字母和数字
export function $checkWN(rule, value, callback) {
  const reg = /^[\w-]+$/
  if (!value && value != 0) {
    callback(new Error('不能为空'))
    return
  }
  else if (!reg.test(value)) {
    callback(new Error('必须为字母、数字、下划线、中划线'))
    return
  }
  callback()
}
// 校验 手机号
export function $checkPhone(rule, value, callback) {
  const val = value ? value.trim() : ''
  const reg = /^1[3-9]\d{9}$/
  if (!reg.test(val)) {
    callback(new Error('请输入正确的手机号'))
    return
  }
  callback()
}
// 密码强度校验（由数字和字母组成，并且要同时含有数字和字母，且长度要在8-16位之间）
export function $checkPassword(rule, value, callback) {
  const val = value ? value.trim() : ''
  const reg = /^(?!\d+$)(?![a-z]+$)[0-9A-Z]{8,16}$/i
  if (!reg.test(val)) {
    callback(new Error('必须同时包含数字和字母， 长度8到16个字符'))
    return
  }
  callback()
}
// zxr新增
/**
 * 邮箱
 * @param {*} s
 */
export function isEmail(s) {
  return /^([\w-])+@([\w-])+((.[\w-]{2,3}){1,2})$/.test(s)
}

/**
 * 手机号码
 * @param {*} s
 */
export function isMobile(s) {
  return /^(13\d|14[014-9]|15[0-35-9]|16[2567]|17[0-8]|18\d|19[0-35-9])\d{8}$/.test(s)
}

/**
 * 电话号码
 * @param {*} s
 */
export function isPhone(s) {
  return /^(\d{3,4}-)?\d{7,8}$/.test(s)
}

/**
 * URL地址
 * @param {*} s
 */
export function isURL(s) {
  return /^https?:\/\/.*/.test(s)
}

/* 小写字母 */
export function isLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/* 大写字母 */
export function isUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/* 大小写字母 */
export function isAlphabets(str) {
  const reg = /^[A-Z]+$/i
  return reg.test(str)
}

/* 验证pad还是pc */
export function isPc() {
  const userAgentInfo = navigator.userAgent
  const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
  let flag = true
  for (let v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false
      break
    }
  }
  return flag
}

/**
 * 判断姓名是否正确
 */
export function isName(name) {
  const regName = /^[\u4E00-\u9FA5]{2,4}$/
  if (!regName.test(name))
    return false
  return true
}

/**
 * 判断是否为整数
 */
export function isNum(num, type) {
  let regName = /[^\d.]/g
  if (type === 1) {
    if (!regName.test(num))
      return false
  }
  else if (type === 2) {
    regName = /\D/g
    if (!regName.test(num))
      return false
  }
  return true
}

/**
 * 判断是否为小数
 */
export function isFloat(num) {
  const regName1 = /^\d+(\.\d+)?$/
  const regName2
    = /^(-((\d+\.0*[1-9]\d*)|(0*[1-9]\d*\.\d+)|(0*[1-9]\d*)))$/
  if (regName1.test(num) || regName2.test(num))
    return true
  return false
}

/**
 * 判断是否为空
 */
export function isNull(val) {
  if (Array.isArray(val)) {
    if (val.length === 0)
      return true
  }
  else if (val instanceof Object) {
    if (JSON.stringify(val) === '{}')
      return true
  }
  else {
    if (val === 'null' || val == null || val === 'undefined' || val === undefined || val === '')
      return true
    return false
  }
  return false
}

/**
 * 判断身份证号码
 */
export function isCardId(code) {
  let msg = ''
  const city = {
    11: '北京',
    12: '天津',
    13: '河北',
    14: '山西',
    15: '内蒙古',
    21: '辽宁',
    22: '吉林',
    23: '黑龙江 ',
    31: '上海',
    32: '江苏',
    33: '浙江',
    34: '安徽',
    35: '福建',
    36: '江西',
    37: '山东',
    41: '河南',
    42: '湖北 ',
    43: '湖南',
    44: '广东',
    45: '广西',
    46: '海南',
    50: '重庆',
    51: '四川',
    52: '贵州',
    53: '云南',
    54: '西藏 ',
    61: '陕西',
    62: '甘肃',
    63: '青海',
    64: '宁夏',
    65: '新疆',
    71: '台湾',
    81: '香港',
    82: '澳门',
    91: '国外 ',
  }
  if (!isNull(code)) {
    if (code.length === 18) {
      if (!code || !/(^\d{18}$)|(^\d{17}([\dX])$)/i.test(code)) {
        msg = '证件号码格式错误'
        return false
      }
      else if (!city[code.substr(0, 2)]) {
        msg = '地址编码错误'
        return false
      }
      else {
        // 18位身份证需要验证最后一位校验位
        code = code.split('')
        // ∑(ai×Wi)(mod 11)
        // 加权因子
        const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
        // 校验位
        const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2, 'x']
        let sum = 0
        let ai = 0
        let wi = 0
        for (let i = 0; i < 17; i++) {
          ai = code[i]
          wi = factor[i]
          sum += ai * wi
        }
        const last = parity[sum % 11]
        if (`${last}` !== `${code[17]}`) {
          msg = '证件号码校验位错误'
          return false
        }
      }
    }
    else {
      msg = '证件号码长度不为18位'
      return false
    }
  }
  else {
    msg = '证件号码不能为空'
    return false
  }
  if (msg) {
    console.log(msg)
  }
  return true
}

/*
 * 整数必须为0
 */
export function isIntEqZero(value) {
  value = Number.parseInt(value)
  return value === 0
}

/*
 * 判断整数value是否大于0
 * 整数必须大于0
 */
export function isIntGtZero(value) {
  value = Number.parseInt(value)
  return value > 0
}

/*
 * 判断整数value是否大于或等于0
 * 整数必须大于或等于0
 */
export function isIntGteZero(value) {
  value = Number.parseInt(value)
  return value >= 0
}

/*
 * 判断整数value是否不等于0
 * 整数必须不等于0
 */
export function isIntNEqZero(value) {
  value = Number.parseInt(value)
  return value !== 0
}

/*
 * 判断整数value是否不等于0
 * 整数必须小于0
 */
export function isIntLtZero(value) {
  value = Number.parseInt(value)
  return value < 0
}

/*
 * 判断整数value是否小于或等于0
 * 整数必须小于或等于0
 */
export function isIntLteZero(value) {
  value = Number.parseInt(value)
  return value <= 0
}

/*
 * 判断浮点数value是否等于0
 * 浮点数必须为0
 */
export function isFloatEqZero(value) {
  value = Number.parseFloat(value)
  return value === 0
}

/*
 * 判断浮点数value是否大于0
 * 浮点数必须大于0
 */
export function isFloatGtZero(value) {
  value = Number.parseFloat(value)
  return value > 0
}

/*
 * 判断浮点数value是否大于或等于0
 * 浮点数必须大于或等于0
 */
export function isFloatGteZero(value) {
  value = Number.parseFloat(value)
  return value >= 0
}

/*
 * 判断浮点数value是否不等于0
 * 浮点数必须不等于0
 */
export function isFloatNEqZero(value) {
  value = Number.parseFloat(value)
  return value !== 0
}

/*
 * 判断浮点数value是否小于0
 * 浮点数必须小于0
 */
export function isFloatLtZero(value) {
  value = Number.parseFloat(value)
  return value < 0
}

/*
 * 判断浮点数value是否小于或等于0
 * 浮点数必须小于或等于0
 */
export function isFloatLteZero(value) {
  value = Number.parseFloat(value)
  return value <= 0
}
/*
 * 匹配integer
 * 匹配integer
 */
export function isInteger(value) {
  return /^[-+]?\d+$/.test(value) && Number.parseInt(value) >= 0
}

/*
 * 判断数值类型，包括整数和浮点数
 * 匹配数值类型，包括整数和浮点数
 */
export function isNumber(value) {
  return /^[-+]?\d+$/.test(value) || /^[-+]?\d+(\.\d+)?$/.test(value)
}

/*
 * 只能输入[0-9]数字
 * 只能输入[0-9]数字
 */
export function isDigits(value) {
  return /^\d+$/.test(value)
}

/*
 * 判断英文字符
 * 只能包含英文字符。
 */
export function isEnglish(value) {
  return /^[A-Z]+$/i.test(value)
}
/*
 * 联系电话(手机/电话皆可)验证
 * 请正确填写您的联系方式
 */
export function isTel(value) {
  const length = value.length
  const mobile = /^(((13\d)|(15\d)|(18\d))+\d{8})$/
  const tel = /^(\d{3,4}-?)?\d{7,9}$/g
  return tel.test(value) || (length === 11 && mobile.test(value))
}

/*
 * 匹配qq
 * 匹配QQ
 */
export function isQq(value) {
  return /^[1-9]\d{4,12}$/.test(value)
}

/*
 * 邮政编码验证
 * 请正确填写您的邮政编码。
 */
export function isZipCode(value) {
  const zip = /^\d{6}$/
  return zip.test(value)
}

/*
 * 匹配密码，长度至少8位，必须包含大小写字母、特殊字符、数字
 */
export function isPwd(value) {
  return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[~!@#$%^&*)(_+}{|:?><]).{8,16}$/.test(value)
}

/*
 * IP地址验证
 * 请填写正确的IP地址。
 */
export function ip(value) {
  return /^(([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.)(([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.){2}([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))$/.test(
    value,
  )
}

/*
 * 字符验证，只能包含中文、英文、数字、下划线等字符。
 * 只能包含中文、英文、数字、下划线等字符
 */
export function stringCheck(value) {
  return /^[\w\u4E00-\u9FA5-]+$/.test(value)
}

/*
 * 匹配汉字
 * 匹配汉字
 */
export function isChinese(value) {
  return /^[\u4E00-\u9FA5]+$/.test(value)
}

/*
 * 匹配中文(包括汉字和字符)
 * 匹配中文(包括汉字和字符)
 */
export function isChineseChar(value) {
  return /^[\u0391-\uFFE5]+$/.test(value)
}

/*
 * 判断是否为合法字符(a-zA-Z0-9-_)
 * 判断是否为合法字符(a-zA-Z0-9-_)
 */
export function isRightfulString(value) {
  return /^[\w-]+$/.test(value)
}

// 车牌号校验
export function isPlateNo(plateNo) {
  const re = /^[\u4E00-\u9FA5][A-Z][A-Z_0-9]{5}$/
  if (re.test(plateNo)) {
    return true
  }
  return false
}

/* 验证内容是否英文数字以及下划线 */
export function validateEngOrNum(rule, value, callback) {
  const reg = /^\w+$/
  if (value == '' || value == undefined || value == null) {
    callback()
  }
  else {
    if (!reg.test(value)) {
      callback(new Error('英文字母、数字或下划线'))
    }
    else {
      callback()
    }
  }
}

export default {
  isAlphabets,
  isCardId,
  isChinese,
  isChineseChar,
  isDigits,
  isEmail,
  isEnglish,
  isFloat,
  stringCheck,
  isFloatGteZero,
  ip,
  isFloatEqZero,
  isFloatGtZero,
  isFloatLtZero,
  isFloatLteZero,
  isFloatNEqZero,
  isIntEqZero,
  isIntGtZero,
  isIntGteZero,
  isIntLtZero,
  isIntLteZero,
  isIntNEqZero,
  isInteger,
  isLowerCase,
  isMobile,
  isName,
  isNull,
  isNum,
  isNumber,
  isPc,
  isPhone,
  isPlateNo,
  isPwd,
  isQq,
  isRightfulString,
  isTel,
  isURL,
  isUpperCase,
  isZipCode,
}
