import * as React from "react";
import * as ReactDOM from "react-dom";

import { Home } from "./components/Home";
import { Header } from "./components/Header";

ReactDOM.render(
    <Home compiler="TypeScript" framework="React" />,
    document.getElementById("example")
);
