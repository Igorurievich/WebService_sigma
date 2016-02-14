/*!
 * ASP.NET SignalR JavaScript Library v2.2.0
 * http://signalr.net/
 *
 * Copyright Microsoft Open Technologies, Inc. All rights reserved.
 * Licensed under the Apache 2.0
 * https://github.com/SignalR/SignalR/blob/master/LICENSE.md
 *
 */

/// <reference path="..\..\SignalR.Client.JS\Scripts\jquery-1.6.4.js" />
/// <reference path="jquery.signalR.js" />
(function ($, window, undefined) {
    /// <param name="$" type="jQuery" />
    "use strict";

    if (typeof ($.signalR) !== "function") {
        throw new Error("SignalR: SignalR is not loaded. Please ensure jquery.signalR-x.js is referenced before ~/signalr/js.");
    }

    var signalR = $.signalR;

    function makeProxyCallback(hub, callback) {
        return function () {
            // Call the client hub method
            callback.apply(hub, $.makeArray(arguments));
        };
    }

    function registerHubProxies(instance, shouldSubscribe) {
        var key, hub, memberKey, memberValue, subscriptionMethod;

        for (key in instance) {
            if (instance.hasOwnProperty(key)) {
                hub = instance[key];

                if (!(hub.hubName)) {
                    // Not a client hub
                    continue;
                }

                if (shouldSubscribe) {
                    // We want to subscribe to the hub events
                    subscriptionMethod = hub.on;
                } else {
                    // We want to unsubscribe from the hub events
                    subscriptionMethod = hub.off;
                }

                // Loop through all members on the hub and find client hub functions to subscribe/unsubscribe
                for (memberKey in hub.client) {
                    if (hub.client.hasOwnProperty(memberKey)) {
                        memberValue = hub.client[memberKey];

                        if (!$.isFunction(memberValue)) {
                            // Not a client hub function
                            continue;
                        }

                        subscriptionMethod.call(hub, memberKey, makeProxyCallback(hub, memberValue));
                    }
                }
            }
        }
    }

    $.hubConnection.prototype.createHubProxies = function () {
        var proxies = {};
        this.starting(function () {
            // Register the hub proxies as subscribed
            // (instance, shouldSubscribe)
            registerHubProxies(proxies, true);

            this._registerSubscribedHubs();
        }).disconnected(function () {
            // Unsubscribe all hub proxies when we "disconnect".  This is to ensure that we do not re-add functional call backs.
            // (instance, shouldSubscribe)
            registerHubProxies(proxies, false);
        });

        proxies['connectionHub'] = this.createHubProxy('connectionHub');
        proxies['connectionHub'].client = {};
        proxies['connectionHub'].server = {
            authorization: function (login, password) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["Authorization"], $.makeArray(arguments)));
            },

            authorizationAsync: function (login, password) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["AuthorizationAsync"], $.makeArray(arguments)));
            },

            getDevice: function (token) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["GetDevice"], $.makeArray(arguments)));
            },

            getLastDeviceInfoAsync: function (token) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["GetLastDeviceInfoAsync"], $.makeArray(arguments)));
            },

            getRoute: function (token, _start, _end) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["GetRoute"], $.makeArray(arguments)));
            },

            getTimeActiveAsync: function (zone_id) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["GetTimeActiveAsync"], $.makeArray(arguments)));
            },

            getUserAsync: function (token) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["GetUserAsync"], $.makeArray(arguments)));
            },

            getZoneAsync: function (divece_Id) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["GetZoneAsync"], $.makeArray(arguments)));
            },

            registrationAsync: function (login, password, name, surname, email) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["RegistrationAsync"], $.makeArray(arguments)));
            },

            removeTimeActiveAsync: function (ta_id) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["RemoveTimeActiveAsync"], $.makeArray(arguments)));
            },

            removeZoneAsync: function (zone_id) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["RemoveZoneAsync"], $.makeArray(arguments)));
            },

            sendMessageAsync: function (token, jsonUserModel) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["SendMessageAsync"], $.makeArray(arguments)));
            },

            setDeviceInfoAsync: function (token, d_id, lon, lat, accurecy, battery, dt, sos) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["SetDeviceInfoAsync"], $.makeArray(arguments)));
            },

            setDevicesAsync: function (token, d_id) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["SetDevicesAsync"], $.makeArray(arguments)));
            },

            setTimeActiveAsync: function (zone_id, dayofweek, startTime, endTime) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["SetTimeActiveAsync"], $.makeArray(arguments)));
            },

            setZoneAsync: function (d_id, description, poligons) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["SetZoneAsync"], $.makeArray(arguments)));
            },

            subscriptionRenewalAsync: function (token) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["SubscriptionRenewalAsync"], $.makeArray(arguments)));
            },

            updateTimeActiveAsync: function (ta_id, dayofweek, startTime, endTime) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["UpdateTimeActiveAsync"], $.makeArray(arguments)));
            },

            updateZoneAsync: function (zone_id, description, poligons) {
                return proxies['connectionHub'].invoke.apply(proxies['connectionHub'], $.merge(["UpdateZoneAsync"], $.makeArray(arguments)));
            }
        };

        return proxies;
    };

    signalR.hub = $.hubConnection("/Server/signalr", { useDefaultPath: false });
    $.extend(signalR, signalR.hub.createHubProxies());

}(window.jQuery, window));