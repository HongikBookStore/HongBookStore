import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Black & White & Gray Palette */
    --primary: #222222;
    --primary-light: #444444;
    --primary-dark: #111111;
    --primary-50: #f8f9fa;
    --primary-100: #f1f3f5;
    --primary-200: #e9ecef;
    --primary-300: #dee2e6;
    --primary-400: #ced4da;
    --primary-500: #adb5bd;
    --primary-600: #868e96;
    --primary-700: #495057;
    --primary-800: #343a40;
    --primary-900: #212529;

    --secondary: #868e96;
    --secondary-light: #adb5bd;
    --secondary-dark: #495057;
    --secondary-50: #f8f9fa;
    --secondary-100: #f1f3f5;
    --secondary-200: #e9ecef;
    --secondary-300: #dee2e6;
    --secondary-400: #ced4da;
    --secondary-500: #adb5bd;
    --secondary-600: #868e96;
    --secondary-700: #495057;
    --secondary-800: #343a40;
    --secondary-900: #212529;

    --accent: #111111;
    --accent-light: #444444;
    --accent-dark: #000000;
    --accent-50: #f8f9fa;
    --accent-100: #f1f3f5;
    --accent-200: #e9ecef;
    --accent-300: #dee2e6;
    --accent-400: #ced4da;
    --accent-500: #adb5bd;
    --accent-600: #868e96;
    --accent-700: #495057;
    --accent-800: #343a40;
    --accent-900: #212529;

    /* Neutral Colors */
    --gray-50: #f8f9fa;
    --gray-100: #f1f3f5;
    --gray-200: #e9ecef;
    --gray-300: #dee2e6;
    --gray-400: #ced4da;
    --gray-500: #adb5bd;
    --gray-600: #868e96;
    --gray-700: #495057;
    --gray-800: #343a40;
    --gray-900: #212529;
    
    /* Semantic Colors */
    --success: #10b981;
    --success-light: #34d399;
    --success-dark: #059669;
    --warning: #f59e0b;
    --warning-light: #fbbf24;
    --warning-dark: #d97706;
    --error: #ef4444;
    --error-light: #f87171;
    --error-dark: #dc2626;
    --info: #3b82f6;
    --info-light: #60a5fa;
    --info-dark: #2563eb;
    
    /* Background & Surface */
    --background: #fafafa;
    --surface: #ffffff;
    --surface-hover: #f8fafc;
    --surface-active: #f1f5f9;
    
    /* Text Colors */
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-tertiary: #64748b;
    --text-disabled: #94a3b8;
    --text-inverse: #ffffff;
    
    /* Border Colors */
    --border-light: #e2e8f0;
    --border-medium: #cbd5e1;
    --border-dark: #94a3b8;
    
    /* Shadows */
    --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
    
    /* Border Radius */
    --radius-none: 0;
    --radius-sm: 0.125rem;
    --radius: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-2xl: 1rem;
    --radius-3xl: 1.5rem;
    --radius-full: 9999px;
    
    /* Spacing */
    --space-0: 0;
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-5: 1.25rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-10: 2.5rem;
    --space-12: 3rem;
    --space-16: 4rem;
    --space-20: 5rem;
    --space-24: 6rem;
    --space-32: 8rem;
    
    /* Transitions */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-bounce: 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
    
    /* Z-Index */
    --z-dropdown: 1000;
    --z-sticky: 1020;
    --z-fixed: 1030;
    --z-modal-backdrop: 1040;
    --z-modal: 1050;
    --z-popover: 1060;
    --z-tooltip: 1070;
    --z-toast: 1080;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }

  body {
    font-family: 'Cafe24Surround', 'SUIT', 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: var(--text-primary);
    background-color: var(--background);
    background-image: 
      radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.08) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.08) 0px, transparent 50%);
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  input, textarea, button, select {
    font-family: 'Cafe24Surround', 'SUIT', 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
    padding: 0 var(--space-16);

    @media (max-width: 1440px) {
      padding: 0 var(--space-12);
    }

    @media (max-width: 1024px) {
      padding: 0 var(--space-8);
    }

    @media (max-width: 768px) {
      padding: 0 var(--space-6);
    }

    @media (max-width: 480px) {
      padding: 0 var(--space-4);
    }
  }

  /* Enhanced Typography */
  h1 {
    font-size: clamp(2.8rem, 6vw, 3.5rem);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: var(--text-primary);
  }
  h2 {
    font-size: clamp(2rem, 4vw, 2.5rem);
    font-weight: 800;
    line-height: 1.18;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }
  h3 {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700;
    line-height: 1.22;
    color: var(--text-primary);
  }
  h4 {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.3;
    color: var(--text-primary);
  }
  h5 {
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.3;
    color: var(--text-primary);
  }
  h6 {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
    color: var(--text-primary);
  }
  p, li, label, input, textarea, select {
    font-size: 1.05rem;
    font-weight: 400;
    line-height: 1.7;
    color: var(--text-secondary);
  }
  a {
    color: var(--primary);
    font-weight: 600;
    text-decoration: none;
    transition: var(--transition-normal);
    font-size: 1.05rem;
    
    &:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }
  }
  strong, b {
    font-weight: 700;
    color: var(--text-primary);
  }
  small {
    font-size: 0.9em;
    color: var(--text-tertiary);
  }
  .button, button {
    font-size: 1.08rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  /* Enhanced Scrollbar */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  ::-webkit-scrollbar-track {
    background: var(--gray-100);
    border-radius: var(--radius-full);
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: var(--radius-full);
    border: 2px solid var(--gray-100);
    transition: var(--transition-normal);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
  }

  ::-webkit-scrollbar-corner {
    background: var(--gray-100);
  }

  /* Selection styles */
  ::selection {
    background: rgba(99, 102, 241, 0.2);
    color: var(--text-primary);
  }

  ::-moz-selection {
    background: rgba(99, 102, 241, 0.2);
    color: var(--text-primary);
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  *:focus:not(:focus-visible) {
    outline: none;
  }

  *:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  /* Button and link hover effects */
  button, a {
    transition: var(--transition-normal);
  }

  button:hover, a:hover {
    transform: translateY(-1px);
  }

  button:active, a:active {
    transform: translateY(0);
  }

  /* Enhanced Loading animations */
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

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
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

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes gradientShift {
    0% { 
      background-position: 0% 50%;
    }
    50% { 
      background-position: 100% 50%;
    }
    100% { 
      background-position: 0% 50%;
    }
  }

  @keyframes float {
    0%, 100% { 
      transform: translateY(0px) rotate(0deg);
    }
    50% { 
      transform: translateY(-20px) rotate(5deg);
    }
  }

  @keyframes pulse {
    0%, 100% { 
      transform: scale(1);
      opacity: 1;
    }
    50% { 
      transform: scale(1.05);
      opacity: 0.8;
    }
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

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  /* Utility Classes */
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

  .visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  /* Animation Classes */
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out;
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }

  .animate-fade-in-down {
    animation: fadeInDown 0.6s ease-out;
  }

  .animate-fade-in-left {
    animation: fadeInLeft 0.6s ease-out;
  }

  .animate-fade-in-right {
    animation: fadeInRight 0.6s ease-out;
  }

  .animate-scale-in {
    animation: scaleIn 0.4s ease-out;
  }

  .animate-slide-in-up {
    animation: slideInUp 0.6s ease-out;
  }

  .animate-slide-in-down {
    animation: slideInDown 0.6s ease-out;
  }

  .animate-slide-in-left {
    animation: slideInLeft 0.6s ease-out;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.6s ease-out;
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  .animate-bounce {
    animation: bounce 1s ease-in-out infinite;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .animate-shimmer {
    background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }

  /* Responsive utilities */
  .hidden {
    display: none !important;
  }

  .block {
    display: block !important;
  }

  .inline-block {
    display: inline-block !important;
  }

  .inline {
    display: inline !important;
  }

  .flex {
    display: flex !important;
  }

  .inline-flex {
    display: inline-flex !important;
  }

  .grid {
    display: grid !important;
  }

  .contents {
    display: contents !important;
  }

  .table {
    display: table !important;
  }

  .table-row {
    display: table-row !important;
  }

  .table-cell {
    display: table-cell !important;
  }

  .flow-root {
    display: flow-root !important;
  }

  .list-item {
    display: list-item !important;
  }

  /* Responsive breakpoints */
  @media (min-width: 640px) {
    .sm\\:hidden { display: none !important; }
    .sm\\:block { display: block !important; }
    .sm\\:flex { display: flex !important; }
  }

  @media (min-width: 768px) {
    .md\\:hidden { display: none !important; }
    .md\\:block { display: block !important; }
    .md\\:flex { display: flex !important; }
  }

  @media (min-width: 1024px) {
    .lg\\:hidden { display: none !important; }
    .lg\\:block { display: block !important; }
    .lg\\:flex { display: flex !important; }
  }

  @media (min-width: 1280px) {
    .xl\\:hidden { display: none !important; }
    .xl\\:block { display: block !important; }
    .xl\\:flex { display: flex !important; }
  }

  @media (min-width: 1536px) {
    .2xl\\:hidden { display: none !important; }
    .2xl\\:block { display: block !important; }
    .2xl\\:flex { display: flex !important; }
  }
`;

export default GlobalStyles; 