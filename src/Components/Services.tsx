import { useParams } from "react-router-dom";

function Services() {
    let { seasonId } = useParams();
    return (
        <div>Services for season {seasonId}</div>
    );
}

export default Services;
