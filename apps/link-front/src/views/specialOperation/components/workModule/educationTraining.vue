<script>
import ImageSelect from '@/components/ImageSelect'

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
        trainContents: {},
      },
    }
  },
  created() {
    this.getPrefix() // 获取图片/文件前缀
    setTimeout(() => {
      this.inputForm = Object.assign(this.inputForm, this.workData)
    }, 300)
  },
  methods: {},
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
      <el-form-item label="现场培训照片">
        <div class="imgList-box">
          <ImageSelect
            v-for="(item, index) in inputForm.trainContents.trainingPhotos"
            :key="index"
            class="img-box"
            :signUrl="item ? filePrefix + item : ''"
            width="100px"
            height="100px"
            disabled
          />
        </div>
      </el-form-item>
      <el-form-item label="培训内容">
        <el-input
          v-model="inputForm.safetyMeasuresSignTime"
          type="textarea"
          class="small-box"
        />
      </el-form-item>
      <el-form-item label="教育培训负责人签字">
        <ImageSelect
          :signUrl="
            inputForm.trainContents.signImage ? filePrefix + inputForm.trainContents.signImage : ''
          "
          width="250px"
          height="100px"
          disabled
        />
      </el-form-item>
      <el-form-item>
        <div class="scheme-box">
          <div class="box">
            <span>施工方案</span>
            <ImageSelect
              :signUrl="
                inputForm.trainContents.constructionPlan
                  ? filePrefix + inputForm.trainContents.constructionPlan
                  : ''
              "
              width="100px"
              height="100px"
              disabled
            />
          </div>
          <div class="box">
            <span>技术交底</span>
            <ImageSelect
              :signUrl="
                inputForm.trainContents.technicalDisclosure
                  ? filePrefix + inputForm.trainContents.technicalDisclosure
                  : ''
              "
              width="100px"
              height="100px"
              disabled
            />
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.handle {
  cursor: no-drop;
}
.small-box {
  width: 600px;
}
.imgList-box {
  display: flex;
  .img-box {
    margin-right: 20px;
  }
}

.scheme-box {
  display: flex;
  .box {
    display: flex;
    flex-direction: column;
    margin-right: 300px;
    span {
      font-size: 16px;
      margin-bottom: 20px;
      text-indent: 20px;
      position: relative;
    }
    span::after {
      content: '';
      width: 8px;
      height: 24px;
      background: #93d2f3;
      position: absolute;
      left: 0px;
    }
  }
}
</style>
