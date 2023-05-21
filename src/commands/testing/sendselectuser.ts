import {
    ApplicationCommandOptionType,
    ChannelType
} from 'discord.js';
import { Command } from '../../structures/Command';
import sendSelectUserMenu from "../../utils/messages/sendSelectUserMenu";

export default new Command({
    name: 'sendselectuser',
    description: 'This is just a testing command, desc here!',
    noDefer: true,
    run: async ({ interaction, client }) => {
        return sendSelectUserMenu(interaction, true, 60000, 60000, async (i: any) => {
            console.log('LOGGED SELECTION');
            console.log(i);
        }, async (i: any, reason: string) => {
            console.log('LOGGED ENDING');
            console.log(i, reason);
        }, 'channelMenu', 'This is placeholder for channel menu!', 1, 'This is the content!');
    },
});