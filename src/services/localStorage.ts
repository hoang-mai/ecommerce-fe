export function clearAllLocalStorage() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('expiresIn');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('refreshExpiresIn');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('sessionState');
  localStorage.removeItem('scope');
}