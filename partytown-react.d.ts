declare module '@qwik.dev/partytown/react' {
  import * as React from 'react';
  export interface PartytownProps {
    debug?: boolean;
    forward?: string[];
  }
  export const Partytown: React.FC<PartytownProps>;
}