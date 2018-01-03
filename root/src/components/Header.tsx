import * as React from "react";

import { MainNavigation } from "./MainNavigation";

export class Header extends React.Component {
    render() {
        return (
            <div>
                <h1>Hazzat Logo goes here!</h1>
                <MainNavigation />
            </div>
        );
    }
}
