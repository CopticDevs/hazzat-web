interface IProps {
    seasonId: string;
    serviceId: string;
    hymnId: string;
}

function HymnRow(props: IProps) {

    return (
        <div>Season: {props.seasonId} Service: {props.serviceId} Hymn: {props.hymnId}</div>
    );
}

export default HymnRow;
