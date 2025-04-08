# TFE Catalog Viewer

This project is a **proof of concept (PoC)** application that consumes data from the Terraform Cloud (TFE) API and displays it in a visual, interactive resource catalog with filters. The project is split into two parts:

- **Backend**: A mock API built with FastAPI that simulates Terraform Cloud endpoints.
- **Frontend**: A React application with TailwindCSS that displays workspaces, resources, and dynamic filters.

## 💡 Why Use This Interface?

Terraform Enterprise (TFE) provides a powerful backend for managing infrastructure, but its **web UI is limited** when it comes to filtering and exploring the resources created inside a workspace.

This custom interface was built to solve that.

✅ **Key benefits:**
- Allows **filtering resources** by type, module, provider, and more  
- Quickly browse and visualize details of all resources within a workspace  
- Lightweight and fully compatible with **Terraform Cloud/Enterprise API**  
- Great for teams that want better insight or validation of deployments  

This is especially useful for platform teams, DevOps engineers, or auditors who need to **interact with resource data beyond what the native portal provides**.

## 🔧 Technologies

- 🐍 **Backend**: FastAPI + Uvicorn
- ⚛️ **Frontend**: React + TypeScript + TailwindCSS
- 📦 Package Managers: `npm` and `venv`


## 📁 Project Structure

```bash
/
├── backend/                            # Backend FastAPI mock server
│   ├── main.py                         # Main FastAPI application with mocked Terraform Cloud API endpoints
│   ├── data.json                       # JSON file with mocked data for workspaces and resources
│   ├── requirements.txt                # Python dependencies for running the FastAPI backend
│
├── frontend/                           # Frontend React application (Vite + TailwindCSS)
│   ├── public/                         # Static assets folder
│   │   └── images/                     # Provider icons used in the UI
│   │       ├── aws.png                 # AWS provider icon
│   │       ├── azure.png               # Azure provider icon
│   │       ├── generic.png             # Generic/default icon
│   │       └── terraform.png           # Terraform logo
│   │
│   ├── src/                            # Source code of the React app
│   │   ├── App.tsx                     # Main application logic (state, data fetching, filters, rendering)
│   │   ├── index.css                   # Global styles (includes Tailwind)
│   │   ├── main.tsx                    # Entry point of the React application
│   │   ├── types.ts                    # TypeScript interfaces used throughout the app
│   │   ├── vite-env.d.ts               # Type declarations for Vite
│   │   └── components/                 # Reusable UI components
│   │       ├── Dropdown.tsx            # Select dropdown for choosing a workspace
│   │       ├── MultiSelect.tsx         # Component for multi-filter selection in the sidebar
│   │       ├── ResourceCard.tsx        # Card UI to display each resource
│   │       └── ResourceModal.tsx       # Modal with details about the selected resource
│   │
│   ├── tailwind.config.js              # TailwindCSS configuration file
│   └── ...                             # Other Vite-related configs (e.g. tsconfig.json, vite.config.ts)
│
└── README.md                           # Documentation on how to run and configure the project

```

## ▶️ Running the project locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/tfe-catalog-viewer.git
cd tfe-catalog-viewer
```

### 2. Run the **backend (mock API)**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

The mock API will be available at:  
📍 `http://localhost:8000/api/v2`


### 3. Run the **frontend (React app)**

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:  
🌐 `http://localhost:5173`

## 🧪 Testing the PoC

- The frontend communicates with the local mock API (`localhost:8000`).
- Select a workspace using the dropdown.
- Apply filters (provider, type, module, etc.).
- Click on a resource card to view its details in a modal.

## 🔁 Switching to the Real Terraform API

To integrate with the actual Terraform Cloud API:

1. **Update** the `fetch` calls in `App.tsx` to use the official API:

```tsx
fetch("https://app.terraform.io/api/v2/organizations/{org}/workspaces", {
  headers: {
    Authorization: "Bearer YOUR_REAL_TFC_TOKEN",
    "Content-Type": "application/vnd.api+json"
  }
});
```

2. **Remove or ignore** the `backend/` folder if you are no longer using the mock API.
3. **Handle** real pagination and error responses if needed.
4. Optionally, **reactivate** the `api.ts` file to centralize real API logic.

## ✅ Features

- [x] Workspace listing
- [x] Resource catalog
- [x] Dynamic filters (type, date, provider, etc.)
- [x] Resource detail modal
- [x] “Clear Filters” button
- [x] Responsive and intuitive UI
- [x] FastAPI mock backend for local PoC

## 📝 License

This project is for demonstration and learning purposes only. Feel free to explore or adapt it as needed.

## 🙌 Acknowledgments

- Terraform Cloud for a well-designed API.
- TailwindCSS and HeadlessUI for rapid prototyping.
- FastAPI for making mock APIs easy and robust.