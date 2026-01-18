import { UI } from "hzengine-core";
import HZLayout from "./HZLayout";

const FgImg = (props: UI.FgImgViewProp) => {
    // FgImg 通常用于人物立绘，默认应该与顶部对齐 (yalign: -1, yanchor: -1)
    const defaultProps = {
        yalign: -1,
        yanchor: -1,
        xalign: 0,
        xanchor: 0
    };

    return (
        <HZLayout {...defaultProps} {...props as any}>
            <img style={{ display: 'block' }} src={props.imgPath} />
        </HZLayout>
    )
}

export default FgImg