export class AccessPoint {
  constructor(
    readonly ssid: string,
    readonly rssi: number,
    readonly authmode: number
  ) { }
}
