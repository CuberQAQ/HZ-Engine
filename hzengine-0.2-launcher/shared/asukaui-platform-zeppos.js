import { reportError } from "@cuberqaq/asuka-ui";
import { getDeviceInfo } from "@zos/device";
import hmUI from "@zos/ui";

/**
 * @type {import("@cuberqaq/asuka-ui").Platform}
 */
export default AsukaUIPlatformZeppOS = {
  getWidgetFactorySize(mount) {
    let size;
    if (mount === hmUI) {
      let { width, height } = getDeviceInfo();
      size = { w: width, h: height };
    } else {
      try {
        size = {
          w: mount.getProperty(hmUI.prop.W),
          h: mount.getProperty(hmUI.prop.H),
        };
      } catch(e) {
        reportError("createFrame", e);
      }
    }
    return size;
  },
};
