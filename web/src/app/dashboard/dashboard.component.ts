/* tslint:disable */
import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import User from '../models/user';
import { HttpClient } from '@angular/common/http';
import remove from 'lodash/remove';
import Group from '../models/group';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  constructor(private router: Router, private httpClient: HttpClient, private toastr: ToastrService) {
  }

  user: User = {};

  groups = [];

  myGroups = [];

  users = [];

  channels = [];

  createGroupModal = {
    name: '',
  };

  createChannelModal = {
    name: '',
    groupId: null,
  };

  inviteUserToChannelModel = {
    name: '',
    email: '',
    group: null,
    channel: null,
    channels: [],
  };

  addUserToChannelModal = {
    channelId: null,
    userId: null,
    addToChannelGroupUsers: [],
    addToChannelChannels: [],
  };

  removeUserToChannelModal = {
    channelId: null,
    userId: null,
    removeToChannelGroupUsers: [],
    removeToChannelChannels: [],
  };

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user'));
    console.log(this.user);
    this.getMyGroups();
    this.getAllUsers();
    this.getAllGroups();
    this.getAllChannels();
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigateByUrl('/login');
  }

  isSuperAdmin() {
    return this.user.role && this.user.role > 3;
  }

  isGroupAdmin() {
    return this.user.role && this.user.role > 2;
  }

  isGroupAssis() {
    return this.user.role && this.user.role > 1;
  }

  isNormalUser(user) {
    return user.role === 1;
  }

  getAllGroups() {
    this.httpClient.get('/api/groups').subscribe(data => {
      this.groups = data;
    }, error => {

    });
  }

  getAllUsers() {
    this.httpClient.get('/api/users').subscribe(data => {
      this.users = data;
    }, error => {

    });
  }

  getAllChannels() {
    this.httpClient.get('/api/channels').subscribe(data => {
      this.channels = data;
    }, error => {

    });
  }

  getMyGroups() {
    this.httpClient.get(`/api/groups/user/${this.user.id}`).subscribe(data => {
      console.log(data);
      this.myGroups = data;
    }, error => {

    });
  }

  onGroupSelectChange(type, group) {
    console.log(type);
    console.log(group);
    if (type === 'createChannel') {
      this.createChannelModal.groupId = group.id;
    } else if (type === 'addUserToChannel') {
      this.addUserToChannelModal.addToChannelChannels = this.channels.filter(item => item.group === group.id);
      this.addUserToChannelModal.addToChannelGroupUsers = [...this.users];
    } else if (type === 'removeUserFromChannel') {
      this.removeUserToChannelModal.removeToChannelChannels = this.channels.filter(item => item.group === group.id);
    } else if (type === 'inviteUserToChannel') {
      this.inviteUserToChannelModel.channels = this.channels.filter(item => item.group === group.id);
    }
  }

  onChannelSelectChange(type, channel) {
    if (type === 'removeUserFromChannel') {
      this.removeUserToChannelModal.removeToChannelGroupUsers = channel.users.map(item => this.users[item - 1]);
      this.removeUserToChannelModal.channelId = channel.id;
    }  else if (type === 'inviteUserToChannel') {
      this.inviteUserToChannelModel.channel = channel;
    } else {
      this.addUserToChannelModal.channelId = channel.id;
    }
  }

  onUserSelectChange(type, user) {
    console.log(type);
    console.log(user);
    if (type === 'addUserToChannel') {
      this.addUserToChannelModal.userId = user.id;
    }
    if (type === 'removeUserFromChannel') {
      this.removeUserToChannelModal.userId = user.id;
    }
  }

  createGroup() {
    if (this.createGroupModal.name) {
      this.httpClient.post('/api/groups', {
        name: this.createGroupModal.name,
    }).subscribe(data => {
        this.groups.push(data);
        this.createGroupModal.name = '';
        this.toastr.success(`Group has been Created`, '');
      }, error => {

      });
    }
  }

  removeGroup(group) {
    this.httpClient.delete(`api/groups/${group.id}`).subscribe(data => {
      remove(this.groups, item => item.id === group.id);
      this.toastr.success(`Group has been removed`, '');
    }, error => {

    });
  }

  addUserToChannel() {
    if (this.addUserToChannelModal.channelId && this.addUserToChannelModal.userId) {
      console.log(this.addUserToChannelModal);
      this.channels[this.addUserToChannelModal.channelId - 1].users.push(this.addUserToChannelModal.userId);
      this.httpClient.put(`/api/channels/${this.addUserToChannelModal.channelId}`, {
        userId: this.addUserToChannelModal.userId,
      }).subscribe(data => {
        this.toastr.success(`User ${this.users[this.addUserToChannelModal.userId -1].name} has been added`, 'Add User To Channel Success');
      }, error => {

      });
    }
  }

  removeFromChannel() {
    console.log(this.removeUserToChannelModal);
    if (this.removeUserToChannelModal.channelId && this.removeUserToChannelModal.userId) {
      remove(this.channels[this.removeUserToChannelModal.channelId - 1].users, item => item === this.removeUserToChannelModal.userId);
      this.removeUserToChannelModal.removeToChannelGroupUsers = [];
      this.httpClient.delete(`/api/channels/${this.removeUserToChannelModal.channelId}/users/${this.removeUserToChannelModal.userId}`).subscribe(data => {
        this.toastr.success(`User ${this.users[this.removeUserToChannelModal.userId -1].name} has been removed`, 'Remove User From Channel Success');
      }, error => {

      });
    }
  }

  createChannel() {
    console.log(this.createChannelModal);
    if (this.createChannelModal.name && this.createChannelModal.groupId) {
      this.channels.push({
        id: this.channels.length + 1,
        group: this.createChannelModal.groupId,
        users: [],
        name: this.createChannelModal.name,
      });

      this.httpClient.post(`api/group/${this.createChannelModal.groupId}/channel`, {
        name: this.createChannelModal.name,
      }).subscribe(data => {
        console.log(data);
        this.toastr.success(`Channel ${this.createChannelModal.name} has been created`, 'Create Channel Success');
        this.createChannelModal.name = '';
      }, error => {
      });
    }
  }

  addUserToAssis(user) {
    this.httpClient.put(`/api/users/${user.id}`, {
      role: 2,
    }).subscribe(data => {
      this.users[user.id - 1] = data;
      this.toastr.success('', 'Change User to Assis');
    }, error => {});
  }

  inviteUserToChannel() {
    if (this.inviteUserToChannelModel.channel && this.inviteUserToChannelModel.name) {
      this.httpClient.post('/api/inviteUser', {
        name: this.inviteUserToChannelModel.name,
        email: this.inviteUserToChannelModel.email,
        channelId: this.inviteUserToChannelModel.channel.id,
      }).subscribe(data => {
        if (data.user) {
          this.users.push(data.user);
        }
        this.channels[this.inviteUserToChannelModel.channel.id - 1] = data.channel;
        this.toastr.success('', 'Invite User Success');
        this.inviteUserToChannelModel.name = '';
        this.inviteUserToChannelModel.email = '';
      })
    }
  }

  removeUser(user: User) {
    this.httpClient.delete(`/api/users/${user.id}`).subscribe(data => {
      remove(this.users, item => item.id === user.id);
    });
  }

  makeGroupAdmin(user: any) {
    this.httpClient.put(`/api/users/${user.id}`, {
      role: 3,
    }).subscribe(data => {
      this.users[user.id - 1] = data;
      this.toastr.success('', 'Change User to GroupAdmin');
    }, error => {});
  }

  makeSuperAdmin(user: any) {
    this.httpClient.put(`/api/users/${user.id}`, {
      role: 4,
    }).subscribe(data => {
      this.users[user.id - 1] = data;
      this.toastr.success('', 'Change User to SuperAdmin');
    }, error => {});
  }

  getRole(role) {
    switch (role) {
      case 4:
        return 'super admin';
      case 3:
        return 'group admin';
      case 2:
        return 'group assis';
      default:
        return 'normal user';
    }
  }
}
