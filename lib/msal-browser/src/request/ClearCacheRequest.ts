/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AccountInfo } from "@azure/msal-common";

/**
 * ClearCacheRequest
 * - account                - Account object that will be logged out of. All tokens tied to this account will be cleared.
 * - correlationId          - Unique GUID set per request to trace a request end-to-end for telemetry purposes.
 * - logoutHint             - A string that specifies the account that is being logged out in order to skip the server account picker on logout.
 */
export type ClearCacheRequest = {
    correlationId?: string;
    account?: AccountInfo | null;
    loginHint?: string;
};
