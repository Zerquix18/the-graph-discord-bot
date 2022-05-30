import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import fetch from 'cross-fetch';

import * as Services from './services';
import localCommands from './commands';
import { IExchange, IPartialPool } from './models';

global.fetch = fetch;
dotenv.config();

console.log('Bot starting up...');

const uniswapService = new Services.UniswapService();
const sushiswapService = new Services.SushiswapService();
const exchangesPools = new Map<IExchange, IPartialPool[]>();

const bot = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
  ]
});

const commands = localCommands.map(localCommand => {
  const { name, description } = localCommand;
  const options: Discord.ApplicationCommandOptionData[] = (localCommand.options || []).map(localOption => {
    return {
      name: localOption.name,
      description: localOption.description,
      type: localOption.type || 'STRING',
      required: typeof localOption.required === 'boolean' ? localOption.required : true,
    };
  });

  const command: Discord.ApplicationCommandData = { name, description, options };
  return command;
});

bot.on('ready', async () => {
  console.log(`Bot successfully connected as ${bot.user ? bot.user.tag : ''}`);
  if (bot.application) {
    await bot.application.commands.set(commands);
    console.log('Registered commands.');
  }
});

bot.on('interactionCreate', async (interaction) => {
  if (! interaction.isCommand()) {
    return;
  }

  const command = localCommands.find(command => command.name === interaction.commandName);
  if (command) {
    console.log(`Executing command: ${interaction.commandName}`);
    await command.handler({ interaction, uniswapService, sushiswapService, exchangesPools });
    console.log('Ran successfully.');
  } else {
    console.log(`Could not find command: ${interaction.commandName}`);
  }
});

async function getPools() {
  const [uniswapPools, sushiswapPools] = await Promise.all([uniswapService.getPools(), sushiswapService.getPools()]);
  exchangesPools.set('uniswap', uniswapPools);
  exchangesPools.set('sushiswap', sushiswapPools);
  console.log('Successfully stored pools');
}

async function main() {
  await getPools();
  bot.login(process.env.BOT_TOKEN);
  setInterval(getPools, 60 * 60 * 1000);
}

main();
