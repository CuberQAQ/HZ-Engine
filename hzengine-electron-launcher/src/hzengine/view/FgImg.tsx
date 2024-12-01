import { UI } from "hzengine-core";
import HZLayout from "./HZLayout";

const FgImg = (props: UI.FgImgViewProp) => {
    return (
        <HZLayout {...props as any}>
            <img src={props.imgPath} />
        </HZLayout>
    )
}

export default FgImg