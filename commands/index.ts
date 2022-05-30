import { ICommand, IExchange, IToken } from '../models';

const LIMIT = 50;

const commands: ICommand[] = [
  {
    name: 'list_exchanges',
    description: 'Will list available exchanges',
    handler: ({ interaction }) => {
      interaction.reply('`uniswap` or `sushiswap`');
    }
  },

  {
    name: 'list_pools',
    description: 'Will list pools for a particular exchange',
    options: [
      {
        name: 'exchange',
        description: 'uniswap, sushiswap',
        required: true,
      },
      {
        name: 'symbol',
        description: 'A token to filter the list, since an exchange will have lots of pairs.',
        required: true,
      },
    ],
    handler: async ({ interaction, exchangesPools }) => {
      const exchange = interaction.options.getString('exchange', true) as IExchange;
      const symbol = interaction.options.getString('symbol', true).toUpperCase();

      try {
        if (! /^[A-Z0-9]{3,4}$/.test(symbol)) {
          throw new Error('Incorrect symbol format, must be 3 or 4 letters/numbers (e.g USDC, ETH)');
        }
        
        const pools = exchangesPools.get(exchange);
        if (! pools) {
          throw new Error(`Could not get pools for ${exchange}. Must be uniswap or sushiswap`);
        }

        const poolsForThisSymbol = pools.filter(pool => {
          const tokens = [pool.token0.symbol.toUpperCase(), pool.token1.symbol.toUpperCase()];
          return tokens.includes(symbol);
        });

        const list = poolsForThisSymbol.map((pool, index) => {
          return `${index + 1}. ${pool.token0.symbol.toUpperCase()}/${pool.token1.symbol.toUpperCase()}`;
        });

        let reply = `There are ${poolsForThisSymbol.length} pools for ${symbol} at ${exchange}.\n`;
        if (list.length > LIMIT) {
          reply += list.slice(0, LIMIT).join("\n");
          reply += `\nPlus ${list.length - LIMIT} more.`;
        } else {
          reply += list.join("\n");
        }

        await interaction.reply(reply);
      } catch (e) {
        await interaction.reply((e as Error).message);
      }
    }
  },

  {
    name: 'get_pool_info',
    description: 'Will retrieve information about a pool',
    options: [
      {
        name: 'exchange',
        description: 'uniswap, sushiswap',
        required: true,
      },
      {
        name: 'pair',
        description: 'A pair like ETH/USDC',
        required: true,
      },
    ],
    handler: async ({ interaction, exchangesPools, sushiswapService, uniswapService }) => {
      const exchange = interaction.options.getString('exchange', true) as IExchange;
      const pair = interaction.options.getString('pair', true).toUpperCase().replace(/[^A-Za\/z0-9\-]/g, '');

      try {
        await interaction.deferReply();

        if (! /^([A-Z0-9]{3,4})\/([A-Z0-9]{3,4})$/.test(pair)) {
          throw new Error('Incorrect symbol format, must be 3 or 4 letters/numbers and a slash (e.g eth/usdc)');
        }
        
        const pools = exchangesPools.get(exchange);
        if (! pools) {
          throw new Error(`Could not get pools for ${exchange}`);
        }

        const pairSplit = pair.split('/');

        const pool = pools.find(pool => {
          const poolPair = [pool.token0.symbol.toUpperCase(), pool.token1.symbol.toUpperCase()];
          return poolPair.includes(pairSplit[0]) && poolPair.includes(pairSplit[1]);
        });

        if (! pool) { 
          throw new Error(`Could not find pair ${pair} in ${exchange}.`);
        }

        const service = exchange === 'sushiswap' ? sushiswapService : uniswapService;
        const poolInfo = await service.getPool(pool.id);

        let reply = `
          ${poolInfo.token1.name} (${poolInfo.token1.symbol}) to ${pool.token0.name} (${poolInfo.token0.symbol}):
Price is ${poolInfo.token1Price.toFixed(2)} for every ${poolInfo.token0.symbol}.
Volume in the last 24 hours is ${poolInfo.volumeUSD.toFixed(2)} USD.
        `.trim();
        await interaction.editReply(reply);
      } catch (e) {
        await interaction.editReply((e as Error).message);
      }
    },
  },

  {
    name: 'get_price',
    description: 'Will get the price of a coin against stables like USDC, USDT or DAI.',
    options: [
      {
        name: 'symbol',
        description: 'A symbol like ETH',
        required: true,
      },
      {
        name: 'exchange',
        description: 'uniswap or sushiswap. Defaults to uniswap.',
        required: false,
      },
      {
        name: 'stable',
        description: 'A stable like USDC.',
        required: false,
      },
    ],
    handler: async ({ interaction, exchangesPools, sushiswapService, uniswapService }) => {
      const symbol = interaction.options.getString('symbol', true).toUpperCase();
      const exchange = (interaction.options.getString('exchange') || 'sushiswap') as IExchange;
      const stable = interaction.options.getString('stable');

      try {
        await interaction.deferReply();

        if (! /^[A-Z0-9]{3,4}$/.test(symbol)) {
          throw new Error('Incorrect symbol format, must be 3 or 4 letters/numbers (e.g ETH, WETH)');
        }
        if (exchange && ! ['uniswap', 'sushiswap'].includes(exchange)) {
          throw new Error('Exchange must be uniswap or sushiswap.');
        }
        if (stable && ! /^[A-Z0-9]{3,4}$/.test(stable)) {
          throw new Error('Incorrect stable format, must be 3 or 4 letters/numbers (e.g USDC, DAI)');
        }

        const pools = exchangesPools.get(exchange)!;
        const poolsWithStables = pools.filter(pool => {
          const pairs = [pool.token0.symbol.toUpperCase(), pool.token1.symbol.toUpperCase()];
          if (! pairs.includes(symbol)) {
            return false;
          }

          return stable ? pairs.includes(stable) : pairs.includes('USDC') || pairs.includes('USDT') || pairs.includes('DAI');
        });

        if (poolsWithStables.length === 0) {
          throw new Error(`Could not find a pool with ${symbol} and/or stables in ${exchange}`)
        }

        const fullPools = await Promise.all(poolsWithStables.map(pool => {
          const service = exchange === 'sushiswap' ? sushiswapService : uniswapService;
          return service.getPool(pool.id);
        }))

        let reply = '';
        fullPools.forEach(pool => {
          let stableToken: IToken;
          let volatileToken: IToken;
          let volatileTokenPrice: number;

          const stables = ['USDC', 'USDT', 'DAI'];
          const isStable = stable ? pool.token0.symbol.toUpperCase() === stable : stables.includes(pool.token0.symbol.toUpperCase());

          if (isStable) {
            stableToken = pool.token0;
            volatileToken = pool.token1;
            volatileTokenPrice = pool.token0Price;
          } else {
            stableToken = pool.token1;
            volatileToken = pool.token0;
            volatileTokenPrice = pool.token1Price;
          }

          reply += `${volatileToken.name} (${volatileToken.symbol}) trades at ${volatileTokenPrice.toFixed(2)} for every ${stableToken.symbol}\n`;
        });
        console.log(reply);
        await interaction.editReply(reply);
      } catch (e) {
        await interaction.editReply((e as Error).message);
      }
    },
  },
];

export default commands;
