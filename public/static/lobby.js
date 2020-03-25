var players = [],
  username,
  readyflag = false,
  login = document.getElementById('login'),
  startgame = document.getElementById('startgame'),
  ready = document.getElementById('ready'),
  logwindow = document.getElementById('logwindow'),
  lobbywindow = document.getElementById('lobbywindow'),
  playerlist = document.getElementById('playerlist');

//Send player username on server
login.addEventListener('click', function() {
  username = document.getElementById('userName').value;
  let password = document.getElementById('Password').value;
  if (username.length > 0) {

    //with socket.io to use socket ID in the lobby
    socket.emit('login_register', {
      username: username,
      password: password
    });

    //with http POST to use web session ID after redirection
    fetch('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: {
          name: username,
          password: password
        }
      })
    });
  } else {
    alert('Pseudo trop court');
  }
});

//Send ready/notready info to server
ready.addEventListener('click', function() {
  if (readyflag == false) {
    readyflag = true;
    ready.innerHTML = '<a>Prêt !</a>';
  } else {
    readyflag = false;
    ready.innerHTML = '<a>Prêt ?</a>';
  };
  socket.emit('localready', {
    username: username,
    readyflag: readyflag
  });
});

//Display lobby
socket.on('logged_in', function(data) {

  data.logins.forEach(function(name) {
    addplayertolobby(name);
  });

  data.isready.forEach(function(name) {
    document.getElementById(name).style.background = 'lightgreen';
  });

  document.getElementById(username).style.borderColor = '#e9e9e9';
  document.getElementById(username).style.outline = '4px solid #ae9f26';

  logwindow.style.display = 'none';
  lobbywindow.style.display = 'block';
});

//Add new players to lobby
socket.on('newplayer', function(username) {
  addplayertolobby(username);
});

//Display updated ready or not state for everyone
socket.on('globalready', function(isready) {

  players.forEach(function(player) {
    document.getElementById(player).style.background = 'lightpink';
  });

  isready.forEach(function(player) {
    document.getElementById(player).style.background = 'lightgreen';
  });

  if (isready.length < 4 || isready.length < players.length) {
    startgame.style.display = 'none';
  };

})

//Allow to start game when server said ok
socket.on('startallowed', function() {
  startgame.style.display = 'inline-block';
})

function addplayertolobby(name) {
  players.push(name);
  clog('New player : ' + name);
  let li = document.createElement('li');
  playerlist.appendChild(li);
  li.innerHTML += name;
  li.style.background = 'lightpink';
  li.id = name;
};
