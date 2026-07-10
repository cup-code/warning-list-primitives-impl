<script setup>
import { Users, ChevronDown } from "lucide-vue";
import { ref, computed } from "vue";

const props = defineProps({
  onlineCount: {
    type: Number,
    default: 0,
  },
  taskOptions: {
    type: Array,
    default: () => [],
    // [{ label, value }]
  },
  selectedPlanId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(["plan-change"]);

// 下拉框展开状态
const isOpen = ref(false);

// 当前选中的选项
const selectedOption = computed(() => {
  return props.taskOptions.find((opt) => opt.value === props.selectedPlanId);
});

// 切换下拉框
function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

// 选择选项
function selectOption(option) {
  if (option.value !== props.selectedPlanId) {
    emit("plan-change", option.value);
  }
  isOpen.value = false;
}

// 点击外部关闭
function handleClickOutside(e) {
  if (!e.target.closest(".task-selector")) {
    isOpen.value = false;
  }
}

// 添加/移除全局点击监听
if (typeof window !== "undefined") {
  window.addEventListener("click", handleClickOutside);
}
</script>

<template>
  <div class="top-bar">
    <div class="online-indicator">
      <Users :size="18" :stroke-width="2" color="#00D4FF" />
      <span class="indicator-label">当前任务数</span>
      <span class="indicator-value cyan">{{ onlineCount }}</span>
    </div>

    <div class="task-selector" :class="{ 'is-open': isOpen }">
      <span class="selector-label">巡检任务：</span>
      <div class="custom-select" @click.stop="toggleDropdown">
        <div class="select-trigger">
          <span class="select-value" :class="{ placeholder: !selectedOption }">
            {{ selectedOption?.label || "请选择巡检计划" }}
          </span>
          <ChevronDown :size="16" class="select-arrow" :class="{ rotate: isOpen }" />
        </div>

        <!-- 下拉选项列表 -->
        <Transition name="dropdown">
          <div v-show="isOpen" class="select-dropdown">
            <div
              v-for="opt in taskOptions"
              :key="opt.value"
              class="select-option"
              :class="{ active: opt.value === selectedPlanId }"
              @click.stop="selectOption(opt)"
            >
              <span class="option-label">{{ opt.label }}</span>
              <span v-if="opt.value === selectedPlanId" class="option-check">✓</span>
            </div>
            <div v-if="taskOptions.length === 0" class="select-empty">暂无巡检计划</div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background: rgba(18, 38, 60, 0.85);
  border-radius: 8px;
  position: relative;
}

.online-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.indicator-label {
  font-size: 13px;
  color: var(--text-secondary, #8b9dc3);
}

.indicator-value {
  font-size: 18px;
  font-weight: 700;
}

.indicator-value.cyan {
  color: var(--accent-cyan, #00d4ff);
}

/* ===== 自定义下拉选择器 ===== */
.task-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.selector-label {
  font-size: 13px;
  color: var(--text-secondary, #8b9dc3);
  white-space: nowrap;
}

.custom-select {
  position: relative;
  min-width: 160px;
  max-width: 240px;
  cursor: pointer;
  user-select: none;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-panel, #111b2e);
  border: 1px solid var(--border-dim, #1e3050);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.select-trigger:hover {
  border-color: var(--accent-cyan, #00d4ff);
  background: rgba(0, 212, 255, 0.05);
}

.task-selector.is-open .select-trigger {
  border-color: var(--accent-cyan, #00d4ff);
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.15);
}

.select-value {
  font-size: 13px;
  color: var(--text-primary, #ffffff);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-value.placeholder {
  color: var(--text-muted, #4a5f85);
}

.select-arrow {
  color: var(--text-secondary, #8b9dc3);
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.select-arrow.rotate {
  transform: rotate(180deg);
}

/* 下拉列表 */
.select-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 280px;
  overflow-y: auto;
  background: var(--bg-panel, #111b2e);
  border: 1px solid var(--border-dim, #1e3050);
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 212, 255, 0.1);
  z-index: 100;
  padding: 4px;
}

/* 滚动条样式 */
.select-dropdown::-webkit-scrollbar {
  width: 4px;
}

.select-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.select-dropdown::-webkit-scrollbar-thumb {
  background: var(--border-dim, #1e3050);
  border-radius: 2px;
}

.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.select-option:hover {
  background: rgba(0, 212, 255, 0.1);
}

.select-option.active {
  background: rgba(0, 212, 255, 0.15);
}

.option-label {
  font-size: 13px;
  color: var(--text-primary, #ffffff);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-check {
  font-size: 12px;
  color: var(--accent-cyan, #00d4ff);
  margin-left: 8px;
  flex-shrink: 0;
}

.select-empty {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted, #4a5f85);
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
