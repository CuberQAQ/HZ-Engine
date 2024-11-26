import { UI } from "hzengine-core";

const Say = (prop: UI.Message
) => {
 return <div style={{display: "flex", "flexDirection": "column"}}>
    <div style={{}}>{prop.who}</div>
    <div style={{flexGrow: 1}}>{prop.what}</div>
 </div>
}
export default Say