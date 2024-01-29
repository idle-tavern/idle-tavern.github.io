import background from "../assets/images/notice-background.png"

type Props = {
    title?: string;
    editable?: boolean;
}

export function CreateQuestNoticeForm(_props: Props) {
    return (
        <div
            className="w-full h-full m-24 flex flex-col justify-center items-center"
            style={{ background: `url(${background}) center / cover` }}
        >

        </div>
    )
}