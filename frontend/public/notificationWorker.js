let timerID = null;

function startProcessing() {
    // Check notifications every 9 seconds
    timerID = setInterval(() => {
        fetch('/notification/process', {
            method: 'PUT',
            credentials: 'include'
        })
        .then(async response => {
            if (response.ok) {
                const result = await response.json();
                if (result.processed > 0) { //Avoid unnecessary updates
                self.postMessage('update'); // Trigger UI update
                }
            }
        })
        .catch(error => {
            self.postMessage({ status: 'error', error: error.message });
        });
    }, 9000);
}

self.onmessage = function(e) {
    switch(e.data.command) {
        case 'start': //When App is mounted, the Worker will start if we are not any
        //of the routes "/" "/login" "/register"
            if (!timerID) {
                startProcessing();
            }
            break;
        case 'stop': //Stop if otherwise
            clearInterval(timerID);
            timerID = null;
            break;
    }
};