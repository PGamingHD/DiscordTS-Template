import {
    ActionRowBuilder,
    APIEmbed,
    ButtonStyle,
    CacheType,
    CommandInteraction,
    ComponentType,
    InteractionCollector,
    InteractionResponse,
    RoleSelectMenuBuilder,
    RoleSelectMenuInteraction, UserSelectMenuBuilder, UserSelectMenuInteraction,
} from 'discord.js';
import logger from '../logger';

export default async function (interaction: CommandInteraction, ephemeral: boolean, time = 60000, idle = 60000, collectFunc: any, endFunc: any, customId: string, placeholder: string, maxCollect: number, content: string) {
    try {
        if (!interaction) throw new Error('Invalid interaction provided');

        if (typeof time !== 'number') throw new Error('Time must be a number');
        if (time < 30000) throw new Error('Time must be more than 30 seconds');
        if (idle < 30000) throw new Error('Idle time must be more than 30 seconds');


        const selectMenu: UserSelectMenuBuilder = new UserSelectMenuBuilder({
            customId,
            placeholder,
            maxValues: maxCollect,
        })

        const row: ActionRowBuilder<UserSelectMenuBuilder> = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(selectMenu);

        const int: InteractionResponse<boolean> =  await interaction.reply({content, components: [row], ephemeral});

        const collector: InteractionCollector<UserSelectMenuInteraction<CacheType>> = await int.createMessageComponentCollector({
            componentType: ComponentType.UserSelect,
            time,
            idle,
            filter: (i: UserSelectMenuInteraction<CacheType>): boolean => i.user.id === interaction.user.id
        });

        collector.on('collect', collectFunc);

        collector.on('end',  endFunc);
    } catch (e) {
        logger.error(e);
    }
    return;
}