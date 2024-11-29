import { UI } from "hzengine-core";

const Say = (prop: UI.Message) => {
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ height: "42px", textAlign: "left", paddingLeft: "16px", fontSize: "28px" }}>{prop.who + " "}</div>
        <div style={{ flexGrow: 1, textAlign: "center", textJustify: "auto", fontSize: "24px" }}>
          {prop.what}
        </div>
      </div>
    </div>
  );
};
export default Say;
