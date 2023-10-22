declare global {
  interface Window {
    gtag: any;
  }
}

const ga = window.gtag;
export default ga;
