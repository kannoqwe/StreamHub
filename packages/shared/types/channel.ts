import { UserModel, StreamModel } from '../models';

export interface ChannelData {
    user: UserModel;
    stream: StreamModel | null;
}