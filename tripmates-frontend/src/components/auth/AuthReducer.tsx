export interface AuthState {
  username: string;
  authOpen: boolean;
  accountType: 'user' | 'business';
  showPass: boolean;
}

export type AuthAction =
  | { type: 'login'; username: string }
  | { type: 'logout' }
  | { type: 'openAuth' }
  | { type: 'closeAuth' }
  | { type: 'setAccountType'; accountType: 'user' | 'business' }
  | { type: 'toggleShowPass' };

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'login':
      return { ...state, username: action.username, authOpen: false };
    case 'logout':
      return { ...state, username: '' };
    case 'openAuth':
      return { ...state, authOpen: true };
    case 'closeAuth':
      return { ...state, authOpen: false };
    case 'setAccountType':
      return { ...state, accountType: action.accountType };
    case 'toggleShowPass':
      return { ...state, showPass: !state.showPass };
    default:
      return state;
  }
}