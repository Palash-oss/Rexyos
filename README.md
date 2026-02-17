# RexyOS - Local OS Autonomous Agent GUI

RexyOS is a futuristic, high-performance web interface designed for interacting with autonomous agents. Built with **React 19**, **Vite**, and powered by **Google Gemini**, it provides a sleek, terminal-inspired environment for task automation, image/video generation, and workspace management.

![RexyOS Interface](https://img.shields.io/badge/Interface-Futuristic-00ffcc?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge&logo=google-gemini)

## 🚀 Key Features

- **Autonomous Agent Integration**: Seamlessly interact with Gemini-powered agents for complex tasks.
- **Multimodal Capabilities**:
  - **Image Generation**: High-quality image synthesis with configurable aspect ratios.
  - **Video Synthesis**: Generate and preview video content directly in the GUI.
  - **Document Drafting**: Create and edit documents or emails using AI.
- **Advanced Control Panel**: 
  - Toggle between **Cloud** and **Local** neural modes.
  - Fine-tune image configurations (Ratio, Size).
  - Vision System integration for image-based reasoning.
- **Terminal Interface**: Command-line style interaction with a real-time activity log.
- **Code Viewer**: Integrated syntax-highlighted code visualization for project scaffolds.
- **Live Feedback**: RGB Ring status indicator and neural processing animations.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Bundler**: Vite
- **AI Service**: Google Generative AI (@google/genai)
- **Styling**: Tailwind CSS (with custom futuristic themes)
- **Utilities**: JSZip for project exports

## 🚦 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn
- Google Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Palash-oss/Rexyos.git
   cd Rexyos
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 📂 Project Structure

- `components/`: Modular UI components (Terminal, ControlPanel, RGBRing, etc.)
- `services/`: Core logic for API integrations (Gemini, Audio).
- `types.ts`: TypeScript interfaces and enums for state management.
- `App.tsx`: Main application orchestrator.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---
Created by [Palash-oss](https://github.com/Palash-oss)

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
