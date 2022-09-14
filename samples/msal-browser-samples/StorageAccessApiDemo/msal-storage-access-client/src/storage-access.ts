export type HasStorageAccessResult = {
    hasStorageAccess: boolean,
    canWriteCookies: boolean
}

export const checkStorageAccess = async (serverUrl: string = getServerUrl()): Promise<HasStorageAccessResult> => {
    return new Promise<HasStorageAccessResult>((resolve, reject) => {

        // Create hidden iframe
        const iframe = document.createElement("iframe");
        iframe.src = `${serverUrl}/silent`;
        iframe.id = "silent-iframe";
        iframe.setAttribute("aria-hidden", "true");
        iframe.style.visibility = "hidden";
        iframe.style.position = "absolute";
        iframe.style.width = iframe.style.height = "0";
        iframe.style.border = "0";
        
        // Add event listener for response from iframe
        const onMessageCallback = (ev: MessageEvent) => {
            // Step 4: Top frame receives result
            if (ev.ports.length > 0 && ev.origin === getServerUrl()) {
                ev.ports[0].addEventListener("message", (e) => {
                    console.log("Step 4: Top frame receives result")
                    console.log("Result", e.data);
    
                    // Clean up
                    ev.ports[0].close();
                    document.getElementById(iframe.id)?.remove();
                    window.removeEventListener("message", onMessageCallback);
        
                    return resolve({
                        hasStorageAccess: e.data["hasStorageAccess"],
                        canWriteCookies: e.data["canWriteCookies"]
                    })
                });
                ev.ports[0].start();
        
                // Step 2: Top frame echos ready event
                if (ev.data === "ready") {
                    console.log("Step 2: Top frame echos ready");
                    ev.ports[0].postMessage("ready");
                }
            }
        };
        window.addEventListener("message", onMessageCallback);
    
        // Add hidden iframe
        document.body.appendChild(iframe);
    });

}

export const promptForStorageAccess = async (forceStorageAccessPrompt?: boolean) => {
    const serverUrl = getServerUrl();
    return new Promise<HasStorageAccessResult>((resolve, reject) => {

        // Create visible iframe
        const iframe = document.createElement("iframe");
        iframe.src = `${serverUrl}/interactive`;
        iframe.id = "interactive-iframe";
        iframe.setAttribute("aria-hidden", "true");
        iframe.style.position = "absolute";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.zIndex = "99999";
        iframe.style.width = "100vw";
        iframe.style.height = "100vh";

        // Make iframe initially hidden
        iframe.style.display = "none";
        
        // Add event listener for response from iframe
        const onMessageCallback = (ev: MessageEvent) => {
            // Step 4: Top frame receives result
            if (ev.ports.length > 0 && ev.origin === getServerUrl()) {
                ev.ports[0].addEventListener("message", (e) => {
                    console.log("Step 4: Top frame receives result")
                    console.log("Result", e.data);
    
                    // Message received to make iframe visible if server indicates prompt should be made visible, or
                    // if user checked box to show prompt (and were not receiving a message indicating they have just clicked the button)
                    if (!!e.data["promptForStorageAccess"] || (forceStorageAccessPrompt && typeof e.data["acquiredStorageAccess"] !== "boolean")) {
                        console.log("Message received to make iframe visible")
                        iframe.style.display = "block";
                        return;
                    }
    
                    // Clean up
                    ev.ports[0].close();
                    document.getElementById(iframe.id)?.remove();
                    window.removeEventListener("message", onMessageCallback);
        
                    return resolve({
                        hasStorageAccess: e.data["hasStorageAccess"],
                        canWriteCookies: e.data["canWriteCookies"]
                    })
                });
                ev.ports[0].start();
        
                // Step 2: Top frame echos ready event
                if (ev.data === "ready") {
                    console.log("Step 2: Top frame echos ready");
                    ev.ports[0].postMessage("ready");
                }
            }
        };
        window.addEventListener("message", onMessageCallback);
    
        // Add visible iframe
        document.body.appendChild(iframe);
    });
}


export function getServerUrl() {
    if (window.location.href.includes("azurestaticapps")) {
        return "https://black-meadow-0b8da171e.1.azurestaticapps.net";
    }

    return "http://localhost:4000";
}