import User from './user';
import Channel from './channel';

interface Group {
  id: number;
  name: string;
  channels: Array<Channel>;
  users: Array<User>;
  assis: Array<User>;
}

export default Group;
