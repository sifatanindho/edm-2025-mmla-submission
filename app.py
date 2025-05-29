from flask import Flask, render_template, request, jsonify, send_file, Response
import os
import time
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/feedback')
def feedback():
    return render_template('feedback.html')

@app.route('/video/<path:filename>')
def stream_video(filename):
    video_path = os.path.join(os.path.dirname(__file__), 'static', 'videos', filename)
    
    def generate():
        with open(video_path, 'rb') as video_file:
            chunk_size = 1024 * 1024  # 1MB chunks
            while True:
                chunk = video_file.read(chunk_size)
                if not chunk:
                    break
                yield chunk
    
    return Response(generate(), 
                   mimetype='video/mp4',
                   headers={'Accept-Ranges': 'bytes',
                            'Cache-Control': 'public, max-age=3600'})

@app.route('/api/available_videos')
def get_videos():
    video_dir = os.path.join(os.path.dirname(__file__), 'static', 'videos')
    videos = [f for f in os.listdir(video_dir) if f.endswith(('.mp4', '.webm'))]
    return jsonify(videos)

@app.route('/api/save_report', methods=['POST'])
def save_report():
    data = request.json
    timestamp = time.strftime('%Y%m%d-%H%M%S')
    filename = f'report-{timestamp}.json'
    report_path = os.path.join(os.path.dirname(__file__), 'reports', filename)
    
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    with open(report_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    return jsonify({'success': True, 'filename': filename})

@app.route('/reports/<path:filename>')
def get_report(filename):
    report_path = os.path.join(os.path.dirname(__file__), 'reports', filename)
    return send_file(report_path, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, threaded=True)