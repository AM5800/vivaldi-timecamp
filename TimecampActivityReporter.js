class TimecampActivityReporter {
    constructor() {
        this.domain = undefined;
        this.started = undefined;
        this.activities = [];
        this.paused = false;

        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name !== "TimecampActivityReporter") return;
            this.synchronize();
        });
        chrome.alarms.create("TimecampActivityReporter", {periodInMinutes: 1.0});
    }

    static formatDate(date) {
        return dateFormat(date, "yyyy-mm-dd HH:MM:ss");
    }

    synchronize() {
        const pendingDomain = this.domain;
        this.appendPendingEvent();
        this.track(pendingDomain);

        if (this.activities.length === 0) {
            console.log("Synchronization skipped");
            return;
        }

        const url = "https://www.timecamp.com/third_party/api/activity";
        const requestData = {
            'api_token': apiKey,
            'computer_activities': this.activities.map(function (activity) {
                return {
                    application_name: "Internet",
                    start_time: TimecampActivityReporter.formatDate(activity.started),
                    end_time: TimecampActivityReporter.formatDate(activity.ended),
                    window_title: "Internet",
                    website_domain: activity.domain,
                    //task_id: "0",
                };
            })
        };

        console.log(JSON.stringify(requestData));

        $.post(url, requestData, () => {
            console.log("Synchronization ok");
            console.log(TimecampActivityReporter.formatDate(new Date()));
            this.activities = [];
        }).fail(function (data) {
            console.log("Synchronization Failed: " + JSON.stringify(data))
        });
    }

    track(domain) {
        if (this.paused) return;
        if (domain === this.domain) return;
        this.appendPendingEvent();
        this.domain = domain;
        this.started = new Date();
        console.log("Tracking: " + domain);
    }

    pause() {
        this.appendPendingEvent();
        this.track(undefined);
        this.paused = true;
    }

    unpause() {
        this.paused = false;
    }

    appendPendingEvent() {
        if (this.domain === undefined) return;
        if (this.started === undefined) return;

        this.activities.push({
            domain: this.domain,
            started: this.started,
            ended: new Date()
        });

        this.domain = undefined;
        this.started = undefined;
    }
}
