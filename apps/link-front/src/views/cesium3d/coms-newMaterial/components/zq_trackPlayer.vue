<script>
export default {
  name: "zq_trackPlayer",
  props: [
    "trackAaimateControl",
    "removeTrack",
    "setTrackSpeed",
    "drawingPercent",
    "cancelTrack",
    "playingTrack",
    "value",
  ],
  data() {
    return {
      visible: false,
      slider: null, // 滚动条DOM元素
      thunk: null, // 拖拽DOM元素
      playTrack: false, // 暂停/播放
      startTime: 0,
      // 开始时间戳
      startTimestamp: 0,
      endTime: 0,
      // 时间长度=开始时间-结束时间
      timeLength: 0,
      min: 0,
      max: 100,
      percent: this.value, // 比分比 ：进度条0-100
      // true 正向 ，flase 反向
      direction: true,

      trackSpeed: 1,
      // 是否被销毁
      isDestroy: false,
      // 时间长度   时:分：秒
      totalLength: " 00:00:00",
      // 是否跟踪  默认跟踪
      isTrackCheckbox: true,
    };
  },
  computed: {
    // 设置一个百分比，提供计算slider进度宽度和trunk的left值
    // 对应公式为 当前值-最小值/最大值-最小值 = slider进度width / slider总width
    // trunk left = slider进度width + trunk宽度/2

    // 进度条宽带 100
    scale() {
      return (this.percent - this.min) / (this.max - this.min);
    },
    width() {
      if (this.slider) {
        return `${this.slider.offsetWidth * this.scale}px`;
      } else {
        return `${0}px`;
      }
    },
    left() {
      if (this.slider) {
        let leftValue = this.slider.offsetWidth * this.scale;
        if (leftValue >= this.slider.offsetWidth - this.thunk.offsetWidth / 2) {
          leftValue = this.slider.offsetWidth - this.thunk.offsetWidth / 2;
        }
        return `${leftValue}px`;
      } else {
        return `${0}px`;
      }
    },
    // 计算实时时间戳
    getCurrTime() {
      if (this.timeLength === 0) {
        return "0000-00-00 00:00:00";
      } else {
        return this.formatTime(
          Number.parseInt(this.startTimestamp + this.timeLength * this.scale)
        );
      }
    },
    playTime() {
      if (this.timeLength === 0 || this.scale === 0) {
        return "00:00:00";
      } else {
        return this.getTimeLength(this.timeLength * this.scale);
      }
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newValue) {
        if (newValue > 100) {
          newValue = 100;
        }
        this.percent = newValue;
      },
    },
  },
  mounted() {
    this.isDestroy = false;
    // 初始化时间
    this.initial();
    this.slider = this.$refs.slider;
    this.thunk = this.$refs.trunk;
    const _this = this;
    // 添加鼠标拖拽
    this.thunk.onmousedown = function (e) {
      // 进度条的宽  0 - 560
      const width = Number.parseInt(_this.width);

      // clientX：当事件被触发时鼠标指针相对于窗口左边界的水平坐标
      const disX = e.clientX;
      document.onmousemove = function (event) {
        // 拖拽的时候获取的新width
        // disX：鼠标按下位置， e.clientX：鼠标拖动的位置， width:上一次进度条宽
        const newWidth = event.clientX - disX + width;
        // 拖拽的时候得到新的百分比
        const scale = newWidth / _this.slider.offsetWidth;

        // console.log('downX:',disX,' moveX:',event.clientX,' lastWidth:',width,' scale:',scale);

        // 监听拖动 正向和反正判断
        if (event.clientX - disX > 0) {
          // 正向
          _this.direction = true;
          // console.log('正向 isDrawing:',_this.$parent.isDrawing);
        } else if (event.clientX - disX < 0) {
          // 反向
          _this.direction = false;
          // console.log('反向 isDrawing:',_this.$parent.isDrawing);
        }

        // 停止计算拖动进度
        if (_this.$parent.isDrawing) {
          // Math.ceil向上取整  Math.floor
          _this.percent = Math.floor((_this.max - _this.min) * scale + _this.min);
          _this.percent = Math.max(_this.percent, _this.min);
          _this.percent = Math.min(_this.percent, _this.max);
          _this.playerDrawingPercent(
            _this.percent,
            Date.parse(_this.getCurrTime),
            _this.direction
          );
        } else {
          // 等待 - 原地拖动触发动画
          _this.playerDrawingPercent(
            _this.percent,
            Date.parse(_this.getCurrTime),
            _this.direction
          );
        }
      };
      document.onmouseup = function () {
        document.onmousemove = document.onmouseup = null;
      };
      return false;
    };
  },
  beforeDestroy() {
    this.isDestroy = true;
  },
  methods: {
    initial() {
      // 播放控制
      this.playTrack = false;
      this.$refs.playBut.innerText = "播放";

      // 时间显示
      this.startTime = "0000-00-00 00:00:00";
      this.endTime = "0000-00-00 00:00:00";
      this.timeLength = 0;

      this.min = 0; // 开始
      this.max = 100; // 结束

      this.percent = 0;
      this.trackSpeed = 1;

      this.totalLength = " 00:00:00";

      this.$refs.playBut.style.color = "#8d8b8b";
      this.$refs.playBut.style.border = "1px solid #585757";
    },
    upTimestamp(min, max) {
      // 重新监听变化
      this.percent = this.value;
      this.startTimestamp = min;
      this.startTime = this.formatTime(min);
      this.endTime = this.formatTime(max);
      this.timeLength = max - min;
      this.$parent.isDrawing = true;
      this.totalLength = this.getTimeLength(this.timeLength);
    },
    //  计算时间长度  小时：分钟：秒
    getTimeLength(timeLength) {
      // 计算天
      // 计算出相差天数 : 转换为毫秒
      // let days = Math.floor( (timeLength*1000) / (24 * 3600 * 1000));
      // 计算天数后剩余的毫秒数
      // let surplusHour = (timeLength*1000) % (24 * 3600 * 1000);

      // 计算小时 :
      let hour = Math.floor(timeLength / (3600 * 1000));
      hour = hour < 10 ? `0${hour}` : hour;

      // 计算分钟 ：计算小时数后剩余的毫秒数
      const surplusMinute = timeLength % (3600 * 1000);
      let minute = Math.floor(surplusMinute / (60 * 1000));
      minute = minute < 10 ? `0${minute}` : minute;

      // 计算秒 ： 计算分钟数后剩余的毫秒数
      const surplusSecond = surplusMinute % (60 * 1000);
      // 秒
      let second = Math.round(surplusSecond / 1000);
      second = second < 10 ? `0${second}` : second;
      return `${hour}:${minute}:${second}`;
    },

    // 是否视图跟踪
    isTrack(evnet) {
      if (this.isTrackCheckbox) {
        this.playingTrack();
      } else {
        // 清楚跟踪
        this.cancelTrack();
      }
    },

    closeHistoryTrack() {
      if (!this.isDestroy) {
        // 默认 灰色 #2e2e2e
        this.$refs.playBut.style.color = "#8d8b8b";
        this.$refs.playBut.style.border = "1px solid #585757";
        this.initial();
        this.removeTrack();
        this.visable = false;
      }
    },
    // 暂停和播放轨迹
    palyerPause(event) {
      if (this.playTrack) {
        this.pauseTrackPlay();
      } else {
        this.trackAaimateControl(true);
        event.target.innerText = "停止";
        // 高亮  蓝色
        event.target.style.color = "#409eff";
        this.$refs.playBut.style.border = "1px solid #409eff";
        this.playTrack = !this.playTrack;
      }
    },
    // 暂停轨迹播放
    pauseTrackPlay() {
      if (this.playTrack) {
        this.$refs.playBut.innerText = "播放";
        this.$refs.playBut.style.color = "#8d8b8b";
        this.$refs.playBut.style.border = "1px solid #585757";
        this.trackAaimateControl(false);
        // 暂停
        this.playTrack = false;
      }
    },

    // 播放速度
    palyerSpeed(speed) {
      this.setTrackSpeed(speed);
    },
    playerDrawingPercent(value, currentTime, direction) {
      this.drawingPercent(value, currentTime, direction);
    },
    // 时间戳转-时间
    formatTime(inputTime) {
      // console.log('time length:'+inputTime.toString().length);
      // var date = new Date(inputTime*1000);
      const timestamp = inputTime.toString().length === 10 ? inputTime * 1000 : inputTime;
      const date = new Date(timestamp);
      const y = date.getFullYear();
      let m = date.getMonth() + 1;
      m = m < 10 ? `0${m}` : m;
      let d = date.getDate();
      d = d < 10 ? `0${d}` : d;
      let h = date.getHours();
      h = h < 10 ? `0${h}` : h;
      let minute = date.getMinutes();
      let second = date.getSeconds();
      minute = minute < 10 ? `0${minute}` : minute;
      second = second < 10 ? `0${second}` : second;
      // 2022-03-23 20:49:31
      return `${y}-${m}-${d} ${h}:${minute}:${second}`;
      // Date.parse(time)/1000;日期转换成秒=就是时间戳
    },
  },
};
</script>

<template>
  <div v-show="visible" id="trackPlayer">
    <div>
      <label class="labelText" style="position: relative; left: 40%">{{
        getCurrTime
      }}</label>
      <button class="closeButton" @click="closeHistoryTrack">&times;</button>
    </div>
    <div class="trackInforation">
      <label class="labelText">{{ playTime }} / {{ totalLength }}</label>
      <div class="checkbox">
        <label key="checkbox-01">
          <input
            v-model="isTrackCheckbox"
            type="checkbox"
            checked="checked"
            @change="isTrack"
          />
          跟随
        </label>
      </div>
    </div>
    <div ref="slider" class="slider">
      <!-- 进度条 -->
      <div class="process" :style="{ width }" />
      <!-- 移动位置 -->
      <div ref="trunk" class="thunk" :style="{ left }">
        <!-- 拖拽滑动点 -->
        <div class="block" />
        <!-- 动态跟随数字 -->
        <!-- <div class="tips">
                    <span>{{scale * 100}}</span>
                    <i class="fas fa-caret-down" />
                </div> -->
      </div>
    </div>
    <div class="trackInforation">
      <label class="labelText">{{ startTime }}</label>
      <div>
        <button ref="playBut" @click="palyerPause($event)">播放</button>
        <select
          v-model="trackSpeed"
          class="control-select"
          @change="palyerSpeed(trackSpeed)"
        >
          <option value="1">1X</option>
          <option value="2">2X</option>
          <option value="4">4X</option>
          <option value="6">6X</option>
          <option value="8">8X</option>
          <option value="10">10X</option>
          <option value="16">16X</option>
          <option value="32">32X</option>
        </select>
      </div>
      <label class="labelText">{{ endTime }}</label>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#trackPlayer {
  position: absolute;
  bottom: 0px;
  left: calc(50% - 280px);
  width: auto;
  height: auto;
  background: #2e2e2ef0;
  z-index: 9900;
  color: white;
  padding: 10px;
  padding-left: 12px;
  border-radius: 6px;
  border: 1px solid #585757;
}
.trackInforation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  & > div {
    display: flex;
    justify-content: center;

    .control-select {
      height: 25px;
      width: 50px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 2px;
      background-color: #2e2e2e;
      color: gray;
      border: 1px solid #666565;
    }
    .control-select:hover {
      border: 1px solid #ffffff;
      color: #ffffff;
    }
    button {
      height: 25px;
      width: 50px;

      color: #8d8b8b;
      background-color: #2e2e2e !important;
      font-size: 12px;
      border: 0;
      border: 1px solid #666565;
      border-radius: 4px;
      margin-left: 2px;
      cursor: pointer;
    }
    button:hover {
      border: 1px solid #ffffff !important;
      color: #ffffff !important;
    }
  }
  .checkbox {
    /*         position: absolute;
        bottom: 25px;
        left: calc(30% - 60px);
        z-index: 100;
        padding: 16px 16px 6px;
        max-width: 180px; */
    background-size: 100% 100%;
    font-size: 12px;
    .layerBut {
      display: flex;
      flex-wrap: nowrap;
      width: 100%;
      background-color: #0f445d40;
      border: 1px solid #585757;
      color: gray;
      border: 0;
      cursor: pointer;

      .arrow {
        font-size: 20px;
        height: 12px;
        margin-right: 15px;
        transform: rotate(-90deg);
        -webkit-transform: rotate(-90deg);
        -moz-transform: rotate(-90deg);
      }
    }
    .layerBut:hover {
      color: #ffffff;
    }
    label {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      color: gray;
      border-radius: 10px;
    }
    input[type="checkbox"],
    input[type="radio"] {
      cursor: pointer;
      position: relative;
      width: 12px;
      height: 12px;
      font-size: 12px;
      margin-right: 10px;
    }
    input[type="checkbox"]:checked:after {
      content: "✓";
      font-size: 12px;
      // font-weight: bold;
      color: gray;
      margin-right: 5px;
    }
    input[type="checkbox"]:after {
      position: absolute;
      top: -2px;
      background: rgba(27, 31, 50, 1);
      border: 1px solid #585757;
      color: #000;
      width: 15px;
      height: 15px;
      display: inline-block;
      visibility: visible;
      padding-left: 0px;
      text-align: center;
      content: " ";
      border-radius: 3px;
    }
    input:hover {
      border: 1px solid #2288ee;
    }
  }
}

.closeButton {
  position: relative;
  float: right;
  background-color: #2e2e2e;
  color: gray;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
.closeButton:hover {
  color: #409eff;
}
.labelText {
  font-size: 14px;
  color: gray;
}

.box {
  margin: 100px auto 0;
  width: 80%;
}
.clear:after {
  content: "";
  display: block;
  clear: both;
}
.slider {
  position: relative;
  margin: 15px 0;
  width: 560px;
  height: 4px;
  background: #4e4e4e;
  cursor: pointer;
}
.slider .process {
  position: absolute;
  left: 0;
  top: 0;
  width: 112px;
  height: 4px;
  background: #409eff;
}
.slider .thunk {
  position: absolute;
  left: 100px;
  top: -7px;
  width: 20px;
  height: 20px;
}
.slider .block {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid #409eff;
  background: rgba(255, 255, 255, 1);
  transition: 0.2s all;
}
.slider .tips {
  position: absolute;
  left: -7px;
  bottom: 30px;
  min-width: 15px;
  text-align: center;
  padding: 4px 8px;
  background: #000;
  border-radius: 5px;
  height: 24px;
  color: #fff;
}
.slider .tips i {
  position: absolute;
  margin-left: -5px;
  left: 50%;
  bottom: -9px;
  font-size: 12px;
  color: #000;
}
.slider .block:hover {
  transform: scale(1.1);
  opacity: 0.6;
}
</style>
