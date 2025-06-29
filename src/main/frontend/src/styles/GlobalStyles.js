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
    scroll-behavior: smooth;
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
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
    font-weight: 800;
  }

  h2 {
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.3;
    font-weight: 700;
  }

  h3 {
    font-size: clamp(1.5rem, 3vw, 2rem);
    line-height: 1.4;
    font-weight: 600;
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
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 6px;
    border: 3px solid var(--background);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, var(--primary-dark), var(--secondary));
  }

  /* Selection styles */
  ::selection {
    background: rgba(124, 58, 237, 0.2);
    color: var(--text);
  }

  ::-moz-selection {
    background: rgba(124, 58, 237, 0.2);
    color: var(--text);
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  /* Button and link hover effects */
  button, a {
    transition: var(--transition);
  }

  button:hover, a:hover {
    transform: translateY(-1px);
  }

  /* Loading animations */
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

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes gradientShift {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }

  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }

  /* Utility classes */
  .fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }

  .fade-in-down {
    animation: fadeInDown 0.6s ease-out;
  }

  .fade-in-left {
    animation: fadeInLeft 0.6s ease-out;
  }

  .fade-in-right {
    animation: fadeInRight 0.6s ease-out;
  }

  .float {
    animation: float 6s ease-in-out infinite;
  }

  .pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  .bounce {
    animation: bounce 1s ease-in-out;
  }

  .rotate {
    animation: rotate 20s linear infinite;
  }

  /* Glass morphism effect */
  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  /* Gradient text */
  .gradient-text {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Hover effects */
  .hover-lift {
    transition: var(--transition);
  }

  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .hover-scale {
    transition: var(--transition);
  }

  .hover-scale:hover {
    transform: scale(1.05);
  }

  /* Loading states */
  .loading {
    position: relative;
    overflow: hidden;
  }

  .loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 1.5s infinite;
  }

  /* Responsive utilities */
  .hidden-mobile {
    @media (max-width: 768px) {
      display: none;
    }
  }

  .hidden-desktop {
    @media (min-width: 769px) {
      display: none;
    }
  }

  /* Accessibility improvements */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Print styles */
  @media print {
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
  }
`;

export default GlobalStyles; 