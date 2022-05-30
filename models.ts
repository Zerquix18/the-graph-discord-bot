import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import * as services from "./services";

// COMMANDS

export type ICommandHandlerArguments = {
  interaction: CommandInteraction;
  uniswapService: services.UniswapService;
  sushiswapService: services.SushiswapService;
  exchangesPools: Map<IExchange, IPartialPool[]>;
}

export type ICommandHandler = (args: ICommandHandlerArguments) => Promise<void> | void;

export interface ICommandOption {
  name: string;
  description: string;
  type?: ApplicationCommandOptionType;
  required?: boolean;
}

export interface ICommand { 
  name: string;
  description: string;
  options?: ICommandOption[];
  handler: ICommandHandler;
}

export type IExchange = 'uniswap' | 'sushiswap';
export type IToken = {
  id: string;
  name: string;
  symbol: string;
}

export interface IPool {
  exchange: IExchange;
  id: string;
  token0: IToken;
  token1: IToken;

  token0Price: number;
  token1Price: number;
  volumeUSD: number;
  volumeToken0: number;
  volumeToken1: number;
}

export type IPartialPool = Pick<IPool, 'exchange' | 'id' | 'token0' | 'token1'>;
