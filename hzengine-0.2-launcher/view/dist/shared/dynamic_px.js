import { getDeviceInfo } from "@zos/device";
const { width, height, screenShape } = getDeviceInfo();
var designWidth = 480;
/**
 * 动态计算尺寸
 * @param {number} raw
 */
export function px(raw) {
    return Math.ceil(raw / designWidth * width);
}
