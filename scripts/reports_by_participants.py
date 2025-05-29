import pandas as pd
import os

input_file = "../output/reports-agg.csv"
data = pd.read_csv(input_file)
output_dir = "../output/participant-level-reports"
os.makedirs(output_dir, exist_ok=True)

for participant_id, group in data.groupby("participantID"):
    output_file = os.path.join(output_dir, f"{participant_id}-reports.csv")
    group.to_csv(output_file, index=False)
    print(f"Saved {output_file}")