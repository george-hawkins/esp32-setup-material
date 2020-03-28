import { AccessPoint } from './AccessPoint';

export enum ConnectStatus {
    SUCCESS,
    FAILURE,
    UNEXPECTED_FAILURE // A low-level unexpected failure.
}

export class ConnectResponse {
    constructor(
      readonly point: AccessPoint,
      readonly status: ConnectStatus,
      readonly message?: string
    ) { }
}
