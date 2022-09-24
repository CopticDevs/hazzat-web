interface IProps {
    content: string;
}

function HymnTitle(props: IProps) {

    return (
        <div className="hymnData">
            <h2>{props.content}</h2>
        </div>
    );
}

export default HymnTitle;
