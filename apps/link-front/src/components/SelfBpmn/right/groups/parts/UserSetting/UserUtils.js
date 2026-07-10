export function getUserTypeLabel(type) {
  switch (type) {
    case 'user':
      return '用户'

    case 'post':
      return '岗位'

    case 'company':
      return '公司'

    case 'depart':
      return '部门'

    case 'role':
      return '角色'

    case 'applyUserId':
      return '发起人'

    case 'previousExecutor':
      return '上一步执行人'

    case 'currentUserId':
      return '当前登录用户'

    case 'sql':
      return 'sql脚本'

    case 'custom':
      return '自定义条件'
  }
}
