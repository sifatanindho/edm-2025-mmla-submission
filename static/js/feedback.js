document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('feedback-video');
    const loadingIndicator = document.getElementById('loading-indicator');
    const startPlaybackBtn = document.getElementById('start-playback');
    const feedbackPopup = document.getElementById('feedback-popup');
    const feedbackOptions = document.getElementById('feedback-options');
    const submitFeedbackBtn = document.getElementById('submit-feedback');
    const downloadReportBtn = document.getElementById('download-report');
    const endSessionBtn = document.getElementById('end-session');
    const surveyBtn = document.getElementById('survey-button');
    const probeTimeDisplay = document.getElementById('probe-time');
    
    const onsetContainer = document.getElementById('onset-container');
    const onsetOption = document.getElementById('onset-option');
    const ongoingOption = document.getElementById('ongoing-option');
    const durationContainer = document.getElementById('duration-container');
    const durationInput = document.getElementById('duration-input');
    
    let videoLoaded = false;
    let lastPauseTime = 0;
    let lastPromptTime = 0;
    let reportData = [];
    let sessionData = {
        groupID: localStorage.getItem('group_id') || '',
        participantID: localStorage.getItem('participant_id') || '',
        video: '',
        startTime: new Date().toISOString(),
        endTime: '',
        probeFrequency: 0,
        responses: []
    };

    const currentVideo = localStorage.getItem('current_video');
    const probeFrequency = parseInt(localStorage.getItem('probe_frequency') || 60);
    const labels = JSON.parse(localStorage.getItem('feedback_labels')) || [];
    
    probeTimeDisplay.textContent = probeFrequency;
    
    sessionData.video = currentVideo;
    sessionData.probeFrequency = probeFrequency;
    
    if (currentVideo) {
        video.src = `/video/${currentVideo}`;
        video.preload = 'metadata';
    } else {
        alert('No video selected. Redirecting to dashboard.');
        window.location.href = '/dashboard';
    }
    
    video.addEventListener('loadeddata', function() {
        videoLoaded = true;
        loadingIndicator.style.display = 'none';
        startPlaybackBtn.style.display = 'block';
        renderFeedbackOptions();
    });
    
    video.addEventListener('error', function() {
        alert('Error loading video. Please try again.');
        console.error('Video error:', video.error);
    });
    
    video.addEventListener('timeupdate', function() {
        if (!videoLoaded || video.paused) return;
        
        const currentTime = Math.floor(video.currentTime);
        probeTimeDisplay.textContent = currentTime - lastPromptTime;
        
        if (currentTime > 1 && (currentTime - lastPromptTime) % probeFrequency === 0 && currentTime !== lastPauseTime) {
            lastPauseTime = currentTime;
            lastPromptTime = currentTime;
            showFeedbackPopup();
        }
    });
    
    video.addEventListener('ended', function() {
        showFeedbackPopup();
    });
    
    startPlaybackBtn.addEventListener('click', function() {
        this.style.display = 'none';
        video.play().catch(err => {
            console.error('Error starting playback:', err);
            alert('Could not start playback. Please try again.');
            this.style.display = 'block';
        });
    });
    
    surveyBtn.addEventListener('click', function() {
        showFeedbackPopup();
    });
    
    function renderFeedbackOptions() {
        feedbackOptions.innerHTML = '';
        
        // Render predefined labels
        labels.forEach(label => {
            const option = document.createElement('div');
            option.className = 'feedback-option';
            option.dataset.label = label;
            option.innerHTML = `
                <input type="checkbox" id="option-${label.toLowerCase().replace(/\s+/g, '-')}" 
                       value="${label}">
                <label for="option-${label.toLowerCase().replace(/\s+/g, '-')}">${label}</label>
            `;
            feedbackOptions.appendChild(option);
        });
        
        // Add "Other" option with text input
        const otherOption = document.createElement('div');
        otherOption.className = 'feedback-option other-option';
        otherOption.dataset.label = 'Other';
        otherOption.innerHTML = `
            <input type="checkbox" id="option-other" value="Other">
            <label for="option-other">Other</label>
            <div id="other-input-container" style="display: none; margin-top: 8px;">
                <input type="text" id="other-text-input" placeholder="Please specify..." class="other-text-field">
            </div>
        `;
        feedbackOptions.appendChild(otherOption);
        
        // Add event listeners for all options including predefined labels
        document.querySelectorAll('.feedback-option').forEach(option => {
            option.addEventListener('click', function(e) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    
                    // Handle "Other" checkbox specifically
                    if (this.classList.contains('other-option')) {
                        const otherInputContainer = document.getElementById('other-input-container');
                        otherInputContainer.style.display = checkbox.checked ? 'block' : 'none';
                    }
                }
                
                this.classList.toggle('selected', this.querySelector('input[type="checkbox"]').checked);
                
                // Show/hide onset container based on checkbox selections
                const selectedOptions = document.querySelectorAll('.feedback-option input[type="checkbox"]:checked');
                onsetContainer.style.display = selectedOptions.length > 0 ? 'block' : 'none';
            });
        });
        
        // Special handler for the "Other" checkbox
        const otherCheckbox = document.getElementById('option-other');
        if (otherCheckbox) {
            otherCheckbox.addEventListener('change', function() {
                const otherInputContainer = document.getElementById('other-input-container');
                otherInputContainer.style.display = this.checked ? 'block' : 'none';
                if (this.checked) {
                    document.getElementById('other-text-input').focus();
                }
            });
        }
    }
    
    function showFeedbackPopup() {
        video.pause();
        
        document.querySelectorAll('.feedback-option').forEach(option => {
            option.classList.remove('selected');
            option.querySelector('input[type="checkbox"]').checked = false;
        });
        
        // Hide other input field and clear its value
        const otherInputContainer = document.getElementById('other-input-container');
        if (otherInputContainer) {
            otherInputContainer.style.display = 'none';
            document.getElementById('other-text-input').value = '';
        }
        
        // Reset onset/ongoing options
        onsetContainer.style.display = 'none';
        onsetOption.checked = false;
        ongoingOption.checked = false;
        durationContainer.style.display = 'none';
        durationInput.value = '';
        
        feedbackPopup.style.display = 'block';
    }
    
    
    onsetOption.addEventListener('change', function() {
        if (this.checked) {
            ongoingOption.checked = false;
            durationContainer.style.display = 'none';
            durationInput.value = '';
        }
    });
    
    ongoingOption.addEventListener('change', function() {
        if (this.checked) {
            onsetOption.checked = false;
            durationContainer.style.display = 'block';
        } else {
            durationContainer.style.display = 'none';
            durationInput.value = '';
        }
    });
    
    submitFeedbackBtn.addEventListener('click', function() {
        const selectedOptions = [];
        let otherText = "N/A";
        
        // Collect selected options
        document.querySelectorAll('.feedback-option input[type="checkbox"]:checked').forEach(checkbox => {
            selectedOptions.push(checkbox.value);
            
            // If "Other" is selected, get the text
            if (checkbox.value === "Other") {
                otherText = document.getElementById('other-text-input').value.trim() || "N/A";
            }
        });
        
        // Prepare onset/ongoing data
        const onsetData = {
            onset: onsetOption.checked,
            ongoing: ongoingOption.checked,
            duration: ongoingOption.checked ? parseInt(durationInput.value || 0) : 0
        };
        
        const responseData = {
            timestamp: new Date().toISOString(),
            videoTime: Math.floor(video.currentTime),
            responses: selectedOptions,
            feeling: {
                labels: selectedOptions,
                other: otherText,
                ...onsetData
            }
        };
        
        sessionData.responses.push(responseData);
        
        // Prepare report data with onset/ongoing information
        let otherTextForReport = "";
        if (selectedOptions.includes("Other")) {
            otherTextForReport = `, Other text: "${otherText}"`;
        }
        
        const reportEntry = [
            `Time: ${Math.floor(video.currentTime)}s`,
            `Responses: ${selectedOptions.join(', ')}${otherTextForReport}`,
            `Onset: ${onsetData.onset}`,
            `Ongoing: ${onsetData.ongoing}`,
            `Duration: ${onsetData.duration}s`
        ].join(', ');
        
        reportData.push(reportEntry);
        
        feedbackPopup.style.display = 'none';
        
        try {
            video.currentTime = video.currentTime + 1;
            lastPauseTime = Math.floor(video.currentTime);
            lastPromptTime = lastPauseTime;
            setTimeout(() => {
                video.play().catch(err => console.error('Error resuming playback:', err));
            }, 200);
        } catch (err) {
            console.error('Error setting video time:', err);
            video.play().catch(err => console.error('Error resuming playback:', err));
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && feedbackPopup.style.display === 'block') {
            e.preventDefault();
            submitFeedbackBtn.click();
        }
    });
    
    downloadReportBtn.addEventListener('click', function() {
        if (sessionData.responses.length === 0) {
            alert('No feedback data collected yet.');
            return;
        }
        
        sessionData.endTime = new Date().toISOString();
        
        fetch('/api/save_report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const textReport = reportData.join('\n');
                const blob = new Blob([textReport], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'video-feedback-report.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                alert('Report saved successfully.');
            } else {
                throw new Error('Failed to save report');
            }
        })
        .catch(error => {
            console.error('Error saving report:', error);
            alert('There was an error saving the report to the server. Downloading local copy instead.');
            
            const textReport = reportData.join('\n');
            const blob = new Blob([textReport], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'video-feedback-report.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    });
    
    endSessionBtn.addEventListener('click', function() {
        if (sessionData.responses.length > 0 && 
            !confirm('You have collected feedback data. Are you sure you want to end the session?')) {
            return;
        }
        
        window.location.href = '/dashboard';
    });
});