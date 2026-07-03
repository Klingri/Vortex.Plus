# Installation
#### First Method:
### Step-by-Step:
1. **Download:** Go to the [Releases](https://github.com/Klingri/VortexPro/releases) page and download the latest `Source code (zip)`.
2. **Extract:** Unzip the folder to a permanent location on your PC.
3. **Open Extensions Page:**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Firefox: `about:addons`
   - Brave: `brave://extensions/`
   - Vivaldi: `vivaldi://extensions`
   - Opera/OperaGX: `opera://extensions`
   - Arc: `arc://extensions`
   - Helium: `helium://extensions`
4. **Developer Mode:** Toggle the **Developer mode** switch in the top right.
5. **Load Unpacked:** Click **"Load unpacked"** and select the folder you just extracted.

- WIP

# Installation Methods

Choose the installation method that best fits your environment. 

## Prerequisites
Before you begin, ensure you have the following installed:
* **Tool/Dependency:** Version X.X or higher
* **Tool/Dependency:** Version X.X or higher

---

## Option 1: Package Manager (Recommended)
The fastest and most common way to get started.

### Using NPM
```bash
npm install <your-package-name>
```

### Using Homebrew
```bash
brew install <your-repository>/<your-package-name>
```

---

## Option 2: Docker (Containerized)
Ideal if you want an isolated environment with all dependencies pre-configured.

1. Clone the repository:
   ```bash
   git clone https://github.com
   ```
2. Navigate into the directory and build the container:
   ```bash
   cd your-repo
   docker build -t <your-image-name> .
   ```
3. Run the container:
   ```bash
   docker run -d -p 8080:8080 <your-image-name>
   ```

---

## Option 3: Manual / From Source
Best for development, debugging, or unsupported platforms.

1. Clone the repository:
   ```bash
   git clone https://github.com
   ```
2. Navigate to the folder:
   ```bash
   cd your-repo
   ```
3. Install dependencies and build the project:
   ```bash
   install_command_here
   ```

---

## Configuration
Most installations require an initial setup. 

1. Copy the environment template file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the required variables. 

---

## Post-Installation Verification
To verify your installation was successful, run:
```bash
your_verification_command_here
```
If everything is set up correctly, you should see the following output:
> Expected output message here.

---

## Troubleshooting
* **Issue:** Brief description of the problem.
  **Fix:** Quick solution or command to resolve it.
* **Issue:** Another common pitfall.
  **Fix:** Solution.

*Need more help? Check out our full [Documentation](insert-link) or open an issue in the [Issue Tracker](insert-link).*
