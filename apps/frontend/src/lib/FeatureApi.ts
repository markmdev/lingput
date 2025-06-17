import { ClientApi } from "./ClientApi";

export class FeatureApi {
  constructor(public clientApi: ClientApi) {}

  fetch<T>(path: string): Promise<T> {
    return this.clientApi.api<T>({
      path,
      options: {
        method: "GET",
      },
    });
  }
}
