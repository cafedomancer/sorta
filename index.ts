import {
  CategoryChannel,
  Client,
  Guild,
  GuildBasedChannel,
  Intents,
  NewsChannel,
  StageChannel,
  StoreChannel,
  TextChannel,
  VoiceChannel
} from 'discord.js'
import lodash from 'lodash'

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

const getGuild = (client: Client): Guild => {
  return client.guilds.cache.get(process.env.GUILD!)!
}

const isCategoryChannel = (channel: GuildBasedChannel): boolean => {
  return (
    channel.name.includes(process.env.CATEGORY!) &&
    channel.viewable &&
    channel.type === 'GUILD_CATEGORY'
  )
}

const getCategoryChannels = (guild: Guild): CategoryChannel[] => {
  return lodash.sortBy(
    guild.channels.cache
      .filter((channel) => isCategoryChannel(channel))
      .map((channel) => channel as CategoryChannel),
    [(channel) => channel.position]
  )
}

const isTextChannel = (
  channel:
    | NewsChannel
    | StageChannel
    | StoreChannel
    | TextChannel
    | VoiceChannel
): boolean => {
  return channel.viewable && channel.type === 'GUILD_TEXT'
}

const getTextChannels = (cateogry: CategoryChannel): TextChannel[] => {
  return lodash.sortBy(
    cateogry.children
      .filter((channel) => isTextChannel(channel))
      .map((channel) => channel as TextChannel),
    [(channel) => channel.name.replace(/\p{Emoji_Presentation}/gu, '')]
  )
}

const minPosition = (textChannels: TextChannel[]): number => {
  return lodash.min(textChannels.map((textChannel) => textChannel.rawPosition))!
}

client.on('ready', async () => {
  const guild = getGuild(client)
  const categoryChannels = getCategoryChannels(guild)
  for (const categoryChannel of categoryChannels) {
    const textChannels = getTextChannels(categoryChannel)
    await guild.channels.setPositions(
      textChannels.map((textChannel, position) => ({
        channel: textChannel.id,
        position: minPosition(textChannels) + position
      }))
    )
  }
  client.destroy()
})

client.login(process.env.TOKEN!)
