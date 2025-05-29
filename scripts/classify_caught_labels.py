import os
import json

def classify_labels(base_path):
    for root, _, files in os.walk(base_path):
        for file in files:
            if file.endswith(".json"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r') as f:
                        content = json.load(f)
                    last_video_time = 0
                    for response in content.get("responses", []):
                        video_time = response["videoTime"]
                        if video_time - last_video_time == 61: # 1 second more than probe frequency because when the video pauses, it resumes 1s ahead
                            response["self-caught"] = False
                            response["probe-caught"] = True
                        elif video_time == 60 and last_video_time == 0:
                            response["self-caught"] = False
                            response["probe-caught"] = True
                        else:
                            response["self-caught"] = True
                            response["probe-caught"] = False
                        last_video_time = video_time
                    with open(file_path, 'w') as f:
                        json.dump(content, f, indent=4)
                    print(f"Updated {file_path}")
                except json.JSONDecodeError as e:
                    print(f"Skipping invalid JSON file {file_path}: {e}")

if __name__ == "__main__":
    base_path = "../response-data"
    classify_labels(base_path)