import {
    ActionRowBuilder,
    AnyComponentBuilder,
    APIEmbed,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CacheType,
    CommandInteraction,
    ComponentType,
    InteractionCollector,
    InteractionResponse,
    Message,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction
} from 'discord.js';
import logger from '../logger';
import {chunk} from 'lodash';

export default async function (interaction: CommandInteraction, options: any[], ephemeral: boolean, time = 60000, idle = 60000, collectFunc: any, endFunc: any, customId: string, placeholder: string, content: string) {
    try {
        if (!interaction) throw new Error('Invalid interaction provided');
        if (!options) throw new Error('No options provided');
        if (!Array.isArray(options)) throw new Error('Options must be an array');
        if (options.length === 0) throw new Error('Options array must include atleast 1 value');

        if (typeof time !== 'number') throw new Error('Time must be a number');
        if (time < 30000) throw new Error('Time must be more than 30 seconds');
        if (idle < 30000) throw new Error('Idle time must be more than 30 seconds');

        const pages: any[] = chunk(options, 25);
        let index: number = 0;

        const opts: any[] = [];
        let row;
        if (pages.length > 1) {
            for (let page of pages) {
                const menu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
                    .setCustomId(customId)
                    .setPlaceholder(placeholder)
                    .addOptions(page)

                const row: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(menu);

                opts.push(row);
            }
        } else {
            const menu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
                .setCustomId(customId)
                .setPlaceholder(placeholder)
                .addOptions(pages[0])

            row = new ActionRowBuilder().addComponents(menu);
        }

        let maxBack: ButtonBuilder;
        if (opts.length >= 5) {
            maxBack = new ButtonBuilder()
                .setCustomId('maxBack')
                .setEmoji('⏪')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false);
        } else {
            maxBack = new ButtonBuilder()
                .setCustomId('exit1')
                .setEmoji('⬛')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(false);
        }
        const prev: ButtonBuilder = new ButtonBuilder()
            .setCustomId('prev')
            .setEmoji('◀')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);
        const home: ButtonBuilder = new ButtonBuilder()
            .setCustomId('stop')
            .setEmoji('⏹️')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(false);
        const next: ButtonBuilder = new ButtonBuilder()
            .setCustomId('next')
            .setEmoji('▶')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);
        let maxNext: ButtonBuilder;
        if (opts.length >= 5) {
            maxNext = new ButtonBuilder()
                .setCustomId('maxNext')
                .setEmoji('⏩')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false);
        } else {
            maxNext = new ButtonBuilder()
                .setCustomId('exit')
                .setEmoji('⬛')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(false);
        }

        const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(maxBack, prev, home, next, maxNext);

        let int: Message<boolean> & InteractionResponse<boolean>;
        if (opts.length > 1) {
            //@ts-ignore
             int =  await interaction.reply({content, components: [opts[index], buttonRow], ephemeral: ephemeral});
        } else {
            //@ts-ignore
            int =  await interaction.reply({content, components: [row], ephemeral: ephemeral});
        }

        const collector: InteractionCollector<StringSelectMenuInteraction<CacheType>> = await int.createMessageComponentCollector({
            componentType: ComponentType.SelectMenu,
            time,
            idle,
            filter: (i: StringSelectMenuInteraction<CacheType>): boolean => i.user.id === interaction.user.id
        });

        const buttonCollector: InteractionCollector<ButtonInteraction<CacheType>> = await int.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time,
            idle,
        })

        buttonCollector.on('collect', async (i: ButtonInteraction<CacheType>): Promise<void> => {
            if (i.user.id !== interaction.user.id) return;

            if (!i.deferred) await i.deferUpdate();

            if (i.customId === 'prev') {
                if (index > 0) {
                    index--
                } else {
                    index = opts.length - 1;
                };
            } else if (i.customId === 'stop') {
                collector.stop('Forced stop');
                buttonCollector.stop('Forced stop');
            } else if (i.customId === 'next') {
                if (index < opts.length - 1) {
                    index++
                } else {
                    index = 0;
                };

            } else if (i.customId === 'maxBack') {
                if (index === 0) {
                    index = opts.length - 1;
                } else {
                    index = 0;
                }
            } else if (i.customId === 'maxNext') {
                if (index === opts.length - 1) {
                    index = 0;
                } else {
                    index = opts.length - 1;
                }
            }

            await int.edit({
                components: [opts[index], buttonRow],
            });

            collector.resetTimer();
        });

        collector.on('collect', collectFunc);

        collector.on('end',  endFunc);
    } catch (e) {
        logger.error(e);
    }
    return;
}