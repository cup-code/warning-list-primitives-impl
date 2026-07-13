<script>
import { getSafetyMeasuresList } from '@/http/specialOperation/specialWork-api.js'

export default {
  props: {
    // 作业票详情
    workData: {
      type: Object,
      default() {
        return {}
      },
    },
    /**
     * 类型列表
     * safeMeasure - 安全措施
     * otherWork - 涉及的其他特殊作业
     * riskMarks - 危害辨识
     */
    typeList: {
      type: Array,
      default() {
        return []
      },
    },
    // 作业类型
    workType: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      safeMeasuresList: [], // 安全措施列表
      showMeasureList: [],
      showReplenishList: [],
      allMeasureList: [],
      informList: [],
      measureList: [],
    }
  },
  computed: {},
  created() {
    if (this.workData && this.workData.id) {
      this.getSafetyMeasuresListFn(this.workData.id)
    }
    this.getPrefix()
  },
  methods: {
    getSafetyMeasuresListFn(id) {
      getSafetyMeasuresList(id).then(({ data }) => {
        const measuresData = data.result
        if (measuresData.length === 0) {
          return
        }
        // 先将数据转变成 一个人对应一条措施
        const measureList = []
        const replenishList = []
        for (const item of measuresData) {
          for (let i = 0; i < item.measureContent.length; i++) {
            const params = {
              userId: item.executorId,
              userName: item.executorName,
              id: item.measureContent[i].id,
              measureContent: item.measureContent[i].content,
              type: item.measureContent[i].type,
              signImagePath: item.signImagePath,
            }
            measureList.push(params)
          }
          for (let j = 0; j < item.extraSafetyMeasures.length; j++) {
            const param = {
              userId: item.executorId,
              userName: item.executorName,
              replenishInfo: item.extraSafetyMeasures[j],
              signImagePath: item.signImagePath,
            }
            replenishList.push(param)
          }
        }

        // 以措施id为key 去重
        const measureData = {}
        for (const item of measureList) {
          if (!measureData[item.id]) {
            measureData[item.id] = {
              id: item.id,
              measureContent: item.measureContent,
              type: item.type,
              signImagePath: [],
            }
          }
          measureData[item.id].signImagePath.push(item.signImagePath)
        }

        // 补充措施去重
        const replenishData = {}
        for (const key of replenishList) {
          if (!replenishData[key.replenishInfo]) {
            replenishData[key.replenishInfo] = {
              measureContent: `(补充措施) ${key.replenishInfo}`,
              signImagePath: [],
            }
          }
          replenishData[key.replenishInfo].signImagePath.push(key.signImagePath)
        }

        const showMeasureList = Object.values(measureData)
        const showReplenishList = Object.values(replenishData)

        this.allMeasureList = [...showMeasureList, ...showReplenishList]
        this.informList = this.allMeasureList.filter(item => item.type === '安全告知')

        this.allMeasureList.forEach((val) => {
          if (val.type === '安全措施' || !val.type) {
            this.measureList.push(val)
          }
        })
      })
    },
  },
}
</script>

<template>
  <div>
    <div>
      <!-- 安全措施 -->
      <template>
        <el-row
          v-if="measureList.length"
          class="table-box"
          type="flex"
        >
          <el-col
            class="table-item item-title"
            :span="2"
          >
            序号
          </el-col>
          <el-col
            class="table-item item-title"
            :span="18"
          >
            安全措施
          </el-col>
          <el-col
            class="table-item item-title"
            :span="4"
          >
            确认人
          </el-col>
        </el-row>
        <el-row
          v-for="(item, index) in measureList"
          :key="item.measureContent"
          class="table-box"
          type="flex"
        >
          <el-col
            class="table-item"
            :span="2"
          >
            {{ index + 1 }}
          </el-col>
          <el-col
            class="table-item"
            :span="18"
          >
            {{ item.measureContent }}
          </el-col>
          <el-col
            class="table-item"
            :span="4"
          >
            <el-image
              v-for="(v, i) in item.signImagePath"
              v-if="v"
              :key="i"
              class="sign-img"
              :src="filePrefix + v"
              :preview-src-list="[filePrefix + v]"
            />
          </el-col>
        </el-row>
      </template>
      <template>
        <!-- <el-row class="table-box" type="flex" v-if="informList.length" v-for="(items, indexs) in informList" :key="items.measureContent">
          <el-col class="table-item item-title" :span="2">安全确认</el-col>
          <el-col class="table-item" :span="18">{{ items.measureContent }}</el-col>
          <el-col class="table-item" :span="4">
            <el-image class="sign-img" v-for="(val, inx) in items.signImagePath" :key="inx" v-if="val" :src="filePrefix + val" :preview-src-list="[filePrefix + val]" />
          </el-col>
        </el-row> -->
        <div
          v-if="informList.length > 0"
          class="box"
        >
          <div class="box-left">
            安全确认
          </div>
          <div class="box-right">
            <div
              v-for="items in informList"
              v-if="informList.length"
              :key="items.measureContent"
              class="box-right-list"
            >
              <span>{{ items.measureContent }}</span>
              <div class="img-box">
                <el-image
                  v-for="(val, inx) in items.signImagePath"
                  v-if="val"
                  :key="inx"
                  class="sign-img"
                  :src="filePrefix + val"
                  :preview-src-list="[filePrefix + val]"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import './index.scss';
.box {
  width: 100%;
  border: 1px solid lightgray;
  display: flex;
  align-items: center;
  .box-left {
    width: 161.32px;
    height: 100%;
    text-align: center;
    font-weight: 600;
  }
  .box-right {
    width: calc(100% - 161.32px);
    border-left: 1px solid lightgray;
    .box-right-list {
      width: 100%;
      text-align: center;
      display: flex;
      span {
        display: inline-block;
        width: 643.49px;
        height: 60.8px;
        line-height: 60.8px;
        border-right: 1px solid lightgray;
        border-bottom: 1px solid lightgray;
      }
      .img-box {
        width: 161.32px;
        height: 60.8px;
        border-bottom: 1px solid lightgray;
        line-height: 60.8px;
        .sign-img {
          width: 80px !important;
          height: 50px !important;
        }
      }
    }
  }
}
</style>
