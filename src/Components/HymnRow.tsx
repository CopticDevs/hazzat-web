interface IProps {
    title: string;
}

function HymnRow(props: IProps) {

    return (
        <div>{props.title}</div>
    );
}

export default HymnRow;
