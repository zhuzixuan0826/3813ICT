const express = require("express");
const app = express();
const port = 3000;
const users = require("./data/users.json");
const groups = require("./data/groups.json");
const channels = require("./data/channels.json");
const remove  = require("lodash/remove");

app.use(express.json());


app.get('/', (req, res) => res.send('hello world'));

// common
app.post('/api/login', (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const email = req.body.email;
  const user = users.find(item => item.name === username);
  if (user) {
    res.json(user)
  } else {
    const newUser = {
      id: users.length + 1,
      name: username,
      role: 1,
      email,
    };
    users.push(newUser);
    res.json(newUser);
  }
});

app.get('/api/groups/user/:userId', (req, res) => {
  console.log(req.params);
  const userId = parseInt(req.params.userId);
  const myGroups = groups.filter(item => {
    return item.users.findIndex(id => id === userId) > -1;
  });
  res.json(myGroups);
});

// super admin

app.delete('/api/users/:userId', (req, res) => {
  remove(users, user => user.id === parseInt(req.params.userId));
  res.json({});
});

app.post('/api/groups', (req, res) => {
  const group = {
    id: groups.length + 1,
    name: req.body.name,
    channels: [],
    users: [],
    assis: [],
  };
  res.json(group);
});

app.get('/api/groups', (req, res) => {
  res.json(groups);
});

app.delete('/api/groups/:id', (req, res) => {
  const id = req.params.id;
  remove(this.groups, item => item.id === id);
  res.json({});
});

app.get('/api/channels', (req, res) => {
  res.json(channels);
});

app.post('/api/inviteUser', (req, res) => {
  const user = users.find(item => item.name === req.body.name && item.email === req.body.email);
  const ret = {};
  const channel = channels[req.body.channelId - 1];
  if (user) {
    channel.users.push(user)
  } else {
    let newUser = {
      id: users.length + 1,
      name : req.body.name,
      email: req.body.email,
      role: 1,
    };
    users.push(newUser);
    ret.user = newUser;
    channel.users.push(newUser)
  }
  ret.channel = channel;

  res.json(ret);
});

app.put('/api/users/:id', (req, res) => {
  const role = req.body.role;
  const user = users[req.params.id - 1];
  user.role = role;
  res.json(user);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/group/:groupId/channel', (req, res) => {
  const groupId = parseInt(req.params.groupId);
  console.log(req.body);
  const channel = {
    id: channels.length + 1,
    group: groupId,
    name: req.body.name,
    user: [],
  };
  channels.push(channel);
  return res.json(channel);
});

app.put('/api/channels/:channelId', (req, res) => {
  const channelId = parseInt(req.params.channelId);
  const userId = req.body.userId;
  channels[channelId - 1].users.push(userId);
  res.json(channels[channelId - 1]);
});

app.delete('/api/channels/:channelId/users/:userId', (req, res) => {
  const channelId = parseInt(req.params.channelId);
  const userId = parseInt(req.params.userId);
  remove(channels[channelId - 1].users, item => item === userId);
  res.json(channels[channelId - 1]);
});

// group


app.listen(port, () => console.log(`app is listening on port ${port}`));
