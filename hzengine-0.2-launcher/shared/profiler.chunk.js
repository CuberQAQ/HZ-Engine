import { event, widget, deleteWidget, getTextLayout, createWidget, prop } from "@zos/ui";
import { getPerformance } from "@zos/app";
import { getDeviceInfo } from "@zos/device";
import { getSystemInfo } from "@zos/settings";
function DragAndDrop(options) {
  this.target = options.target;
  this.onDragStart = options.onDragStart;
  this.onDrag = options.onDrag;
  this.onDragEnd = options.onDragEnd;
  this.long_press_timeout = options.long_press_timeout || 500;
  this.drag_timeout = options.drag_timeout || 1e3;
  this.is_dragging = false;
  this.drag_pos_y = 0;
  this.listeners = {};
  this.addListeners();
}
DragAndDrop.prototype.addListeners = function() {
  let long_press_timer;
  let drag_inactivity_timer;
  const clearAllTimers = () => {
    clearTimeout(long_press_timer);
    clearTimeout(drag_inactivity_timer);
  };
  const resetDragInactivityTimer = () => {
    clearTimeout(drag_inactivity_timer);
    drag_inactivity_timer = setTimeout(() => {
      this.stopDragging();
    }, this.drag_timeout);
  };
  this.listeners = { click_down: (info) => {
    clearAllTimers();
    long_press_timer = setTimeout(() => {
      this.startDragging(info.y);
      resetDragInactivityTimer();
    }, this.long_press_timeout);
  }, move: (info) => {
    if (this.is_dragging) {
      this.updateDragPosition(info.y);
      resetDragInactivityTimer();
    }
  }, click_up: () => {
    clearAllTimers();
    if (this.is_dragging) {
      this.stopDragging();
    }
  } };
  this.target.addEventListener(event.CLICK_DOWN, this.listeners.click_down);
  this.target.addEventListener(event.MOVE, this.listeners.move);
  this.target.addEventListener(event.CLICK_UP, this.listeners.click_up);
};
DragAndDrop.prototype.removeListeners = function() {
  if (this.target && this.listeners) {
    this.target.removeEventListener(event.CLICK_DOWN, this.listeners.click_down);
    this.target.removeEventListener(event.MOVE, this.listeners.move);
    this.target.removeEventListener(event.CLICK_UP, this.listeners.click_up);
  }
};
DragAndDrop.prototype.startDragging = function(y) {
  this.is_dragging = true;
  this.drag_pos_y = y;
  if (this.onDragStart) this.onDragStart(y);
};
DragAndDrop.prototype.stopDragging = function() {
  this.is_dragging = false;
  if (this.onDragEnd) this.onDragEnd();
};
DragAndDrop.prototype.updateDragPosition = function(y) {
  const delta_y = y - this.drag_pos_y;
  this.drag_pos_y = y;
  if (this.onDrag) this.onDrag(delta_y);
};
DragAndDrop.prototype.destroy = function() {
  this.removeListeners();
};
const VERSION = "0.8.0";
const PREFIX = `[Profiler v${VERSION}]`;
let DEBUG_LEVEL = 1;
const MIN_API_VERSION = 4;
const { height: DEVICE_HEIGHT$1 } = getDeviceInfo();
const { minAPI: minAPI$1 } = getSystemInfo();
const API_VERSION$1 = minAPI$1;
const ERR = { API_VER_TOO_LOW: `${PREFIX} requires API v${MIN_API_VERSION} or higher. Current version: ${API_VERSION$1}` };
function checkAPIVersion() {
  if (isNaN(API_VERSION$1) || API_VERSION$1 < MIN_API_VERSION) {
    console.log(ERR.API_VER_TOO_LOW);
  }
}
const QuickJS = (function() {
  return { min: Math.min, max: Math.max, sqrt: Math.sqrt, abs: Math.abs, round: Math.round, ceil: Math.ceil, keys: Object.keys, now: Date.now };
})();
function isTopHalfOfTheScreen(y) {
  return y < DEVICE_HEIGHT$1 * 0.5;
}
function getYShift(y, widget_height) {
  const mid = DEVICE_HEIGHT$1 * 0.5;
  const zone = widget_height * 2;
  if (y < mid - zone) return widget_height;
  else if (y > mid + zone) return 0;
  else {
    const t = (mid + zone - y) / (2 * zone);
    return widget_height * t;
  }
}
function slack(depth = 2) {
  let c = "";
  const s = new Error().stack;
  if (typeof s === "string" && s.includes("\n")) {
    const f = s.split("\n")[depth];
    if (f == null ? void 0 : f.startsWith("    at ")) {
      c = f.slice(7).split(" ")[0];
    }
  }
  return c;
}
function setDebugLevel(level) {
  DEBUG_LEVEL = level;
}
function debugLog(level, msg = "", ...msgs) {
  if (level > DEBUG_LEVEL) return;
  const what = slack();
  const out = `${what}()${msg ? ", " + msg : ""}`;
  if (msgs.length === 0) {
    console.log(PREFIX, ">>>", out);
  } else {
    console.log(PREFIX, ">>>", out, ...msgs);
  }
}
setDebugLevel(3);
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();
const { minAPI } = getSystemInfo();
const API_VERSION = minAPI;
const COLORS = { SYS_FRAMEWORK: 4868682, SYS_SYSTEM: 7237230, APP: 10395294, PAGE: 12434877, BG: 1118481, WHITE: 16777215, BLACK: 0, FREE_GREEN: 5025616, FREE_YELLOW: 16771899, FREE_RED: 16007990 };
const BAR_HEIGHT = 20;
const TEXT_SIZE = BAR_HEIGHT - 2;
const MIN_TEXT_BAR_WIDTH = TEXT_SIZE * 2.5;
const POS_FACTOR = 0.15;
function Profiler(options = {}) {
  var _a, _b, _c;
  checkAPIVersion();
  this.snapshot_enabled = (_a = options.enable_snapshot) != null ? _a : true;
  this.autoupdate = (_b = options.autoupdate) != null ? _b : true;
  this.update_interval = options.update_interval || 2e3;
  this.show_labels = (_c = options.show_labels) != null ? _c : false;
  this.view_container = null;
  this.canvas = null;
  this.bar_width = DEVICE_WIDTH;
  this.original_bar_height = BAR_HEIGHT;
  this.bar_height = this.original_bar_height;
  this.bar_y = this.getPositionY() || this.findOptimalPosY();
  this.text_size = options.show_labels ? TEXT_SIZE - TEXT_SIZE * 0.5 : TEXT_SIZE;
  this.is_visible = false;
  this.memory_data = null;
  this.perf_data = null;
  this.cb_update = null;
  this.module_analysis = { app_used: 0, pages_used: 0 };
  this.snap_last_fname = null;
  this.snap_counter = 0;
  for (let key in Profiler.prototype.get) {
    if (Profiler.prototype.get.hasOwnProperty(key)) {
      this.get[key] = Profiler.prototype.get[key].bind(this);
    }
  }
  this.createViewContainer();
  if (this.autoupdate) {
    this.startAutoUpdate(this.update_interval);
  }
  this.is_dragging = false;
  this.drag_pos_y = 0;
  this.DragAndDrop = null;
}
Profiler.prototype.show = function() {
  if (!this.canvas) {
    this.canvas = this.view_container.createWidget(widget.CANVAS, { x: 0, y: 0, w: DEVICE_WIDTH, h: DEVICE_HEIGHT });
  }
  this.createDragAndDrop();
  this.is_visible = true;
  this.update();
};
Profiler.prototype.hide = function() {
  this.is_visible = false;
  this.clear();
};
Profiler.prototype.update = function() {
  this.collectData();
  if (this.is_visible) this.render();
  if (this.cb_update) this.cb_update();
};
Profiler.prototype.onUpdate = function(callback) {
  if (typeof callback === "function") {
    this.cb_update = callback;
  }
};
Profiler.prototype.destroy = function() {
  this.stopAutoUpdate();
  this.hide();
  if (this.DragAndDrop) {
    this.DragAndDrop.destroy();
    this.DragAndDrop = null;
  }
  if (this.canvas) {
    deleteWidget(this.canvas);
    this.canvas = null;
  }
  if (this.view_container) {
    deleteWidget(this.view_container);
    this.view_container = null;
  }
};
Profiler.prototype.setPositionY = function(y) {
  if (typeof y !== "number" || y <= 0) return;
  this.bar_y = y;
  this.updateBarPosition();
};
Profiler.prototype.getPositionY = function() {
  return this.bar_y;
};
Profiler.prototype.snapshot = function(callback) {
  if (typeof callback !== "function") {
    throw new Error("Snapshot: Argument must be a function");
  }
  if (!this.snapshot_enabled) return callback();
  const f = new Error().stack.split("\n")[1].trim().split(" ")[1] || "?";
  const start = QuickJS.now();
  const perf_start = getPerformance("memory", "perf");
  const self_mem_consume = 1600;
  const self_time_consume = 29;
  let res;
  try {
    res = callback();
  } catch (error) {
    console.log(`Error in provided function: ${error.message}`);
  }
  const end = QuickJS.now();
  const perf_end = getPerformance("memory", "perf");
  const start_mem = perf_start.memory.system.total - perf_start.memory.system.used;
  const end_mem = perf_end.memory.system.total - perf_end.memory.system.used;
  const mem_used = start_mem - end_mem - self_mem_consume;
  const time_used = end - start - self_time_consume;
  const snapshot = { execution_time: `${time_used < 5 ? 0 : time_used}ms`, memory_used: this.fmtMem(mem_used < 100 ? 0 : mem_used), free_memory: this.fmtMem(end_mem) };
  if (this.snap_last_fname === f) {
    this.snap_counter++;
  } else {
    this.snap_last_fname = f;
    this.snap_counter = 1;
  }
  console.log(`>>> ${f}() snapshot #${this.snap_counter}`, JSON.stringify(snapshot));
  return res;
};
Profiler.prototype.render = function() {
  if (!this.is_visible || !this.memory_data) return;
  this.clear();
  try {
    const { system, app, framework } = this.memory_data;
    const { app_used, pages_used } = this.module_analysis;
    const ttl_mem = system.total;
    const sys_mem_used = system.used;
    const framework_mem_used = framework.used;
    const app_ttl_used = app[0].used;
    const avail_mem = ttl_mem - sys_mem_used;
    const actual_sys_used = sys_mem_used - framework_mem_used - app_ttl_used;
    const framework_bar_w = framework_mem_used * this.bar_width / ttl_mem >>> 0;
    const sys_bar_w = actual_sys_used * this.bar_width / ttl_mem >>> 0;
    const app_bar_w = app_used * this.bar_width / ttl_mem >>> 0;
    const pages_bar_w = pages_used * this.bar_width / ttl_mem >>> 0;
    const start_x = 0;
    this.drawBar(start_x, this.bar_width, COLORS.BG);
    let cur_x = start_x;
    const framework_text = this.show_labels ? `FW ${this.fmtMem(framework_mem_used)}` : this.fmtMem(framework_mem_used);
    this.drawBar(cur_x, cur_x + framework_bar_w, COLORS.SYS_FRAMEWORK, framework_text, COLORS.WHITE);
    cur_x += framework_bar_w;
    const sys_text = this.show_labels ? `SYS ${this.fmtMem(actual_sys_used)}` : this.fmtMem(actual_sys_used);
    this.drawBar(cur_x, cur_x + sys_bar_w, COLORS.SYS_SYSTEM, sys_text, COLORS.WHITE);
    cur_x += sys_bar_w;
    const app_text = this.show_labels ? `APP ${this.fmtMem(app_used)}` : this.fmtMem(app_used);
    this.drawBar(cur_x, cur_x + app_bar_w, COLORS.APP, app_text, COLORS.BLACK);
    cur_x += app_bar_w;
    if (pages_used > 0) {
      const pages_text = this.show_labels ? `PG ${this.fmtMem(pages_used)}` : this.fmtMem(pages_used);
      this.drawBar(cur_x, cur_x + pages_bar_w, COLORS.PAGE, pages_text, COLORS.BLACK);
      cur_x += pages_bar_w;
    }
    const free_color = this.getFreeColor(avail_mem);
    const free_text = this.show_labels ? `FR ${this.fmtMem(avail_mem)}` : this.fmtMem(avail_mem);
    this.drawBar(cur_x, this.bar_width, free_color, free_text, COLORS.BLACK, true);
  } catch (error) {
    debugLog(1, "Error in render:", error.message);
    debugLog(1, "memory_data:", JSON.stringify(this.memory_data));
  }
  if (this.is_dragging) {
    this.highlightBar();
  }
};
Profiler.prototype.drawBar = /* @__PURE__ */ (function() {
  const layout_cache = {};
  const MAX_CACHE_SIZE = 20;
  let cache_items = 0;
  function cleanCache() {
    const items = QuickJS.keys(layout_cache);
    const to_remove = QuickJS.ceil(items.length * 0.5);
    for (let i = 0; i < to_remove; i++) {
      delete layout_cache[items[i]];
    }
    cache_items = items.length - to_remove;
  }
  return function(x1, x2, color, text, text_color, is_last_bar = false) {
    const bar_w = x2 - x1;
    this.canvas.drawRect({ x1, y1: 0, x2, y2: this.bar_height, color });
    if (text) {
      let text_width;
      const cache_key = `${text}_${this.text_size}_${bar_w}`;
      if (layout_cache[cache_key] !== void 0) {
        text_width = layout_cache[cache_key];
      } else {
        try {
          const layout = getTextLayout(text, { text_size: this.text_size, text_width: bar_w, wrapped: 0 });
          if (layout && typeof layout.width === "number") {
            text_width = layout.width;
            if (cache_items >= MAX_CACHE_SIZE) {
              cleanCache();
            }
            layout_cache[cache_key] = text_width;
            cache_items++;
          } else {
            debugLog(1, "Invalid layout:", JSON.stringify(layout));
            return;
          }
        } catch (error) {
          debugLog(1, "Error in getTextLayout:", error.message);
          return;
        }
      }
      if (text_width <= bar_w && bar_w >= MIN_TEXT_BAR_WIDTH) {
        let text_x;
        if (is_last_bar) {
          text_x = x1 + (bar_w - text_width) * 0.5;
        } else {
          text_x = QuickJS.max(x1, QuickJS.min((x1 + x2 - text_width) * 0.5, x2 - text_width));
        }
        const text_y = (this.bar_height - this.text_size) * 0.5 - this.text_size / 4;
        this.canvas.drawText({ x: text_x, y: text_y, text, text_size: this.text_size, color: text_color });
      }
    }
  };
})();
Profiler.prototype.collectData = function() {
  const data = getPerformance("memory", "perf");
  this.memory_data = data.memory;
  this.perf_data = data.perf;
  this.module_analysis = this.analyzeModules();
};
Profiler.prototype.clear = function() {
  if (this.canvas) {
    this.canvas.clear({ x: 0, y: 0, w: DEVICE_WIDTH, h: DEVICE_HEIGHT });
  }
};
Profiler.prototype.createViewContainer = function() {
  this.bar_y = this.findOptimalPosY();
  const vc_w = this.getWidthAtY(this.bar_y + this.bar_height);
  const vc_x = QuickJS.round((DEVICE_WIDTH - vc_w) * 0.5);
  this.bar_width = vc_w;
  this.view_container = createWidget(widget.VIEW_CONTAINER, { x: vc_x, y: this.bar_y, w: DEVICE_WIDTH, h: this.bar_height, scroll_enable: false, z_index: 1337 });
};
Profiler.prototype.startAutoUpdate = function(interval = this.update_interval) {
  this.stopAutoUpdate();
  this.update_interval = setInterval(() => this.update(), interval);
};
Profiler.prototype.stopAutoUpdate = function() {
  if (this.update_interval) {
    clearInterval(this.update_interval);
    this.update_interval = null;
  }
};
Profiler.prototype.highlightBar = function() {
  if (this.canvas) {
    this.canvas.strokeRect({ x1: -1, y1: -1, x2: this.bar_width, y2: this.bar_height, color: COLORS.WHITE, line_width: 1 });
  }
};
Profiler.prototype.unhighlightBar = function() {
  if (this.canvas) {
    this.canvas.clear({ x: 0, y: 0, w: this.bar_width, h: this.bar_height });
    this.render();
  }
};
Profiler.prototype.updateBarPosition = function() {
  const y_shift = getYShift(this.bar_y, this.bar_height);
  const new_width = this.getWidthAtY(this.bar_y + y_shift);
  const new_x = QuickJS.round((DEVICE_WIDTH - new_width) * 0.5);
  if (this.bar_y <= this.bar_height) this.bar_y = this.bar_height;
  this.view_container.setProperty(prop.MORE, { x: new_x, y: this.bar_y, w: new_width, h: this.bar_height });
  this.bar_width = new_width;
  this.render();
};
Profiler.prototype.getWidthAtY = /* @__PURE__ */ (function() {
  const cache = {};
  return function(y) {
    if (cache[y] !== void 0) {
      return cache[y];
    }
    const R = DEVICE_WIDTH * 0.5;
    const dist_from_center = QuickJS.abs(y - R);
    const res = QuickJS.round(2 * QuickJS.sqrt(R * R - dist_from_center * dist_from_center));
    cache[y] = res;
    return res;
  };
})();
Profiler.prototype.findOptimalPosY = function() {
  const optimal_y = DEVICE_HEIGHT * POS_FACTOR;
  return QuickJS.round(optimal_y);
};
Profiler.prototype.getRawMemoryData = function() {
  return this.memory_data;
};
Profiler.prototype.getRawPerformanceData = function() {
  return this.perf_data;
};
Profiler.prototype.getModulePerformance = function(module_name) {
  if (!this.perf_data || !this.perf_data.modules) return null;
  const modules = this.perf_data.modules;
  for (let i = 0; i < modules.length; i++) {
    if (modules[i].file === module_name) {
      return modules[i];
    }
  }
  return null;
};
Profiler.prototype.get = { apiVersion: function() {
  return API_VERSION;
}, totalMemory: function() {
  var _a, _b, _c;
  return (_c = (_b = (_a = this.memory_data) == null ? void 0 : _a.system) == null ? void 0 : _b.total) != null ? _c : 0;
}, systemUsed: function() {
  var _a, _b, _c;
  return (_c = (_b = (_a = this.memory_data) == null ? void 0 : _a.system) == null ? void 0 : _b.used) != null ? _c : 0;
}, appUsed: function() {
  var _a, _b, _c, _d;
  return (_d = (_c = (_b = (_a = this.memory_data) == null ? void 0 : _a.app) == null ? void 0 : _b[0]) == null ? void 0 : _c.used) != null ? _d : 0;
}, frameworkUsed: function() {
  var _a, _b, _c;
  return (_c = (_b = (_a = this.memory_data) == null ? void 0 : _a.framework) == null ? void 0 : _b.used) != null ? _c : 0;
}, appEvalTime: function() {
  var _a, _b;
  return (_b = (_a = this.getModulePerf("app")) == null ? void 0 : _a.evalTime) != null ? _b : 0;
}, appCreateTime: function() {
  var _a, _b;
  return (_b = (_a = this.getModulePerf("app")) == null ? void 0 : _a.createTime) != null ? _b : 0;
}, appId: function() {
  var _a, _b;
  return (_b = (_a = this.perf_data) == null ? void 0 : _a.appid) != null ? _b : 0;
}, moduleCount: function() {
  var _a, _b, _c, _d, _e;
  return (_e = (_d = (_c = (_b = (_a = this.memory_data) == null ? void 0 : _a.app) == null ? void 0 : _b[0]) == null ? void 0 : _c.modules) == null ? void 0 : _d.length) != null ? _e : 0;
}, totalModuleMemory: function() {
  var _a, _b, _c, _d;
  const modules = (_c = (_b = (_a = this.memory_data) == null ? void 0 : _a.app) == null ? void 0 : _b[0]) == null ? void 0 : _c.modules;
  if (!modules) return 0;
  let ttl = 0;
  for (let i = 0; i < modules.length; i++) {
    ttl += (_d = modules[i].used) != null ? _d : 0;
  }
  return ttl;
}, mostMemoryIntensiveModule: function() {
  var _a, _b, _c;
  const modules = (_c = (_b = (_a = this.memory_data) == null ? void 0 : _a.app) == null ? void 0 : _b[0]) == null ? void 0 : _c.modules;
  if (!modules || modules.length === 0) return { used: 0, file: "none" };
  let max = { used: 0, file: "none" };
  for (let i = 0; i < modules.length; i++) {
    if (modules[i].used > max.used) {
      max = modules[i];
    }
  }
  return max;
}, freeMemory: function() {
  return this.get.totalMemory() - this.get.systemUsed();
}, memoryUsagePercentage: function() {
  return (this.get.systemUsed() / this.get.totalMemory() * 100).toFixed(2);
}, appMemoryUsagePercentage: function() {
  return (this.get.appUsed() / this.get.totalMemory() * 100).toFixed(2);
}, totalEvalTime: function() {
  var _a, _b;
  const modules = (_a = this.perf_data) == null ? void 0 : _a.modules;
  if (!modules) return 0;
  let ttl = 0;
  for (let i = 0; i < modules.length; i++) {
    ttl += (_b = modules[i].evalTime) != null ? _b : 0;
  }
  return ttl;
}, mostTimeIntensiveModule: function() {
  var _a;
  const modules = (_a = this.perf_data) == null ? void 0 : _a.modules;
  if (!modules || modules.length === 0) return { evalTime: 0, file: "none" };
  let max = { evalTime: 0, file: "none" };
  for (let i = 0; i < modules.length; i++) {
    if (modules[i].evalTime > max.evalTime) {
      max = modules[i];
    }
  }
  return max;
}, averageInitTime: function() {
  var _a;
  const modules = (_a = this.perf_data) == null ? void 0 : _a.modules;
  if (!modules) return 0;
  let ttl = 0;
  let cnt = 0;
  for (let i = 0; i < modules.length; i++) {
    if (modules[i].initTime) {
      ttl += modules[i].initTime;
      cnt++;
    }
  }
  return cnt ? (ttl / cnt).toFixed(2) : 0;
}, totalBuildTime: function() {
  var _a, _b;
  const modules = (_a = this.perf_data) == null ? void 0 : _a.modules;
  if (!modules) return 0;
  let ttl = 0;
  for (let i = 0; i < modules.length; i++) {
    ttl += (_b = modules[i].buildTime) != null ? _b : 0;
  }
  return ttl;
} };
Profiler.prototype.fmtMem = function(bytes) {
  const kb = bytes / 1024;
  if (kb >= 1e3) {
    const mb = kb / 1024;
    return `${mb.toFixed(1)}M`;
  } else {
    return `${QuickJS.ceil(kb)}K`;
  }
};
Profiler.prototype.analyzeModules = function() {
  if (!this.memory_data || !this.memory_data.app || !this.memory_data.app[0].modules) {
    return { app_used: 0, pages_used: 0 };
  }
  const modules = this.memory_data.app[0].modules;
  const app_used = modules[0].used || 0;
  let pages_used = 0;
  for (let i = 1; i < modules.length; i++) {
    pages_used += modules[i].used || 0;
  }
  return { app_used, pages_used };
};
Profiler.prototype.getFreeColor = function(avail_mem) {
  const ttl_mem = this.memory_data.system.total;
  const free_perc = avail_mem / ttl_mem;
  if (free_perc > 0.33) {
    return COLORS.FREE_GREEN;
  } else if (free_perc > 0.167) {
    return COLORS.FREE_YELLOW;
  } else {
    return COLORS.FREE_RED;
  }
};
Profiler.prototype.createDragAndDrop = function() {
  if (this.DragAndDrop) {
    this.DragAndDrop.destroy();
  }
  this.DragAndDrop = new DragAndDrop({ target: this.canvas, onDragStart: (y) => {
    this.is_dragging = true;
    this.drag_pos_y = y;
    this.bar_height = this.original_bar_height * 2;
    this.updateBarPosition();
    this.highlightBar();
  }, onDrag: (delta_y) => {
    this.bar_y = QuickJS.max(0, QuickJS.min(DEVICE_HEIGHT - this.bar_height * 2, this.bar_y + delta_y));
    this.updateBarPosition();
  }, onDragEnd: () => {
    this.is_dragging = false;
    this.bar_height = this.original_bar_height;
    if (!isTopHalfOfTheScreen(this.bar_y)) {
      this.bar_y = this.bar_y + this.bar_height;
    }
    this.updateBarPosition();
    this.unhighlightBar();
  } });
};
export {
  Profiler as P
};
