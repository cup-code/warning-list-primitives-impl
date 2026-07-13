<script>
import { is } from "kaka-bpmn/lib/util/ModelUtil";
import { getExtensionFormDefinitionList } from "@/http/safe-production/flowable-api";

import Form from "../groups/parts/Form";

export default {
  components: {
    Form,
  },
  props: {
    element: {
      type: Object,
      default: undefined,
    },
    bpmnModeler: {
      type: Object,
      default: undefined,
    },
    name: "",
  },
  data() {
    return {
      formOptions: [],
    };
  },
  computed: {
    enable() {
      if (!this.ensureFormKeyAndDataSupported(this.element)) {
        return false;
      } else {
        return true;
      }
    },
  },
  created() {
    getExtensionFormDefinitionList({
      pageNo: 1,
      pageSize: -1,
      status: 1,
    }).then(({ data }) => {
      if (data.code === 200) {
        data.page.list.forEach((item) => {
          this.formOptions.push({
            id: item.id,
            name: item.name,
            jsonId: item.formDefinitionJson.id,
            version: item.formDefinitionJson.version,
            json: item.formDefinitionJson.json,
          });
        });
      } else {
        this.$message.error(data.message);
      }
    });
  },
  methods: {
    ensureFormKeyAndDataSupported(element) {
      return (
        (is(element, "bpmn:StartEvent") && !is(element.parent, "bpmn:SubProcess")) ||
        is(element, "bpmn:UserTask")
      );
    },
  },
};
</script>

<template>
  <el-collapse-item v-if="enable" :name="name">
    <template slot="title">
      <span class="title">表单设置</span>
      <i class="header-icon el-icon-info" />
    </template>

    <Form :element="element" :bpmnModeler="bpmnModeler" :formOptions="formOptions" />
  </el-collapse-item>
</template>
