# The Graph Discord Bot

A Discord bot that gets data from descentralized exchanges such as uniswap and sushiswap using data from The Graph. It can be used to list pools, get their info and also get prices against popular stablecoins.

## Setting it up

First you need to install the dependencies:

```npm install```

The bot will expect 2 environment variables: `BOT_TOKEN`, which is a token you can get from the [Discord Developer Portal](https://discord.com/developers/applications). It needs bot permissions and the ability to generate commands. You'll end up with a link like this:

https://discord.com/api/oauth2/authorize?client_id={clientid}&permissions=2147485696&scope=applications.commands%20bot 

You will also need the `THE_GRAPH_API_KEY` which you can get on [The Graph's studio](https://thegraph.com/studio/).

Once there's an `.env` file, run the commands:
- `npm install`
- `npm run tsc`
- `node bot.js`

## Commands

### list_exchanges

Returns the list of supported exchanges. For now, only `uniswap` and `sushiswap`.

### list_pools {exchange} {symbol}

Returns a list of pools in an exchange for a given symbol.
* `exchange` must be `sushiswap` or `uniswap`.
* `symbol` must be something like `WETH`, `USDC`, `LINK`.

e.g /list_pools uniswap LINK

### get_pool_info {exchange} {pair}

Returns the name, symbol, price and volume for a pair of tokens in an exchange.

* `exchange` must be `sushiswap` or `uniswap`.
* `pair` must be two symbols separated by a slash (e.g `LINK/USDT`)

e.g /get_pool_info uniswap LINK/USDT

### get_price {token} {exchange?} {stable?}

Returns the price against a stablecoin. It will use sushiswap by default, and if there's no stable, it will return the price against USDT, USDC and DAI.

* `exchange` must be `sushiswap` or `uniswap`.
* `stable` must be something like `USDC`, `DAI`.

e.g /get_price LINK uniswap

