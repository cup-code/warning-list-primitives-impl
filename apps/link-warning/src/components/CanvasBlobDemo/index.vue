<template>
  <div class="canvas-blob-demo">
    <h3>Canvas.toBlob() 方法使用示例</h3>

    <!-- Canvas画布 -->
    <div class="canvas-container">
      <canvas
        ref="demoCanvas"
        width="400"
        height="300"
        style="border: 1px solid #ccc; background: #f5f5f5;"
      ></canvas>
    </div>

    <!-- 操作按钮 -->
    <div class="button-group">
      <el-button @click="drawOnCanvas" type="primary">绘制内容</el-button>
      <el-button @click="convertToBlob" type="success">转换为Blob</el-button>
      <el-button @click="createBlobLink" type="warning">创建Blob链接</el-button>
      <el-button @click="downloadAsFile" type="info">下载为文件</el-button>
      <el-button @click="uploadToServer" type="danger">上传到服务器</el-button>
    </div>

    <!-- 结果显示 -->
    <div class="results" v-if="results.length">
      <h4>转换结果：</h4>
      <div v-for="(result, index) in results" :key="index" class="result-item">
        <p><strong>{{ result.type }}:</strong> {{ result.value }}</p>
        <img v-if="result.type === 'Blob链接'" :src="result.value" style="max-width: 200px; max-height: 150px;" />
      </div>
    </div>
  </div>
</template>

<script>
import { canvasToBlob, createBlobURL, createFileFromCanvas, revokeBlobURL } from '@/utils/canvasToImage';
import { upLoadImg } from '@/http/manage-api';

export default {
  name: 'CanvasBlobDemo',
  data() {
    return {
      results: [],
      blobURLs: [] // 存储blob URLs，用于清理
    };
  },

  beforeDestroy() {
    // 组件销毁时清理blob URLs
    this.blobURLs.forEach(url => revokeBlobURL(url));
  },

  methods: {
    /**
     * 在canvas上绘制一些内容
     */
    drawOnCanvas() {
      const canvas = this.$refs.demoCanvas;
      const ctx = canvas.getContext('2d');

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制背景
      ctx.fillStyle = '#e3f2fd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制圆形
      ctx.fillStyle = '#2196f3';
      ctx.beginPath();
      ctx.arc(200, 150, 80, 0, 2 * Math.PI);
      ctx.fill();

      // 绘制文字
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Canvas.toBlob()', 200, 150);
      ctx.fillText('示例', 200, 180);

      this.$message.success('已在Canvas上绘制内容');
    },

    /**
     * 使用canvas.toBlob()转换为Blob对象
     */
    async convertToBlob() {
      try {
        const canvas = this.$refs.demoCanvas;
        const blob = await canvasToBlob(canvas, 'image/png', 0.9);

        this.results.push({
          type: 'Blob对象',
          value: `大小: ${(blob.size / 1024).toFixed(2)} KB, 类型: ${blob.type}`
        });

        this.$message.success('Canvas已转换为Blob对象');
      } catch (error) {
        this.$message.error('转换失败: ' + error.message);
      }
    },

    /**
     * 创建Blob链接
     */
    async createBlobLink() {
      try {
        const canvas = this.$refs.demoCanvas;
        const blobURL = await createBlobURL(canvas, 'image/png', 0.9);

        // 存储blob URL用于后续清理
        this.blobURLs.push(blobURL);

        this.results.push({
          type: 'Blob链接',
          value: blobURL
        });

        this.$message.success('已创建Blob链接');
      } catch (error) {
        this.$message.error('创建Blob链接失败: ' + error.message);
      }
    },

    /**
     * 下载为文件
     */
    async downloadAsFile() {
      try {
        const canvas = this.$refs.demoCanvas;
        const blob = await canvasToBlob(canvas, 'image/png', 0.9);
        const url = URL.createObjectURL(blob);

        // 创建下载链接
        const link = document.createElement('a');
        link.href = url;
        link.download = `canvas-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 释放URL
        URL.revokeObjectURL(url);

        this.$message.success('文件下载成功');
      } catch (error) {
        this.$message.error('下载失败: ' + error.message);
      }
    },

    /**
     * 上传到服务器
     */
    async uploadToServer() {
      try {
        const canvas = this.$refs.demoCanvas;
        const file = await createFileFromCanvas(canvas, `canvas-${Date.now()}.png`, 'image/png', 0.9);

        // 上传到服务器
        const response = await upLoadImg(file, 'CANVAS_IMAGE', true);

        let httpURL = '';
        if (response && response.data && response.data.url) {
          httpURL = response.data.url;
        } else if (response && response.url) {
          httpURL = response.url;
        }

        this.results.push({
          type: 'HTTP链接',
          value: httpURL
        });

        this.$message.success('上传成功');
      } catch (error) {
        this.$message.error('上传失败: ' + error.message);
      }
    }
  }
};
</script>

<style scoped>
.canvas-blob-demo {
  padding: 20px;
}

.canvas-container {
  margin: 20px 0;
  text-align: center;
}

.button-group {
  margin: 20px 0;
  text-align: center;
}

.button-group .el-button {
  margin: 0 10px;
}

.results {
  margin-top: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 4px;
}

.result-item {
  margin: 10px 0;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #2196f3;
}

.result-item img {
  display: block;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>

