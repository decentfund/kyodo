import React from 'react';
import { DrizzleContext } from 'drizzle-react';

export default function drizzleConnect(Component) {
  const DrizzledComponent = (props, context) => (
    <DrizzleContext.Consumer>
      {drizzleContext => {
        const { drizzle, drizzleState, initialized } = drizzleContext;

        return (
          <Component
            {...props}
            drizzle={drizzle}
            drizzleState={drizzleState}
            initialized={initialized}
          />
        );
      }}
    </DrizzleContext.Consumer>
  );

  return DrizzledComponent;
}
