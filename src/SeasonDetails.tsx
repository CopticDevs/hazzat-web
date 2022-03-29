import { useParams } from "react-router-dom";

function SeasonDetails() {
  let { seasonId } = useParams();
  return (
    <div>Season Details {seasonId}</div>
  );
}

export default SeasonDetails;
