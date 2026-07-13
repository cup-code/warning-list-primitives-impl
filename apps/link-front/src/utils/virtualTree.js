const MAX_CACHE_SIZE = 50

export class VirtualTree {
  constructor(pageSize = 20) {
    this.pageSize = pageSize
    this.allData = []
    this.treeData = []
    this.virtualData = new Map()
    this.loadedPages = new Set()
    this.searchCache = new Map()
    this.nodeMap = new Map()
  }

  setData(data) {
    this.allData = data
    this.nodeMap.clear()
    this.virtualData.clear()
    this.loadedPages.clear()
    this.searchCache.clear()

    // 构建树形结构
    this.treeData = this.buildTree(data)
    // 返回第一页数据
    return this.getPageData(0)
  }

  buildTree(data) {
    // 建立节点映射
    data.forEach((node) => {
      this.nodeMap.set(node.id, { ...node, children: [], hasChildren: false })
    })

    const roots = []
    // 构建父子关系
    data.forEach((node) => {
      const processedNode = this.nodeMap.get(node.id)
      if (node.parentId && this.nodeMap.has(node.parentId)) {
        const parent = this.nodeMap.get(node.parentId)
        parent.children.push(processedNode)
        parent.hasChildren = true
      }
      else {
        roots.push(processedNode)
      }
    })

    // 排序
    return this.sortTreeNodes(roots)
  }

  getPageData(pageIndex) {
    const start = pageIndex * this.pageSize
    const end = start + this.pageSize

    if (this.loadedPages.has(pageIndex)) {
      return this.virtualData.get(pageIndex)
    }

    const pageData = this.treeData.slice(start, end).map(node => ({
      ...node,
      hasChildren: this.hasChildren(node),
      loaded: false,
    }))

    this.virtualData.set(pageIndex, pageData)
    this.loadedPages.add(pageIndex)
    return pageData
  }

  hasChildren(node) {
    return this.nodeMap.get(node.id)?.hasChildren || false
  }

  getChildren(parentId) {
    return this.nodeMap.get(parentId)?.children || []
  }

  searchNodes(searchStr, propKeys) {
    const cacheKey = searchStr
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)
    }

    const matchedNodes = new Set()
    const result = []

    // 搜索匹配节点
    this.allData.forEach((node) => {
      let isMatch = false
      for (const key of propKeys) {
        const val = String(node[key] || '').toLowerCase()
        if (val.includes(searchStr)) {
          isMatch = true
          break
        }
      }

      if (isMatch) {
        matchedNodes.add(node.id)
        this.addParentChain(node, matchedNodes)
      }
    })

    // 构建搜索结果树
    matchedNodes.forEach((id) => {
      const node = this.nodeMap.get(id)
      if (node) {
        result.push({
          ...node,
          children: node.children.filter(child => matchedNodes.has(child.id)),
        })
      }
    })

    // 只保留根节点
    const searchResult = result.filter(node =>
      !node.parentId || !matchedNodes.has(node.parentId),
    )

    if (this.searchCache.size >= MAX_CACHE_SIZE) {
      this.searchCache.clear()
    }
    this.searchCache.set(cacheKey, searchResult)
    return searchResult
  }

  addParentChain(node, nodeSet) {
    let current = node
    while (current.parentId) {
      const parent = this.nodeMap.get(current.parentId)
      if (parent) {
        nodeSet.add(parent.id)
        current = parent
      }
      else {
        break
      }
    }
  }

  sortTreeNodes(nodes) {
    return nodes
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .map(node => ({
        ...node,
        children: node.children.length ? this.sortTreeNodes(node.children) : [],
      }))
  }

  resetSearch() {
    this.searchCache.clear()
  }
}
