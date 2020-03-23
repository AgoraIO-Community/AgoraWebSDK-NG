---
id: cloud_proxy
title: Use Cloud Proxy
sidebar_label: Cloud Proxy
---

## Introduction
Enterprises with high-security requirements usually have firewalls that restrict employees from visiting unauthorized sites to protect internal information.

To ensure that enterprise users can connect to Agora's services through a firewall, Agora supports setting up a cloud proxy.

Compared with setting a single proxy server, the cloud proxy is more flexible and stable, thus widely implemented in organizations with high-security requirements, such as large-scale enterprises, hospitals, universities, and banks.

## Implementation

Before proceeding, ensure that you have implemented the basic real-time communication function in your project. For details, see [Implement a Basic Video Call](basic_call.md).

Follow these steps to use the cloud proxy:
1. Contact sales-us@agora.io and provide your App ID, and the information on the regions using the cloud proxy, the concurrent scale, and network operators.
2. Add the following test IP addresses and ports to your whitelist.
    The sources are the clients that integrate the Agora Web SDK NG.
    | Protocol | Destination       | Port                     | Port Purpose                      |
    | ---- | -------------- | ------------------------ | ----------------------------- |
    | TCP  | 23.236.115.138 | 443, 4000<br/>3433 - 3460 | Message data transmission<br/>Media data exchange |
    | TCP  | 148.153.66.218 | 443, 4000<br/>3433 - 3460 | Message data transmission<br/>Media data exchange |
    | TCP  | 47.74.211.17   | 443                      | Edge node communication                  |
    | TCP  | 52.80.192.229  | 443                      | Edge node communication                  |
    | TCP  | 52.52.84.170   | 443                      | Edge node communication                  |
    | TCP  | 47.96.234.219  | 443                      | Edge node communication                  |
    | UDP  | 23.236.115.138 | 3478 - 3500               | Media data exchange                  |
    | UDP  | 148.153.66.218 | 3478 - 3500               | Media data exchange                  |

    > These IPs are for testing only. You need to apply for exclusive IP resources for production environment.

3. Call `AgoraRTCClient.startProxyServer` to enable the cloud proxy and see if the audio or video call works.

4. Agora will provide the IP addresses (domain name) and ports for you to use the cloud proxy in the production environment. Add the IP address and ports to your whitelist.

5. If you want to disable the cloud proxy, call `AgoraRTCClient.stopProxyServer`.

### Sample code

**Enable the cloud proxy**

```js
const client = AgoraRTC.createClient({mode: 'live',codec: 'vp8'});

// Enable the cloud proxy
client.startProxyServer();
// Join a channel
client.join("<YOUR TOKEN>", "<YOUR CHANNEL>").then(() => {
  /** ... **/
});
```

**Disable the cloud proxy**

```js
// Enable the cloud proxy and join a channel
/** ... **/

// Leave the channel
client.leave();

// Disable the cloud proxy
client.stopProxyServer();

// Rejoin a channel
client.join("<YOUR TOKEN>", "<YOUR CHANNEL>").then(() => {
  /** ... **/
});
```

### API reference
- [`startProxyServer`](/api/en/interfaces/iagorartcclient.html#startproxyserver)
- [`stopProxyServer`](/api/en/interfaces/iagorartcclient.html#stopproxyserver)

## Working principles

The following figure shows the working principles of the Agora cloud proxy.

![](assets/cloud-proxy-en.jpeg)

1. Before connecting to Agora SD-RTN™, the SDK sends the request to the cloud proxy.
2. The cloud proxy sends back the proxy information.
3. The SDK sends the data to the cloud proxy, and the cloud proxy forwards the data to Agora SD-RTN™.
4. Agora SD-RTN™ sends the data to the cloud proxy, and the cloud proxy forwards the data to the SDK.

## Considerations
-  `startProxyServer` must be called before joining the channel, and `stopProxyServer` must be called after leaving the channel.
- The Agora Web SDK NG also provides t`setProxyServer` 和 `setTurnServer` methods for you to deploy the proxy. The `setProxyServer` 和 `setTurnServer` methods cannot be used with the `startProxyServer` method at the same time, else an error occurs.
- `stopProxyServer` disables all proxy settings, including those set by the `setProxyServer` and `setTurnServer` methods.