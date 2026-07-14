export function createMachineListQuery(type, allMachineListApi, machineListApi) {
  return () => (
    type === 'all'
      ? allMachineListApi({ isPage: false })
      : machineListApi({ isPage: false })
  )
}

export function extractMachineList(response, isAll) {
  if (!response?.data?.success) {
    return undefined
  }

  return isAll ? response.data.result : response.data.result.list
}

export function findMachine(machineList, value) {
  return machineList.find(item => item.id === value)
}

export function findMachineName(machineList, value) {
  return findMachine(machineList, value)?.machineName
}
