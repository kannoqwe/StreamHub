import {StreamModel, UserModel} from "../../models";

export interface ChannelDto {
    user: UserModel;
    stream: StreamModel | null;
}