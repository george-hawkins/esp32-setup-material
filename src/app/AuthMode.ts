// AuthMode constants - https://github.com/espressif/esp-idf/blob/master/components/wifi_provisioning/proto/wifi_constants.proto
// MicroPython `network` has most of these but is missing `ENTERPRISE`.
export enum AuthMode {
    OPEN = 0,
    WEP = 1,
    WPA_PSK = 2,
    WPA2_PSK = 3,
    WPA_WPA2_PSK = 4,
    ENTERPRISE = 5
}
