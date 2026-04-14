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
        safetyDisclosure: {},
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
    <div class="box">
      <span>施工方案</span>
      <ImageSelect
        :signUrl="
          inputForm.safetyDisclosure.constructionPlan
            ? filePrefix + inputForm.safetyDisclosure.constructionPlan
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
          inputForm.safetyDisclosure.technicalDisclosure
            ? filePrefix + inputForm.safetyDisclosure.technicalDisclosure
            : ''
        "
        width="100px"
        height="100px"
        disabled
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.handle {
  cursor: no-drop;
  display: flex;
  padding-left: 140px;
  box-sizing: border-box;
}
.box {
  display: flex;
  flex-direction: column;
  margin-right: 300px;
  span {
    font-size: 16px;
    margin-bottom: 20px;
    font-weight: 600;
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
</style>
