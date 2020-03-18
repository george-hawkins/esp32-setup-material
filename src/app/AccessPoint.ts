export class AccessPoint {
  constructor(
    readonly ssid: string,
    readonly bssid: string // BSSID encoded as a hexadecimal string.
  ) { }
}
