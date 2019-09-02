import User from './user';

interface Channel {
  id: number;
  name: string;
  users: Array<User>;
}

export default Channel;
