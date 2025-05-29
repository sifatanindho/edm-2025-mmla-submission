#!/bin/bash

set -e

echo "Starting setup..."

read -p "Is the virtual environment already set up and activated? (y/n): " venv_setup
if [[ "$venv_setup" != "y" ]]; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    REQUIRED_VERSION="3.8"
    if [[ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]]; then
        echo "Python 3.8 or higher is required. Found $PYTHON_VERSION"
        exit 1
    fi

    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
else
    echo "Skipping virtual environment setup. Make sure it is activated."
fi

read -p "Install dependencies? (y/n): " install_req
if [[ "$install_req" == "y" ]]; then
    echo "Installing dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
fi

read -p "Create necessary directories? (y/n): " create_dirs
if [[ "$create_dirs" == "y" ]]; then
    echo "Creating directories..."
    mkdir -p static/videos reports
fi

read -p "Reduce video size? (y/n): " reduce_video
if [[ "$reduce_video" == "y" ]]; then
    read -p "Enter input video filename (e.g., input.mp4): " input_video
    read -p "Enter output video filename (e.g., output.mp4): " output_video
    ffmpeg -i static/videos/"$input_video" -vf "scale=1280:720" -preset fast static/videos/"$output_video"
    echo "Video resized successfully."
fi

read -p "Run in development mode (default) or deploy with Nginx? (dev/nginx): " mode

if [[ "$mode" == "nginx" ]]; then
    echo "Setting up Nginx..."
    if ! command -v nginx &> /dev/null; then
        echo "Nginx not found. Installing..."
        sudo apt update
        sudo apt install -y nginx
    fi

    sudo cp nginx.conf /etc/nginx/sites-available/video-feedback
    sudo ln -sf /etc/nginx/sites-available/video-feedback /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx

    echo "Starting Gunicorn..."
    gunicorn --bind 127.0.0.1:8000 app:app
else
    echo "Starting Flask development server..."
    python app.py
fi
