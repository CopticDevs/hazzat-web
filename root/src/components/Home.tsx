import * as React from "react";

export interface HomeProps { compiler: string; framework: string; }

// 'HomeProps' describes the shape of props.
// State is never set so we use the 'undefined' type.
export class Home extends React.Component<HomeProps, undefined> {
    render() {
        return <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>;
    }
}
