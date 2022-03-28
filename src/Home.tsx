import React from 'react';
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="Home">
        <p><Link to="/Seasons">Seasons</Link></p>
        <p><Link to="/Types">Types</Link></p>
        <p><Link to="/Tunes">Tunes</Link></p>
    </div>
  );
}

export default Home;
