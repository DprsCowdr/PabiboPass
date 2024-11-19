
---

# 🌟 PabiboPass Chrome Extension

## Table of Contents

1. [Introduction](#introduction)
   - 1.1 [What is PabiboPass?](#what-is-pabibopass)
   - 1.2 [Why Use PabiboPass?](#why-use-pabibopass)

2. [Features](#features)

3. [Project Structure](#project-structure)

4. [Installation](#installation)
   - 4.1 [Add to Chrome](#add-to-chrome)
   - 4.2 [Verify Installation](#verify-installation)

5. [Usage](#usage)
   - 5.1 [Master Lock](#master-lock)
   - 5.2 [Password Management](#password-management)
   - 5.3 [Password Generator](#password-generator)

6. [Dependencies](#dependencies)

7. [Contributing](#contributing)

8. [License](#license)

---

## 1. Introduction

### 1.1 What is PabiboPass?
**PabiboPass** is a Chrome Web Extension that provides a secure, easy-to-use password manager. It helps users generate, store, and organize passwords with ease.

### 1.2 Why Use PabiboPass?
PabiboPass enhances your online security by offering:
- Strong password generation.
- A master password to protect all credentials.
- Organized account management within your browser.

---

## 2. Features

- 🔑 **Password Generator**: Create strong, unique passwords instantly.
- 🗂️ **Account Management**: Save and categorize accounts under tabs like `All`, `Frequent`, and `Favorites`.
- 🔍 **Search Functionality**: Find your credentials quickly.
- 🔐 **Master Password Protection**: Safeguard all data with a single master password.
- 🌐 **Custom URLs**: Add accounts for any custom website.

---

## 3. Project Structure

```plaintext
pabibopass/
│
├── background.js         # Background tasks
├── content_script.js     # Interacts with webpages
├── mainpage.html         # Main interface
├── popup.html            # Popup UI
├── mainpage.css          # Main page styling
├── popup.css             # Popup styling
├── manifest.json         # Extension configuration
├── icons/                # Icons for the extension
│   ├── icon128.png       # Icon file
│   ├── facebook.png      # Example service icon
│   ├── gmail.png         # Example service icon
```

---

## 4. Installation

### 4.1 Add to Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer Mode** in the top-right corner.
3. Click **Load unpacked** and select the project directory.

### 4.2 Verify Installation

1. Once loaded, the extension's icon appears in the toolbar.
2. Click on it to open the popup interface.

---

## 5. Usage

### 5.1 Master Lock

- Open the popup, enter your **master password**, and confirm it during setup.

### 5.2 Password Management

1. Use the `Add Account` feature to save credentials.
2. Organize accounts under tabs: `All`, `Frequent`, or `Favorites`.

### 5.3 Password Generator

1. Use the **Password Generator** to create strong passwords.
2. Copy passwords to your clipboard with the 📋 button.

---

## 6. Dependencies

- **Chrome Extensions API**: Powers the extension.
- **Font Awesome**: For icons.
- **Tailwind CSS**: For popup styling.

---

## 7. Contributing

We welcome contributions:
1. Fork the repository and create a new branch.
2. Make your changes and submit a pull request.

---

---

