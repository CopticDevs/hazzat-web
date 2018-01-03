import * as React from "react";

import { Header } from "./Header";
import { Footer } from "./Footer";

export interface HomeProps { compiler: string; framework: string; }

// 'HomeProps' describes the shape of props.
// State is never set so we use the 'undefined' type.
export class Home extends React.Component<HomeProps, undefined> {
    render() {
        return (
            <div>
                <Header />
                <h1>Home content written with {this.props.compiler} and {this.props.framework}!</h1>
                <Footer />
            </div>
        );
    }
}
