

function trackCurrentTab() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        if (tabs.length === 0 || tabs[0] === undefined) {
            reporter.track(undefined);
            return;
        }

        let url = tabs[0].url;
        let host = getDomainFromUrl(url);

        if (!host.includes(".")) reporter.track(undefined);
        else reporter.track(host);
    });
}

function getDomainFromUrl(data) {
    const a = document.createElement('a');
    a.href = data;
    return a.hostname;
}

let reporter = new TimecampActivityReporter();

chrome.tabs.onActivated.addListener(function () {
    trackCurrentTab();
});

chrome.windows.onFocusChanged.addListener(function (windowId) {
    if (windowId === -1) reporter.pause();
    else {
        reporter.unpause();
        trackCurrentTab();
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    trackCurrentTab();
});