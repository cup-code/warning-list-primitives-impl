<script>
import ImageSelect from '@/components/ImageSelect'
import { getAccTypeListAll } from '@/http/specialOperation/specialWork-api.js'

export default {
  components: { ImageSelect },
  props: {
    workData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      inputForm: {
        safetyMeasuresConfig: {
          measureContentList: [],
        },
      },
      identifyList: [], // 危害辨识列表
      harmName: [],
      showMeasureList: [],
      showReplenishList: [],
    }
  },
  created() {
    this.getAccTypeListAllFn()
    this.getPrefix() // 获取图片/文件前缀
    setTimeout(() => {
      this.inputForm = Object.assign({}, this.inputForm, this.workData)
      if (this.inputForm.hazardIdentification && this.inputForm.hazardIdentification.length > 0) {
        for (const key of this.inputForm.hazardIdentification) {
          this.identifyList.forEach((res) => {
            if (key == res.id) {
              this.harmName.push(res.accidentTypeName)
            }
          })
        }
      }
      this.getMeasureContentList()
    }, 300)
  },
  methods: {
    getAccTypeListAllFn() {
      getAccTypeListAll().then(({ data }) => {
        if (data.success) {
          this.identifyList = data.result || []
        }
      })
    },
    getMeasureContentList() {
      const list = []
      const replenishList = []
      for (const key of this.inputForm.safetyMeasuresConfig) {
        for (let i = 0; i < key.measureContentList.length; i++) {
          const params = {
            id: key.measureContentList[i].id,
            userName: key.userName,
            measureContent: key.measureContentList[i].content,
          }
          list.push(params)
        }

        for (let j = 0; j < key.extraSafetyMeasures.length; j++) {
          const param = {
            userId: key.userId,
            userName: key.userName,
            replenishInfo: key.extraSafetyMeasures[j],
          }
          replenishList.push(param)
        }
      }

      const obj = {}
      for (const item of list) {
        if (!obj[item.id]) {
          obj[item.id] = {
            id: item.id,
            measureContent: item.measureContent,
            userName: [],
          }
        }
        obj[item.id].userName.push(item.userName)
      }

      // 补充措施去重
      const replenishData = {}
      for (const key of replenishList) {
        if (!replenishData[key.replenishInfo]) {
          replenishData[key.replenishInfo] = {
            replenishInfo: `(补充措施) ${key.replenishInfo}`,
            userName: [],
          }
        }
        replenishData[key.replenishInfo].userName.push(key.userName)
      }

      this.showMeasureList = Object.values(obj)
      this.showReplenishList = Object.values(replenishData)
    },
  },
}
</script>

<template>
  <div class="handle">
    <el-form
      ref="inputForm"
      :model="inputForm"
      label-width="140px"
      disabled
    >
      <el-form-item label="安全措施落实">
        <div
          v-for="(items, indexs) in showMeasureList"
          v-if="showMeasureList && showMeasureList.length"
          :key="items.measureContent"
        >
          {{ `${indexs + 1}、${items.measureContent}` }}
        </div>
        <div
          v-for="(v, i) in showReplenishList"
          v-if="showReplenishList && showReplenishList.length"
          :key="v.replenishInfo"
        >
          {{ `${i + 1}、${v.replenishInfo}` }}
        </div>
      </el-form-item>
      <el-form-item label="危害辨识">
        <el-checkbox-group v-model="harmName">
          <el-checkbox
            v-for="item in identifyList"
            :key="item.accidentTypeName"
            :label="item.accidentTypeName"
          />
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="安全措施编制人签字">
        <ImageSelect
          :signUrl="inputForm.safetyMeasuresSign ? filePrefix + inputForm.safetyMeasuresSign : ''"
          width="250px"
          height="100px"
          disabled
        />
      </el-form-item>
      <el-form-item label="签字日期">
        <el-input
          v-model="inputForm.safetyMeasuresSignTime"
          type="input"
          class="small-box"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.handle {
  cursor: no-drop;
}
.small-box {
  width: 250px;
}
</style>
