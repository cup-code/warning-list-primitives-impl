<script>
export default {
  props: {
    routerList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      defaultPath: '', // 跳转地址
      circlarDeg: 0, // 旋转角度计数
    }
  },
  methods: {
    getDeg(index) {
      return `${(index + 4) * 60}deg` // 从240度开始，每个div角度是60度
    },
    changeNav(index) {
      this.circlarDeg = this.circlarDeg + index
      const circlar = document.getElementById('circlar')
      circlar.style.transform = `rotateZ(${this.circlarDeg * 60}deg)`
    },
    /* 点击菜单按钮，跳转页面 */
    clickchange(item) {
      this.defaultPath = item.path
      this.openDefaultMenu(item)
    },
    openDefaultMenu(item) {
      if (item.children && item.children.length > 0) {
        this.defaultPath += `/${item.children[0].path}`
        if (item.children[0].query) {
          this.defaultPath += `?${item.children[0].query}`
        }
        this.openDefaultMenu(item.children[0])
      }
      else {
        if (item.pageSourceType == 1) {
          // 如果是前端组件类型
          this.$router.push(this.defaultPath)
        }
        else if (item.pageSourceType == 3) {
          // 如果是外链地址
          const element = document.createElement('a')
          element.setAttribute('href', item.externalUrl)
          element.setAttribute('target', '_blank')
          element.style.display = 'none'
          document.body.appendChild(element)
          element.click()
          document.body.removeChild(element)
        }
      }
    },
  },
}
</script>

<template>
  <div class="bi-middle">
    <div class="bi-middle-img">
      <div class="bi-middle-text">
        安全平台
      </div>
      <div class="ring-middle" />
      <div class="button-section">
        <div
          class="turn-button"
          :style="`background-image:url(${require('@/assets/xingfa/arrowicon.png').default});`"
          @click="changeNav(-1)"
        />
        <div
          class="turn-button"
          :style="`background-image:url(${require('@/assets/xingfa/arrowicon2.png').default});`"
          @click="changeNav(1)"
        />
      </div>
      <div id="circlar">
        <div
          v-for="(item, index) in routerList"
          :key="index"
          class="rotate-text"
          :style="`transform: rotateZ(${getDeg(index)});`"
        >
          <div
            class="ringside"
            @click="clickchange(item)"
          >
            <svg
              viewBox="0 0 170 170"
              width="38.125vw"
              height="38.125vw"
              style="transform: translate(-29%, 0%); pointer-events: none"
            >
              <path
                id="circle"
                d="M 40,140 a 70,70 0 1,1 1,1 L 20,70z"
              />
              <text
                x="146"
                y="0"
              >
                <textPath xlink:href="#circle">{{ item.menuName }}</textPath>
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bi-middle {
  width: 49%;
  height: 100%;
  position: relative;
  .bi-middle-text {
    position: absolute;
    width: 19vw;
    margin: 44% 26%;
    text-align: center;
    font-size: 3.2458vw;
    font-family: FZDaHei-B02;
    text-shadow: 1px 1px 1vw #00e7ff;
  }
  .bi-middle-img {
    overflow: hidden;
    /*父元素添加hidden，防止溢出*/
    width: 40.125vw;
    height: 40.125vw;
    border-radius: 50%;
    margin: 2.6041vw auto;
    background-size: 100% 100%;
    background-origin: content-box;
    position: relative;
    pointer-events: none;
    overflow: hidden;
    .ring-middle {
      z-index: 2;
      position: absolute;
      width: 30.25vw;
      height: 30.25vw;
      top: 50%;
      left: 50%;
      margin: -15.125vw 0 0 -15.125vw;
      background-image: url('~@/assets/xingfa/ringmain.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      pointer-events: none;
    }
    .button-section {
      z-index: 1;
      position: absolute;
      top: 80.5%;
      left: 25%;
      width: 20vw;
      height: 8vw;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      -webkit-clip-path: polygon(15% 0%, -10% 100%, 104% 100%, 81% 0%);
      background-image: url('~@/assets/xingfa/p.png');
      display: flex;
      pointer-events: auto;
      justify-content: space-between;
      .turn-button {
        background-repeat: no-repeat;
        background-size: 3.5vw 5vh;
        margin: 2vw 1.8vw;
        width: 4vw;
        height: 8vh;
        pointer-events: auto;
      }
    }
  }
}
/*圆环样式*/
#circlar {
  z-index: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition-duration: 1s;
  /*设置对象动画*/
  /*animation:revolve 5s linear 0s infinite  normal;*/
  /*animation-fill-mode: both;*/
  /*animation-play-state: running;*/
  .rotate-text {
    position: absolute;
    display: inline-block;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    color: #66e4ff;
    font-size: 2.0312vw;
    line-height: 1.5789vw;
    text-shadow: 1px 1px 1vw #00e7ff;
    /*设置对象的过渡，贝塞尔曲线：(x,y)(x,y)第一个控制点 第二个控制点*/
    transition: all 0.5s cubic-bezier(0, 0, 0, 1);
    pointer-events: none;
    .ringside {
      width: 18.3854vw;
      height: 7.6041vw;
      transform: translate(62%, -7%);
      background-image: url('~@/assets/xingfa/ringside.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      pointer-events: auto;
    }
    .ringside:hover {
      background-image: url('~@/assets/xingfa/G.png');
      cursor: pointer;
    }
  }
}

/*环形文字样式*/
.ringside text {
  font-size: 8px;
  fill: #66e4ff;
  line-height: 1.5789vw;
  text-shadow: 1px 1px 20px #00e7ff;
}
.ringside path {
  /*fill: red;*/
  fill: none;
}
.ringside svg {
  display: block;
}
</style>
