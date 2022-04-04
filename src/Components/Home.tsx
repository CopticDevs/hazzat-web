import { NavLink } from "react-router-dom";

function Home() {
    return (
        <div className="Home">
            <p><NavLink to="/Seasons">Seasons</NavLink></p>
            <p><NavLink to="/Types">Types</NavLink></p>
            <p><NavLink to="/Tunes">Tunes</NavLink></p>
        </div>
    );
}

export default Home;
