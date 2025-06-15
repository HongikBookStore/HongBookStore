import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --primary: #7c3aed;
    --primary-dark: #6d28d9;
    --secondary: #0ea5e9;
    --accent: #f97316;
    --background: #f8fafc;
    --surface: #ffffff;
    --text: #0f172a;
    --text-light: #475569;
    --border: #e2e8f0;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    --radius-sm: 0.375rem;
    --radius: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: var(--text);
    background-color: var(--background);
    background-image: 
      radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.1) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.1) 0px, transparent 50%);
    min-height: 100vh;
    overflow-x: hidden;
  }

  #root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .container {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 4rem;

    @media (max-width: 1440px) {
      padding: 0 3rem;
    }

    @media (max-width: 1024px) {
      padding: 0 2rem;
    }

    @media (max-width: 768px) {
      padding: 0 1.5rem;
    }
  }

  /* Responsive Typography */
  h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    line-height: 1.2;
  }

  h2 {
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.3;
  }

  h3 {
    font-size: clamp(1.5rem, 3vw, 2rem);
    line-height: 1.4;
  }

  p {
    font-size: clamp(1rem, 1.5vw, 1.125rem);
  }

  /* Modern Scrollbar */
  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    background: var(--background);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 6px;
    border: 3px solid var(--background);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-light);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes gradientShift {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

export default GlobalStyles; 