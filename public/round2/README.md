# Project

This is a static web application containing HTML, CSS, and JavaScript.

## How to host on Render

You can easily host this static website for free on Render. Follow these steps:

1. **Push your code to GitHub**: Make sure all these project files are committed and pushed to a GitHub repository.
2. **Create a Render Account**: Go to [Render](https://render.com/) and sign up or log in.
3. **Create a New Web Service**:
   - Click on the **New +** button in the Render dashboard.
   - Select **Static Site** from the dropdown menu.
4. **Connect Repository**: Connect your GitHub account and select the repository where this project is located.
5. **Configure the Service**:
   - **Name**: Choose a name for your site.
   - **Branch**: Typically `main` or `master`.
   - **Build Command**: Leave this empty (since it's just static HTML/CSS/JS).
   - **Publish directory**: Enter `.` (just a dot) or leave it as the root directory, so Render serves your `index.html` file from the base directory.
6. **Deploy**: Click the **Create Static Site** button. Render will build and deploy your site, giving you a live URL (e.g., `your-site-name.onrender.com`).
