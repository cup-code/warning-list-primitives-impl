<script>
export default {
  name: 'SkillTable',
  props: {
    skillList: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
}
</script>

<template>
  <div class="skill-table-wrapper" style="margin-top: 10px">
    <div class="mb-4 text-base font-semibold">
      配置技能详情：
    </div>
    <div class="flex justify-center">
      <table
        class="skill-table"
        style="
          width: 100%;
          border-collapse: collapse;
          text-align: center;
          box-sizing: border-box;
          border: 1px solid #333;
        "
      >
        <tbody>
          <tr v-for="row in Math.ceil((skillList.length || 0) / 2)" :key="row">
            <td
              style="
                border: 1px solid #333;
                padding: 6px 10px;
                min-width: 40px;
                width: 40px;
                background-color: #ebebea;
                vertical-align: middle;
                text-align: center;
              "
            >
              <img
                v-if="skillList[(row - 1) * 2]"
                src="https://img.icons8.com/color/24/000000/ok--v1.png"
                alt="✔"
                style="width: 18px; vertical-align: middle"
              >
            </td>
            <td
              style="
                border: 1px solid #333;
                padding: 6px 10px;
                min-width: 100px;
                height: 40px;
                vertical-align: middle;
                text-align: center;
              "
            >
              <span
                v-if="skillList[(row - 1) * 2]"
                style="display: inline-block; vertical-align: middle; line-height: normal"
              >
                {{ skillList[(row - 1) * 2] }}
              </span>
            </td>
            <td
              style="
                border: 1px solid #333;
                padding: 6px 10px;
                min-width: 40px;
                width: 40px;
                background-color: #ebebea;
                vertical-align: middle;
                text-align: center;
              "
            >
              <img
                v-if="skillList[(row - 1) * 2 + 1]"
                src="https://img.icons8.com/color/24/000000/ok--v1.png"
                alt="✔"
                style="width: 18px; vertical-align: middle"
              >
            </td>
            <td
              style="
                border: 1px solid #333;
                padding: 6px 10px;
                min-width: 100px;
                height: 40px;
                vertical-align: middle;
                text-align: center;
              "
            >
              <span
                v-if="skillList[(row - 1) * 2 + 1]"
                style="display: inline-block; vertical-align: middle; line-height: normal"
              >
                {{ skillList[(row - 1) * 2 + 1] }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
