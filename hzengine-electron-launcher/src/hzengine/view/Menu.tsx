import { HZEngineCore, UI } from "hzengine-core";
import HZEnginePlatformWeb from "../hzengine-platform-web";
import { Fragment } from "react/jsx-runtime";
import "./Menu.css"

function Menu(
  this: UI.MenuView<typeof HZEnginePlatformWeb>,
  props: UI.MenuViewProp
) {
  const getClickFunc = (jump_position: [path: string, index: number]) => {
    return () => {
      // jump to the next line of the @label
      this.core.script.jump(jump_position[0], jump_position[1] + 1);
      // this._hideButtons();
      // destroy menu view
      const router = this.core.ui.getRouter("menu");
      if (!router) {
        throw "menu router not found";
      }
      router.pop();
      // Continue to run game at next js task
      this.core.system.unBlock();
    };
  };

  return (
    <div className="hz-menu">
      {props.itemList.map((item, index) => {
        return (
          <Fragment key={index}>
            {(
              item.enable_js_expression
                ? this.core.script.evalExpression(item.enable_js_expression)
                : true
            ) ? (
              <button
                className="hz-menu-item"
                onClick={getClickFunc(item.position)}
              >
                {item.text}
              </button>
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}

export default Menu;
