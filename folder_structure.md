# Frontend Project Structure (`src/`)

This document provides a comprehensive overview of the `src/` directory in your React frontend. It explains the purpose of each folder and file, making it easy to understand the project architecture at a glance.

---

## 📁 `src/` (Root)
This is the root of your React application code.

- **`App.jsx`**: The main entry point for your application's routing. It defines all the page paths (e.g., `/login`, `/dashboard`) using `react-router-dom`.
- **`main.jsx`**: The React DOM initialization file. It attaches the `<App />` component to the `index.html` root element.
- **`index.css` & `App.css`**: Global stylesheets containing your Tailwind CSS v4 directives, custom theme variables, and global fonts (`Press Start 2P`, `Space Mono`).

---

## 📁 `api/`
Handles all external communications (e.g., to your backend server).

- **`api.js`**: Contains the Axios instance configuration. It automatically attaches the `localStorage` JWT token to every request and sets the base URL (`http://localhost:5000/api`).

---

## 📁 `assets/`
Contains static media files used throughout the application.

- **Images & Icons**: Files like `logo.png`, `herobg.png`, and various component mockups (`stepp1.png`, etc.) are stored here and imported directly into components.

---

## 📁 `components/`
This folder contains reusable "Lego blocks" of your UI, categorized by their scope.

### 📂 `ui/`
Small, highly reusable, generic UI components (Buttons, Inputs, Spinners).
- **`CyberButton.jsx`**: The core action button styled with the Velora Cyberpunk theme (yellow/cyan colors, hard shadows, active depression effect).
- **`InputField.jsx`**: A reusable, themed text input component that supports icons, error messages, and monospace styling.
- **`StatusBadge.jsx`**: The blinking status indicator (e.g., `[ ONLINE ]`) used in the Landing page and Dashboard.
- **`Loader.jsx`**: A global loading spinner or loading animation component.

### 📂 `layout/`
Components that define the structural skeleton of your Dashboard pages.
- **`Sidebar.jsx`**: The left-hand navigation menu for the dashboard. Styled with the dark terminal aesthetic.
- **`TopNav.jsx`**: The top navigation bar containing the search bar, notifications, and user profile dropdown.

### 📂 `public/`
Components specifically built for the public-facing Landing Page (`/`).
- **`HeroSection.jsx`**: The massive top section of the landing page ("Manage Your Workflow...").
- **`Features.jsx`**: The section detailing the features (Module 01, 02, 03) and the "Systems Online" aesthetic.
- **`StepSection.jsx`**: The 3-step timeline ("Connect", "Configure", "Deploy") demonstrating the platform's workflow.
- **`Footer.jsx`**: The footer of the landing page containing links and copyright info.

---

## 📁 `pages/`
These are the actual "Pages" (or "Views") that a user navigates to. They are directly wired into `App.jsx` routing.

### 📂 `auth/`
Pages related to user authentication.
- **`Login.jsx`**: The page for existing users to sign in. Includes Local (Email/Password) and OAuth (GitHub/Google) forms.
- **`Register.jsx`**: The page for new users to create an account.
- **`Callback.jsx`**: A hidden page that GitHub/Google redirects back to. It catches the `token` from the URL, saves it to `localStorage`, and forwards the user to the Dashboard.

### 📂 `main_dashboard/`
Pages related to account-level overviews (before diving into a specific project).
- **`Dashboard.jsx`**: The main screen after logging in. Shows all the user's projects/applications at a high level.
- **`Account.jsx`, `Members.jsx`, `Integrations.jsx`**: Screens for managing user account settings and teams.
- **`NewProject.jsx`**: The flow for creating or importing a new project.

### 📂 `project_view/`
Heavy, data-rich pages that show details for a *specific* project/application.
- **`Overview.jsx`**: The default view of a single project.
- **`Deployments.jsx`**: A table/list of all past and current deployments for the project.
- **`Metrics.jsx`**: Graphs and charts showing project performance (CPU, Memory, Requests).
- **`Settings.jsx`**: Configuration for the specific project (Environment variables, build commands, deletion).
- **`Terminal.jsx`**: A real-time web socket terminal showing the build logs of a deployment.
- **`Webhooks.jsx`**: Settings for triggering auto-deployments via GitHub webhooks.

---

## 📁 `context/` & `routes/` (Deprecated/Obsolete)
- **`context/AuthContext.jsx`**: *Currently Unused.* Previously managed global auth state, but we moved to direct `localStorage` management to simplify the architecture.
- **`routes/index.jsx`**: *Currently Unused.* Previously held routing logic, but this was moved directly into `App.jsx` for better visibility and Hot-Module Reloading support.
