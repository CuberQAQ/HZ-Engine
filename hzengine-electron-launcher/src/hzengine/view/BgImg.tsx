import { UI } from "hzengine-core";
import HZLayout from "./HZLayout";

const BgImg = (props: UI.BgImgViewProp) => {
    return (
        <HZLayout {...props as any}>
            <img style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} src={props.imgPath} />
        </HZLayout>
    )
}

export default BgImg