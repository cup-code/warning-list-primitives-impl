<script>
import BaseInfo from "@/components/Detail/Device/BaseInfo";
import Command from "@/components/Detail/Device/Command";
import Extend from "@/components/Detail/Device/Extend";
import Point from "@/components/Detail/Device/Point";
import PointEdit from "@/components/Detail/Device/PointEdit";
import PointHis from "@/components/Detail/Device/PointHis";
import ProtocolPr from "@/components/Detail/Device/ProtocolPr";
import { getInfoById } from "@/http/dev/manage-api";
import { formatDate } from "@/utils";

export default {
  components: {
    BaseInfo,
    Point,
    PointEdit,
    PointHis,
    Command,
    Extend,
    ProtocolPr,
  },
  data: () => ({
    loading: false,
    pid: "", // 由路由传递进来的产品id
    did: "", // 由路由传递进来的设备id
    dcd: "", // 由路由传递进来的设备code
    baseInfo: {}, // 接口获得的基础信息
    cur_tab: "BaseInfo", // 当前选中的标签(默认第一个)
  }),
  created() {
    this.pid = this.$route.params.pid;
    this.did = this.$route.params.did;
    this.dcd = this.$route.params.dcd;
    this.getDataList();
    this.getPrefix();
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true;
      getInfoById(this.pid, this.did)
        .then(({ data }) => {
          this.loading = false;
          const msg = data.message;
          if (data.success) {
            this.baseInfo = data.result || {};
            this.baseInfo.typeName =
              this.$dictUtils
                .getDictList("product_type")
                .find((item) => item.dictCode == this.baseInfo.type).dictName || "";
          } else {
            this.$message.error(msg || "获取 基础信息 失败");
          }
        })
        .catch((err) => {
          this.loading = false;
          this.$message.error("获取 基础信息 失败");
        });
    },
    changeFn() {
      this.getDataList();
    },
    backFn() {
      this.$router.back(-1);
    },
  },
};
</script>

<template>
  <div class="page-container">
    <ECard>
      <EButton
        class="button-back"
        type="text"
        size="mini"
        btnIcon="el-icon-arrow-left"
        @click="backFn"
      >
        返回
      </EButton>
      <div class="base-info">
        <div class="card-title">基础信息</div>
        <el-row class="card-con" type="flex" align="middle">
          <el-col :span="5">
            <div>
              <span>设备名称:</span>
              <span>{{ baseInfo.name }}</span>
            </div>
            <div>
              <span>设备编码:</span>
              <span>{{ baseInfo.code }}</span>
            </div>
            <div>
              <span>设备描述:</span>
              <span>{{ baseInfo.remarks }}</span>
            </div>
          </el-col>
          <el-col :span="5">
            <div>
              <span>所属产品:</span>
              <span>{{ baseInfo.productName }}</span>
            </div>
            <div>
              <span>产品类型:</span>
              <span>{{ baseInfo.typeName }}</span>
            </div>
            <div>
              <span>所属分组:</span>
              <span>{{ baseInfo.groupName }}</span>
            </div>
          </el-col>
          <el-col :span="5">
            <div>
              <span>设备状态:</span>
              <span v-if="baseInfo.state === -1">未发布</span>
              <span v-if="baseInfo.state === 0">未激活</span>
              <span v-if="baseInfo.state === 1">离线</span>
              <span v-if="baseInfo.state === 2">在线</span>
            </div>
            <div>
              <span>创建时间:</span>
              <span>{{ formatDate(baseInfo.createdTime) }}</span>
            </div>
            <div>
              <span>更新时间:</span>
              <span>{{ formatDate(baseInfo.updatedTime) }}</span>
            </div>
          </el-col>
          <el-col :span="5" style="height: 100%">
            <img :src="filePrefix + baseInfo.imageUrl" style="height: 100%" />
          </el-col>
          <el-col :span="4" style="text-align: right" />
        </el-row>
      </div>
    </ECard>
    <ECard>
      <el-tabs v-model="cur_tab">
        <el-tab-pane label="基础属性" name="BaseInfo">
          <base-info v-if="cur_tab == 'BaseInfo'" :dt="baseInfo" @change="changeFn" />
        </el-tab-pane>
        <el-tab-pane label="测点属性" name="Point">
          <point v-if="cur_tab == 'Point'" :pid="pid" :did="did" :dcd="dcd" />
        </el-tab-pane>
        <el-tab-pane label="测点历史" name="PointHis">
          <point-his v-if="cur_tab == 'PointHis'" :pid="pid" :did="did" />
        </el-tab-pane>
        <el-tab-pane label="测点编辑" name="PointEdit">
          <point-edit v-if="cur_tab == 'PointEdit'" :did="did" />
        </el-tab-pane>
        <el-tab-pane label="扩展属性" name="Extend">
          <extend v-if="cur_tab == 'Extend'" :pid="pid" />
        </el-tab-pane>
        <el-tab-pane label="协议参数" name="ProtocolPr">
          <protocol-pr v-if="cur_tab == 'ProtocolPr'" :dt="baseInfo" />
        </el-tab-pane>

        <!-- <el-tab-pane label="命令属性">
                正在开发中...
                <command :pid="pid" :did="did" />
            </el-tab-pane> -->
      </el-tabs>
    </ECard>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  position: relative;
  .card-title {
    font-size: 14px;
    font-weight: 500;
  }

  .base-info {
    margin: 10px 0 0 20px;
  }

  .button-back {
    margin-top: -10px;
    margin-right: 20px;
  }

  .card-con {
    padding: 10px 20px;
    height: 63px;
    box-sizing: content-box;
    .el-col {
      & > div {
        padding: 4px 0;
        & > span:first-child {
          padding-right: 10px;
        }
      }
    }
    //   }
  }
  //   }
}
</style>
