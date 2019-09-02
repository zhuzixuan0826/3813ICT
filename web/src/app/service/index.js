import { HttpHeaders } from "@angular/common/http";
var headers = new Headers();
headers.append('Content-Type', 'application/json');

export function login(httpClient,  user) {
  return httpClient.post('/api/login', user, {});
}
