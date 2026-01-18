import { HZEngineCore, TransformPlugin, UI } from "hzengine-core";
import path from "@cuberqaq/path-polyfill";
import { createRef, useEffect, useState } from "react";
function Say(this: UI.View<UI.Message>, prop: UI.Message) {
  const _animationPlugin: TransformPlugin.AnimationPlugin | null =
    (this.core.plugins.get("animation") as any) ?? null;
  if (!_animationPlugin) {
    console.log("[SayView] animation plugin not found");
  }
  const [_animationId, setAnimationId] = useState<number | null>(null);
  const [innerText, setInnerText] = useState<string>("");
  const _what = prop.what;
  const _clearAnim = () => {
    if (_animationId) {
      _animationPlugin?.clearTempAnimation(_animationId);
      setAnimationId(null);
    }
  };

  useEffect(() => {
    _clearAnim();
    setAnimationId(
      _animationPlugin?.createTempAnimation({
        profile: [
          {
            frame: { len: 0 },
          },
          {
            time: _what!.length * 0.06,
            wrapper: "linear",
            frame: { len: _what!.length },
          },
        ],
        onFrame: (props) => {
          setInnerText(_what?.slice(0, ~~props.len!))
        },
        onEnd: () => {
          this.core.debug.log("[SayView]", "打字机结束");
        },
      }) ?? null
    );
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div style={{ flex: 1 }} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          // 黑色文字描边
          textShadow: "0 0 10px black",
        }}
      >
        <img
          style={{
            position: "absolute",
            left: 0,
            zIndex: 0,
          }}
          src={path.join(this.core.storage.projectRoot!, "gui", "say_bg.png")}
        />
        <div
          style={{
            height: "42px",
            textAlign: "left",
            paddingLeft: "16px",
            fontSize: "28px",
            position: "relative",
          }}
        >
          {prop.who + " "}
        </div>
        <div
          style={{
            flexGrow: 1,
            textAlign: "center",
            fontSize: "24px",
            position: "relative",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            padding: "0 16px"
          }}
        >
          {innerText}
        </div>
      </div>
    </div>
  );
}
export default Say;
