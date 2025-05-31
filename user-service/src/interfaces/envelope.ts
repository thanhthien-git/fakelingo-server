import { IUserRequest } from 'fakelingo-token';

export interface Envelope<T = null> {
  metadata: {
    user?: IUserRequest;
  };

  payload?: T;
}
