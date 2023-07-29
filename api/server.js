const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const jwt = require('jsonwebtoken');
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Endpoint pentru logare
server.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = router.db.get('users').find({ username, password }).value();
  if (user) {
    const token = jwt.sign({ userId: user.id }, 'secretKey', { expiresIn: '1h' });
    res.status(200).jsonp({
      token,
      id: user.id,
      username: user.username
      
    });
  } else {
    res.status(401).jsonp({ error: 'Credențiale invalide' });
  }
});

// Endpoint pentru înregistrare
server.post('/register', (req, res) => {
  const { username,phone,email, password } = req.body;
  const id = Date.now().toString();
  router.db.get('users').push({ id, username,phone,email, password }).write();
  const token = jwt.sign({ userId: id }, 'secretKey', { expiresIn: '1h' });
  res.status(201).jsonp({
    token,
    
      id,
      username,
      phone,
      email
    
  });
});
// Endpoint pentru a obține informațiile utilizatorului în funcție de token
server.get('/users', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, 'secretKey');
    const user = router.db.get('users').find({ id: decodedToken.userId }).value();
    if (user) {
      res.status(200).jsonp({
        id: user.id,
        username: user.username,
        phone: user.phone,
        email:user.email
      });
    } else {
      res.status(404).jsonp({ error: 'Utilizatorul nu a fost găsit' });
    }
  } catch (error) {
    res.status(401).jsonp({ error: 'Token invalid' });
  }
});

server.use(router);
server.listen(3001, () => {
  console.log('JSON Server is running');
});