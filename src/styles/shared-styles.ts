import { css } from 'lit';

// these styles can be imported from any component
// for an example of how to use this, check /pages/about-about.ts
export const styles = css`
  @media(min-width: 1000px) {
    sl-card {
      text-align: center;
      max-width: 70vw;
    }
  }
  .listen-card::part(body) {
      text-align: center;
    }
    main {
      text-align: center;
    }
`;