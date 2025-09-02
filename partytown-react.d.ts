declare module '@builder.io/partytown/react' {
  import * as React from 'react';
  export interface PartytownProps {
    debug?: boolean;
    forward?: string[];
  }
  export const Partytown: React.FC<PartytownProps>;
}