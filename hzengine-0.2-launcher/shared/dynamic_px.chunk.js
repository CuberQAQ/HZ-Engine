import { getDeviceInfo } from "@zos/device";
const { width, height, screenShape } = getDeviceInfo();
var designWidth = 480;
function px(raw) {
  return Math.ceil(raw / designWidth * width);
}
export {
  px as p
};
