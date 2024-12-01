import { UI } from "hzengine-core";
import HZLayout from "./HZLayout";

const BgImg = (props: UI.BgImgViewProp) => {
    return (
        <HZLayout {...props as any}>
            <img src={props.imgPath} />
        </HZLayout>
    )
}

export default BgImg