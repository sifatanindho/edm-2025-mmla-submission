document.addEventListener('DOMContentLoaded', function() {
    const groupID = document.getElementById('group-id');
    const participantID = document.getElementById('participant-id');
    const videoSelect = document.getElementById('video-select');
    const previewPlayer = document.getElementById('preview-player');
    const labelList = document.getElementById('label-list');
    const newLabelInput = document.getElementById('new-label');
    const addLabelBtn = document.getElementById('add-label');
    const probeFrequency = document.getElementById('probe-frequency');
    const startSessionBtn = document.getElementById('start-session');
    
    fetch('/api/available_videos')
        .then(response => response.json())
        .then(videos => {
            videos.forEach(video => {
                const option = document.createElement('option');
                option.value = video;
                option.textContent = video;
                videoSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading videos:', error);
            alert('Error loading available videos. Please try refreshing the page.');
        });
    
    let labels = [
        "Disengaged", "Optimistic", "Confused",
        "Frustrated", "Conflicted", "Surprised", "Curious"
    ];
    
    const savedFrequency = localStorage.getItem('probe_frequency');
    if (savedFrequency) {
        probeFrequency.value = savedFrequency;
    }

    function renderLabels() {
        labelList.innerHTML = '';
        labels.forEach((label, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${label}</span>
                <div>
                    <button class="button secondary edit-label" data-index="${index}">Edit</button>
                    <button class="button danger delete-label" data-index="${index}">Delete</button>
                </div>
            `;
            labelList.appendChild(li);
        });
        
        document.querySelectorAll('.edit-label').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                editLabel(index);
            });
        });
        
        document.querySelectorAll('.delete-label').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                deleteLabel(index);
            });
        });
        
        localStorage.setItem('feedback_labels', JSON.stringify(labels));
    }
    
    function editLabel(index) {
        const newLabel = prompt('Edit label:', labels[index]);
        if (newLabel && newLabel.trim() !== '') {
            labels[index] = newLabel.trim();
            renderLabels();
        }
    }
    
    function deleteLabel(index) {
        if (confirm('Are you sure you want to delete this label?')) {
            labels.splice(index, 1);
            renderLabels();
        }
    }
    
    addLabelBtn.addEventListener('click', function() {
        const label = newLabelInput.value.trim();
        if (label) {
            labels.push(label);
            renderLabels();
            newLabelInput.value = '';
        }
    });
    
    newLabelInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const label = newLabelInput.value.trim();
            if (label) {
                labels.push(label);
                renderLabels();
                newLabelInput.value = '';
            }
        }
    });
    
    videoSelect.addEventListener('change', function() {
        if (this.value) {
            previewPlayer.src = `/video/${this.value}`;
        } else {
            previewPlayer.src = '';
        }
    });

    probeFrequency.addEventListener('change', function() {
        if (parseInt(this.value) < 10) {
            this.value = 10;
        }
        localStorage.setItem('probe_frequency', this.value);
    });
    
    startSessionBtn.addEventListener('click', function() {
        const selectedVideo = videoSelect.value;
        
        if (!selectedVideo) {
            alert('Please select a video');
            return;
        }

        if (!groupID || !participantID) {
            alert('Please enter both Group ID and Participant ID');
            return;
        }
        
        localStorage.setItem('current_video', selectedVideo);
        localStorage.setItem('probe_frequency', probeFrequency.value);
        localStorage.setItem('group_id', groupID.value);
        localStorage.setItem('participant_id', participantID.value);
        
        console.log('Group ID:', groupID);
        console.log('Participant ID:', participantID);
        window.location.href = '/feedback';
    });
    
    renderLabels();
});