## Overview

This is the code we used for our paper "A Methodological Framework for Capturing Internal States in Collaborative Learning". After the collection of each session, we ran ```python scripts/classify_caught_labels.py``` to classify the caught labels automatically.

After the collection of all data, we ran our notebook ```notebooks/EDA/response-data-exploration.ipynb``` for our analysis.

Finally, we ran ```python scripts/reports_by_participants.py``` to generate the reports for each participant in order to ensure no single participant skewed the results.

All collected data is removed from this repository. Please contact sifatul.anindho@colostate.edu if you want to use our data under the terms and conditions the participants consented to.


## Requirements

The conda environment we used is available in ```environment.yml```. You can create the environment by running:

```bash
conda env create -f environment.yml
```
