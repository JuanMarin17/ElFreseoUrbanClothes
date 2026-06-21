import { Component } from "react";
import ServerError500 from "./ServerError500";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Error no controlado:", error, info);
  }

  render() {
    if (this.state.error) {
      return <ServerError500 details={this.state.error?.message} />;
    }
    return this.props.children;
  }
}
