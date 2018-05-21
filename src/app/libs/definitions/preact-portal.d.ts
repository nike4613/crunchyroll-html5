declare module 'preact-portal' {
  import { Component } from "preact";

  interface PortalProperties {
    into: string|Node;
  }

  class Portal extends Component<{},PortalProperties> {
    render(): null;
  }

  export default Portal;
}