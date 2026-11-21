export function statusMiddleware(req, res, next) {
  if (req.path === '/status') {
    return res.status(200).json({
      name: 'Gerenciador de usuários',
      version: '1.0.0',
    });
  } else {
    if (next && typeof next === 'function') {
      next();
    }
  }
}
