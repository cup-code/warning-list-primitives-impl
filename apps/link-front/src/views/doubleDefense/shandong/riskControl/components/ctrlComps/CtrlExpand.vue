<script>
import { CtrlCycleArr } from '@/views/doubleDefense/shandong/config/constant'

export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    // 展示数据
    expandList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      allDic: {}, // 字典信息
      CtrlCycleArr, // 管控周期列表
    }
  },
  computed: {
    /* 翻译管控周期 */
    setCycleDes() {
      return function (controlCycle, controlCycleUnit, controlFrequency) {
        let des = '-'
        const cycleType = Number.parseInt(controlCycleUnit)
        let cycleTypeDes = ''
        for (const item of CtrlCycleArr) {
          if (item.value == cycleType) {
            cycleTypeDes = item.label
            break
          }
        }
        des = `${controlCycle + cycleTypeDes + controlFrequency}次`
        return des
      }
    },
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
  },
}
</script>

<template>
  <el-table-column type="expand">
    <template slot-scope="props">
      <el-table
        v-loading="loading"
        class="expand-box"
        :data="expandList"
        align="center"
      >
        <el-table-column
          label="序号"
          type="index"
          align="center"
          width="50"
        />
        <el-table-column
          label="管控措施分类"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{
              $dictUtils.getDictLabelById('measure_main', scope.row.controlMeasuresMainType, '--')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="管控措施"
          align="center"
        >
          <template slot-scope="scope">
            <RichText :des="scope.row.controlMeasuresDesc" />
          </template>
        </el-table-column>
        <el-table-column
          label="隐患排查内容"
          align="center"
        >
          <template slot-scope="scope">
            <RichText :des="scope.row.checkContent" />
          </template>
        </el-table-column>
        <!-- <el-table-column label="管控层级" align="center">
          <template slot-scope="scope">
            <span>  {{ $dictUtils.getDictLabel('control_level', scope.row.controlHierarchy) }} </span>
          </template>
        </el-table-column> -->
        <el-table-column
          label="周期"
          align="center"
        >
          <template slot-scope="scope">
            <span>
              {{
                setCycleDes(
                  scope.row.controlCycle,
                  scope.row.controlCycleUnit,
                  scope.row.controlFrequency,
                )
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="管控部门"
          align="center"
          prop="controlDept"
        />
        <el-table-column
          label="责任人"
          align="center"
          prop="controlResponsible"
        />
      </el-table>
    </template>
  </el-table-column>
</template>

<style lang="scss" scoped>
.expand-box {
  margin: 0 0 0 50px !important;
  width: calc(100% - 60px);
}
</style>
