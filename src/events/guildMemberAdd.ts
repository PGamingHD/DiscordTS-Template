import { ChannelType, GuildMember, TextChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { client } from '../bot';
import logger from '../utils/logger';
import db from '../utils/database';

export default new Event('guildMemberAdd', async (member: GuildMember) => {
    if (member.user.bot) return false;


    return true;
});